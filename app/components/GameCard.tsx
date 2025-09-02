import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function GameCard({ title, description, link }: any) {
  return (
    <Link href={link} asChild>
      <Pressable style={{ backgroundColor: '#bfdbfe', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
        {description && <Text style={{ color: '#374151' }}>{description}</Text>}
      </Pressable>
    </Link>
  );
}
