const SITE = 'https://lasthorizoncommandpost.org';

export default {
  // Fires every hour on the hour
  async scheduled(event, env) {
    const res = await fetch(`${SITE}/api/cron?secret=${env.CRON_SECRET}`);
    const body = await res.text();
    console.log(`[commandpost-cron] ${new Date().toISOString()} → ${res.status}: ${body}`);
  },

  // GET the worker URL directly to trigger manually (useful for testing)
  async fetch(request, env) {
    const res = await fetch(`${SITE}/api/cron?secret=${env.CRON_SECRET}`);
    const body = await res.text();
    return new Response(`${res.status}: ${body}`, {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};
