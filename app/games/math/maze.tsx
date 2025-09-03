import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';
import { saveLocalProgress } from '../../../src/db/gameService';

type Gate = { question: string; options: string[]; answer: string };

const G9: Gate[] = [
  { question: 'Area(Δ)?', options: ['½ × b × h', 'l × w', '2πr'], answer: '½ × b × h' },
  { question: '(a−b)² = ?', options: ['a² − 2ab + b²', 'a² + 2ab + b²', 'a² + b²'], answer: 'a² − 2ab + b²' },
];
const G10: Gate[] = [
  { question: 'sin²θ + cos²θ = ?', options: ['1', '0', '2'], answer: '1' },
  { question: 'AP nth term?', options: ['a + (n−1)d', 'a + nd', 'n(a+d)'], answer: 'a + (n−1)d' },
];

export default function Maze() {
  const { grade } = useLocalSearchParams<{ grade?: string }>();
  const gates = grade === '10' ? G10 : G9;
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  const choose = (opt: string) => {
    const ok = opt === gates[idx].answer;
    setScore(s => s + (ok ? 120 : -60));
    if (idx < gates.length - 1) setIdx(i => i + 1); else end();
  };

  const end = async () => {
    saveLocalProgress({ student_id: 'S_LOCAL', game_id: `math_${grade || '9'}_maze`, score, time_spent: 0, level: idx + 1, grade: grade === '10' ? 10 : 9, subject: 'Math', date: new Date().toISOString() });
    await saveGameScore({ userId: `user_${Date.now()}`, gameId: `math_${grade || '9'}_maze`, score, timeSpent: 0, completedAt: new Date().toISOString(), grade: grade === '10' ? 10 : 9, subject: 'Math' });
    Alert.alert('Maze Complete', `Score: ${score}`);
  };

  return (
    <LinearGradient colors={['#14b8a6', '#0f766e']} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Formula Maze</Text>
        <Text style={{ color: 'white', marginBottom: 8 }}>Gate {idx + 1} / {gates.length} | Score: {score}</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
          <Text style={{ color: 'white', marginBottom: 12 }}>{gates[idx].question}</Text>
          {gates[idx].options.map(o => (
            <TouchableOpacity key={o} onPress={() => choose(o)} style={{ backgroundColor: 'rgba(255,255,255,0.18)', padding: 10, borderRadius: 10, marginBottom: 8 }}>
              <Text style={{ color: 'white' }}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}


