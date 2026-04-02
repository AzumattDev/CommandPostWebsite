// GET /api/servers/:num
// Returns the community-consensus start date for a given server number.

export async function onRequestGet({ params, env }) {
  const num = parseInt(params.num);
  if (!num || num < 1) {
    return new Response('Bad request', { status: 400 });
  }

  const row = await env.DB.prepare(
    'SELECT server_num, start_date, verified, vote_count FROM server_registry WHERE server_num = ?'
  ).bind(num).first();

  if (!row) {
    return new Response('Not found', { status: 404 });
  }

  return Response.json(row, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
