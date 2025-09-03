import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('gamelearn.db');

export const initDB = () => {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS game_progress (
      id TEXT PRIMARY KEY,
      student_id TEXT,
      game_id TEXT,
      score INTEGER,
      time_spent INTEGER,
      level INTEGER,
      grade INTEGER,
      subject TEXT,
      date TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_gp_student ON game_progress(student_id);
    CREATE INDEX IF NOT EXISTS idx_gp_subject ON game_progress(subject);
  `);
};

export function generateId() {
  return `loc_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
