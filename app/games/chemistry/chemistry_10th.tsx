import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';

const { width, height } = Dimensions.get('window');

interface AcidBase {
  id: string;
  name: string;
  ph: number;
  color: string;
  position: Animated.ValueXY;
  type: 'acid' | 'base' | 'neutral';
}

export default function Chemistry10th() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [substances, setSubstances] = useState<AcidBase[]>([]);
  const [selectedSubstance, setSelectedSubstance] = useState<AcidBase | null>(null);
  const [phMeter, setPhMeter] = useState(7);
  const [correctPlacements, setCorrectPlacements] = useState(0);

  const bubbleAnimations = useRef<Animated.Value[]>([]).current;
  const phAnimation = useRef(new Animated.Value(7)).current;

  const substanceData = [
    { name: 'Lemon Juice', ph: 2, color: '#FBBF24', type: 'acid' as const },
    { name: 'Vinegar', ph: 3, color: '#F59E0B', type: 'acid' as const },
    { name: 'Coffee', ph: 5, color: '#92400E', type: 'acid' as const },
    { name: 'Pure Water', ph: 7, color: '#3B82F6', type: 'neutral' as const },
    { name: 'Baking Soda', ph: 9, color: '#10B981', type: 'base' as const },
    { name: 'Soap', ph: 10, color: '#059669', type: 'base' as const },
    { name: 'Ammonia', ph: 11, color: '#047857', type: 'base' as const },
    { name: 'Bleach', ph: 12, color: '#065F46', type: 'base' as const }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      generateSubstances();
      animateBubbles();
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

  const generateSubstances = () => {
    const shuffled = [...substanceData].sort(() => Math.random() - 0.5);
    const newSubstances: AcidBase[] = shuffled.slice(0, 6).map((data, index) => ({
      id: `substance_${index}`,
      name: data.name,
      ph: data.ph,
      color: data.color,
      type: data.type,
      position: new Animated.ValueXY({
        x: 30 + (index % 3) * 120,
        y: height - 180 + Math.floor(index / 3) * 80
      })
    }));
    setSubstances(newSubstances);
  };

  const animateBubbles = () => {
    // Create floating bubble animations
    for (let i = 0; i < 10; i++) {
      const bubble = new Animated.Value(0);
      bubbleAnimations.push(bubble);
      
      Animated.loop(
        Animated.timing(bubble, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: false
        })
      ).start();
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(100);
    setCorrectPlacements(0);
    setPhMeter(7);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const endGame = async () => {
    setGameState('results');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await saveGameScore({
        userId: `user_${Date.now()}`,
        gameId: 'chemistry_10th_acids',
        score,
        timeSpent: 100 - timeLeft,
        completedAt: new Date().toISOString(),
        grade: 10,
        subject: 'Chemistry'
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const testSubstance = (substance: AcidBase) => {
    setSelectedSubstance(substance);
    setPhMeter(substance.ph);
    
    // Animate pH meter
    Animated.timing(phAnimation, {
      toValue: substance.ph,
      duration: 1000,
      useNativeDriver: false
    }).start();

    // Animate substance to pH meter
    Animated.timing(substance.position, {
      toValue: { x: width/2 - 30, y: 200 },
      duration: 800,
      useNativeDriver: false
    }).start();

    setScore(prev => prev + 75);
    setCorrectPlacements(prev => prev + 1);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (correctPlacements + 1 >= 6) {
      setTimeout(() => endGame(), 2000);
    }
  };

  const getPhColor = (ph: number) => {
    if (ph < 7) return '#EF4444'; // Red for acids
    if (ph > 7) return '#3B82F6'; // Blue for bases
    return '#10B981'; // Green for neutral
  };

  if (gameState === 'menu') {
    return (
      <LinearGradient colors={['#7C3AED', '#A855F7']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Animatable.View animation="bounceIn" style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
              🧪 pH Lab
            </Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
              10th Grade - Acids, Bases & Salts
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={500} style={{ width: '100%', marginBottom: 30 }}>
            <Text style={{ fontSize: 16, color: 'white', marginBottom: 16, textAlign: 'center' }}>
              🎯 Test substances and learn about pH levels!
            </Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20, marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                pH Scale Guide:
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#EF4444', fontSize: 14 }}>🔴 Acids (0-6)</Text>
                <Text style={{ color: '#10B981', fontSize: 14 }}>🟢 Neutral (7)</Text>
                <Text style={{ color: '#3B82F6', fontSize: 14 }}>🔵 Bases (8-14)</Text>
              </View>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                💡 Tap substances to test their pH with animated reactions!
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
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#7C3AED' }}>
                🚀 Start pH Lab
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
            <View style={{ backgroundColor: 'rgba(124,58,237,0.3)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 14 }}>
                Tested: {correctPlacements}/6
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                ⏱️ {timeLeft}s
              </Text>
            </View>
          </View>
        </View>

        {/* pH Meter */}
        <View style={{
          position: 'absolute',
          top: 150,
          left: width/2 - 60,
          width: 120,
          height: 200,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 20,
          padding: 16,
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            pH Meter
          </Text>
          
          <Animated.View style={{
            width: 80,
            height: 120,
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 10,
            justifyContent: 'flex-end',
            overflow: 'hidden'
          }}>
            <Animated.View style={{
              width: '100%',
              height: phAnimation.interpolate({
                inputRange: [0, 14],
                outputRange: [0, 120]
              }),
              backgroundColor: getPhColor(phMeter),
              borderRadius: 8
            }} />
          </Animated.View>
          
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
            {phMeter.toFixed(1)}
          </Text>
        </View>

        {/* Floating Bubbles */}
        {bubbleAnimations.slice(0, 8).map((bubble, index) => (
          <Animated.View
            key={`bubble_${index}`}
            style={{
              position: 'absolute',
              left: bubble.interpolate({
                inputRange: [0, 1],
                outputRange: [Math.random() * width, Math.random() * width]
              }),
              top: bubble.interpolate({
                inputRange: [0, 1],
                outputRange: [height, -50]
              }),
              width: 20 + Math.random() * 20,
              height: 20 + Math.random() * 20,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)'
            }}
          />
        ))}

        {/* Substances */}
        {substances.map((substance) => (
          <Animated.View
            key={substance.id}
            style={{
              position: 'absolute',
              left: substance.position.x,
              top: substance.position.y,
            }}
          >
            <TouchableOpacity
              onPress={() => testSubstance(substance)}
              style={{
                width: 80,
                height: 80,
                borderRadius: 15,
                backgroundColor: substance.color,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 8,
                borderWidth: selectedSubstance?.id === substance.id ? 4 : 0,
                borderColor: 'white',
                shadowColor: substance.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                {substance.name}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white', marginTop: 4 }}>
                pH: {substance.ph}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Instructions */}
        <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 16 }}>
            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
              {selectedSubstance 
                ? `Testing: ${selectedSubstance.name} - pH ${selectedSubstance.ph} (${selectedSubstance.type})` 
                : 'Tap substances to test their pH levels!'}
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
          <Text style={{ fontSize: 48 }}>🧪</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 16 }}>
            pH Lab Complete!
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
