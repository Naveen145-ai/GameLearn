import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { apiService, LeaderboardEntry } from '../../src/services/apiService';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState<'global' | 'physics' | 'chemistry' | 'biology' | 'math'>('global');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      let data: LeaderboardEntry[] = [];
      
      if (selectedTab === 'global') {
        data = await apiService.getGlobalLeaderboard();
      } else {
        data = await apiService.getSubjectLeaderboard(selectedTab);
      }
      
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Mock data for development
      setLeaderboardData([
        { userId: '1', userName: 'Arjun Kumar', totalScore: 2450, gamesPlayed: 15, averageScore: 163, rank: 1 },
        { userId: '2', userName: 'Priya Sharma', totalScore: 2380, gamesPlayed: 14, averageScore: 170, rank: 2 },
        { userId: '3', userName: 'Rahul Singh', totalScore: 2290, gamesPlayed: 13, averageScore: 176, rank: 3 },
        { userId: '4', userName: 'Anita Patel', totalScore: 2150, gamesPlayed: 12, averageScore: 179, rank: 4 },
        { userId: '5', userName: 'Vikram Rao', totalScore: 2080, gamesPlayed: 11, averageScore: 189, rank: 5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      global: ['#667eea', '#764ba2'],
      physics: ['#3B82F6', '#1E40AF'],
      chemistry: ['#10B981', '#047857'],
      biology: ['#8B5CF6', '#6D28D9'],
      math: ['#F59E0B', '#D97706']
    };
    return colors[subject as keyof typeof colors] || colors.global;
  };

  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 4 }}>
      <LinearGradient
        colors={isActive ? getSubjectColor(title.toLowerCase()) : ['#F3F4F6', '#E5E7EB']}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          elevation: isActive ? 3 : 1,
        }}
      >
        <Text style={{
          color: isActive ? 'white' : '#6B7280',
          fontWeight: isActive ? 'bold' : 'normal',
          fontSize: 14
        }}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const LeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={{
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: item.rank <= 3 ? '#FFD700' : '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {getRankIcon(item.rank)}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
          {item.userName}
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
          {item.gamesPlayed} games played
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#059669' }}>
          {item.totalScore}
        </Text>
        <Text style={{ fontSize: 12, color: '#6B7280' }}>
          Avg: {item.averageScore}
        </Text>
      </View>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={getSubjectColor(selectedTab)}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: 60 }}>
        <Animatable.View animation="fadeInDown" style={{ alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="trophy" size={40} color="white" />
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 8 }}>
            Leaderboard
          </Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
            Compete with fellow learners
          </Text>
        </Animatable.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <TabButton
            title="Global"
            isActive={selectedTab === 'global'}
            onPress={() => setSelectedTab('global')}
          />
          <TabButton
            title="Physics"
            isActive={selectedTab === 'physics'}
            onPress={() => setSelectedTab('physics')}
          />
          <TabButton
            title="Chemistry"
            isActive={selectedTab === 'chemistry'}
            onPress={() => setSelectedTab('chemistry')}
          />
          <TabButton
            title="Biology"
            isActive={selectedTab === 'biology'}
            onPress={() => setSelectedTab('biology')}
          />
          <TabButton
            title="Math"
            isActive={selectedTab === 'math'}
            onPress={() => setSelectedTab('math')}
          />
        </ScrollView>

        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: 'white', fontSize: 16 }}>Loading leaderboard...</Text>
            </View>
          ) : (
            leaderboardData.map((item, index) => (
              <LeaderboardItem key={item.userId} item={item} index={index} />
            ))
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
