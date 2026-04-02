import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database;

export function initDb(): void {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/severbus.db');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);
  seedIfEmpty(db);

  console.log(`Database connected: ${dbPath}`);
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      file_hash TEXT NOT NULL,
      source_url TEXT,
      parse_method TEXT NOT NULL DEFAULT 'deterministic',
      file_type TEXT NOT NULL DEFAULT 'docx',
      stops_count INTEGER NOT NULL,
      trips_count INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_schedule_active ON schedule(is_active) WHERE is_active = 1;

    CREATE TABLE IF NOT EXISTS schedule_changelog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL REFERENCES schedule(id),
      diff TEXT NOT NULL,
      summary TEXT NOT NULL,
      parse_method TEXT NOT NULL,
      previous_hash TEXT,
      new_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_changelog_created ON schedule_changelog(created_at DESC);

    CREATE TABLE IF NOT EXISTS complains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stop TEXT NOT NULL,
      direction TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('earlier', 'later', 'not_arrive', 'passed_by', 'arrived')),
      message TEXT,
      user_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_complains_created ON complains(created_at DESC);

    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_visits_user ON visits(user_id);
    CREATE INDEX IF NOT EXISTS idx_visits_created ON visits(created_at DESC);

    CREATE TABLE IF NOT EXISTS schedule_pipeline_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger TEXT NOT NULL DEFAULT 'cron',
      status TEXT NOT NULL,
      error_message TEXT,
      error_stage TEXT,
      parse_method TEXT,
      file_hash TEXT,
      duration_ms INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS feature_flags (
      key TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS request_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL DEFAULT 'info',
      method TEXT,
      url TEXT,
      status_code INTEGER,
      duration_ms INTEGER,
      error_message TEXT,
      error_stack TEXT,
      user_agent TEXT,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_request_logs_created ON request_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_request_logs_level ON request_logs(level);
    CREATE INDEX IF NOT EXISTS idx_request_logs_status ON request_logs(status_code);

    CREATE TABLE IF NOT EXISTS banner_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      message TEXT NOT NULL,
      is_approved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default feature flags
  db.prepare(`INSERT OR IGNORE INTO feature_flags (key, enabled) VALUES ('liveTracking', 1)`).run();
}

function seedIfEmpty(db: Database.Database): void {
  const row = db.prepare('SELECT COUNT(*) as cnt FROM schedule').get() as { cnt: number };
  if (row.cnt > 0) return;

  const seedPath = path.join(__dirname, '../data/schedule-seed.json');
  if (!fs.existsSync(seedPath)) {
    console.warn('schedule-seed.json not found, skipping seed');
    return;
  }

  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  const stopsCount = countStops(seedData);
  const tripsCount = countTrips(seedData);

  db.prepare(`
    INSERT INTO schedule (data, file_hash, parse_method, file_type, stops_count, trips_count, is_active)
    VALUES (?, 'seed', 'seed', 'seed', ?, ?, 1)
  `).run(JSON.stringify(seedData), stopsCount, tripsCount);

  console.log('Schedule seeded from schedule-seed.json');
}

function countStops(schedule: Record<string, unknown>): number {
  const stops = new Set<string>();
  for (const direction of Object.values(schedule) as Record<string, unknown>[]) {
    for (const day of Object.values(direction) as Record<string, unknown>[]) {
      for (const stop of Object.keys(day)) {
        stops.add(stop);
      }
    }
  }
  return stops.size;
}

function countTrips(schedule: Record<string, unknown>): number {
  let max = 0;
  for (const direction of Object.values(schedule) as Record<string, unknown>[]) {
    for (const day of Object.values(direction) as Record<string, unknown>[]) {
      for (const times of Object.values(day) as string[][]) {
        if (times.length > max) max = times.length;
      }
    }
  }
  return max;
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}
