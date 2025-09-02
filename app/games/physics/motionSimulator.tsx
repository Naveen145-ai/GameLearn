import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  Easing 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function MotionSimulator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [velocity, setVelocity] = useState(50);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const carPosition = useSharedValue(0);
  const speedometer = useSharedValue(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const startSimulation = () => {
    setIsPlaying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    carPosition.value = withRepeat(
      withTiming(width - 100, {
        duration: (width - 100) / velocity * 100,
        easing: Easing.linear,
      }),
      -1,
      true
    );
    
    speedometer.value = withTiming(velocity, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    carPosition.value = withTiming(0, { duration: 500 });
    speedometer.value = withTiming(0, { duration: 500 });
    
    // Calculate score based on accuracy
    const targetVelocity = 60;
    const accuracy = Math.max(0, 100 - Math.abs(velocity - targetVelocity));
    setScore(prev => prev + Math.round(accuracy));
  };

  const adjustVelocity = (change: number) => {
    const newVelocity = Math.max(10, Math.min(100, velocity + change));
    setVelocity(newVelocity);
    Haptics.selectionAsync();
  };

  const carAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: carPosition.value }],
  }));

  const speedometerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(speedometer.value / 100) * 180 - 90}deg` }],
  }));

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
            Motion Simulator
          </Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 }}>
            Learn about velocity and motion
          </Text>
        </View>

        {/* Score and Time */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginBottom: 30,
          paddingHorizontal: 20
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Score</Text>
            <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold' }}>{score}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Time</Text>
            <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold' }}>
              {timeElapsed.toFixed(1)}s
            </Text>
          </View>
        </View>

        {/* Speedometer */}
        <View style={{ 
          alignItems: 'center', 
          marginBottom: 40,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: 20
        }}>
          <Text style={{ color: 'white', fontSize: 18, marginBottom: 15 }}>
            Velocity: {velocity} m/s
          </Text>
          <View style={{
            width: 120,
            height: 60,
            borderWidth: 3,
            borderColor: 'white',
            borderTopLeftRadius: 60,
            borderTopRightRadius: 60,
            borderBottomWidth: 0,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  width: 3,
                  height: 50,
                  backgroundColor: '#FF6B6B',
                  transformOrigin: 'bottom',
                },
                speedometerAnimatedStyle
              ]}
            />
          </View>
        </View>

        {/* Road and Car */}
        <View style={{
          height: 120,
          backgroundColor: '#2C3E50',
          borderRadius: 15,
          marginBottom: 30,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Road markings */}
          <View style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: 'white',
            opacity: 0.5
          }} />
          
          {/* Car */}
          <Animated.View style={[
            {
              position: 'absolute',
              top: 30,
              width: 80,
              height: 60,
              backgroundColor: '#E74C3C',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center'
            },
            carAnimatedStyle
          ]}>
            <Ionicons name="car-sport" size={40} color="white" />
          </Animated.View>
        </View>

        {/* Velocity Controls */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 15,
          padding: 20,
          marginBottom: 30
        }}>
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', marginBottom: 15 }}>
            Adjust Velocity
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => adjustVelocity(-10)}
              style={{
                backgroundColor: '#FF6B6B',
                borderRadius: 25,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="remove" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                {velocity}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                m/s
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => adjustVelocity(10)}
              style={{
                backgroundColor: '#4ECDC4',
                borderRadius: 25,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <TouchableOpacity
            onPress={isPlaying ? stopSimulation : startSimulation}
            style={{
              backgroundColor: isPlaying ? '#FF6B6B' : '#4ECDC4',
              borderRadius: 25,
              paddingHorizontal: 30,
              paddingVertical: 15,
              flexDirection: 'row',
              alignItems: 'center',
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <Ionicons 
              name={isPlaying ? "stop" : "play"} 
              size={24} 
              color="white" 
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              {isPlaying ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Learning Tip */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 15,
          padding: 15,
          marginTop: 20
        }}>
          <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
            💡 Tip: Velocity = Distance ÷ Time. Try different speeds to see how motion changes!
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
