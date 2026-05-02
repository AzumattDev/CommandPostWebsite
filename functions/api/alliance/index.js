// GET  /api/alliance?id=X&token=X                        — load full state
// POST /api/alliance?action=register                      — create alliance, body:{name,server?,password}
// POST /api/alliance?action=auth&id=X&token=X             — verify + return full state
// POST /api/alliance?action=settings&id=X&token=X         — body:{webhook?,boardingHour?,postDaily?,showVip?,server?}
// POST /api/alliance?action=roster&id=X&token=X           — body:{players:[...]}
// POST /api/alliance?action=schedule&id=X&token=X         — body:{conductors:[7],vips:[7]}
// POST /api/alliance?action=rules&id=X&token=X            — body:{rules:[7]}
// POST /api/alliance?action=rot-idx&id=X&token=X          — body:{rotIdx:{...}}
// POST /api/alliance?action=discord-schedule&id=X&token=X — body:{schedule,boardingTime,weekLabel?,_test?}
// POST /api/alliance?action=discord-daily&id=X&token=X    — body:{conductor,date,upcomingWeek?}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

/* ── Crypto helpers ────────────────────────────────────────── */

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function genId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return 'a' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ── DB helpers ────────────────────────────────────────────── */

async function resolveAlliance(db, id, token) {
  if (!id || !token) return null;
  const hash = await sha256(token);
  return db.prepare(
    'SELECT id,name,server,discord_webhook,boarding_hour_utc,post_daily,show_vip,rot_idx FROM alliances WHERE id=? AND token_hash=?'
  ).bind(id, hash).first();
}

async function loadFullState(db, id) {
  const [rosterRes, schedRes, rulesRes] = await Promise.all([
    db.prepare('SELECT id,name,role,active,avail,vs_points,tech_points,sort_order FROM alliance_roster WHERE alliance_id=? ORDER BY sort_order ASC,id ASC').bind(id).all(),
    db.prepare('SELECT day_index,conductor,vip FROM alliance_schedule WHERE alliance_id=? ORDER BY day_index').bind(id).all(),
    db.prepare('SELECT day_index,rule_type,label FROM alliance_day_rules WHERE alliance_id=? ORDER BY day_index').bind(id).all(),
  ]);

  const roster = (rosterRes.results || []).map(r => ({
    id: r.id, name: r.name, role: r.role,
    active: r.active === 1,
    avail: String(r.avail || '1111111'),
    vsPoints: r.vs_points, techPoints: r.tech_points, sortOrder: r.sort_order,
  }));

  const conductors = Array(7).fill('');
  const vips = Array(7).fill('');
  for (const row of (schedRes.results || [])) {
    conductors[row.day_index] = row.conductor || '';
    vips[row.day_index] = row.vip || '';
  }

  const rules = Array.from({ length: 7 }, () => ({ type: 'manual', label: '' }));
  for (const row of (rulesRes.results || [])) {
    rules[row.day_index] = { type: row.rule_type, label: row.label || '' };
  }

  return { roster, conductors, vips, rules };
}

const DEFAULT_RULES = [
  { type: 'r4r5-rotation', label: 'Officers' },
  { type: 'r4r5-rotation', label: 'Officers' },
  { type: 'r3-rotation',   label: '' },
  { type: 'bg-mvp',        label: 'BG MVP' },
  { type: 'tech-top',      label: 'Tech Top' },
  { type: 'casino',        label: 'Casino Night' },
  { type: 'mvp',           label: 'Weekly MVP' },
];

async function seedDefaultRules(db, id) {
  const stmts = DEFAULT_RULES.map((r, i) =>
    db.prepare('INSERT OR IGNORE INTO alliance_day_rules (alliance_id,day_index,rule_type,label) VALUES (?,?,?,?)')
      .bind(id, i, r.type, r.label)
  );
  await db.batch(stmts);
}

function allianceView(ally) {
  return {
    id: ally.id, name: ally.name, server: ally.server || '',
    webhook: ally.discord_webhook || '',
    boardingHour: ally.boarding_hour_utc ?? 2,
    postDaily: ally.post_daily === 1,
    showVip: ally.show_vip === 1,
    rotIdx: (() => { try { return JSON.parse(ally.rot_idx || '{}'); } catch { return {}; } })(),
  };
}

