import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR || ".data";
fs.mkdirSync(DATA_DIR, { recursive: true });
export const db = new Database(path.join(DATA_DIR, "kydras.db"));
db.pragma("journal_mode = WAL");

// events table (basic for counters)
db.exec(`
CREATE TABLE IF NOT EXISTS events(
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT "queued",
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

// short links
db.exec(`
CREATE TABLE IF NOT EXISTS short_links(
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

export default db;
