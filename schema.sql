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
