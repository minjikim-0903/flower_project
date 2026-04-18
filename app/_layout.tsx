import '../global.css';
import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { gluestackUIConfig } from '@gluestack-ui/config';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  const { setSession, loadProfile, session, isLoading } = useAuthStore();
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadProfile();
    });
  }, []);

  useEffect(() => {
    if (!isLoading && !session && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [session, isLoading, inAuthGroup]);

  return (
    <GluestackUIProvider config={gluestackUIConfig}>
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
    </GluestackUIProvider>
  );
}
