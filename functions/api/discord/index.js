// POST /api/discord?token=X
//   Body: { schedule, boardingTime, weekLabel?, webhookOverride? }
//   → Posts the weekly schedule embed to Discord.
//
// POST /api/discord?action=daily&token=X
//   → Reads D1 roster, computes today's conductor, posts an announcement embed.
//   → Only ADMIN_TOKEN; uses env.DISCORD_WEBHOOK_URL (no override allowed for cron action).
//
// POST /api/discord?token=X  (conductor token, manual daily from train.html)
//   Body: { action:'daily-manual', conductor, date, upcomingWeek, webhookOverride }
//
// Env vars:
//   ADMIN_TOKEN          — full admin access
//   CONDUCTOR_TOKEN      — (optional) shared token for train.html users
//   DISCORD_WEBHOOK_URL  — (optional) server-side default webhook; can be overridden per-request

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

/* ── Auth ────────────────────────────────────────────────── */

function isAdmin(request, env) {
  return new URL(request.url).searchParams.get('token') === env.ADMIN_TOKEN;
}

function isConductor(request, env) {
  if (isAdmin(request, env)) return true;
  const token = new URL(request.url).searchParams.get('token');
  return env.CONDUCTOR_TOKEN && token === env.CONDUCTOR_TOKEN;
}

/* ── Helpers ─────────────────────────────────────────────── */

function conductorForDate(dateStr, roster) {
  if (!roster.length) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayNum = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2020, 0, 1)) / 86400000);
  return roster[dayNum % roster.length].name;
}

function getGameDateAtReset() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

