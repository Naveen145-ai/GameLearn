import { View, ScrollView, Text } from 'react-native';
import { tenthTopics } from '../../src/data/tenthTopics';
import GameCard from '../components/GameCard';

export default function Tenth() {
  return (
    <ScrollView style={{ padding: 16, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>10th Standard Topics</Text>
      {tenthTopics.map(topic => (
        <GameCard key={topic.id} title={topic.title} link={`/games/${topic.game}`} />
      ))}
    </ScrollView>
  );
}
