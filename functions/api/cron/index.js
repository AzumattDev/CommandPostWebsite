// GET/POST /api/cron?secret=X
//
// Fires hourly; posts daily conductor announcement to alliances where:
//   post_daily=1, boarding_hour_utc=currentHour, last_posted_date!=today
//
// Env vars required: CRON_SECRET, DB

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

function utcDate() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function utcDow() {
  return (new Date().getUTCDay() + 6) % 7; // 0=Mon … 6=Sun
}

function dateAddDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function fmtShortDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

function boardingUnixTs(dateStr, hourUtc) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d, Number(hourUtc), 0, 0) / 1000);
}

function resetUnixTs(dateStr) {
  return boardingUnixTs(dateStr, 2); // 02:00 UTC game reset
}

async function postToDiscord(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Discord ${res.status}: ${await res.text()}`);
}

async function handleCron(env) {
  const hour  = new Date().getUTCHours();
  const today = utcDate();
  const dow   = utcDow();

  const allyRes = await env.DB.prepare(
    `SELECT id, name, discord_webhook, show_vip, boarding_hour_utc
     FROM alliances
     WHERE post_daily=1
       AND boarding_hour_utc=?
       AND last_posted_date != ?`
  ).bind(hour, today).all();

  const alliances = allyRes.results || [];
  const results = [];

  for (const ally of alliances) {
    if (!ally.discord_webhook) {
      results.push({ id: ally.id, skipped: 'no webhook' });
      continue;
    }

    const row = await env.DB.prepare(
      'SELECT conductor, vip FROM alliance_schedule WHERE alliance_id=? AND day_index=?'
    ).bind(ally.id, dow).first();

    const conductor = row?.conductor || '';
    const vip       = row?.vip       || '';

    if (!conductor) {
      results.push({ id: ally.id, name: ally.name, skipped: 'no conductor set for today' });
      continue;
    }

    const weekRes = await env.DB.prepare(
      'SELECT day_index, conductor FROM alliance_schedule WHERE alliance_id=? ORDER BY day_index'
    ).bind(ally.id).all();

    const weekConds = Array(7).fill('?');
    for (const w of (weekRes.results || [])) weekConds[w.day_index] = w.conductor || '?';

    const boardingTs = boardingUnixTs(today, ally.boarding_hour_utc ?? 2);
    const resetTs    = resetUnixTs(today);

    const weekFields = Array.from({ length: 7 }, (_, i) => {
      const idx  = (dow + i) % 7;
      const date = dateAddDays(today, i);
      return {
        name:   fmtShortDate(date),
        value:  i === 0 ? `**${weekConds[idx]}** ← today` : `**${weekConds[idx] || '?'}**`,
        inline: true,
      };
    });

    const embed = {
      title:       '🚂 Today\'s Train Conductor',
      description: [
        `**${conductor}** is conducting today's train!`,
        '',
        'All aboard! 🚂',
        '',
        `📅 ${formatDisplayDate(today)}`,
        `⏰ **Boarding:** <t:${boardingTs}:t>`,
        `🔄 **Game Reset:** <t:${resetTs}:t>`,
      ].join('\n'),
      color:  0xe8720c,
      fields: [
        ...(ally.show_vip === 1 && vip ? [{ name: '⭐ VIP', value: `**${vip}**`, inline: false }] : []),
        { name: '​', value: '**— This Week —**', inline: false },
        ...weekFields,
      ],
      footer:    { text: `${ally.name} · commandpost.guide · automated reminder` },
      timestamp: new Date().toISOString(),
    };

    try {
      await postToDiscord(ally.discord_webhook, { embeds: [embed] });
      await env.DB.prepare('UPDATE alliances SET last_posted_date=? WHERE id=?').bind(today, ally.id).run();
      results.push({ id: ally.id, name: ally.name, ok: true, conductor });
    } catch (e) {
      results.push({ id: ally.id, name: ally.name, error: e.message });
    }
  }

  return { ok: true, hour, today, checked: alliances.length, fired: results.filter(r => r.ok).length, results };
}

export async function onRequestGet({ request, env }) {
  const secret = new URL(request.url).searchParams.get('secret');
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  const result = await handleCron(env);
  return Response.json(result, { headers: CORS });
}

export { onRequestGet as onRequestPost };
