-- Run this once in the D1 dashboard: D1 > your database > Console > paste and execute
-- If updating an existing DB, run only the CREATE TABLE statements for new tables.

CREATE TABLE IF NOT EXISTS server_registry (
  server_num   INTEGER PRIMARY KEY,
  start_date   TEXT    NOT NULL,          -- YYYY-MM-DD, UTC midnight = server day 1
  verified     INTEGER DEFAULT 0,         -- 1 = manually confirmed accurate
  vote_count   INTEGER DEFAULT 1,
  updated_at   TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS server_submissions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  server_num   INTEGER NOT NULL,
  start_date   TEXT    NOT NULL,
  submitted_at TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_corrections (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  event_day    INTEGER NOT NULL,
  event_title  TEXT    NOT NULL,
  correction   TEXT    NOT NULL,
  status       TEXT    DEFAULT 'pending',   -- pending | approved | rejected
  submitted_at TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS train_roster (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    DEFAULT (datetime('now'))
);

-- coalition_plans: supports multiple plans per server (keyed by server + plan_name)
-- NEW schema — run the migration block below if upgrading from the old single-plan schema
CREATE TABLE IF NOT EXISTS coalition_plans (
  server      TEXT NOT NULL,
  plan_name   TEXT NOT NULL DEFAULT 'Default',  
  label       TEXT DEFAULT '',    
  alliance    TEXT DEFAULT '',   
  plan_data   TEXT NOT NULL,      
  updated_by  TEXT DEFAULT '',
  updated_at  TEXT NOT NULL, 
  PRIMARY KEY (server, plan_name)
);

-- preseason_plans: one plan per server+alliance combo (mirrors coalition_plans pattern)
CREATE TABLE IF NOT EXISTS preseason_plans (
  server      TEXT NOT NULL,
  plan_name   TEXT NOT NULL DEFAULT 'Default',
  label       TEXT DEFAULT '',
  alliance    TEXT DEFAULT '',
  plan_data   TEXT NOT NULL,
  updated_by  TEXT DEFAULT '',
  updated_at  TEXT NOT NULL,
  PRIMARY KEY (server, plan_name)
);

MIGRATION (ran this block once for upgrading from the old single-primary-key schema)
CREATE TABLE coalition_plans_new (
  server    TEXT NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'Default',
  label     TEXT DEFAULT '',
  alliance  TEXT DEFAULT '',
  plan_data TEXT NOT NULL,
  updated_by TEXT DEFAULT '',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (server, plan_name)
);
INSERT OR IGNORE INTO coalition_plans_new
  SELECT server,
         COALESCE(NULLIF(alliance,''), COALESCE(NULLIF(label,''), 'Default')),
         label, alliance, plan_data, updated_by, updated_at
  FROM coalition_plans;
DROP TABLE coalition_plans;
ALTER TABLE coalition_plans_new RENAME TO coalition_plans;

