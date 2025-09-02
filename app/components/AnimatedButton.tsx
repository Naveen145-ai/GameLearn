import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function AnimatedButton({ onPress, title }: any) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1) }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={onPress} className="bg-green-500 p-3 rounded-xl">
        <Text className="text-white font-bold">{title}</Text>
      </Pressable>
    </Animated.View>
  );
}
