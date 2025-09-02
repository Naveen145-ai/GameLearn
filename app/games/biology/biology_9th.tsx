import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';

const { width, height } = Dimensions.get('window');

interface Organelle {
  id: string;
  name: string;
  function: string;
  color: string;
  position: Animated.ValueXY;
  placed: boolean;
  correctPosition: { x: number; y: number };
}

export default function Biology9th() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [organelles, setOrganelles] = useState<Organelle[]>([]);
  const [selectedOrganelle, setSelectedOrganelle] = useState<Organelle | null>(null);
  const [placedCount, setPlacedCount] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const organelleData = [
    { name: 'Nucleus', function: 'Controls cell activities', color: '#FF6B6B', correctPosition: { x: width/2 - 30, y: height/2 - 30 } },
    { name: 'Mitochondria', function: 'Powerhouse of cell', color: '#4ECDC4', correctPosition: { x: width/2 + 60, y: height/2 - 60 } },
    { name: 'Ribosome', function: 'Protein synthesis', color: '#45B7D1', correctPosition: { x: width/2 - 80, y: height/2 + 40 } },
    { name: 'Vacuole', function: 'Storage organelle', color: '#96CEB4', correctPosition: { x: width/2 + 40, y: height/2 + 60 } },
    { name: 'Chloroplast', function: 'Photosynthesis', color: '#10B981', correctPosition: { x: width/2 - 40, y: height/2 - 80 } },
    { name: 'Cell Wall', function: 'Protection & shape', color: '#8B5CF6', correctPosition: { x: width/2 - 100, y: height/2 - 100 } }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      initializeOrganelles();
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

  const initializeOrganelles = () => {
    const newOrganelles: Organelle[] = organelleData.map((data, index) => ({
      id: `organelle_${index}`,
      name: data.name,
      function: data.function,
      color: data.color,
      correctPosition: data.correctPosition,
      placed: false,
      position: new Animated.ValueXY({
        x: 20 + (index % 3) * 100,
        y: height - 150 + Math.floor(index / 3) * 60
      })
    }));
    setOrganelles(newOrganelles);
    setPlacedCount(0);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(120);
    setShowHints(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const endGame = async () => {
    setGameState('results');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await saveGameScore({
        userId: `user_${Date.now()}`,
        gameId: 'biology_9th_cell',
        score,
        timeSpent: 120 - timeLeft,
        completedAt: new Date().toISOString(),
        grade: 9,
        subject: 'Biology'
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const selectOrganelle = (organelle: Organelle) => {
    if (organelle.placed) return;
    
    setSelectedOrganelle(organelle);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(organelle.position, {
        toValue: { x: (organelle.position.x as any)._value, y: (organelle.position.y as any)._value - 10 },
        duration: 100,
        useNativeDriver: false
      }),
      Animated.timing(organelle.position, {
        toValue: { x: (organelle.position.x as any)._value, y: (organelle.position.y as any)._value + 10 },
        duration: 100,
        useNativeDriver: false
      })
    ]).start();
  };

  const placeOrganelle = (targetX: number, targetY: number) => {
    if (!selectedOrganelle) return;

    const distance = Math.sqrt(
      Math.pow(targetX - selectedOrganelle.correctPosition.x, 2) +
      Math.pow(targetY - selectedOrganelle.correctPosition.y, 2)
    );

    if (distance < 50) {
      // Correct placement
      Animated.timing(selectedOrganelle.position, {
        toValue: selectedOrganelle.correctPosition,
        duration: 300,
        useNativeDriver: false
      }).start();

      setOrganelles(prev => prev.map(org => 
        org.id === selectedOrganelle.id ? { ...org, placed: true } : org
      ));
      
      setScore(prev => prev + 100);
      setPlacedCount(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (placedCount + 1 === organelleData.length) {
        setTimeout(() => endGame(), 1000);
      }
    } else {
      // Wrong placement - bounce back
      Animated.spring(selectedOrganelle.position, {
        toValue: {
          x: 20 + (organelleData.findIndex(o => o.name === selectedOrganelle.name) % 3) * 100,
          y: height - 150 + Math.floor(organelleData.findIndex(o => o.name === selectedOrganelle.name) / 3) * 60
        },
        useNativeDriver: false
      }).start();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    setSelectedOrganelle(null);
  };

  if (gameState === 'menu') {
    return (
      <LinearGradient colors={['#059669', '#10B981']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Animatable.View animation="bounceIn" style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
              🔬 Biology Lab
            </Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
              9th Grade - Cell Structure & Function
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={500} style={{ width: '100%', marginBottom: 30 }}>
            <Text style={{ fontSize: 16, color: 'white', marginBottom: 16, textAlign: 'center' }}>
              🎯 Build a complete cell by placing organelles correctly!
            </Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20, marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                Organelles to Place:
              </Text>
              <ScrollView style={{ maxHeight: 120 }}>
                {organelleData.map((org, index) => (
                  <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: 'white', fontSize: 14 }}>{org.name}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, flex: 1, textAlign: 'right' }}>
                      {org.function}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                💡 Drag organelles from bottom to their correct positions in the cell!
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
                🚀 Start Biology Lab
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
            <TouchableOpacity
              onPress={() => setShowHints(!showHints)}
              style={{ backgroundColor: 'rgba(16,185,129,0.3)', borderRadius: 15, padding: 12 }}
            >
              <Text style={{ color: 'white', fontSize: 14 }}>
                💡 Hints
              </Text>
            </TouchableOpacity>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                ⏱️ {timeLeft}s
              </Text>
            </View>
          </View>
          
          <View style={{ backgroundColor: 'rgba(16,185,129,0.3)', borderRadius: 15, padding: 16 }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
              🧬 Build the Cell: {placedCount}/{organelleData.length} placed
            </Text>
          </View>
        </View>

        {/* Cell membrane outline */}
        <View style={{
          position: 'absolute',
          top: height/2 - 120,
          left: width/2 - 120,
          width: 240,
          height: 240,
          borderRadius: 120,
          borderWidth: 3,
          borderColor: 'rgba(16,185,129,0.5)',
          borderStyle: 'dashed'
        }} />

        {/* Hint positions */}
        {showHints && organelleData.map((org, index) => (
          <View
            key={`hint_${index}`}
            style={{
              position: 'absolute',
              left: org.correctPosition.x,
              top: org.correctPosition.y,
              width: 60,
              height: 60,
              borderRadius: 30,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.3)',
              borderStyle: 'dashed',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center' }}>
              {org.name}
            </Text>
          </View>
        ))}

        {/* Organelles */}
        {organelles.map((organelle) => (
          <Animated.View
            key={organelle.id}
            style={{
              position: 'absolute',
              left: organelle.position.x,
              top: organelle.position.y,
            }}
          >
            <TouchableOpacity
              onPress={() => selectOrganelle(organelle)}
              onLongPress={() => {
                if (selectedOrganelle?.id === organelle.id) {
                  placeOrganelle(organelle.correctPosition.x, organelle.correctPosition.y);
                }
              }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: organelle.color,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 8,
                borderWidth: selectedOrganelle?.id === organelle.id ? 4 : 0,
                borderColor: 'white',
                opacity: organelle.placed ? 0.8 : 1,
                shadowColor: organelle.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                {organelle.name.slice(0, 4)}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Cell membrane touch area */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: height/2 - 120,
            left: width/2 - 120,
            width: 240,
            height: 240,
            borderRadius: 120,
          }}
          onPress={(event) => {
            const { locationX, locationY } = event.nativeEvent;
            if (selectedOrganelle) {
              placeOrganelle(
                width/2 - 120 + locationX - 30,
                height/2 - 120 + locationY - 30
              );
            }
          }}
        />

        {/* Instructions */}
        <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 16 }}>
            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
              {selectedOrganelle 
                ? `Selected: ${selectedOrganelle.name} - ${selectedOrganelle.function}` 
                : 'Tap an organelle, then tap inside the cell to place it!'}
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
          <Text style={{ fontSize: 48 }}>🔬</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 16 }}>
            Cell Built Successfully!
          </Text>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
            Final Score: {score}
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            Organelles Placed: {placedCount}/{organelleData.length}
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
