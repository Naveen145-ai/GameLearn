import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Equation {
  id: string;
  equation: string;
  answer: number;
  options: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

const generateEquations = (difficulty: 'easy' | 'medium' | 'hard'): Equation[] => {
  const equations: Equation[] = [];
  
  for (let i = 0; i < 10; i++) {
    let equation: string;
    let answer: number;
    
    if (difficulty === 'easy') {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const operation = Math.random() > 0.5 ? '+' : '-';
      equation = `${a} ${operation} ${b}`;
      answer = operation === '+' ? a + b : a - b;
    } else if (difficulty === 'medium') {
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      const operation = Math.random() > 0.5 ? '×' : '÷';
      if (operation === '×') {
        equation = `${a} × ${b}`;
        answer = a * b;
      } else {
        const product = a * b;
        equation = `${product} ÷ ${a}`;
        answer = b;
      }
    } else {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const c = Math.floor(Math.random() * 20) + 1;
      equation = `${a}x + ${b} = ${c}`;
      answer = Math.round((c - b) / a);
    }
    
    const wrongAnswers = [
      answer + Math.floor(Math.random() * 10) + 1,
      answer - Math.floor(Math.random() * 10) - 1,
      answer + Math.floor(Math.random() * 5) + 1
    ];
    
    const options = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    equations.push({
      id: i.toString(),
      equation,
      answer,
      options,
      difficulty
    });
  }
  
  return equations;
};

export default function EquationSolver() {
  const [equations, setEquations] = useState<Equation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [streak, setStreak] = useState(0);

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameStarted]);

  useEffect(() => {
    progressWidth.value = withTiming((currentIndex / equations.length) * 100);
  }, [currentIndex, equations.length]);

  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    const newEquations = generateEquations(selectedDifficulty);
    setEquations(newEquations);
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(120);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const endGame = () => {
    setGameStarted(false);
    Alert.alert(
      'Game Over!',
      `Final Score: ${score}\nEquations Solved: ${currentIndex}/${equations.length}\nBest Streak: ${streak}`,
      [{ text: 'Play Again', onPress: () => setGameStarted(false) }]
    );
  };

  const selectAnswer = (selectedAnswer: number) => {
    const currentEquation = equations[currentIndex];
    const isCorrect = selectedAnswer === currentEquation.answer;
    
    if (isCorrect) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      const bonusPoints = streak >= 3 ? Math.floor(streak / 3) * 5 : 0;
      setScore(prev => prev + points + bonusPoints);
      setStreak(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStreak(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    if (currentIndex + 1 >= equations.length) {
      setTimeout(endGame, 500);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const AnswerButton = ({ answer, index }: { answer: number; index: number }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      scale.value = withSpring(0.9, {}, () => {
        scale.value = withSpring(1);
      });
      runOnJS(selectAnswer)(answer);
    };

    return (
      <Animated.View style={[animatedStyle, { marginBottom: 15 }]}>
        <TouchableOpacity
          onPress={handlePress}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 15,
            padding: 20,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.3)',
            elevation: 3,
          }}
        >
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
            {answer}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const DifficultyButton = ({ level, title, description, color }: {
    level: 'easy' | 'medium' | 'hard';
    title: string;
    description: string;
    color: string[];
  }) => (
    <TouchableOpacity
      onPress={() => startGame(level)}
      style={{ marginBottom: 15 }}
    >
      <LinearGradient
        colors={color}
        style={{
          borderRadius: 15,
          padding: 20,
          alignItems: 'center',
          elevation: 5,
        }}
      >
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
          {title}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' }}>
          {description}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const currentEquation = equations[currentIndex];

  return (
    <LinearGradient colors={['#f093fb', '#f5576c']} style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
            Equation Solver
          </Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 }}>
            Solve mathematical equations
          </Text>
        </View>

        {!gameStarted ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 30,
              marginBottom: 30,
              alignItems: 'center'
            }}>
              <Ionicons name="calculator" size={80} color="white" style={{ marginBottom: 20 }} />
              <Text style={{ color: 'white', fontSize: 20, textAlign: 'center', marginBottom: 20 }}>
                Choose your difficulty level
              </Text>
            </View>

            <DifficultyButton
              level="easy"
              title="Easy"
              description="Addition and Subtraction (1-20)"
              color={['#4ECDC4', '#44A08D']}
            />
            <DifficultyButton
              level="medium"
              title="Medium"
              description="Multiplication and Division"
              color={['#F59E0B', '#D97706']}
            />
            <DifficultyButton
              level="hard"
              title="Hard"
              description="Linear Equations (ax + b = c)"
              color={['#EF4444', '#DC2626']}
            />
          </View>
        ) : (
          <>
            {/* Game Stats */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              marginBottom: 20,
              paddingHorizontal: 10
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Score</Text>
                <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold' }}>{score}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Time</Text>
                <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold' }}>{timeLeft}s</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Streak</Text>
                <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold' }}>{streak}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 10,
              height: 10,
              marginBottom: 30,
              overflow: 'hidden'
            }}>
              <Animated.View
                style={[
                  {
                    height: '100%',
                    backgroundColor: '#FFD700',
                    borderRadius: 10,
                  },
                  useAnimatedStyle(() => ({
                    width: `${progressWidth.value}%`,
                  }))
                ]}
              />
            </View>

            {/* Current Equation */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 30,
              marginBottom: 30,
              alignItems: 'center'
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 10 }}>
                Question {currentIndex + 1} of {equations.length}
              </Text>
              <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold', textAlign: 'center' }}>
                {currentEquation?.equation} = ?
              </Text>
              {difficulty === 'hard' && (
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 10 }}>
                  Find the value of x
                </Text>
              )}
            </View>

            {/* Answer Options */}
            <View style={{ flex: 1 }}>
              {currentEquation?.options.map((answer, index) => (
                <AnswerButton key={index} answer={answer} index={index} />
              ))}
            </View>

            {/* Streak Bonus Indicator */}
            {streak >= 3 && (
              <View style={{
                backgroundColor: 'rgba(255,215,0,0.2)',
                borderRadius: 15,
                padding: 10,
                alignItems: 'center',
                marginTop: 10
              }}>
                <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: 'bold' }}>
                  🔥 Streak Bonus Active! +{Math.floor(streak / 3) * 5} points
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </LinearGradient>
  );
}
