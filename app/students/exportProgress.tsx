import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../src/contexts/AuthContext';
import { exportProgressForStudent } from '../../src/db/gameService';

export default function ExportProgress() {
  const { user } = useAuth();
  const [payload, setPayload] = useState('');
  const studentId = user?.id || 'unknown';

  useEffect(() => {
    const rows = exportProgressForStudent(studentId);
    setPayload(JSON.stringify({ type: 'game_progress', version: 1, data: rows }));
  }, []);

  const copy = async () => {
    await Clipboard.setStringAsync(payload);
    Alert.alert('Copied', 'Payload copied to clipboard');
  };

  const share = async () => {
    try {
      const path = FileSystem.cacheDirectory + 'progress.json';
      await FileSystem.writeAsStringAsync(path, payload, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'application/json' });
      } else {
        Alert.alert('Sharing not available');
      }
    } catch (e) {
      Alert.alert('Share failed', String(e));
    }
  };

  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Export My Progress</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            {user?.name} • Grade {user?.grade} • Math Games
          </Text>
        </View>
        {payload ? (
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <QRCode value={payload} size={220} />
          </View>
        ) : null}
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={copy} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 8, marginRight: 8 }}>
            <Text style={{ color: 'white' }}>Copy to Clipboard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={share} style={{ backgroundColor: '#10b981', padding: 10, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Share File</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}


