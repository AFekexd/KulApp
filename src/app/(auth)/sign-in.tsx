/**
 * Sign In & Sign Up Screen — PoopTracker
 * Native iOS 18 inspired - Minimal, clean, light mode.
 */
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, typography, spacing, borderRadius } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, continueAsGuest } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password);
      setLoading(false);
      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      if (!username.trim()) {
        Alert.alert('Required Field', 'Please enter a username.');
        setLoading(false);
        return;
      }
      const { error } = await signUpWithEmail(email, password, username);
      setLoading(false);
      if (error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        Alert.alert('Success!', 'Account created! You can now log in.');
        setMode('signin');
      }
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.iconEmoji}>💩</Text>
              <Text style={styles.title}>PoopTracker</Text>
              <Text style={styles.tagline}>Community poop tracking</Text>
            </View>

            {/* Mode Switcher */}
            <View style={styles.tabContainer}>
              <Pressable 
                style={[styles.tab, mode === 'signin' && styles.activeTab]}
                onPress={() => setMode('signin')}
              >
                <Text style={[styles.tabText, mode === 'signin' && styles.activeTabText]}>
                  Log In
                </Text>
              </Pressable>

              <Pressable 
                style={[styles.tab, mode === 'signup' && styles.activeTab]}
                onPress={() => setMode('signup')}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. PoopMaster69"
                    placeholderTextColor={Colors.light.textMuted}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor={Colors.light.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.light.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Primary Submit Button */}
              <Button
                title={mode === 'signin' ? 'Log In' : 'Create Account'}
                onPress={handleSubmit}
                loading={loading}
                style={{ marginTop: spacing.md }}
              />
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

              {/* Social OAuth & Guest Buttons */}
            <View style={styles.socialContainer}>
              <View style={styles.socialRow}>
                <Button
                  title="Google"
                  variant="secondary"
                  style={{ flex: 1 }}
                  onPress={async () => {
                    setLoading(true);
                    const { error } = await signInWithGoogle();
                    setLoading(false);
                    if (error) Alert.alert('Google Sign-In Failed', error.message);
                  }}
                  loading={loading}
                />
                <Button
                  title="Apple"
                  variant="secondary"
                  style={{ flex: 1 }}
                  onPress={async () => {
                    const { error } = await signInWithApple();
                    if (error) Alert.alert('Notice', error.message);
                  }}
                />
              </View>

              <Button
                title="Continue as Guest"
                variant="ghost"
                onPress={handleGuest}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading1,
    color: Colors.accent.primary,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.body,
    color: Colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.borderLight,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  activeTab: {
    backgroundColor: Colors.light.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  tabText: {
    ...typography.bodySmall,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.light.text,
    fontWeight: '700',
  },
  formContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    ...typography.label,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    color: Colors.light.text,
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    ...typography.caption,
    color: Colors.light.textMuted,
  },
  socialContainer: {
    gap: spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
