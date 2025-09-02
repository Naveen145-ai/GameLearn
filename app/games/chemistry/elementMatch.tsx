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

interface Element {
  id: string;
  symbol: string;
  name: string;
  atomicNumber: number;
  color: string;
  matched: boolean;
}

const elements: Element[] = [
  { id: '1', symbol: 'H', name: 'Hydrogen', atomicNumber: 1, color: '#FF6B6B', matched: false },
  { id: '2', symbol: 'He', name: 'Helium', atomicNumber: 2, color: '#4ECDC4', matched: false },
  { id: '3', symbol: 'Li', name: 'Lithium', atomicNumber: 3, color: '#45B7D1', matched: false },
  { id: '4', symbol: 'Be', name: 'Beryllium', atomicNumber: 4, color: '#96CEB4', matched: false },
  { id: '5', symbol: 'B', name: 'Boron', atomicNumber: 5, color: '#FFEAA7', matched: false },
  { id: '6', symbol: 'C', name: 'Carbon', atomicNumber: 6, color: '#DDA0DD', matched: false },
  { id: '7', symbol: 'N', name: 'Nitrogen', atomicNumber: 7, color: '#98D8C8', matched: false },
  { id: '8', symbol: 'O', name: 'Oxygen', atomicNumber: 8, color: '#F7DC6F', matched: false },
];

export default function ElementMatch() {
  const [gameElements, setGameElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [matches, setMatches] = useState(0);

  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameStarted]);

  const startGame = () => {
    const shuffledElements = [...elements].sort(() => Math.random() - 0.5).slice(0, 6);
    const gameData = [
      ...shuffledElements,
      ...shuffledElements.map(el => ({ ...el, id: el.id + '_name', symbol: el.name, name: el.symbol }))
    ].sort(() => Math.random() - 0.5);
    
    setGameElements(gameData);
    setGameStarted(true);
    setScore(0);
    setMatches(0);
    setTimeLeft(60);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const endGame = () => {
    setGameStarted(false);
    Alert.alert(
      'Game Over!',
      `Final Score: ${score}\nMatches: ${matches}`,
      [{ text: 'Play Again', onPress: startGame }]
    );
  };

  const selectElement = (element: Element) => {
    if (element.matched) return;

    Haptics.selectionAsync();
    scaleAnim.value = withSpring(0.9, {}, () => {
      scaleAnim.value = withSpring(1);
    });

    if (!selectedElement) {
      setSelectedElement(element);
    } else if (selectedElement.id === element.id) {
      setSelectedElement(null);
    } else {
      // Check for match
      const isMatch = (
        (selectedElement.symbol === element.name && selectedElement.name === element.symbol) ||
        (selectedElement.name === element.symbol && selectedElement.symbol === element.name)
      );

      if (isMatch) {
        // Match found
        setGameElements(prev => prev.map(el => 
          el.id === selectedElement.id || el.id === element.id 
            ? { ...el, matched: true }
            : el
        ));
        setScore(prev => prev + 100);
        setMatches(prev => prev + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // No match
        setScore(prev => Math.max(0, prev - 10));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setSelectedElement(null);
    }
  };

  const ElementCard = ({ element, index }: { element: Element; index: number }) => {
    const isSelected = selectedElement?.id === element.id;
    const cardScale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    const handlePress = () => {
      cardScale.value = withSpring(0.95, {}, () => {
        cardScale.value = withSpring(1);
      });
      runOnJS(selectElement)(element);
    };

    return (
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          onPress={handlePress}
          disabled={element.matched}
          style={{
            width: (width - 60) / 3,
            height: 80,
            margin: 5,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: element.matched ? '#95A5A6' : element.color,
            borderWidth: isSelected ? 3 : 0,
            borderColor: '#FFD700',
            elevation: element.matched ? 1 : 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            opacity: element.matched ? 0.5 : 1,
          }}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center'
          }}>
            {element.symbol}
          </Text>
          {element.matched && (
            <Ionicons name="checkmark-circle" size={24} color="white" style={{ position: 'absolute', top: 5, right: 5 }} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#11998e', '#38ef7d']} style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
            Element Match
          </Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 }}>
            Match elements with their names
          </Text>
        </View>

        {/* Game Stats */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginBottom: 20,
          paddingHorizontal: 20
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
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Matches</Text>
            <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold' }}>{matches}</Text>
          </View>
        </View>

        {!gameStarted ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 30,
              alignItems: 'center'
            }}>
              <Ionicons name="flask" size={80} color="white" style={{ marginBottom: 20 }} />
              <Text style={{ color: 'white', fontSize: 20, textAlign: 'center', marginBottom: 20 }}>
                Match chemical elements with their names!
              </Text>
              <TouchableOpacity
                onPress={startGame}
                style={{
                  backgroundColor: '#FF6B6B',
                  borderRadius: 25,
                  paddingHorizontal: 40,
                  paddingVertical: 15,
                  elevation: 5,
                }}
              >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                  Start Game
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Game Grid */}
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 15,
              marginBottom: 20
            }}>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {gameElements.map((element, index) => (
                  <ElementCard key={element.id} element={element} index={index} />
                ))}
              </View>
            </View>

            {/* Instructions */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 15,
              padding: 15
            }}>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                💡 Tip: Match element symbols (H, He, Li) with their full names (Hydrogen, Helium, Lithium)
              </Text>
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
}
