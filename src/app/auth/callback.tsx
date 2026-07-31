import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

// This is a dummy route to catch the OAuth redirect
// so Expo Router doesn't throw an "Unmatched Route" error.
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // The WebBrowser.openAuthSessionAsync in authStore will handle the actual
    // URL parsing and session setting. We just need to make sure we don't stay here.
    // If we get stuck here for some reason, we redirect to home.
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#18181b' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}
