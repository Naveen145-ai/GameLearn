import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';

const { width, height } = Dimensions.get('window');

interface Atom {
  id: string;
  element: string;
  symbol: string;
  color: string;
  position: Animated.ValueXY;
  electrons: number;
}

export default function Chemistry9th() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [selectedAtom, setSelectedAtom] = useState<Atom | null>(null);
  const [targetMolecule, setTargetMolecule] = useState('H2O');
  const [createdBonds, setCreatedBonds] = useState<string[]>([]);

  const atomData = [
    { element: 'Hydrogen', symbol: 'H', color: '#FF6B6B', electrons: 1 },
    { element: 'Oxygen', symbol: 'O', color: '#4ECDC4', electrons: 6 },
    { element: 'Carbon', symbol: 'C', color: '#45B7D1', electrons: 4 },
    { element: 'Nitrogen', symbol: 'N', color: '#96CEB4', electrons: 5 },
    { element: 'Sodium', symbol: 'Na', color: '#FFEAA7', electrons: 1 },
    { element: 'Chlorine', symbol: 'Cl', color: '#DDA0DD', electrons: 7 }
  ];

  const molecules = [
    { formula: 'H2O', name: 'Water', atoms: ['H', 'H', 'O'] },
    { formula: 'CO2', name: 'Carbon Dioxide', atoms: ['C', 'O', 'O'] },
    { formula: 'NH3', name: 'Ammonia', atoms: ['N', 'H', 'H', 'H'] },
    { formula: 'NaCl', name: 'Salt', atoms: ['Na', 'Cl'] },
    { formula: 'CH4', name: 'Methane', atoms: ['C', 'H', 'H', 'H', 'H'] }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      generateAtoms();
      setTargetMolecule(molecules[Math.floor(Math.random() * molecules.length)].formula);
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

  const generateAtoms = () => {
    const newAtoms: Atom[] = [];
    for (let i = 0; i < 8; i++) {
      const atomInfo = atomData[Math.floor(Math.random() * atomData.length)];
      newAtoms.push({
        id: `atom_${i}`,
        element: atomInfo.element,
        symbol: atomInfo.symbol,
        color: atomInfo.color,
        electrons: atomInfo.electrons,
        position: new Animated.ValueXY({
          x: Math.random() * (width - 80) + 40,
          y: Math.random() * (height - 300) + 150
        })
      });
    }
    setAtoms(newAtoms);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(90);
    setCreatedBonds([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const endGame = async () => {
    setGameState('results');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await saveGameScore({
        userId: `user_${Date.now()}`,
        gameId: 'chemistry_9th_atoms',
        score,
        timeSpent: 90 - timeLeft,
        completedAt: new Date().toISOString(),
        grade: 9,
        subject: 'Chemistry'
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const selectAtom = (atom: Atom) => {
    if (selectedAtom) {
      if (selectedAtom.id !== atom.id) {
        // Create bond
        const bondId = `${selectedAtom.symbol}-${atom.symbol}`;
        setCreatedBonds(prev => [...prev, bondId]);
        setScore(prev => prev + 50);
        
        // Animate atoms coming together
        Animated.parallel([
          Animated.timing(selectedAtom.position, {
            toValue: { x: atom.position.x._value, y: atom.position.y._value - 30 },
            duration: 500,
            useNativeDriver: false
          }),
          Animated.timing(atom.position, {
            toValue: { x: atom.position.x._value, y: atom.position.y._value + 30 },
            duration: 500,
            useNativeDriver: false
          })
        ]).start();

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        
        // Check if molecule is complete
        checkMoleculeComplete();
      }
      setSelectedAtom(null);
    } else {
      setSelectedAtom(atom);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const checkMoleculeComplete = () => {
    const target = molecules.find(m => m.formula === targetMolecule);
    if (target && createdBonds.length >= target.atoms.length - 1) {
      setScore(prev => prev + 200);
      setTargetMolecule(molecules[Math.floor(Math.random() * molecules.length)].formula);
      setCreatedBonds([]);
      generateAtoms();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (gameState === 'menu') {
    return (
      <LinearGradient colors={['#7C3AED', '#A855F7']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Animatable.View animation="bounceIn" style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
              🧪 Chemistry Lab
            </Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
              9th Grade - Atoms & Molecules
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={500} style={{ width: '100%', marginBottom: 30 }}>
            <Text style={{ fontSize: 16, color: 'white', marginBottom: 16, textAlign: 'center' }}>
              🎯 Create molecules by bonding atoms together!
            </Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20, marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                Sample Molecules to Create:
              </Text>
              {molecules.slice(0, 3).map((mol, index) => (
                <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: 'white', fontSize: 14 }}>{mol.formula}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{mol.name}</Text>
                </View>
              ))}
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                💡 Tap atoms to select them, then tap another to create bonds!
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
                🚀 Start Chemistry Lab
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
      <LinearGradient colors={['#1F2937', '#374151']} style={{ flex: 1 }}>
        {/* Game UI */}
        <View style={{ position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
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
          
          <View style={{ backgroundColor: 'rgba(124,58,237,0.3)', borderRadius: 15, padding: 16 }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
              🎯 Create: {targetMolecule}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
              {molecules.find(m => m.formula === targetMolecule)?.name}
            </Text>
          </View>
        </View>

        {/* Atoms */}
        {atoms.map((atom) => (
          <Animated.View
            key={atom.id}
            style={{
              position: 'absolute',
              left: atom.position.x,
              top: atom.position.y,
            }}
          >
            <TouchableOpacity
              onPress={() => selectAtom(atom)}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: atom.color,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 8,
                borderWidth: selectedAtom?.id === atom.id ? 4 : 0,
                borderColor: 'white',
                shadowColor: atom.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                {atom.symbol}
              </Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
                e⁻: {atom.electrons}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Bonds visualization */}
        {createdBonds.map((bond, index) => (
          <Animatable.View
            key={index}
            animation="fadeIn"
            style={{
              position: 'absolute',
              bottom: 100 + (index * 30),
              left: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 10,
              padding: 8
            }}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>
              Bond: {bond}
            </Text>
          </Animatable.View>
        ))}

        {/* Instructions */}
        <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 16 }}>
            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
              {selectedAtom ? `Selected: ${selectedAtom.symbol} (${selectedAtom.element})` : 'Tap an atom to select it!'}
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
            Chemistry Complete!
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
