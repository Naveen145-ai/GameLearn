import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';

const { width, height } = Dimensions.get('window');

interface TrigProblem {
  question: string;
  answer: number;
  angle: number;
  type: 'sin' | 'cos' | 'tan';
  visualization: any;
}

export default function Math10th() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [currentProblem, setCurrentProblem] = useState<TrigProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  
  const circleAnimation = useRef(new Animated.Value(0)).current;
  const angleAnimation = useRef(new Animated.Value(0)).current;

  const problems: TrigProblem[] = [
    {
      question: "sin(30°) = ?",
      answer: 0.5,
      angle: 30,
      type: 'sin',
      visualization: { radius: 80, angle: 30 }
    },
    {
      question: "cos(60°) = ?",
      answer: 0.5,
      angle: 60,
      type: 'cos',
      visualization: { radius: 80, angle: 60 }
    },
    {
      question: "tan(45°) = ?",
      answer: 1,
      angle: 45,
      type: 'tan',
      visualization: { radius: 80, angle: 45 }
    },
    {
      question: "sin(90°) = ?",
      answer: 1,
      angle: 90,
      type: 'sin',
      visualization: { radius: 80, angle: 90 }
    },
    {
      question: "cos(0°) = ?",
      answer: 1,
      angle: 0,
      type: 'cos',
      visualization: { radius: 80, angle: 0 }
    }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      generateNewProblem();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  const generateNewProblem = () => {
    const problem = problems[Math.floor(Math.random() * problems.length)];
    setCurrentProblem(problem);
    setUserAnswer('');
    
    // Animate unit circle
    circleAnimation.setValue(0);
    angleAnimation.setValue(0);
    
    Animated.parallel([
      Animated.timing(circleAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false
      }),
      Animated.timing(angleAnimation, {
        toValue: problem.angle,
        duration: 1500,
        useNativeDriver: false
      })
    ]).start();
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(100);
    setStreak(0);
    setProblemsSolved(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const endGame = async () => {
    setGameState('results');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await saveGameScore({
        userId: `user_${Date.now()}`,
        gameId: 'math_10th_trigonometry',
        score,
        timeSpent: 100 - timeLeft,
        completedAt: new Date().toISOString(),
        grade: 10,
        subject: 'Math'
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const checkAnswer = () => {
    if (!currentProblem) return;
    
    const answer = parseFloat(userAnswer);
    if (Math.abs(answer - currentProblem.answer) < 0.1) {
      // Correct answer
      const points = 150 + (streak * 20);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setProblemsSolved(prev => prev + 1);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Celebration animation
      Animated.sequence([
        Animated.timing(circleAnimation, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: false
        }),
        Animated.timing(circleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false
        })
      ]).start();
      
      setTimeout(() => generateNewProblem(), 1500);
    } else {
      // Wrong answer
      setStreak(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Shake animation
      Animated.sequence([
        Animated.timing(circleAnimation, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: false
        }),
        Animated.timing(circleAnimation, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: false
        }),
        Animated.timing(circleAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false
        })
      ]).start();
    }
  };

  const renderUnitCircle = () => {
    if (!currentProblem) return null;

    const radius = 80;
    const centerX = width/2;
    const centerY = height/2 - 50;
    
    const angleRad = (currentProblem.angle * Math.PI) / 180;
    const pointX = centerX + radius * Math.cos(angleRad);
    const pointY = centerY - radius * Math.sin(angleRad);

    return (
      <Animated.View style={{
        transform: [{ scale: circleAnimation }],
        alignItems: 'center',
        marginVertical: 20
      }}>
        <View style={{
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          borderWidth: 3,
          borderColor: '#3B82F6',
          position: 'relative',
          backgroundColor: 'rgba(59,130,246,0.1)'
        }}>
          {/* Coordinate axes */}
          <View style={{
            position: 'absolute',
            width: '100%',
            height: 2,
            backgroundColor: 'rgba(255,255,255,0.5)',
            top: '50%',
            marginTop: -1
          }} />
          <View style={{
            position: 'absolute',
            width: 2,
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.5)',
            left: '50%',
            marginLeft: -1
          }} />
          
          {/* Animated angle line */}
          <Animated.View style={{
            position: 'absolute',
            top: radius - 1,
            left: radius - 1,
            width: angleAnimation.interpolate({
              inputRange: [0, 90],
              outputRange: [radius, radius * Math.sqrt(2)]
            }),
            height: 2,
            backgroundColor: '#10B981',
            transformOrigin: 'left center',
            transform: [{
              rotate: angleAnimation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              })
            }]
          }} />
          
          {/* Point on circle */}
          <Animated.View style={{
            position: 'absolute',
            top: angleAnimation.interpolate({
              inputRange: [0, 360],
              outputRange: [radius, radius - radius * Math.sin(angleRad)]
            }),
            left: angleAnimation.interpolate({
              inputRange: [0, 360],
              outputRange: [radius, radius + radius * Math.cos(angleRad)]
            }),
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#EF4444',
            marginTop: -6,
            marginLeft: -6
          }} />
        </View>
        
        <Text style={{ color: 'white', marginTop: 16, fontSize: 14, textAlign: 'center' }}>
          Unit Circle - Angle: {currentProblem.angle}°
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' }}>
          {currentProblem.type}({currentProblem.angle}°) = ?
        </Text>
      </Animated.View>
    );
  };

  if (gameState === 'menu') {
    return (
      <LinearGradient colors={['#7C2D12', '#EA580C']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Animatable.View animation="bounceIn" style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
              📐 Trigonometry
            </Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
              10th Grade - Angles & Ratios
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={500} style={{ width: '100%', marginBottom: 30 }}>
            <Text style={{ fontSize: 16, color: 'white', marginBottom: 16, textAlign: 'center' }}>
              🎯 Master trigonometry with animated unit circles!
            </Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20, marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                Topics Covered:
              </Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>📊 Trigonometric Ratios</Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>⭕ Unit Circle</Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>📐 Special Angles</Text>
              <Text style={{ color: 'white', fontSize: 14 }}>🔄 Quadratic Equations</Text>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                💡 Watch the unit circle animate as you solve problems!
              </Text>
            </View>
          </Animatable.View>

          <Animatable.View animation="pulse" iterationCount="infinite" style={{ marginBottom: 30 }}>
            <TouchableOpacity onPress={startGame} style={{
              backgroundColor: 'white',
              borderRadius: 25,
              paddingVertical: 16,
              paddingHorizontal: 40,
              elevation: 8
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#7C2D12' }}>
                🚀 Start Trigonometry
              </Text>
            </TouchableOpacity>
          </Animatable.View>

          <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 50, left: 20 }}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (gameState === 'playing') {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        {/* Game UI */}
        <View style={{ position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Score: {score}
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(234,88,12,0.3)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 14 }}>
                🔥 Streak: {streak}
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                ⏱️ {timeLeft}s
              </Text>
            </View>
          </View>
        </View>

        {/* Problem Display */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingTop: 120 }}>
          {currentProblem && (
            <Animatable.View animation="fadeInUp" style={{ width: '100%', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, marginBottom: 20, width: '100%' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 16 }}>
                  Problem #{problemsSolved + 1}
                </Text>
                <Text style={{ fontSize: 18, color: 'white', textAlign: 'center', marginBottom: 20 }}>
                  {currentProblem.question}
                </Text>
                
                {renderUnitCircle()}
              </View>

              {/* Answer Input */}
              <View style={{ width: '100%', marginBottom: 20 }}>
                <TextInput
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Enter decimal answer (e.g., 0.5)"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 15,
                    padding: 16,
                    fontSize: 18,
                    color: 'white',
                    textAlign: 'center',
                    borderWidth: 2,
                    borderColor: userAnswer ? '#3B82F6' : 'transparent'
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={checkAnswer}
                disabled={!userAnswer}
                style={{
                  backgroundColor: userAnswer ? '#3B82F6' : 'rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  paddingVertical: 16,
                  paddingHorizontal: 40,
                  elevation: 8
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                  ✓ Submit Answer
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#059669', '#10B981']} style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Animatable.View animation="bounceIn" style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 48 }}>📐</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 16 }}>
            Trigonometry Mastered!
          </Text>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
            Final Score: {score}
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            Problems Solved: {problemsSolved} | Best Streak: {streak}
          </Text>
        </Animatable.View>

        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity
            onPress={() => setGameState('menu')}
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              paddingVertical: 12,
              paddingHorizontal: 24
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#059669' }}>
              Play Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              paddingVertical: 12,
              paddingHorizontal: 24
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
              Back to Subjects
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
