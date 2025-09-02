import { View, Text } from 'react-native';

export default function ScoreBoard({ score }: any) {
  return (
    <View className="p-4 bg-yellow-200 rounded-xl mb-4">
      <Text className="text-lg font-bold">Score: {score}</Text>
    </View>
  );
}
