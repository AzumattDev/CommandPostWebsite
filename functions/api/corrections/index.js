// POST /api/corrections — submit an event correction
// GET  /api/corrections?token=X — list pending (admin)
// POST /api/corrections?action=approve&id=X&token=X — approve
// POST /api/corrections?action=reject&id=X&token=X  — reject

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

function isAdmin(request, env) {
  const url = new URL(request.url);
  return url.searchParams.get('token') === env.ADMIN_TOKEN;
}

export async function onRequestGet({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  const rows = await env.DB.prepare(
    `SELECT id, event_day, event_title, correction, status, submitted_at
     FROM event_corrections WHERE status = 'pending' ORDER BY submitted_at DESC LIMIT 100`
  ).all();
  return Response.json(rows.results, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  // Admin actions
  if (action === 'approve' || action === 'reject') {
    if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
    const id = parseInt(url.searchParams.get('id'));
    if (!id) return new Response('Missing id', { status: 400 });
    await env.DB.prepare(`UPDATE event_corrections SET status = ? WHERE id = ?`)
      .bind(action === 'approve' ? 'approved' : 'rejected', id).run();
    return Response.json({ ok: true }, { headers: CORS });
  }

  // Public submission
  let body;
  try { body = await request.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const { event_day, event_title, correction } = body;
  if (!Number.isInteger(event_day) || !event_title || !correction) {
    return new Response('Missing fields', { status: 400 });
  }
  if (correction.length > 500) return new Response('Too long', { status: 400 });

  await env.DB.prepare(
    `INSERT INTO event_corrections (event_day, event_title, correction) VALUES (?, ?, ?)`
  ).bind(event_day, String(event_title).slice(0, 200), String(correction).slice(0, 500)).run();

  return Response.json({ ok: true }, { headers: CORS });
}
