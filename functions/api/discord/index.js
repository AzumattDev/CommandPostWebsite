// POST /api/discord?token=X
//   Body: { schedule: [ { day, conductor, vip? }, … ], boardingTime, weekLabel? }
//   → Posts the weekly schedule embed to Discord.
//
// POST /api/discord?action=daily&token=X
//   No body required.
//   → Reads the roster from D1, computes today's conductor, posts an announcement embed.
//
// Env secrets required: DISCORD_WEBHOOK_URL, ADMIN_TOKEN

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

/* ── Shared helpers ──────────────────────────────────────── */

function conductorForDate(dateStr, roster) {
  if (!roster.length) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayNum = Math.round(
    (Date.UTC(y, m - 1, d) - Date.UTC(2020, 0, 1)) / 86400000
  );
  return roster[dayNum % roster.length].name;
}

// Game reset is 02:00 UTC. At that moment Date.now() - 2 h = yesterday's midnight UTC,
// so we add 1 day to get the just-started game day.
function getGameDateAtReset() {
  const d = new Date(Date.now());           // called right at / after 02:00 UTC
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC'
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
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC'
  });
}

async function postToDiscord(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord ${res.status}: ${err}`);
  }
}

/* ── Request handler ─────────────────────────────────────── */

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);

  if (url.searchParams.get('token') !== env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }

  if (!env.DISCORD_WEBHOOK_URL) {
    return new Response('Discord webhook not configured', { status: 503, headers: CORS });
  }

  const action = url.searchParams.get('action');

  /* ── Daily announcement (automated / cron) ──────────────── */
  if (action === 'daily') {
    const rows = await env.DB.prepare(
      `SELECT id, name, sort_order FROM train_roster ORDER BY sort_order ASC, id ASC`
    ).all();
    const roster = rows.results ?? [];

    if (!roster.length) {
      return new Response('Roster is empty', { status: 422, headers: CORS });
    }

    const dateStr   = getGameDateAtReset();
    const conductor = conductorForDate(dateStr, roster);
    const display   = formatDisplayDate(dateStr);

    // Build 7-day look-ahead (today + next 6)
    const weekFields = [];
    for (let i = 0; i < 7; i++) {
      const ds = i === 0 ? dateStr : addDays(dateStr, i);
      const name = conductorForDate(ds, roster);
      weekFields.push({
        name: formatShortDate(ds),
        value: i === 0 ? `**${name}** ← today` : `**${name}**`,
        inline: true,
      });
    }

    const embed = {
      title: '🚂 Today\'s Train Conductor',
      description: `**${conductor}** is conducting the train today.\n\nAll aboard — see you at boarding time!`,
      color: 0xe8720c,
      fields: [
        { name: 'Date', value: display, inline: false },
        { name: '\u200b', value: '**— Upcoming conductors —**', inline: false },
        ...weekFields,
      ],
      footer: { text: 'lasthorizoncommandpost.org · automated reminder' },
      timestamp: new Date().toISOString(),
    };

    try {
      await postToDiscord(env.DISCORD_WEBHOOK_URL, { embeds: [embed] });
    } catch (e) {
      return new Response(e.message, { status: 502, headers: CORS });
    }

    return Response.json({ ok: true, conductor, date: dateStr }, { headers: CORS });
  }

  /* ── Manual schedule post ────────────────────────────────── */
  let body;
  try { body = await request.json(); } catch {
    return new Response('Bad JSON', { status: 400, headers: CORS });
  }

  const { schedule, boardingTime, weekLabel } = body;
  if (!Array.isArray(schedule) || !schedule.length) {
    return new Response('Missing schedule', { status: 400, headers: CORS });
  }

  const title = weekLabel
    ? `🚂 Train Conductor Schedule — ${weekLabel}`
    : '🚂 Train Conductor Schedule';

  const fields = schedule.map(({ day, conductor, vip }) => {
    let value = conductor ? `**${conductor}**` : '*(unassigned)*';
    if (vip) value += `\n⭐ VIP: **${vip}**`;
    return { name: day, value, inline: true };
  });

  const embed = {
    title,
    color: 0xe8720c,
    fields,
    footer: { text: `⏰ Boarding: ${boardingTime || '??:??'} · lasthorizoncommandpost.org` },
    timestamp: new Date().toISOString(),
  };

  try {
    await postToDiscord(env.DISCORD_WEBHOOK_URL, { embeds: [embed] });
  } catch (e) {
    return new Response(e.message, { status: 502, headers: CORS });
  }

  return Response.json({ ok: true }, { headers: CORS });
}
