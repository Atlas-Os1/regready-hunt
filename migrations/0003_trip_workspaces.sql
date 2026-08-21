CREATE TABLE IF NOT EXISTS trips (
  trip_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT,
  species TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trip_items (
  item_id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trip_invites (
  invite_id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  email TEXT,
  display_name TEXT,
  invite_token TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS trips_user_idx ON trips(user_id, start_date);
CREATE INDEX IF NOT EXISTS trip_items_trip_idx ON trip_items(trip_id, created_at);
CREATE INDEX IF NOT EXISTS trip_invites_token_idx ON trip_invites(invite_token);
