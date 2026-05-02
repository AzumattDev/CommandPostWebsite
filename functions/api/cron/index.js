// GET/POST /api/cron?secret=X
//
// Call this endpoint hourly from an external cron service or a separate Cloudflare Worker.
// It posts the daily conductor announcement to every alliance where:
//   - post_daily = 1
//   - boarding_hour_utc matches the current UTC hour
//   - last_posted_date != today  (prevents duplicate posts)
//
// Env vars required:
//   CRON_SECRET — arbitrary secret string to protect this endpoint
//   DB          — D1 database binding

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function utcDate() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function utcDow() {
  return (new Date().getUTCDay() + 6) % 7; // 0=Mon … 6=Sun
}

function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
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

async function handleCron(env) {
  const hour  = new Date().getUTCHours();
  const today = utcDate();
  const dow   = utcDow();

  const allyRes = await env.DB.prepare(
    `SELECT id, name, discord_webhook, show_vip
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

    const weekFields = Array.from({ length: 7 }, (_, i) => {
      const idx = (dow + i) % 7;
      return {
        name: DAYS_SHORT[idx],
        value: i === 0 ? `**${weekConds[idx]}** ← today` : `**${weekConds[idx]}**`,
        inline: true,
      };
    });

    const embed = {
      title: '🚂 Today\'s Train Conductor',
      description: `**${conductor}** is conducting the train today.\n\nAll aboard — see you at boarding time!`,
      color: 0xe8720c,
      fields: [
        { name: 'Date', value: formatDisplayDate(today), inline: false },
        ...(ally.show_vip === 1 && vip ? [{ name: 'VIP', value: `⭐ **${vip}**`, inline: false }] : []),
        { name: '​', value: '**— This week —**', inline: false },
        ...weekFields,
      ],
      footer: { text: `${ally.name} · commandpost.guide · automated reminder` },
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
