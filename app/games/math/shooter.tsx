import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';
import { saveLocalProgress } from '../../../src/db/gameService';

type Target = { text: string; correct: boolean };

const T9: Target[] = [
  { text: '(a+b)² = a² + 2ab + b²', correct: true },
  { text: '(a−b)² = a² + 2ab + b²', correct: false },
  { text: 'Perimeter(rect) = 2(l + w)', correct: true },
];
const T10: Target[] = [
  { text: 'x = (-b ± √(b² - 4ac)) / (2a)', correct: true },
  { text: 'SA(sphere) = 2πr²', correct: false },
  { text: 'sin²θ + cos²θ = 1', correct: true },
];

export default function Shooter() {
  const { grade } = useLocalSearchParams<{ grade?: string }>();
  const data = grade === '10' ? T10 : T9;
  const [score, setScore] = useState(0);
  const [idx, setIdx] = useState(0);
  const y = useRef(new Animated.Value(0)).current;

  const shoot = (isShoot: boolean) => {
    const target = data[idx];
    const ok = (isShoot && !target.correct) || (!isShoot && target.correct);
    setScore(s => s + (ok ? 100 : -50));
    setIdx(i => (i + 1) % data.length);
  };

  const end = async () => {
    saveLocalProgress({ student_id: 'S_LOCAL', game_id: `math_${grade || '9'}_shooter`, score, time_spent: 0, level: idx + 1, grade: grade === '10' ? 10 : 9, subject: 'Math', date: new Date().toISOString() });
    await saveGameScore({ userId: `user_${Date.now()}`, gameId: `math_${grade || '9'}_shooter`, score, timeSpent: 0, completedAt: new Date().toISOString(), grade: grade === '10' ? 10 : 9, subject: 'Math' });
    Alert.alert('Shooter Over', `Score: ${score}`);
  };

  return (
    <LinearGradient colors={['#ef4444', '#7f1d1d']} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Formula Shooter</Text>
        <Text style={{ color: 'white', marginBottom: 8 }}>Score: {score}</Text>
        <View style={{ height: 160, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, justifyContent: 'center' }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>{data[idx].text}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <TouchableOpacity onPress={() => shoot(true)} style={{ backgroundColor: '#ef4444', padding: 12, borderRadius: 10, marginRight: 8 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Shoot (Wrong)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => shoot(false)} style={{ backgroundColor: '#22c55e', padding: 12, borderRadius: 10 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Don’t Shoot (Right)</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={end} style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 10, alignSelf: 'flex-start' }}>
          <Text style={{ color: 'white' }}>End</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}


