/**
 * Auth Layout — KulAPP
 * Light mode, #F7F7F5 background.
 */
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F7F7F5' },
      }}
    />
  );
}
