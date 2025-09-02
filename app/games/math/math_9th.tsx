import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';

const { width, height } = Dimensions.get('window');

interface MathProblem {
  question: string;
  answer: number;
  type: 'linear' | 'quadratic' | 'geometry';
  visualization: any;
}

export default function Math9th() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  
  const graphAnimation = useRef(new Animated.Value(0)).current;
  const pointAnimations = useRef<Animated.Value[]>([]).current;

  const problems: MathProblem[] = [
    {
      question: "Solve: 2x + 5 = 13",
      answer: 4,
      type: 'linear',
      visualization: { slope: 2, intercept: 5, target: 13 }
    },
    {
      question: "Find x: 3x - 7 = 14",
      answer: 7,
      type: 'linear',
      visualization: { slope: 3, intercept: -7, target: 14 }
    },
    {
      question: "Area of triangle with base 8cm, height 6cm",
      answer: 24,
      type: 'geometry',
      visualization: { base: 8, height: 6, shape: 'triangle' }
    },
    {
      question: "Perimeter of rectangle: length 12cm, width 8cm",
      answer: 40,
      type: 'geometry',
      visualization: { length: 12, width: 8, shape: 'rectangle' }
    },
    {
      question: "Solve: x² - 5x + 6 = 0 (smaller root)",
      answer: 2,
      type: 'quadratic',
      visualization: { a: 1, b: -5, c: 6 }
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
    
    // Animate graph drawing
    graphAnimation.setValue(0);
    Animated.timing(graphAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false
    }).start();
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(90);
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
        gameId: 'math_9th_equations',
        score,
        timeSpent: 90 - timeLeft,
        completedAt: new Date().toISOString(),
        grade: 9,
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
      const points = 100 + (streak * 10);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setProblemsSolved(prev => prev + 1);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Celebration animation
      Animated.sequence([
        Animated.timing(graphAnimation, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: false
        }),
        Animated.timing(graphAnimation, {
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
        Animated.timing(graphAnimation, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: false
        }),
        Animated.timing(graphAnimation, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: false
        }),
        Animated.timing(graphAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false
        })
      ]).start();
    }
  };

  const renderVisualization = () => {
    if (!currentProblem) return null;

    const viz = currentProblem.visualization;
    
    if (currentProblem.type === 'geometry' && viz.shape === 'triangle') {
      return (
        <Animated.View style={{
          transform: [{ scale: graphAnimation }],
          alignItems: 'center',
          marginVertical: 20
        }}>
          <View style={{
            width: viz.base * 10,
            height: viz.height * 10,
            backgroundColor: 'transparent',
            borderLeftWidth: 3,
            borderBottomWidth: 3,
            borderRightWidth: 3,
            borderColor: '#3B82F6',
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            transform: [{ rotate: '0deg' }]
          }} />
          <Text style={{ color: 'white', marginTop: 8, fontSize: 12 }}>
            Base: {viz.base}cm, Height: {viz.height}cm
          </Text>
        </Animated.View>
      );
    }
    
    if (currentProblem.type === 'geometry' && viz.shape === 'rectangle') {
      return (
        <Animated.View style={{
          transform: [{ scale: graphAnimation }],
          alignItems: 'center',
          marginVertical: 20
        }}>
          <View style={{
            width: viz.length * 8,
            height: viz.width * 8,
            backgroundColor: 'transparent',
            borderWidth: 3,
            borderColor: '#10B981',
            borderRadius: 8
          }} />
          <Text style={{ color: 'white', marginTop: 8, fontSize: 12 }}>
            Length: {viz.length}cm, Width: {viz.width}cm
          </Text>
        </Animated.View>
      );
    }

    // Linear equation visualization
    return (
      <Animated.View style={{
        transform: [{ scale: graphAnimation }],
        alignItems: 'center',
        marginVertical: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        padding: 20
      }}>
        <View style={{
          width: 200,
          height: 150,
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Coordinate system */}
          <View style={{
            position: 'absolute',
            width: '100%',
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.3)',
            top: '50%'
          }} />
          <View style={{
            position: 'absolute',
            width: 1,
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.3)',
            left: '50%'
          }} />
          
          {/* Animated line */}
          <Animated.View style={{
            position: 'absolute',
            width: graphAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 180]
            }),
            height: 2,
            backgroundColor: '#3B82F6',
            transform: [{ rotate: `${Math.atan(viz.slope || 1) * 180 / Math.PI}deg` }]
          }} />
        </View>
        <Text style={{ color: 'white', marginTop: 8, fontSize: 12 }}>
          y = {viz.slope}x + {viz.intercept}
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
              📐 Math Arena
            </Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
              9th Grade - Equations & Geometry
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={500} style={{ width: '100%', marginBottom: 30 }}>
            <Text style={{ fontSize: 16, color: 'white', marginBottom: 16, textAlign: 'center' }}>
              🎯 Solve equations with visual graphs and geometry!
            </Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20, marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                Topics Covered:
              </Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>📊 Linear Equations</Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>📈 Quadratic Equations</Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>📐 Geometry (Area & Perimeter)</Text>
              <Text style={{ color: 'white', fontSize: 14 }}>🎲 Number Systems</Text>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                💡 Each correct answer builds your streak for bonus points!
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
                🚀 Start Math Arena
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
                
                {renderVisualization()}
              </View>

              {/* Answer Input */}
              <View style={{ width: '100%', marginBottom: 20 }}>
                <TextInput
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Enter your answer"
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
          <Text style={{ fontSize: 48 }}>🏆</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 16 }}>
            Math Mastery!
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
