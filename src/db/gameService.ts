import { db, initDB, generateId } from './database';

export const initDatabase = () => {
  initDB();
};

export type LocalProgress = {
  id?: string;
  student_id: string;
  game_id: string;
  score: number;
  time_spent: number;
  level: number;
  grade: number;
  subject: string;
  date: string; // ISO
};

export function saveLocalProgress(p: LocalProgress) {
  const id = p.id || generateId();
  db.runSync(
    'INSERT OR REPLACE INTO game_progress (id, student_id, game_id, score, time_spent, level, grade, subject, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, p.student_id, p.game_id, p.score, p.time_spent, p.level, p.grade, p.subject, p.date]
  );
  return id;
}

export function getLocalProgressBySubject(subject: string) {
  const result = db.getAllSync<any>(
    'SELECT * FROM game_progress WHERE subject = ? ORDER BY date DESC LIMIT 200',
    [subject]
  );
  return result;
}

export function exportProgressForStudent(studentId: string) {
  const rows = db.getAllSync<any>(
    'SELECT * FROM game_progress WHERE student_id = ? ORDER BY date DESC',
    [studentId]
  );
  return rows;
}

export function importProgress(rows: LocalProgress[]) {
  db.transactionSync(tx => {
    for (const r of rows) {
      const id = r.id || generateId();
      tx.run(
        'INSERT OR REPLACE INTO game_progress (id, student_id, game_id, score, time_spent, level, grade, subject, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, r.student_id, r.game_id, r.score, r.time_spent, r.level, r.grade, r.subject, r.date]
      );
    }
  });
}
