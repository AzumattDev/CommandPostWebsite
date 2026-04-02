// POST /api/servers
// Accepts a community submission: { server_num, start_date }
// start_date is derived by the client: anchorDate - (anchorDay - 1) days

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const { server_num, start_date } = body;

  // Validate
  if (!Number.isInteger(server_num) || server_num < 1 || server_num > 99999) {
    return new Response('Invalid server_num', { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
    return new Response('Invalid start_date (expected YYYY-MM-DD)', { status: 400 });
  }

  // Log every submission for audit
  await env.DB.prepare(
    'INSERT INTO server_submissions (server_num, start_date) VALUES (?, ?)'
  ).bind(server_num, start_date).run();

  // Count submissions per (server_num, start_date) and pick the winner
  const winner = await env.DB.prepare(`
    SELECT start_date, COUNT(*) AS cnt
    FROM server_submissions
    WHERE server_num = ?
    GROUP BY start_date
    ORDER BY cnt DESC
    LIMIT 1
  `).bind(server_num).first();

  if (winner) {
    // Upsert registry with the consensus date + vote count
    await env.DB.prepare(`
      INSERT INTO server_registry (server_num, start_date, vote_count, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(server_num) DO UPDATE SET
        start_date  = excluded.start_date,
        vote_count  = excluded.vote_count,
        updated_at  = excluded.updated_at
      WHERE verified = 0
    `).bind(server_num, winner.start_date, winner.cnt).run();
  }

  return Response.json({ ok: true }, { headers: CORS });
}
