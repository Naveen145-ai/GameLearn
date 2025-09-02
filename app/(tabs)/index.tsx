import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Home() {
  const grades = [
    { 
      grade: 9, 
      title: '9th Standard', 
      color: ['#3B82F6', '#1E40AF'],
      subjects: ['Physics', 'Chemistry', 'Biology', 'Math'],
      icon: 'school'
    },
    { 
      grade: 10, 
      title: '10th Standard', 
      color: ['#10B981', '#047857'],
      subjects: ['Physics', 'Chemistry', 'Biology', 'Math'],
      icon: 'library'
    }
  ];

  const SubjectCard = ({ subject, index }: { subject: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 200}
      style={{ marginBottom: 16 }}
    >
      <TouchableOpacity
        onPress={() => router.push(`/games/${subject.name.toLowerCase()}`)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={subject.color}
          style={{
            borderRadius: 20,
            padding: 20,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 15,
                padding: 12,
                marginRight: 16
              }}>
                <Ionicons name={subject.icon as any} size={32} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
                  {subject.name}
                </Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                  {subject.games} interactive games
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  const QuickStatsCard = () => (
    <Animatable.View animation="fadeIn" delay={800}>
      <View style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
          Your Progress
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6' }}>12</Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Games Played</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>850</Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Total Score</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B' }}>5</Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Streak</Text>
          </View>
        </View>
      </View>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
            🎮 Learning Games
          </Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
            Master 9th & 10th grade concepts through fun games
          </Text>
        </Animatable.View>

        {/* Quick Stats */}
        <QuickStatsCard />

        {/* Subject Cards */}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
          Choose Your Subject
        </Text>
        
        {subjects.map((subject, index) => (
          <SubjectCard key={subject.name} subject={subject} index={index} />
        ))}

        {/* Quick Access Buttons */}
        <Animatable.View animation="fadeInUp" delay={1000}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/leaderboard')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 15,
                padding: 16,
                flex: 1,
                marginRight: 8,
                alignItems: 'center'
              }}
            >
              <Ionicons name="trophy" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
                Leaderboard
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/games/fruitCatch')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 15,
                padding: 16,
                flex: 1,
                marginLeft: 8,
                alignItems: 'center'
              }}
            >
              <Ionicons name="game-controller" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
                Quick Game
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Learning Tip */}
        <Animatable.View animation="fadeIn" delay={1200}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 15,
            padding: 16,
            marginTop: 20,
            marginBottom: 20
          }}>
            <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
              💡 <Text style={{ fontWeight: 'bold' }}>Daily Tip:</Text> Play games regularly to improve your understanding and climb the leaderboard!
            </Text>
          </View>
        </Animatable.View>
      </ScrollView>
    </LinearGradient>
  );
}
