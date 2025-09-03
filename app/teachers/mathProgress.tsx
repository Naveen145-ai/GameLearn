import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { initDatabase, getLocalProgressBySubject, exportProgressForStudent, importProgress, LocalProgress } from '../../src/db/gameService';

export default function MathProgress() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<LocalProgress[]>([]);
  const [grade, setGrade] = useState<number | null>(null);

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

  useEffect(() => {
    initDatabase();
    reload();
  }, []);

  const reload = () => {
    const all = getLocalProgressBySubject('Math');
    setItems(grade ? all.filter(r => r.grade === grade) : all);
  };

  const exportStudent = async (studentId: string) => {
    const data = exportProgressForStudent(studentId);
    const payload = JSON.stringify({ type: 'game_progress', version: 1, data });
    await Clipboard.setStringAsync(payload);
    Alert.alert('Copied', 'Student progress copied to clipboard. Share via QR/Bluetooth.');
  };

  const importFromClipboard = async () => {
    const str = await Clipboard.getStringAsync();
    try {
      const parsed = JSON.parse(str);
      if (parsed?.type === 'game_progress' && Array.isArray(parsed.data)) {
        importProgress(parsed.data as LocalProgress[]);
        reload();
        Alert.alert('Imported', 'Progress data imported.');
      } else {
        Alert.alert('Invalid data', 'Clipboard does not contain progress payload.');
      }
    } catch {
      Alert.alert('Invalid JSON', 'Clipboard content is not valid JSON.');
    }
  };

  return (
    <LinearGradient colors={['#111827', '#1f2937']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>Teacher - Math Progress</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              Welcome, {user?.name || 'Teacher'} • {user?.subject || 'Mathematics'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 }}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => { setGrade(null); reload(); }} style={{ backgroundColor: grade === null ? '#10b981' : 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8, marginRight: 8 }}>
            <Text style={{ color: 'white' }}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setGrade(9); reload(); }} style={{ backgroundColor: grade === 9 ? '#10b981' : 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8, marginRight: 8 }}>
            <Text style={{ color: 'white' }}>Grade 9</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setGrade(10); reload(); }} style={{ backgroundColor: grade === 10 ? '#10b981' : 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 }}>
            <Text style={{ color: 'white' }}>Grade 10</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: 'white', marginBottom: 8 }}>Offline Sync</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={importFromClipboard} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 8, marginRight: 8 }}>
              <Text style={{ color: 'white' }}>Import from Clipboard</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Tip', 'Open a student record and use Export to copy payload. You can convert this text to a QR code or send via Bluetooth.')} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 8 }}>
              <Text style={{ color: 'white' }}>How to share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {items.map((r, i) => (
          <View key={r.id || i} style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold', color: '#111827' }}>{r.student_id} • {r.game_id}</Text>
            <Text style={{ color: '#374151', marginTop: 2 }}>Score: {r.score} • Time: {r.time_spent}s • Level: {r.level}</Text>
            <Text style={{ color: '#6b7280', marginTop: 2 }}>Grade: {r.grade} • {new Date(r.date).toLocaleString()}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity onPress={() => exportStudent(r.student_id)} style={{ backgroundColor: '#10b981', padding: 8, borderRadius: 8, marginRight: 8 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Export Student</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}


