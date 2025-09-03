import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { useAuth } from '../src/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated
      router.replace('/auth');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if already authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return <>{children}</>;
}

export default function Layout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="games/fruitCatch" options={{ title: 'Fruit Catch Game' }} />
          <Stack.Screen name="teachers/mathProgress" options={{ title: 'Teacher Progress' }} />
          <Stack.Screen name="teachers/scanImport" options={{ title: 'Scan QR Code' }} />
          <Stack.Screen name="students/exportProgress" options={{ title: 'Export Progress' }} />
        <Stack.Screen name="students/myProgress" options={{ title: 'My Progress' }} />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}
