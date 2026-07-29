/**
 * Root Layout
 * Wraps the app with necessary providers and handles initial app load.
 */
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Colors } from '@/theme';
import { useAuth } from '@/hooks/useAuth';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { initialize, isInitialized, isAuthenticated } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        await initialize();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, [initialize]);

  useEffect(() => {
    if (appIsReady && isInitialized) {
      // Hide splash screen once we know auth state
      SplashScreen.hideAsync();

      const inAuthGroup = segments[0] === '(auth)';

      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to the sign-in page.
        router.replace('/(auth)/sign-in');
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect away from the sign-in page.
        router.replace('/(tabs)');
      }
    }
  }, [appIsReady, isInitialized, isAuthenticated, segments, router]);

  if (!appIsReady || !isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F7F7F5' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="(modals)" 
            options={{ 
              headerShown: false, 
              presentation: 'transparentModal',
              animation: 'fade',
              contentStyle: { backgroundColor: 'transparent' },
            }} 
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