async function postToDiscord(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Discord ${res.status}: ${await res.text()}`);
}

function resolveWebhook(env, override) {
  if (override) {
    if (!override.startsWith('https://discord.com/api/webhooks/') &&
        !override.startsWith('https://discordapp.com/api/webhooks/')) {
      return { url: null, err: 'Invalid webhook URL — must be a discord.com webhook.' };
    }
    return { url: override, err: null };
  }
  if (!env.DISCORD_WEBHOOK_URL) return { url: null, err: 'Discord webhook not configured' };
  return { url: env.DISCORD_WEBHOOK_URL, err: null };
}

/* ── Request handler ─────────────────────────────────────── */

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);

  if (!isConductor(request, env)) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response('Bad JSON', { status: 400, headers: CORS });
  }

  const action = url.searchParams.get('action') || body.action;

  /* ── Automated daily cron (admin-only, uses server webhook) ── */
  if (action === 'daily') {
    if (!isAdmin(request, env)) {
      return new Response('Unauthorized', { status: 401, headers: CORS });
    }
    if (!env.DISCORD_WEBHOOK_URL) {
      return new Response('Discord webhook not configured', { status: 503, headers: CORS });
    }

    const rows = await env.DB.prepare(
      `SELECT id, name, sort_order FROM train_roster ORDER BY sort_order ASC, id ASC`
    ).all();
    const roster = rows.results ?? [];
    if (!roster.length) return new Response('Roster is empty', { status: 422, headers: CORS });

    const dateStr   = getGameDateAtReset();
    const conductor = conductorForDate(dateStr, roster);
    const weekFields = [];
    for (let i = 0; i < 7; i++) {
      const ds = i === 0 ? dateStr : addDays(dateStr, i);
      const name = conductorForDate(ds, roster);
      weekFields.push({ name: formatShortDate(ds), value: i === 0 ? `**${name}** ← today` : `**${name}**`, inline: true });
    }
    const embed = {
      title: '🚂 Today\'s Train Conductor',
      description: `**${conductor}** is conducting the train today.\n\nAll aboard — see you at boarding time!`,
      color: 0xe8720c,
      fields: [
        { name: 'Date', value: formatDisplayDate(dateStr), inline: false },
        { name: '​', value: '**— Upcoming conductors —**', inline: false },
        ...weekFields,
      ],
      footer: { text: 'ashmasters.org · automated reminder' },
      timestamp: new Date().toISOString(),
    };
    try { await postToDiscord(env.DISCORD_WEBHOOK_URL, { embeds: [embed] }); }
    catch (e) { return new Response(e.message, { status: 502, headers: CORS }); }
    return Response.json({ ok: true, conductor, date: dateStr }, { headers: CORS });
  }

  /* ── Manual daily post from train.html ──────────────────── */
  if (action === 'daily-manual') {
    const { conductor, date, upcomingWeek, webhookOverride, boardingTime, vip } = body;
    if (!conductor) return new Response('Missing conductor', { status: 400, headers: CORS });

    const { url: webhookUrl, err } = resolveWebhook(env, webhookOverride);
    if (err) return new Response(err, { status: 503, headers: CORS });

    const todayStr = date || getGameDateAtReset();
    let boardingTs = null, resetTs = null;
    if (boardingTime) {
      const h = parseInt(boardingTime.split(':')[0]) || 0;
      const [y, m, d] = todayStr.split('-').map(Number);
      boardingTs = Math.floor(Date.UTC(y, m - 1, d, h, 0, 0) / 1000);
      resetTs    = Math.floor(Date.UTC(y, m - 1, d, 2, 0, 0) / 1000);
    }

    const weekFields = (upcomingWeek || []).slice(0, 7).map((item, i) => {
      const label = date ? formatShortDate(addDays(date, i)) : item.day;
      const cond  = i === 0 ? `**${item.conductor}** ← today` : `**${item.conductor || '?'}**`;
      return { name: label, value: cond + (item.vip ? `\n⭐ VIP: **${item.vip}**` : ''), inline: true };
    });

    const description = boardingTs
      ? `**${conductor}** is conducting the train today.\n\nAll aboard — boarding at <t:${boardingTs}:t> · Reset at <t:${resetTs}:t>`
      : `**${conductor}** is conducting the train today.\n\nAll aboard!`;

    const embed = {
      title: '🚂 Today\'s Train Conductor',
      description,
      color: 0xe8720c,
      fields: [
        { name: 'Date', value: formatDisplayDate(todayStr), inline: false },
        ...(vip ? [{ name: '⭐ VIP', value: `**${vip}**`, inline: false }] : []),
        ...(weekFields.length ? [{ name: '​', value: '**— Upcoming conductors —**', inline: false }, ...weekFields] : []),
      ],
      footer: { text: 'ashmasters.org · train scheduler' },
      timestamp: new Date().toISOString(),
    };
    try { await postToDiscord(webhookUrl, { embeds: [embed] }); }
    catch (e) { return new Response(e.message, { status: 502, headers: CORS }); }
    return Response.json({ ok: true }, { headers: CORS });
  }

  /* ── Manual weekly schedule post ────────────────────────── */
  const { schedule, boardingTime, weekLabel, webhookOverride, _test } = body;

  const { url: webhookUrl, err } = resolveWebhook(env, webhookOverride);
  if (err) return new Response(err, { status: 503, headers: CORS });

  // Test ping
  if (_test) {
    try { await postToDiscord(webhookUrl, { content: '🚂 Webhook test from Train Conductor Scheduler — ashmasters.org' }); }
    catch (e) { return new Response(e.message, { status: 502, headers: CORS }); }
    return Response.json({ ok: true }, { headers: CORS });
  }

  if (!Array.isArray(schedule) || !schedule.length) {
    return new Response('Missing schedule', { status: 400, headers: CORS });
  }

  const title = weekLabel ? `🚂 Train Conductor Schedule — ${weekLabel}` : '🚂 Train Conductor Schedule';
  const fields = schedule.map(({ day, conductor, vip }) => {
    let value = conductor ? `**${conductor}**` : '*(unassigned)*';
    if (vip) value += `\n⭐ VIP: **${vip}**`;
    return { name: day, value, inline: true };
  });

  const embed = {
    title,
    color: 0xe8720c,
    fields,
    footer: { text: `⏰ Boarding: ${boardingTime || '??:??'} · ashmasters.org` },
    timestamp: new Date().toISOString(),
  };

  try { await postToDiscord(webhookUrl, { embeds: [embed] }); }
  catch (e) { return new Response(e.message, { status: 502, headers: CORS }); }

  return Response.json({ ok: true }, { headers: CORS });
}
