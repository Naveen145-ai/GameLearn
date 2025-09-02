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

const { width, height } = Dimensions.get('window');

interface Organelle {
  id: string;
  name: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  placed: boolean;
  correctX: number;
  correctY: number;
}

const organelles: Organelle[] = [
  { id: '1', name: 'Nucleus', icon: '⚫', color: '#8B5CF6', x: 0, y: 0, placed: false, correctX: 150, correctY: 150 },
  { id: '2', name: 'Mitochondria', icon: '🥜', color: '#10B981', x: 0, y: 0, placed: false, correctX: 100, correctY: 100 },
  { id: '3', name: 'Ribosome', icon: '🔴', color: '#F59E0B', x: 0, y: 0, placed: false, correctX: 200, correctY: 120 },
  { id: '4', name: 'Vacuole', icon: '💧', color: '#3B82F6', x: 0, y: 0, placed: false, correctX: 80, correctY: 180 },
  { id: '5', name: 'Chloroplast', icon: '🟢', color: '#059669', x: 0, y: 0, placed: false, correctX: 180, correctY: 80 },
];

export default function CellBuilder() {
  const [gameOrganelles, setGameOrganelles] = useState<Organelle[]>([]);
  const [selectedOrganelle, setSelectedOrganelle] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [placedCount, setPlacedCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (gameStarted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted]);

  const startGame = () => {
    const shuffledOrganelles = organelles.map(org => ({
      ...org,
      x: Math.random() * (width - 100),
      y: height * 0.7 + Math.random() * 100,
      placed: false
    }));
    
    setGameOrganelles(shuffledOrganelles);
    setGameStarted(true);
    setScore(0);
    setPlacedCount(0);
    setTimeElapsed(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const selectOrganelle = (id: string) => {
    setSelectedOrganelle(selectedOrganelle === id ? null : id);
    Haptics.selectionAsync();
  };

  const placeCellOrganelle = (x: number, y: number) => {
    if (!selectedOrganelle) return;

    const organelle = gameOrganelles.find(org => org.id === selectedOrganelle);
    if (!organelle || organelle.placed) return;

    const distance = Math.sqrt(
      Math.pow(x - organelle.correctX, 2) + Math.pow(y - organelle.correctY, 2)
    );

    const isCorrect = distance < 50;
    
    if (isCorrect) {
      setGameOrganelles(prev => prev.map(org => 
        org.id === selectedOrganelle 
          ? { ...org, x: organelle.correctX, y: organelle.correctY, placed: true }
          : org
      ));
      setScore(prev => prev + 100);
      setPlacedCount(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (placedCount + 1 === organelles.length) {
        setTimeout(() => {
          Alert.alert(
            'Congratulations!',
            `Cell completed!\nScore: ${score + 100}\nTime: ${timeElapsed}s`,
            [{ text: 'Play Again', onPress: startGame }]
          );
        }, 500);
      }
    } else {
      setScore(prev => Math.max(0, prev - 10));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    setSelectedOrganelle(null);
  };

  const OrganelleComponent = ({ organelle }: { organelle: Organelle }) => {
    const isSelected = selectedOrganelle === organelle.id;
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      scale.value = withSpring(0.9, {}, () => {
        scale.value = withSpring(1);
      });
      runOnJS(selectOrganelle)(organelle.id);
    };

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: organelle.x,
            top: organelle.y,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: organelle.color,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: isSelected ? 3 : 0,
            borderColor: '#FFD700',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            opacity: organelle.placed ? 0.8 : 1,
          },
          animatedStyle
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          disabled={organelle.placed}
          style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 24 }}>{organelle.icon}</Text>
        </TouchableOpacity>
        {organelle.placed && (
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color="white" 
            style={{ position: 'absolute', top: -5, right: -5 }} 
          />
        )}
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 60 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
            Cell Builder
          </Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 }}>
            Build a plant cell by placing organelles
          </Text>
        </View>

        {/* Game Stats */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around',
          marginBottom: 20,
          paddingHorizontal: 20
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Score</Text>
            <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold' }}>{score}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Placed</Text>
            <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold' }}>
              {placedCount}/{organelles.length}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Time</Text>
            <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold' }}>{timeElapsed}s</Text>
          </View>
        </View>

        {!gameStarted ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 30,
              alignItems: 'center'
            }}>
              <Ionicons name="leaf" size={80} color="white" style={{ marginBottom: 20 }} />
              <Text style={{ color: 'white', fontSize: 20, textAlign: 'center', marginBottom: 20 }}>
                Drag organelles to their correct positions in the plant cell!
              </Text>
              <TouchableOpacity
                onPress={startGame}
                style={{
                  backgroundColor: '#10B981',
                  borderRadius: 25,
                  paddingHorizontal: 40,
                  paddingVertical: 15,
                  elevation: 5,
                }}
              >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                  Start Building
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Cell Area */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => {
                const { locationX, locationY } = e.nativeEvent;
                placeCellOrganelle(locationX, locationY);
              }}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.1)',
                margin: 20,
                borderRadius: 20,
                position: 'relative',
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.3)',
                borderStyle: 'dashed'
              }}
            >
              {/* Cell Wall */}
              <View style={{
                position: 'absolute',
                top: 20,
                left: 20,
                right: 20,
                bottom: 20,
                borderRadius: 15,
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.5)',
                backgroundColor: 'rgba(144,238,144,0.1)'
              }}>
                {/* Cell Membrane */}
                <View style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  right: 10,
                  bottom: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(173,216,230,0.1)'
                }}>
                  <Text style={{
                    position: 'absolute',
                    top: 5,
                    left: 10,
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    Plant Cell
                  </Text>
                </View>
              </View>

              {/* Organelles */}
              {gameOrganelles.map(organelle => (
                <OrganelleComponent key={organelle.id} organelle={organelle} />
              ))}

              {/* Target positions (hints) */}
              {organelles.map(org => (
                <View
                  key={`target-${org.id}`}
                  style={{
                    position: 'absolute',
                    left: org.correctX - 25,
                    top: org.correctY - 25,
                    width: 50,
                    height: 50,
                    borderRadius: 25,
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
            </TouchableOpacity>

            {/* Instructions */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 15,
              padding: 15,
              margin: 20,
              marginTop: 0
            }}>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                💡 Select an organelle below, then tap its correct position in the cell
              </Text>
              {selectedOrganelle && (
                <Text style={{ color: '#FFD700', fontSize: 16, textAlign: 'center', marginTop: 5, fontWeight: 'bold' }}>
                  Selected: {gameOrganelles.find(org => org.id === selectedOrganelle)?.name}
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
}
