import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, PanGestureHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';

const { width, height } = Dimensions.get('window');

export default function Physics9th() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedMass, setSelectedMass] = useState(1);
  const [gravity, setGravity] = useState(9.8);
  
  const ballPosition = useRef(new Animated.ValueXY({ x: width / 2, y: 100 })).current;
  const ballVelocity = useRef({ x: 0, y: 0 });

  // Physics simulation
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        // Apply gravity
        ballVelocity.current.y += gravity * 0.1;
        
        // Update position
        ballPosition.setValue({
          x: ballPosition.x._value + ballVelocity.current.x,
          y: ballPosition.y._value + ballVelocity.current.y
        });

        // Bounce off walls
        if (ballPosition.x._value <= 20 || ballPosition.x._value >= width - 20) {
          ballVelocity.current.x *= -0.8;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Bounce off ground
        if (ballPosition.y._value >= height - 200) {
          ballVelocity.current.y *= -0.7;
          ballPosition.setValue({
            x: ballPosition.x._value,
            y: height - 200
          });
          setScore(prev => prev + Math.floor(Math.abs(ballVelocity.current.y)));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }, 16);

      return () => clearInterval(interval);
    }
  }, [gameState, gravity]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    ballPosition.setValue({ x: width / 2, y: 100 });
    ballVelocity.current = { x: 0, y: 0 };
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const endGame = async () => {
    setGameState('results');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await saveGameScore({
        userId: `user_${Date.now()}`,
        gameId: 'physics_9th_gravity',
        score,
        timeSpent: 60 - timeLeft,
        completedAt: new Date().toISOString(),
        grade: 9,
        subject: 'Physics'
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const applyForce = (direction: 'left' | 'right' | 'up') => {
    const force = 2;
    switch (direction) {
      case 'left':
        ballVelocity.current.x -= force;
        break;
      case 'right':
        ballVelocity.current.x += force;
        break;
      case 'up':
        ballVelocity.current.y -= force * 2;
        break;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (gameState === 'menu') {
    return (
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Animatable.View animation="bounceIn" style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
              ⚡ Physics Lab
            </Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
              9th Grade - Motion & Gravity
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={500} style={{ width: '100%', marginBottom: 30 }}>
            <Text style={{ fontSize: 16, color: 'white', marginBottom: 16, textAlign: 'center' }}>
              🎯 Control the ball using forces and gravity!
            </Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20, marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 8 }}>Mass: {selectedMass} kg</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[0.5, 1, 2, 5].map(mass => (
                  <TouchableOpacity
                    key={mass}
                    onPress={() => setSelectedMass(mass)}
                    style={{
                      backgroundColor: selectedMass === mass ? 'white' : 'rgba(255,255,255,0.2)',
                      borderRadius: 10,
                      padding: 8,
                      minWidth: 50,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: selectedMass === mass ? '#1E3A8A' : 'white', fontWeight: 'bold' }}>
                      {mass}kg
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 8 }}>Gravity: {gravity} m/s²</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[1.6, 3.7, 9.8, 24.8].map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGravity(g)}
                    style={{
                      backgroundColor: gravity === g ? 'white' : 'rgba(255,255,255,0.2)',
                      borderRadius: 10,
                      padding: 8,
                      flex: 1,
                      marginHorizontal: 2,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: gravity === g ? '#1E3A8A' : 'white', fontWeight: 'bold', fontSize: 12 }}>
                      {g === 1.6 ? 'Moon' : g === 3.7 ? 'Mars' : g === 9.8 ? 'Earth' : 'Jupiter'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' }}>
                🚀 Start Physics Lab
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Score: {score}
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                ⏱️ {timeLeft}s
              </Text>
            </View>
          </View>
        </View>

        {/* Physics Ball */}
        <Animated.View
          style={{
            position: 'absolute',
            left: ballPosition.x,
            top: ballPosition.y,
            width: 40 * selectedMass,
            height: 40 * selectedMass,
            borderRadius: 20 * selectedMass,
            backgroundColor: '#3B82F6',
            elevation: 8,
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
          }}
        />

        {/* Ground */}
        <View style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          height: 5,
          backgroundColor: '#10B981'
        }} />

        {/* Control Buttons */}
        <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => applyForce('left')}
              style={{
                backgroundColor: '#EF4444',
                borderRadius: 20,
                padding: 20,
                elevation: 8
              }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => applyForce('up')}
              style={{
                backgroundColor: '#10B981',
                borderRadius: 20,
                padding: 20,
                elevation: 8
              }}
            >
              <Ionicons name="arrow-up" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => applyForce('right')}
              style={{
                backgroundColor: '#EF4444',
                borderRadius: 20,
                padding: 20,
                elevation: 8
              }}
            >
              <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 16 }}>
            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
              Mass: {selectedMass}kg | Gravity: {gravity}m/s² | Velocity: {Math.abs(ballVelocity.current.y).toFixed(1)}m/s
            </Text>
          </View>
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
            Physics Complete!
          </Text>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
            Final Score: {score}
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
