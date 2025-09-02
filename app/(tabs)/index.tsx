import { ScrollView, Text } from 'react-native';
import GameCard from '../components/GameCard';

export default function Home() {
  return (
    <ScrollView style={{ padding: 16, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Gamified Learning (9th & 10th)</Text>
      <GameCard title="9th Standard" description="Physics, Chemistry, Biology, Math" link="/(tabs)/ninth" />
      <GameCard title="10th Standard" description="Physics, Chemistry, Biology, Math" link="/(tabs)/tenth" />
    </ScrollView>
  );
}
