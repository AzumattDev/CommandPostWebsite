// GET  /api/coalition?server=2190             — all plans for a server (array)
// GET  /api/coalition?server=2190&plan_name=X — fetch one specific plan
// POST /api/coalition                         — upsert plan (body: { server, plan_name, label, alliance, plan_data, updated_by })
//
// DB schema (run migration if upgrading from single-plan-per-server):
//   CREATE TABLE coalition_plans (
//     server    TEXT NOT NULL,
//     plan_name TEXT NOT NULL DEFAULT 'Default',
//     label     TEXT,
//     alliance  TEXT,
//     plan_data TEXT,
//     updated_by TEXT,
//     updated_at TEXT,
//     PRIMARY KEY (server, plan_name)
//   );

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const server    = url.searchParams.get('server');
  const plan_name = url.searchParams.get('plan_name');

  if (!server) return new Response('Missing server', { status: 400, headers: CORS });

  if (plan_name) {
    // Fetch one specific plan
    const row = await env.DB.prepare(
      `SELECT server, plan_name, label, alliance, plan_data, updated_by, updated_at
       FROM coalition_plans WHERE server = ? AND plan_name = ?`
    ).bind(String(server).slice(0, 10), String(plan_name).slice(0, 30)).first();

    if (!row) return new Response('Not found', { status: 404, headers: CORS });
    return Response.json(row, { headers: CORS });
  } else {
    // Return all plans for the server as an array
    const result = await env.DB.prepare(
      `SELECT server, plan_name, label, alliance, plan_data, updated_by, updated_at
       FROM coalition_plans WHERE server = ? ORDER BY updated_at DESC`
    ).bind(String(server).slice(0, 10)).all();

    if (!result.results || !result.results.length)
      return new Response('Not found', { status: 404, headers: CORS });

    return Response.json(result.results, { headers: CORS });
  }
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return new Response('Bad JSON', { status: 400, headers: CORS }); }

  const server     = String(body.server     ?? '').trim().slice(0, 10);
  const plan_name  = String(body.plan_name  ?? body.alliance ?? 'Default').trim().slice(0, 30) || 'Default';
  const label      = String(body.label      ?? '').trim().slice(0, 60);
  const alliance   = String(body.alliance   ?? '').trim().slice(0, 10);
  const updated_by = String(body.updated_by ?? '').trim().slice(0, 20);
  const plan_data  = String(body.plan_data  ?? '').slice(0, 131072); // 128 KB max

  if (!server)    return new Response('Missing server',    { status: 400, headers: CORS });
  if (!plan_data) return new Response('Missing plan_data', { status: 400, headers: CORS });

  try { JSON.parse(plan_data); } catch { return new Response('plan_data is not valid JSON', { status: 400, headers: CORS }); }

  const updated_at = new Date().toISOString().replace('T', ' ').slice(0, 19);

  await env.DB.prepare(`
    INSERT INTO coalition_plans (server, plan_name, label, alliance, plan_data, updated_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(server, plan_name) DO UPDATE SET
      label      = excluded.label,
      alliance   = excluded.alliance,
      plan_data  = excluded.plan_data,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at
  `).bind(server, plan_name, label, alliance, plan_data, updated_by, updated_at).run();

  return Response.json({ ok: true, updated_at }, { headers: CORS });
}
