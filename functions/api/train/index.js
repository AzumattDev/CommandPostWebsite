// GET  /api/train?token=X                       — list roster (admin)
// POST /api/train?action=add&token=X             — add member, body: { name }
// POST /api/train?action=remove&id=X&token=X     — remove member by id

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
    `SELECT id, name, sort_order FROM train_roster ORDER BY sort_order ASC, id ASC`
  ).all();
  return Response.json(rows.results, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'add') {
    let body;
    try { body = await request.json(); } catch { return new Response('Bad JSON', { status: 400 }); }
    const name = String(body.name ?? '').trim().slice(0, 32);
    if (!name) return new Response('Missing name', { status: 400 });

    const max = await env.DB.prepare(
      `SELECT COALESCE(MAX(sort_order), -1) AS m FROM train_roster`
    ).first();
    const sortOrder = (max?.m ?? -1) + 1;

    try {
      await env.DB.prepare(
        `INSERT INTO train_roster (name, sort_order) VALUES (?, ?)`
      ).bind(name, sortOrder).run();
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return new Response('Name already exists', { status: 409 });
      }
      throw e;
    }
    return Response.json({ ok: true }, { headers: CORS });
  }

  if (action === 'remove') {
    const id = parseInt(url.searchParams.get('id'));
    if (!id) return new Response('Missing id', { status: 400 });
    await env.DB.prepare(`DELETE FROM train_roster WHERE id = ?`).bind(id).run();
    return Response.json({ ok: true }, { headers: CORS });
  }

  return new Response('Unknown action', { status: 400 });
}
