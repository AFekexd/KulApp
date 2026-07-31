/**
 * Sign In & Sign Up Screen — KulAPP
 * 
 * Native iOS 18 inspired. Minimal, clean, playful, light mode.
 * Strict 8pt spacing, soft rounded corners, flat design.
 * No gradients, no glassmorphism, no neumorphism.
 */
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#F7F7F5',
  card: '#FFFFFF',
  primary: '#7C4D2E',
  secondary: '#C89A5A',
  success: '#4CAF50',
  textPrimary: '#1B1B1B',
  textSecondary: '#6B6B6B',
  border: '#ECECEC',
};

export default function SignInScreen() {
  const router = useRouter();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    continueAsGuest,
  } = useAuthStore();

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
        Alert.alert('Welcome! 💩', 'Account created. You are now signed in.');
        router.replace('/(tabs)');
      }
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ─── Brand Header ─── */}
            <View style={styles.brandGroup}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>💩</Text>
              </View>
              <Text style={styles.appName}>KulAPP</Text>
              <Text style={styles.tagline}>Community poop tracking</Text>
            </View>

            {/* ─── Mode Toggle ─── */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'signin' && styles.toggleActive]}
                onPress={() => setMode('signin')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>
                  Log In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'signup' && styles.toggleActive]}
                onPress={() => setMode('signup')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* ─── Form Card ─── */}
            <View style={styles.formCard}>
              {mode === 'signup' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. PoopMaster69"
                    placeholderTextColor={C.textSecondary}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={C.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={C.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Primary Action */}
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {mode === 'signin' ? 'Log In' : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ─── Divider ─── */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ─── Social & Guest Buttons ─── */}
            <View style={styles.socialGroup}>
              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.socialBtn}
                  activeOpacity={0.8}
                  onPress={async () => {
                    setLoading(true);
                    const { error } = await signInWithGoogle();
                    setLoading(false);
                    if (error) Alert.alert('Google Sign-In', error.message);
                  }}
                >
                  <Text style={styles.socialIcon}>G</Text>
                  <Text style={styles.socialLabel}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialBtn}
                  activeOpacity={0.8}
                  onPress={async () => {
                    const { error } = await signInWithApple();
                    if (error) Alert.alert('Apple Sign-In', error.message);
                  }}
                >
                  <Text style={styles.socialIcon}></Text>
                  <Text style={styles.socialLabel}>Apple</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.guestBtn}
                activeOpacity={0.8}
                onPress={handleGuest}
              >
                <Text style={styles.guestBtnText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>

            {/* ─── Footer ─── */}
            <Text style={styles.footer}>
              By continuing you agree to our Terms of Service & Privacy Policy.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    justifyContent: 'center',
    minHeight: '100%',
  },

  /* ── Brand Header ── */
  brandGroup: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 4,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    }),
  },
  logoEmoji: {
    fontSize: 42,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: C.textSecondary,
  },

  /* ── Mode Toggle ── */
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleActive: {
    backgroundColor: C.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* ── Form Card ── */
  formCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    gap: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    }),
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textPrimary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.textPrimary,
  },
  primaryBtn: {
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 8px rgba(124, 77, 46, 0.25)' },
    }),
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* ── Divider ── */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
  },

  /* ── Social & Guest ── */
  socialGroup: {
    gap: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
    }),
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textPrimary,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },
  guestBtn: {
    backgroundColor: '#F7F2EE',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  guestBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
  },

  /* ── Footer ── */
  footer: {
    fontSize: 11,
    fontWeight: '500',
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
});
