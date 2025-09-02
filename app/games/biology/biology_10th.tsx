import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';

const { width, height } = Dimensions.get('window');

interface Organ {
  id: string;
  name: string;
  system: string;
  color: string;
  position: Animated.ValueXY;
  connected: boolean;
}

export default function Biology10th() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [organs, setOrgans] = useState<Organ[]>([]);
  const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);
  const [currentSystem, setCurrentSystem] = useState('circulatory');
  const [connectionsComplete, setConnectionsComplete] = useState(0);

  const heartAnimation = useRef(new Animated.Value(1)).current;
  const bloodFlow = useRef(new Animated.Value(0)).current;

  const organData = {
    circulatory: [
      { name: 'Heart', color: '#EF4444', position: { x: width/2 - 30, y: height/2 - 40 } },
      { name: 'Arteries', color: '#DC2626', position: { x: width/2 + 60, y: height/2 - 60 } },
      { name: 'Veins', color: '#B91C1C', position: { x: width/2 - 90, y: height/2 - 20 } },
      { name: 'Capillaries', color: '#991B1B', position: { x: width/2 + 40, y: height/2 + 40 } }
    ],
    respiratory: [
      { name: 'Lungs', color: '#3B82F6', position: { x: width/2 - 40, y: height/2 - 60 } },
      { name: 'Trachea', color: '#2563EB', position: { x: width/2, y: height/2 - 100 } },
      { name: 'Bronchi', color: '#1D4ED8', position: { x: width/2 - 20, y: height/2 - 20 } },
      { name: 'Alveoli', color: '#1E40AF', position: { x: width/2 + 60, y: height/2 + 20 } }
    ],
    digestive: [
      { name: 'Stomach', color: '#10B981', position: { x: width/2 - 20, y: height/2 - 20 } },
      { name: 'Liver', color: '#059669', position: { x: width/2 + 50, y: height/2 - 50 } },
      { name: 'Intestines', color: '#047857', position: { x: width/2 - 60, y: height/2 + 40 } },
      { name: 'Pancreas', color: '#065F46', position: { x: width/2 + 20, y: height/2 + 60 } }
    ]
  };

  useEffect(() => {
    if (gameState === 'playing') {
      initializeOrgans();
      animateHeartbeat();
      animateBloodFlow();
    }
  }, [gameState, currentSystem]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  const initializeOrgans = () => {
    const systemOrgans = organData[currentSystem as keyof typeof organData];
    const newOrgans: Organ[] = systemOrgans.map((data, index) => ({
      id: `organ_${index}`,
      name: data.name,
      system: currentSystem,
      color: data.color,
      connected: false,
      position: new Animated.ValueXY({
        x: 20 + (index % 2) * 150,
        y: height - 180 + Math.floor(index / 2) * 80
      })
    }));
    setOrgans(newOrgans);
    setConnectionsComplete(0);
  };

  const animateHeartbeat = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnimation, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: false
        }),
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false
        })
      ])
    ).start();
  };

  const animateBloodFlow = () => {
    Animated.loop(
      Animated.timing(bloodFlow, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false
      })
    ).start(() => bloodFlow.setValue(0));
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(120);
    setCurrentSystem('circulatory');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const endGame = async () => {
    setGameState('results');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await saveGameScore({
        userId: `user_${Date.now()}`,
        gameId: 'biology_10th_systems',
        score,
        timeSpent: 120 - timeLeft,
        completedAt: new Date().toISOString(),
        grade: 10,
        subject: 'Biology'
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const connectOrgan = (organ: Organ) => {
    if (organ.connected) return;

    const systemOrgans = organData[currentSystem as keyof typeof organData];
    const targetPosition = systemOrgans.find(o => o.name === organ.name)?.position;
    
    if (targetPosition) {
      Animated.timing(organ.position, {
        toValue: targetPosition,
        duration: 800,
        useNativeDriver: false
      }).start();

      setOrgans(prev => prev.map(o => 
        o.id === organ.id ? { ...o, connected: true } : o
      ));
      
      setScore(prev => prev + 120);
      setConnectionsComplete(prev => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      if (connectionsComplete + 1 >= systemOrgans.length) {
        // Move to next system
        setTimeout(() => {
          const systems = ['circulatory', 'respiratory', 'digestive'];
          const currentIndex = systems.indexOf(currentSystem);
          if (currentIndex < systems.length - 1) {
            setCurrentSystem(systems[currentIndex + 1]);
            setScore(prev => prev + 300); // Bonus for completing system
          } else {
            endGame();
          }
        }, 1500);
      }
    }
  };

  if (gameState === 'menu') {
    return (
      <LinearGradient colors={['#059669', '#10B981']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Animatable.View animation="bounceIn" style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
              🫀 Body Systems
            </Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
              10th Grade - Life Processes
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={500} style={{ width: '100%', marginBottom: 30 }}>
            <Text style={{ fontSize: 16, color: 'white', marginBottom: 16, textAlign: 'center' }}>
              🎯 Connect organs to build complete body systems!
            </Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20, marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                Systems to Build:
              </Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>❤️ Circulatory System</Text>
              <Text style={{ color: 'white', fontSize: 14, marginBottom: 6 }}>🫁 Respiratory System</Text>
              <Text style={{ color: 'white', fontSize: 14 }}>🍽️ Digestive System</Text>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                💡 Watch organs animate as you connect them correctly!
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
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#059669' }}>
                🚀 Start Body Systems
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
            <View style={{ backgroundColor: 'rgba(16,185,129,0.3)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 14 }}>
                {currentSystem.charAt(0).toUpperCase() + currentSystem.slice(1)} System
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                ⏱️ {timeLeft}s
              </Text>
            </View>
          </View>
        </View>

        {/* Body outline */}
        <View style={{
          position: 'absolute',
          top: height/2 - 150,
          left: width/2 - 80,
          width: 160,
          height: 300,
          borderRadius: 80,
          borderWidth: 3,
          borderColor: 'rgba(16,185,129,0.5)',
          borderStyle: 'dashed'
        }} />

        {/* Animated heartbeat for circulatory system */}
        {currentSystem === 'circulatory' && (
          <Animated.View
            style={{
              position: 'absolute',
              top: height/2 - 40,
              left: width/2 - 30,
              width: 60,
              height: 60,
              transform: [{ scale: heartAnimation }]
            }}
          >
            <Text style={{ fontSize: 40, textAlign: 'center' }}>❤️</Text>
          </Animated.View>
        )}

        {/* Breathing animation for respiratory */}
        {currentSystem === 'respiratory' && (
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            style={{
              position: 'absolute',
              top: height/2 - 60,
              left: width/2 - 40,
              width: 80,
              height: 80,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 40 }}>🫁</Text>
          </Animatable.View>
        )}

        {/* Digestive animation */}
        {currentSystem === 'digestive' && (
          <Animatable.View
            animation="bounce"
            iterationCount="infinite"
            style={{
              position: 'absolute',
              top: height/2 - 20,
              left: width/2 - 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 30 }}>🍽️</Text>
          </Animatable.View>
        )}

        {/* Organs */}
        {organs.map((organ) => (
          <Animated.View
            key={organ.id}
            style={{
              position: 'absolute',
              left: organ.position.x,
              top: organ.position.y,
            }}
          >
            <TouchableOpacity
              onPress={() => connectOrgan(organ)}
              style={{
                width: 70,
                height: 50,
                borderRadius: 15,
                backgroundColor: organ.color,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 8,
                borderWidth: selectedOrgan?.id === organ.id ? 4 : 0,
                borderColor: 'white',
                opacity: organ.connected ? 0.7 : 1,
                shadowColor: organ.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                {organ.name}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Progress indicator */}
        <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 16 }}>
            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
              {currentSystem.charAt(0).toUpperCase() + currentSystem.slice(1)} System: {connectionsComplete}/{organData[currentSystem as keyof typeof organData].length} connected
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
          <Text style={{ fontSize: 48 }}>🫀</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 16 }}>
            Body Systems Complete!
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
