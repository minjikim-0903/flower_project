import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  const { setSession, loadProfile } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadProfile();
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="users" />
          <Stack.Screen name="seller" />
          <Stack.Screen name="admin" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
