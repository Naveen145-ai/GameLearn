import { View, ScrollView, Text } from 'react-native';
import { ninthTopics } from '../../src/data/ninthTopics';
import GameCard from '../components/GameCard';

export default function Ninth() {
  return (
    <ScrollView style={{ padding: 16, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>9th Standard Topics</Text>
      {ninthTopics.map(topic => (
        <GameCard key={topic.id} title={topic.title} link={`/games/${topic.game}`} />
      ))}
    </ScrollView>
  );
}
