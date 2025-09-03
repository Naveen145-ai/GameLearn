import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { initDatabase, getLocalProgressBySubject } from '../../src/db/gameService';
import { palette, spacing, radius, shadow } from '../../constants/theme';

type LocalProgress = {
  id?: string;
  student_id: string;
  game_id: string;
  score: number;
  time_spent: number;
  level: number;
  grade: number;
  subject: string;
  date: string;
};

export default function MyProgress() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<LocalProgress[]>([]);
  const [grade, setGrade] = useState<number | null>(null);

  useEffect(() => {
    initDatabase();
    reload();
  }, []);

  const reload = () => {
    const all = getLocalProgressBySubject('Math');
    // Filter by current user
    const userProgress = all.filter(r => r.student_id === user?.id);
    setItems(grade ? userProgress.filter(r => r.grade === grade) : userProgress);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const getGameDisplayName = (gameId: string) => {
    const gameNames: { [key: string]: string } = {
      'math_9th_formula_builder': 'Formula Builder',
      'math_10th_formula_builder': 'Formula Builder',
      'math_9th_runner': 'Formula Runner',
      'math_10th_runner': 'Formula Runner',
      'math_9th_blocks': 'Formula Blocks',
      'math_10th_blocks': 'Formula Blocks',
      'math_9th_maze': 'Formula Maze',
      'math_10th_maze': 'Formula Maze',
      'math_9th_shooter': 'Formula Shooter',
      'math_10th_shooter': 'Formula Shooter'
    };
    return gameNames[gameId] || gameId;
  };

  const getTotalScore = () => {
    return items.reduce((sum, item) => sum + item.score, 0);
  };

  const getGamesPlayed = () => {
    return items.length;
  };

  const getAverageScore = () => {
    return items.length > 0 ? Math.round(getTotalScore() / items.length) : 0;
  };

  return (
    <LinearGradient colors={['#111827', '#1f2937']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>My Math Progress</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              Welcome, {user?.name || 'Student'} • Grade {user?.grade}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 }}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Grade Filter */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <TouchableOpacity 
            onPress={() => { setGrade(null); reload(); }} 
            style={{ 
              backgroundColor: grade === null ? '#10b981' : 'rgba(255,255,255,0.2)', 
              padding: 8, 
              borderRadius: 8, 
              marginRight: 8 
            }}
          >
            <Text style={{ color: 'white' }}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { setGrade(9); reload(); }} 
            style={{ 
              backgroundColor: grade === 9 ? '#10b981' : 'rgba(255,255,255,0.2)', 
              padding: 8, 
              borderRadius: 8, 
              marginRight: 8 
            }}
          >
            <Text style={{ color: 'white' }}>Grade 9</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { setGrade(10); reload(); }} 
            style={{ 
              backgroundColor: grade === 10 ? '#10b981' : 'rgba(255,255,255,0.2)', 
              padding: 8, 
              borderRadius: 8 
            }}
          >
            <Text style={{ color: 'white' }}>Grade 10</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Summary</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>{getGamesPlayed()}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Games Played</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>{getTotalScore()}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Total Score</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>{getAverageScore()}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Average</Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity 
          onPress={() => router.push('/students/exportProgress')}
          style={{ 
            backgroundColor: '#10b981', 
            padding: 12, 
            borderRadius: 12, 
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Ionicons name="share-social" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Export My Progress to Teacher</Text>
        </TouchableOpacity>

        {/* Progress List */}
        {items.length === 0 ? (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, alignItems: 'center' }}>
            <Ionicons name="game-controller-outline" size={48} color="rgba(255,255,255,0.5)" />
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12, textAlign: 'center' }}>
              No games played yet.{'\n'}Start playing math games to see your progress here!
            </Text>
          </View>
        ) : (
          items.map((item, i) => (
            <View key={item.id || i} style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: '#111827', fontSize: 16 }}>
                  {getGameDisplayName(item.game_id)}
                </Text>
                <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 18 }}>
                  {item.score} pts
                </Text>
              </View>
              <Text style={{ color: '#374151', marginBottom: 4 }}>
                Level: {item.level} • Time: {item.time_spent}s
              </Text>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>
                {new Date(item.date).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}
