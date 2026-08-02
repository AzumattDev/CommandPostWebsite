-- Alliance multi-tenant tables for the Train Conductor Scheduler
-- Run via: wrangler d1 execute lastwar-servers --file=migrations/alliance_tables.sql

CREATE TABLE IF NOT EXISTS alliances (
  id                 TEXT    PRIMARY KEY,
  name               TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  server             TEXT    NOT NULL DEFAULT '',
  token_hash         TEXT    NOT NULL UNIQUE,
  discord_webhook    TEXT,
  boarding_hour_utc  INTEGER NOT NULL DEFAULT 2,
  post_daily         INTEGER NOT NULL DEFAULT 0,
  show_vip           INTEGER NOT NULL DEFAULT 0,
  rot_idx            TEXT    NOT NULL DEFAULT '{"r5":0,"r4":0,"r3":0,"r2":0,"r1":0,"any":0}',
  last_posted_date   TEXT    NOT NULL DEFAULT '',
  server_utc_offset  INTEGER NOT NULL DEFAULT 0,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS alliance_roster (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  alliance_id  TEXT    NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL COLLATE NOCASE,
  role         TEXT    NOT NULL DEFAULT 'r4' CHECK(role IN ('r5','r4','r3','r2','r1')),
  active       INTEGER NOT NULL DEFAULT 1,
  avail        TEXT    NOT NULL DEFAULT '1111111',
  vs_points    INTEGER NOT NULL DEFAULT 0,
  tech_points  INTEGER NOT NULL DEFAULT 0,
  power        INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(alliance_id, name)
);

CREATE TABLE IF NOT EXISTS alliance_schedule (
  alliance_id  TEXT    NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  day_index    INTEGER NOT NULL CHECK(day_index BETWEEN 0 AND 6),
  conductor    TEXT    NOT NULL DEFAULT '',
  vip          TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (alliance_id, day_index)
);

CREATE TABLE IF NOT EXISTS alliance_day_rules (
  alliance_id  TEXT    NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  day_index    INTEGER NOT NULL CHECK(day_index BETWEEN 0 AND 6),
  rule_type    TEXT    NOT NULL DEFAULT 'manual',
  label        TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (alliance_id, day_index)
);

-- Migration: add server timezone offset (run once if upgrading)
-- In D1 console: paste this single line and execute:
-- ALTER TABLE alliances ADD COLUMN server_utc_offset INTEGER NOT NULL DEFAULT 0;

-- Migration: add boarding minute support (run once if upgrading)
-- In D1 console: paste this single line and execute:
-- ALTER TABLE alliances ADD COLUMN boarding_minute_utc INTEGER NOT NULL DEFAULT 0;

-- Migration: add roster power for point tiebreaks (run once if upgrading)
-- In D1 console: paste this single line and execute:
-- ALTER TABLE alliance_roster ADD COLUMN power INTEGER NOT NULL DEFAULT 0;