/* ── Discord helpers ───────────────────────────────────────── */

async function postToDiscord(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Discord ${res.status}: ${await res.text()}`);
}

function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

function utcDate() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
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

function boardingUnixTs(dateStr, hourUtc) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d, Number(hourUtc), 0, 0) / 1000);
}

function resetUnixTs(dateStr) {
  return boardingUnixTs(dateStr, 2); // 02:00 UTC game reset
}

function daysBetween(fromStr, toStr) {
  const [fy, fm, fd] = fromStr.split('-').map(Number);
  const [ty, tm, td] = toStr.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

function currentUtcMonday() {
  const d = new Date();
  const dow = (d.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow));
  return `${monday.getUTCFullYear()}-${String(monday.getUTCMonth() + 1).padStart(2, '0')}-${String(monday.getUTCDate()).padStart(2, '0')}`;
}

/* ── GET: load state ───────────────────────────────────────── */

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const ally = await resolveAlliance(env.DB, url.searchParams.get('id'), url.searchParams.get('token'));
  if (!ally) return new Response('Unauthorized', { status: 401, headers: CORS });

  const state = await loadFullState(env.DB, ally.id);
  return Response.json({ ok: true, alliance: allianceView(ally), ...state }, { headers: CORS });
}

/* ── POST: all mutations ───────────────────────────────────── */

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  let body;
  try { body = await request.json(); } catch {
    return new Response('Bad JSON', { status: 400, headers: CORS });
  }

  /* ── Register ── */
  if (action === 'register') {
    const name     = String(body.name     || '').trim().slice(0, 48);
    const server   = String(body.server   || '').trim().slice(0, 32);
    const password = String(body.password || '').trim();
    if (!name)                  return new Response('Missing alliance name',              { status: 400, headers: CORS });
    if (password.length < 6)    return new Response('Password must be at least 6 chars', { status: 400, headers: CORS });

    const id   = genId();
    const hash = await sha256(password);
    const rotIdx = '{"r5":0,"r4":0,"r3":0,"r2":0,"r1":0,"any":0}';

    try {
      await env.DB.prepare(
        'INSERT INTO alliances (id,name,server,token_hash,rot_idx) VALUES (?,?,?,?,?)'
      ).bind(id, name, server, hash, rotIdx).run();
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return new Response('An alliance with that name already exists', { status: 409, headers: CORS });
      }
      throw e;
    }

    await seedDefaultRules(env.DB, id);
    return Response.json({ ok: true, id, name }, { headers: CORS });
  }

  /* ── Auth (login) ── */
  if (action === 'auth') {
    const id    = url.searchParams.get('id')    || String(body.id    || '');
    const token = url.searchParams.get('token') || String(body.password || '');
    const ally  = await resolveAlliance(env.DB, id, token);
    if (!ally) return new Response('Invalid alliance ID or password', { status: 401, headers: CORS });

    const state = await loadFullState(env.DB, id);
    return Response.json({ ok: true, alliance: allianceView(ally), ...state }, { headers: CORS });
  }

  /* ── All remaining actions require auth ── */
  const id    = url.searchParams.get('id');
  const token = url.searchParams.get('token');
  const ally  = await resolveAlliance(env.DB, id, token);
  if (!ally) return new Response('Unauthorized', { status: 401, headers: CORS });

  /* ── Settings ── */
  if (action === 'settings') {
    const parts = [], vals = [];
    const set = (col, val) => { parts.push(`${col}=?`); vals.push(val); };

    if (body.webhook     !== undefined) set('discord_webhook',   String(body.webhook || '').trim().slice(0, 300) || null);
    if (body.boardingHour !== undefined) set('boarding_hour_utc', Math.max(0, Math.min(23, parseInt(body.boardingHour) || 0)));
    if (body.postDaily   !== undefined) set('post_daily',         body.postDaily ? 1 : 0);
    if (body.showVip     !== undefined) set('show_vip',           body.showVip   ? 1 : 0);
    if (body.server      !== undefined) set('server',             String(body.server || '').trim().slice(0, 32));

    if (parts.length) {
      vals.push(id);
      await env.DB.prepare(`UPDATE alliances SET ${parts.join(',')} WHERE id=?`).bind(...vals).run();
    }
    return Response.json({ ok: true }, { headers: CORS });
  }

  /* ── Roster (full replace) ── */
  if (action === 'roster') {
    const players = Array.isArray(body.players) ? body.players.slice(0, 100) : [];
    const validRoles = new Set(['r5','r4','r3','r2','r1']);

    const inserts = players
      .map((p, i) => {
        const name = String(p.name || '').trim().slice(0, 32);
        if (!name) return null;
        const role   = validRoles.has(p.role) ? p.role : 'r4';
        const active = p.active ? 1 : 0;
        const avail  = String(p.avail || '1111111').replace(/[^01]/g, '1').slice(0, 7).padEnd(7, '1');
        const vs     = Math.max(0, parseInt(p.vsPoints)  || 0);
        const tech   = Math.max(0, parseInt(p.techPoints) || 0);
        return env.DB.prepare(
          'INSERT OR IGNORE INTO alliance_roster (alliance_id,name,role,active,avail,vs_points,tech_points,sort_order) VALUES (?,?,?,?,?,?,?,?)'
        ).bind(id, name, role, active, avail, vs, tech, i);
      })
      .filter(Boolean);

    await env.DB.batch([
      env.DB.prepare('DELETE FROM alliance_roster WHERE alliance_id=?').bind(id),
      ...inserts,
    ]);
    return Response.json({ ok: true }, { headers: CORS });
  }

  /* ── Schedule (full replace, 7 slots) ── */
  if (action === 'schedule') {
    const conductors = Array.isArray(body.conductors) ? body.conductors : Array(7).fill('');
    const vips       = Array.isArray(body.vips)       ? body.vips       : Array(7).fill('');
    await env.DB.batch([
      env.DB.prepare('DELETE FROM alliance_schedule WHERE alliance_id=?').bind(id),
      ...Array.from({ length: 7 }, (_, i) =>
        env.DB.prepare('INSERT INTO alliance_schedule (alliance_id,day_index,conductor,vip) VALUES (?,?,?,?)')
          .bind(id, i, String(conductors[i] || '').trim().slice(0, 32), String(vips[i] || '').trim().slice(0, 32))
      ),
    ]);
    return Response.json({ ok: true }, { headers: CORS });
  }

  /* ── Day rules (full replace, 7 slots) ── */
  if (action === 'rules') {
    const rules = Array.isArray(body.rules) ? body.rules.slice(0, 7) : [];
    if (!rules.length) return Response.json({ ok: true }, { headers: CORS });
    await env.DB.batch([
      env.DB.prepare('DELETE FROM alliance_day_rules WHERE alliance_id=?').bind(id),
      ...rules.map((r, i) =>
        env.DB.prepare('INSERT INTO alliance_day_rules (alliance_id,day_index,rule_type,label) VALUES (?,?,?,?)')
          .bind(id, i, String(r.type || 'manual').slice(0, 32), String(r.label || '').slice(0, 64))
      ),
    ]);
    return Response.json({ ok: true }, { headers: CORS });
  }

  /* ── Rotation index ── */
  if (action === 'rot-idx') {
    let rotIdx;
    try { rotIdx = JSON.stringify(body.rotIdx || {}); } catch { rotIdx = '{}'; }
    await env.DB.prepare('UPDATE alliances SET rot_idx=? WHERE id=?').bind(rotIdx, id).run();
    return Response.json({ ok: true }, { headers: CORS });
  }

  /* ── Discord: post weekly schedule ── */
  if (action === 'discord-schedule') {
    if (!ally.discord_webhook) {
      return new Response('No Discord webhook configured for this alliance. Add one in Alliance Account settings.', { status: 503, headers: CORS });
    }
    const { schedule, boardingTime, weekLabel, weekStartDate, _test } = body;
    if (_test) {
      try { await postToDiscord(ally.discord_webhook, { content: '🚂 Webhook test — ashmasters.org · Train Conductor Scheduler' }); }
      catch (e) { return new Response(e.message, { status: 502, headers: CORS }); }
      return Response.json({ ok: true }, { headers: CORS });
    }

    if (!Array.isArray(schedule) || !schedule.length) {
      return new Response('Missing schedule', { status: 400, headers: CORS });
    }

    const monday      = weekStartDate || currentUtcMonday();
    const todayStr    = utcDate();
    const todayOffset = daysBetween(monday, todayStr);
    const bHour       = boardingTime ? (parseInt(boardingTime.split(':')[0]) || 0) : (ally.boarding_hour_utc ?? 2);
    const boardingTs  = boardingUnixTs(monday, bHour);
    const resetTs     = resetUnixTs(monday);

    const title = weekLabel ? `🚂 Train Conductor Schedule — ${weekLabel}` : '🚂 Train Conductor Schedule';

    const todayItem = todayOffset >= 0 && todayOffset < 7 ? schedule[todayOffset] : null;
    const descLines = [`⏰ **Boarding:** <t:${boardingTs}:t>  ·  🔄 **Reset:** <t:${resetTs}:t>`];
    if (todayItem?.conductor) descLines.push('', `Today's conductor: **${todayItem.conductor}**`);
    const description = descLines.join('\n');

    const fields = schedule.map(({ day, conductor, vip }, i) => {
      const fieldName = fmtShortDate(dateAddDays(monday, i));
      const isToday   = i === todayOffset;
      let value = conductor
        ? `**${conductor}**${isToday ? ' ← today' : ''}`
        : `*(unassigned)*${isToday ? ' ← today' : ''}`;
      if (vip) value += `\n⭐ VIP: **${vip}**`;
      return { name: fieldName, value, inline: true };
    });

    const embed = {
      title, description, color: 0xe8720c, fields,
      footer:    { text: `${ally.name} · ashmasters.org` },
      timestamp: new Date().toISOString(),
    };
    try { await postToDiscord(ally.discord_webhook, { embeds: [embed] }); }
    catch (e) { return new Response(e.message, { status: 502, headers: CORS }); }
    return Response.json({ ok: true }, { headers: CORS });
  }

  /* ── Discord: post today's conductor ── */
  if (action === 'discord-daily') {
    if (!ally.discord_webhook) {
      return new Response('No Discord webhook configured for this alliance.', { status: 503, headers: CORS });
    }
    const { conductor, date, upcomingWeek, boardingTime, vip } = body;
    if (!conductor) return new Response('Missing conductor', { status: 400, headers: CORS });

    const todayStr   = date || utcDate();
    const bHour      = boardingTime ? (parseInt(boardingTime.split(':')[0]) || 0) : (ally.boarding_hour_utc ?? 2);
    const boardingTs = boardingUnixTs(todayStr, bHour);
    const resetTs    = resetUnixTs(todayStr);

    const weekFields = (upcomingWeek || []).slice(0, 7).map((item, i) => {
      const label = date ? fmtShortDate(dateAddDays(date, i)) : item.day;
      const cond  = i === 0 ? `**${item.conductor}** ← today` : `**${item.conductor || '?'}**`;
      return { name: label, value: cond + (item.vip ? `\n⭐ VIP: **${item.vip}**` : ''), inline: true };
    });

    const embed = {
      title:       '🚂 Today\'s Train Conductor',
      description: `**${conductor}** is conducting the train today.\n\nAll aboard — boarding at <t:${boardingTs}:t> · Reset at <t:${resetTs}:t>`,
      color:  0xe8720c,
      fields: [
        { name: 'Date', value: formatDisplayDate(todayStr), inline: false },
        ...(vip ? [{ name: '⭐ VIP', value: `**${vip}**`, inline: false }] : []),
        ...(weekFields.length ? [{ name: '​', value: '**— Upcoming conductors —**', inline: false }, ...weekFields] : []),
      ],
      footer:    { text: `${ally.name} · ashmasters.org · train scheduler` },
      timestamp: new Date().toISOString(),
    };
    try { await postToDiscord(ally.discord_webhook, { embeds: [embed] }); }
    catch (e) { return new Response(e.message, { status: 502, headers: CORS }); }
    return Response.json({ ok: true }, { headers: CORS });
  }

  return new Response('Unknown action', { status: 400, headers: CORS });
}
