import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';

const { width, height } = Dimensions.get('window');

interface LightRay {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  animation: Animated.Value;
}

export default function Physics10th() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [lightRays, setLightRays] = useState<LightRay[]>([]);
  const [mirrorAngle, setMirrorAngle] = useState(45);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetsHit, setTargetsHit] = useState(0);

  const prismAnimation = useRef(new Animated.Value(0)).current;
  const rayAnimations = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    if (gameState === 'playing') {
      generateLightRays();
      animatePrism();
    }
  }, [gameState, currentLevel]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  const generateLightRays = () => {
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    const newRays: LightRay[] = colors.map((color, index) => ({
      id: `ray_${index}`,
      startX: 50,
      startY: 150 + index * 30,
      endX: width - 50,
      endY: 150 + index * 30,
      color,
      animation: new Animated.Value(0)
    }));
    setLightRays(newRays);
  };

  const animatePrism = () => {
    Animated.timing(prismAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false
    }).start();

    // Animate light rays with dispersion
    lightRays.forEach((ray, index) => {
      setTimeout(() => {
        Animated.timing(ray.animation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false
        }).start();
      }, index * 200);
    });
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(90);
    setTargetsHit(0);
    setCurrentLevel(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const endGame = async () => {
    setGameState('results');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await saveGameScore({
        userId: `user_${Date.now()}`,
        gameId: 'physics_10th_light',
        score,
        timeSpent: 90 - timeLeft,
        completedAt: new Date().toISOString(),
        grade: 10,
        subject: 'Physics'
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const adjustMirror = (direction: 'left' | 'right') => {
    const newAngle = direction === 'left' 
      ? Math.max(0, mirrorAngle - 15) 
      : Math.min(90, mirrorAngle + 15);
    setMirrorAngle(newAngle);
    
    // Check if light hits target
    if (newAngle === 45) {
      setScore(prev => prev + 150);
      setTargetsHit(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (targetsHit + 1 >= 3) {
        setCurrentLevel(prev => prev + 1);
        setTargetsHit(0);
        generateLightRays();
      }
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (gameState === 'menu') {
    return (
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Animatable.View animation="bounceIn" style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
              🌈 Optics Lab
            </Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
              10th Grade - Light & Reflection
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={500} style={{ width: '100%', marginBottom: 30 }}>
            <Text style={{ fontSize: 16, color: 'white', marginBottom: 16, textAlign: 'center' }}>
              🎯 Control light rays and mirrors to hit targets!
            </Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20, marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                Physics Concepts:
              </Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>🌈 Light Dispersion</Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>🪞 Reflection Laws</Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>📐 Angle of Incidence</Text>
              <Text style={{ color: 'white', fontSize: 14 }}>🔍 Refraction</Text>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                💡 Adjust mirror angles to direct light rays to targets!
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
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E40AF' }}>
                🚀 Start Optics Lab
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
            <View style={{ backgroundColor: 'rgba(59,130,246,0.3)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 14 }}>
                Level {currentLevel}
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                ⏱️ {timeLeft}s
              </Text>
            </View>
          </View>
        </View>

        {/* Light Source */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={{
            position: 'absolute',
            top: 200,
            left: 30,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FBBF24',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8
          }}
        >
          <Text style={{ fontSize: 20 }}>💡</Text>
        </Animatable.View>

        {/* Prism */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 180,
            left: width/2 - 30,
            width: 60,
            height: 80,
            backgroundColor: 'rgba(255,255,255,0.3)',
            transform: [
              {
                rotate: prismAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }
            ],
            borderRadius: 10,
            elevation: 8
          }}
        />

        {/* Light Rays */}
        {lightRays.map((ray, index) => (
          <Animated.View
            key={ray.id}
            style={{
              position: 'absolute',
              top: ray.startY,
              left: ray.startX,
              width: ray.animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, ray.endX - ray.startX]
              }),
              height: 3,
              backgroundColor: ray.color,
              shadowColor: ray.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 5
            }}
          />
        ))}

        {/* Mirror */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 300,
            right: 80,
            width: 80,
            height: 8,
            backgroundColor: '#C0C0C0',
            borderRadius: 4,
            elevation: 8,
            transform: [{ rotate: `${mirrorAngle}deg` }]
          }}
        />

        {/* Target */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={{
            position: 'absolute',
            bottom: 200,
            right: 30,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#10B981',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8
          }}
        >
          <Text style={{ fontSize: 24 }}>🎯</Text>
        </Animatable.View>

        {/* Controls */}
        <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => adjustMirror('left')}
              style={{
                backgroundColor: '#EF4444',
                borderRadius: 20,
                padding: 20,
                elevation: 8
              }}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 15,
              padding: 16,
              minWidth: 120,
              alignItems: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                Mirror: {mirrorAngle}°
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => adjustMirror('right')}
              style={{
                backgroundColor: '#EF4444',
                borderRadius: 20,
                padding: 20,
                elevation: 8
              }}
            >
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 16 }}>
            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
              Targets Hit: {targetsHit}/3 | Level: {currentLevel}
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
          <Text style={{ fontSize: 48 }}>🌈</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 16 }}>
            Optics Mastered!
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
