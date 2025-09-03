import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { commonStyles, palette, radius, shadow, spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function Home() {
  const { user, logout } = useAuth();
  
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

  const GradeCard = ({ gradeData, index }: { gradeData: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 200}
      style={{ marginBottom: spacing.md }}
    >
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/${gradeData.grade === 9 ? 'ninth' : 'tenth'}`)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradeData.color}
          style={{
            borderRadius: radius.xl,
            padding: spacing.lg,
            ...shadow.card,
          }}
        >
          <View style={[commonStyles.row, commonStyles.spaceBetween]}>
            <View style={[commonStyles.row, { flex: 1 }]}>
              <View style={[commonStyles.glass, { marginRight: spacing.md }]}>
                <Ionicons name={gradeData.icon as any} size={32} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.textTitle, { marginBottom: 4 }]}>
                  {gradeData.title}
                </Text>
                <Text style={commonStyles.textMuted}>
                  {gradeData.subjects.join(', ')}
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
      <View style={[commonStyles.card, { marginBottom: spacing.lg }]}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: palette.textDark, marginBottom: spacing.md }}>
          Your Progress
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: palette.primary }}>12</Text>
            <Text style={{ fontSize: 12, color: palette.muted }}>Games Played</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: palette.success }}>850</Text>
            <Text style={{ fontSize: 12, color: palette.muted }}>Total Score</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: palette.warning }}>5</Text>
            <Text style={{ fontSize: 12, color: palette.muted }}>Streak</Text>
          </View>
        </View>
      </View>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={[palette.backgroundTop, palette.backgroundBottom]}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
            🎮 Learning Games
          </Text>
          <Text style={[commonStyles.textMuted, { fontSize: 16, marginTop: 8, textAlign: 'center' }]}>
            Master 9th & 10th grade concepts through fun games
          </Text>
        </Animatable.View>

        {/* User Info & Logout */}
        <Animatable.View animation="fadeInDown" delay={200}>
          <View style={[commonStyles.glass, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }]}>
            <View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Welcome, {user?.name || 'Student'}!
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                {user?.type === 'student' ? `Grade ${user?.grade}` : `Subject: ${user?.subject}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={[commonStyles.glass, { padding: spacing.sm }]}
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Quick Stats */}
        <QuickStatsCard />

        {/* Grade Cards */}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: spacing.md }}>
          Choose Your Grade
        </Text>
        
        {grades.map((gradeData, index) => (
          <GradeCard key={gradeData.grade} gradeData={gradeData} index={index} />
        ))}

        {/* Quick Access Buttons */}
        <Animatable.View animation="fadeInUp" delay={1000}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/leaderboard')}
              style={[commonStyles.buttonPill, commonStyles.glass, { marginRight: spacing.sm }]}
            >
              <Ionicons name="trophy" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
                Leaderboard
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/ninth')}
              style={[commonStyles.buttonPill, commonStyles.glass, { marginLeft: spacing.sm }]}
            >
              <Ionicons name="game-controller" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
                Quick Play
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Learning Tip */}
        <Animatable.View animation="fadeIn" delay={1200}>
          <View style={[commonStyles.glassSoft, { marginTop: spacing.lg, marginBottom: spacing.lg }]}>
            <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
              💡 <Text style={{ fontWeight: 'bold' }}>Daily Tip:</Text> Play games regularly to improve your understanding and climb the leaderboard!
            </Text>
          </View>
        </Animatable.View>

        {/* Student Progress & Export */}
        <Animatable.View animation="fadeInUp" delay={1400}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg }}>
            <TouchableOpacity
              onPress={() => router.push('/students/myProgress')}
              style={[commonStyles.buttonPill, commonStyles.glass, { marginRight: spacing.sm }]}
            >
              <Ionicons name="bar-chart" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
                My Progress
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/students/exportProgress')}
              style={[commonStyles.buttonPill, commonStyles.glass, { marginLeft: spacing.sm }]}
            >
              <Ionicons name="share-social" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
                Export Progress
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Teacher Access */}
        <Animatable.View animation="fadeInUp" delay={1600}>
          <TouchableOpacity
            onPress={() => router.push('/teachers/mathProgress')}
            style={[commonStyles.buttonPill, commonStyles.glass, { marginTop: spacing.lg, alignSelf: 'center' }]}
          >
            <Ionicons name="school" size={24} color="white" />
            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
              Teacher Progress View
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </LinearGradient>
  );
}
