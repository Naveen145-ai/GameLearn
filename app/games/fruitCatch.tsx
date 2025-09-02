import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { saveScore } from '../../src/db/gameService';

const { width } = Dimensions.get('window');

const fruits = [
  { name: 'Apple', type: 'healthy', img: require('../../assets/images/icon.png'), calories: 52 },
  { name: 'Burger', type: 'unhealthy', img: require('../../assets/images/favicon.png'), calories: 300 },
];

export default function FruitCatch() {
  const [score, setScore] = useState(0);
  const [currentFruit, setCurrentFruit] = useState(fruits[0]);
  const fall = useSharedValue(0);

  useEffect(() => {
    spawnFruit();
  }, []);

  const spawnFruit = () => {
    const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
    setCurrentFruit(randomFruit);
    fall.value = 0;
    fall.value = withTiming(500, { duration: 3000, easing: Easing.linear });
  };

  const catchFruit = () => {
    if (currentFruit.type === 'healthy') setScore(score + 10);
    else setScore(score - 5);

    saveScore('fruitCatch', score);
    spawnFruit();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fall.value }]
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dcfce7' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Score: {score}</Text>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity onPress={catchFruit}>
          <Image source={currentFruit.img} style={{ width: 80, height: 80 }} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
