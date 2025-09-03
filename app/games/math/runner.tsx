import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { saveGameScore } from '../../../src/services/apiService';
import { saveLocalProgress } from '../../../src/db/gameService';

type Obstacle = { prompt: string; answer: string; options: string[] };

const BANK_9: Obstacle[] = [
  { prompt: '(a+b)² = ?', answer: 'a² + 2ab + b²', options: ['a² + 2ab + b²', 'a² + b²', '2ab'] },
  { prompt: 'Perimeter(rect) = ?', answer: '2(l + w)', options: ['2(l + w)', 'l × w', 'πr²'] },
];
const BANK_10: Obstacle[] = [
  { prompt: 'Quadratic formula?', answer: '(-b ± √(b² - 4ac)) / (2a)', options: ['(-b ± √(b² - 4ac)) / (2a)', 'b² - 4ac', 'a + (n-1)d'] },
  { prompt: 'SA sphere?', answer: '4πr²', options: ['4πr²', '2πr²', 'πr²'] },
];

export default function Runner() {
  const { user } = useAuth();
  const { grade } = useLocalSearchParams<{ grade?: string }>();
  const bank = (grade === '10' ? BANK_10 : BANK_9);
  const [score, setScore] = useState(0);
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const obstacleX = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (!running) return;
    animateObstacle();
  }, [idx, running]);

  const animateObstacle = () => {
    obstacleX.setValue(300);
    Animated.timing(obstacleX, { toValue: -50, duration: 2500, easing: Easing.linear, useNativeDriver: false }).start(({ finished }) => {
      if (finished && running) setIdx(i => (i + 1) % bank.length);
    });
  };

  const choose = (opt: string) => {
    if (!running) return;
    const correct = opt === bank[idx].answer;
    setScore(s => s + (correct ? 100 : -50));
    setIdx(i => (i + 1) % bank.length);
  };

  const start = () => { 
    setRunning(true); 
    setScore(0); 
    setIdx(0); 
    setStartTime(Date.now());
  };
  
  const end = async () => {
    setRunning(false);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const finalScore = Math.max(0, score); // Ensure score doesn't go negative
    
    try {
      // Save to local database
      saveLocalProgress({ 
        student_id: user?.id || 'unknown', 
        game_id: `math_${grade || '9'}_runner`, 
        score: finalScore, 
        time_spent: timeSpent, 
        level: idx + 1, 
        grade: user?.grade || (grade === '10' ? 10 : 9), 
        subject: 'Math', 
        date: new Date().toISOString() 
      });
      
      // Try to save to server
      await saveGameScore({ 
        userId: user?.id || 'unknown', 
        gameId: `math_${grade || '9'}_runner`, 
        score: finalScore, 
        timeSpent: timeSpent, 
        completedAt: new Date().toISOString(), 
        grade: user?.grade || (grade === '10' ? 10 : 9), 
        subject: 'Math' 
      });
    } catch (error) {
      console.log('Server save failed, but local save succeeded');
    }
    
    Alert.alert('Runner Over', `Final Score: ${finalScore}\nTime: ${timeSpent}s\nQuestions: ${idx + 1}`);
  };

  return (
    <LinearGradient colors={['#0ea5e9', '#0369a1']} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Formula Runner</Text>
        <Text style={{ color: 'white', marginBottom: 8 }}>Score: {score}</Text>
        {!running ? (
          <TouchableOpacity onPress={start} style={{ backgroundColor: 'white', padding: 12, borderRadius: 10, alignSelf: 'flex-start' }}>
            <Text style={{ fontWeight: 'bold' }}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={end} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 10, alignSelf: 'flex-start' }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>End</Text>
          </TouchableOpacity>
        )}

        {running && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: 'white', marginBottom: 8 }}>{bank[idx].prompt}</Text>
            <View style={{ height: 120, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, overflow: 'hidden', justifyContent: 'center' }}>
              <Animated.View style={{ width: 50, height: 50, backgroundColor: '#f59e0b', borderRadius: 8, transform: [{ translateX: obstacleX }] }} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
              {bank[idx].options.map(o => (
                <TouchableOpacity key={o} onPress={() => choose(o)} style={{ backgroundColor: 'rgba(255,255,255,0.18)', padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: 'white' }}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}


