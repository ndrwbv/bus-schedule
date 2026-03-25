import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function initDb(): void {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/severbus.db');
  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log(`Database connected: ${dbPath}`);
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}
