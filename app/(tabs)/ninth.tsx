import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';
import { saveGameScore } from '../../src/services/apiService';

export default function Ninth() {
  const subjects = [
    { 
      name: 'Physics', 
      icon: 'nuclear', 
      color: ['#3B82F6', '#1E40AF'],
      topics: ['Motion', 'Force & Laws', 'Gravitation', 'Work & Energy'],
      gameId: 'physics_9th'
    },
    { 
      name: 'Chemistry', 
      icon: 'flask', 
      color: ['#10B981', '#047857'],
      topics: ['Matter', 'Atoms & Molecules', 'Structure of Atom', 'Chemical Reactions'],
      gameId: 'chemistry_9th'
    },
    { 
      name: 'Biology', 
      icon: 'leaf', 
      color: ['#8B5CF6', '#6D28D9'],
      topics: ['Cell Structure', 'Tissues', 'Life Processes', 'Heredity'],
      gameId: 'biology_9th'
    },
    { 
      name: 'Math', 
      icon: 'calculator', 
      color: ['#F59E0B', '#D97706'],
      topics: ['Number Systems', 'Polynomials', 'Linear Equations', 'Geometry'],
      gameId: 'math_9th'
    }
  ];

  const SubjectCard = ({ subject, index }: { subject: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 200}
      style={{ marginBottom: 16 }}
    >
      <TouchableOpacity
        onPress={() => router.push(`/games/${subject.name.toLowerCase()}/${subject.gameId}`)}
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
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                  {subject.topics.join(' • ')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 100 }}>
        <Animatable.View animation="fadeInDown" style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
            📚 9th Standard
          </Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>
            Choose a subject to start learning
          </Text>
        </Animatable.View>

        {subjects.map((subject, index) => (
          <SubjectCard key={subject.name} subject={subject} index={index} />
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
