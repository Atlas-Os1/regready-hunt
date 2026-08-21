CREATE TABLE IF NOT EXISTS source_packs (
  pack_id TEXT PRIMARY KEY,
  authority TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  status TEXT NOT NULL,
  legal_notice TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS source_documents (
  source_id TEXT PRIMARY KEY,
  pack_id TEXT NOT NULL REFERENCES source_packs(pack_id),
  species TEXT,
  kind TEXT NOT NULL,
  scope TEXT NOT NULL,
  source_url TEXT NOT NULL,
  final_url TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  raw_file TEXT NOT NULL,
  text_file TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  UNIQUE(pack_id, source_url)
);

CREATE TABLE IF NOT EXISTS rule_records (
  rule_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES source_documents(source_id),
  species TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  source_text TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'captured-unreviewed',
  effective_year INTEGER,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rule_records_species ON rule_records(species);
CREATE INDEX IF NOT EXISTS idx_source_documents_pack ON source_documents(pack_id);
