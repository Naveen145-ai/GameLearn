import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { importProgress, LocalProgress } from '../../src/db/gameService';

export default function ScanImport() {
  const [BarCodeScanner, setBarCodeScanner] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod: any = await import('expo-barcode-scanner');
        if (!mounted) return;
        setBarCodeScanner(() => mod.BarCodeScanner);
        const { status } = await mod.BarCodeScanner.requestPermissionsAsync();
        if (!mounted) return;
        setHasPermission(status === 'granted');
      } catch (e) {
        setHasPermission(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onScan = ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const payload = JSON.parse(data);
      if (payload?.type === 'game_progress' && Array.isArray(payload.data)) {
        importProgress(payload.data as LocalProgress[]);
        Alert.alert('Imported', 'Progress imported successfully.');
      } else {
        Alert.alert('Invalid QR', 'QR code does not contain progress data.');
      }
    } catch (e) {
      Alert.alert('Invalid QR', 'Failed to parse QR payload.');
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false || !BarCodeScanner) {
    return (
      <LinearGradient colors={['#111827', '#1f2937']} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Scan Progress QR</Text>
          <Text style={{ color: 'white', opacity: 0.8, textAlign: 'center' }}>
            Camera or scanner module unavailable. You can still import from clipboard on the Teacher Progress page.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#111827', '#1f2937']} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Scan Progress QR</Text>
        <View style={{ borderRadius: 12, overflow: 'hidden', height: 320 }}>
          <BarCodeScanner onBarCodeScanned={scanned ? undefined : (onScan as any)} style={{ width: '100%', height: '100%' }} />
        </View>
        {scanned && (
          <TouchableOpacity onPress={() => setScanned(false)} style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 8, alignSelf: 'flex-start' }}>
            <Text style={{ color: 'white' }}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}


