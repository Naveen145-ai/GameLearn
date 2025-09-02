import { useState, useEffect } from 'react';

export const useGameEngine = (initialScore = 0) => {
  const [score, setScore] = useState(initialScore);

  const increaseScore = (points: number) => setScore(score + points);
  const decreaseScore = (points: number) => setScore(score - points);

  return { score, increaseScore, decreaseScore };
};
