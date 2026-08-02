/**
 * Root Layout
 * Wraps the app with necessary providers, loads Google Fonts, and handles initial app load.
 */
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Colors } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { useGroupStore } from '@/stores/groupStore';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Complete any pending auth sessions on web/app return
WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { initialize, isInitialized, isAuthenticated } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);
  const { groups, fetchUserGroups } = useGroupStore();
  const [groupChecked, setGroupChecked] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Nunito-Bold': Nunito_700Bold,
    'Nunito-ExtraBold': Nunito_800ExtraBold,
    'Nunito-Black': Nunito_900Black,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

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
    if (isAuthenticated) {
      fetchUserGroups().then(() => setGroupChecked(true));
    } else {
      setGroupChecked(true);
    }
  }, [isAuthenticated, fetchUserGroups]);

  useEffect(() => {
    if (appIsReady && isInitialized && fontsLoaded && groupChecked) {
      SplashScreen.hideAsync();

      const inAuthGroup = segments[0] === '(auth)';
      const inNoGroup = segments[0] === '(no-group)';

      if (!isAuthenticated && !inAuthGroup) {
        setTimeout(() => router.replace('/(auth)/sign-in'), 0);
      } else if (isAuthenticated) {
        if (groups.length === 0 && !inNoGroup) {
          setTimeout(() => router.replace('/(no-group)'), 0);
        } else if (groups.length > 0 && (inAuthGroup || inNoGroup)) {
          setTimeout(() => router.replace('/(tabs)'), 0);
        }
      }
    }
  }, [appIsReady, isInitialized, isAuthenticated, fontsLoaded, groupChecked, groups.length, segments, router]);


  if (!appIsReady || !isInitialized || !fontsLoaded || !groupChecked) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#18181b' }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <View style={styles.webMobileConstraint}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.light.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(no-group)" options={{ headerShown: false, animation: 'fade' }} />
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
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  webMobileConstraint: {
    flex: 1,
    ...Platform.select({
      web: {
        width: 390,
        height: 844,
        alignSelf: 'center',
        marginVertical: 40,
        borderRadius: 40,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }
    })
  }
});
