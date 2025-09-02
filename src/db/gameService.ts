// Simple game service without SQLite for now
export const initDatabase = () => {
  console.log('Database initialized');
};

export const saveScore = (game: string, score: number) => {
  console.log(`Score saved: ${game} - ${score}`);
};

export const getScores = (callback: (scores: any[]) => void) => {
  // Mock scores for now
  callback([]);
};
