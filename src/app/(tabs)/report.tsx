/**
 * Tab fallback route for Report (+ button)
 * Redirects directly to Quick Drop modal.
 */
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function ReportTab() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(modals)/quick-drop');
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F5', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#7C4D2E" size="large" />
    </View>
  );
}
