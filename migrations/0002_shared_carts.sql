CREATE TABLE IF NOT EXISTS shared_carts (
  id TEXT PRIMARY KEY,
  items_json TEXT NOT NULL,
  total REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
