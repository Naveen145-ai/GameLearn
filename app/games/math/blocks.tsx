import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';
import { saveLocalProgress } from '../../../src/db/gameService';

type BlockPuzzle = { display: string; required: string[]; bag: string[] };

const P9: BlockPuzzle[] = [
  { display: '(a+b)² =', required: ['a²', '2ab', 'b²'], bag: ['a²', '2ab', 'b²', 'a³'] },
  { display: 'Perimeter(rect) =', required: ['2(l + w)'], bag: ['2(l + w)', 'l × w'] },
];
const P10: BlockPuzzle[] = [
  { display: 'x =', required: ['(-b ± √(b² - 4ac)) / (2a)'], bag: ['(-b ± √(b² - 4ac)) / (2a)', '(b² - 4ac) / (2a)'] },
  { display: 'SA(sphere) =', required: ['4πr²'], bag: ['4πr²', '2πr²'] },
];

export default function Blocks() {
  const { grade } = useLocalSearchParams<{ grade?: string }>();
  const puzzles = grade === '10' ? P10 : P9;
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const bagTerms = useMemo(() => puzzles[idx].bag, [idx]);

  const pick = (t: string) => {
    if (selected.includes(t)) return;
    setSelected(prev => [...prev, t]);
  };

  const reset = () => setSelected([]);

  const check = () => {
    const ok = selected.length === puzzles[idx].required.length && selected.every((t, i) => t === puzzles[idx].required[i]);
    if (ok) {
      setScore(s => s + 100);
      if (idx < puzzles.length - 1) { setIdx(i => i + 1); setSelected([]); } else { end(); }
    } else {
      setScore(s => Math.max(0, s - 50));
      setSelected([]);
    }
  };

  const end = async () => {
    saveLocalProgress({ student_id: 'S_LOCAL', game_id: `math_${grade || '9'}_blocks`, score, time_spent: 0, level: idx + 1, grade: grade === '10' ? 10 : 9, subject: 'Math', date: new Date().toISOString() });
    await saveGameScore({ userId: `user_${Date.now()}`, gameId: `math_${grade || '9'}_blocks`, score, timeSpent: 0, completedAt: new Date().toISOString(), grade: grade === '10' ? 10 : 9, subject: 'Math' });
    Alert.alert('Blocks Over', `Score: ${score}`);
  };

  return (
    <LinearGradient colors={['#8b5cf6', '#5b21b6']} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Puzzle Blocks</Text>
        <Text style={{ color: 'white', marginBottom: 8 }}>Score: {score}</Text>
        <Text style={{ color: 'white', marginBottom: 12 }}>{puzzles[idx].display}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {bagTerms.map(t => (
            <TouchableOpacity key={t} onPress={() => pick(t)} style={{ backgroundColor: 'rgba(255,255,255,0.18)', padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity onPress={check} style={{ backgroundColor: '#22c55e', padding: 10, borderRadius: 10, marginRight: 8 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Check</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={reset} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 10 }}>
            <Text style={{ color: 'white' }}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}


