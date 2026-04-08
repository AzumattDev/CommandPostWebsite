// GET  /api/coalition?server=2190   — fetch shared plan for a server
// POST /api/coalition                — upsert plan (body: { server, label, alliance, plan_data, updated_by })

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  const server = new URL(request.url).searchParams.get('server');
  if (!server) return new Response('Missing server', { status: 400, headers: CORS });

  const row = await env.DB.prepare(
    `SELECT server, label, alliance, plan_data, updated_by, updated_at
     FROM coalition_plans WHERE server = ?`
  ).bind(String(server).slice(0, 10)).first();

  if (!row) return new Response('Not found', { status: 404, headers: CORS });
  return Response.json(row, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return new Response('Bad JSON', { status: 400, headers: CORS }); }

  const server     = String(body.server     ?? '').trim().slice(0, 10);
  const label      = String(body.label      ?? '').trim().slice(0, 60);
  const alliance   = String(body.alliance   ?? '').trim().slice(0, 10);
  const updated_by = String(body.updated_by ?? '').trim().slice(0, 20);
  const plan_data  = String(body.plan_data  ?? '').slice(0, 131072); // 128 KB max

  if (!server)    return new Response('Missing server',    { status: 400, headers: CORS });
  if (!plan_data) return new Response('Missing plan_data', { status: 400, headers: CORS });

  // Basic JSON validation
  try { JSON.parse(plan_data); } catch { return new Response('plan_data is not valid JSON', { status: 400, headers: CORS }); }

  const updated_at = new Date().toISOString().replace('T', ' ').slice(0, 19);

  await env.DB.prepare(`
    INSERT INTO coalition_plans (server, label, alliance, plan_data, updated_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(server) DO UPDATE SET
      label      = excluded.label,
      alliance   = excluded.alliance,
      plan_data  = excluded.plan_data,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at
  `).bind(server, label, alliance, plan_data, updated_by, updated_at).run();

  return Response.json({ ok: true, updated_at }, { headers: CORS });
}
