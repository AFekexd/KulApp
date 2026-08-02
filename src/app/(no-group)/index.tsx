import PageTransition from '@/components/PageTransition';
import { useAuthStore } from '@/stores/authStore';
import { useGroupStore } from '@/stores/groupStore';
import { useRouter } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const DESIGN_COLORS = {
  background: '#2D1B15',
  card: '#3E2723',
  primary: '#A95C33',
  textPrimary: '#EFEBE9',
  textSecondary: '#BCAAA4',
  border: '#5D4037',
};

export default function NoGroupScreen() {
  const router = useRouter();
  const { createGroup, joinGroup } = useGroupStore();
  const { profile } = useAuthStore();

  const [mode, setMode] = useState<'select' | 'join' | 'create'>('select');
  const [inviteCode, setInviteCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    //Group name or User's username with random 3 digit number
    const finalName = groupName.trim() || `${profile?.username || 'Group'}-${Math.floor(Math.random() * 900) + 100}`;
    const { error } = await createGroup(finalName);
    setIsLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter a valid invite code.');
      return;
    }
    setIsLoading(true);
    const { error } = await joinGroup(inviteCode);
    setIsLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <PageTransition>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.content}>
            <Animated.View
              style={styles.header}
              entering={FadeInDown.duration(600).springify().damping(12)}
              layout={Layout.springify()}
            >
              <Text style={styles.title}>Welcome to KulApp</Text>
              <Text style={styles.subtitle}>You need a group to start dropping.</Text>
            </Animated.View>

            {mode === 'select' && (
              <Animated.View
                style={styles.cardStack}
                entering={FadeInDown.delay(200).duration(600).springify().damping(12)}
                layout={Layout.springify()}
              >
                <TouchableOpacity style={styles.optionCard} onPress={() => setMode('join')}>
                  <View style={styles.iconBox}>
                    <Users size={24} color={DESIGN_COLORS.primary} />
                  </View>
                  <View style={styles.optionTextInfo}>
                    <Text style={styles.optionTitle}>Join a Group</Text>
                    <Text style={styles.optionSub}>I have an invite code</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard} onPress={() => setMode('create')}>
                  <View style={styles.iconBox}>
                    <Plus size={24} color={DESIGN_COLORS.primary} />
                  </View>
                  <View style={styles.optionTextInfo}>
                    <Text style={styles.optionTitle}>Create a Group</Text>
                    <Text style={styles.optionSub}>Start a new squad</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}

            {mode === 'join' && (
              <Animated.View
                style={styles.formContainer}

              >
                <Text style={styles.formLabel}>Enter Invite Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. A1B2C3"
                  placeholderTextColor={DESIGN_COLORS.textSecondary}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[styles.primaryBtn, (!inviteCode || isLoading) && styles.btnDisabled]}
                  onPress={handleJoin}
                  disabled={!inviteCode || isLoading}
                >
                  <Text style={styles.primaryBtnText}>{isLoading ? 'Joining...' : 'Join Group'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backBtn} onPress={() => setMode('select')}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {mode === 'create' && (
              <Animated.View
                style={styles.formContainer}


              >
                <Text style={styles.formLabel}>Group Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Dorm 3rd Floor"
                  placeholderTextColor={DESIGN_COLORS.textSecondary}
                  value={groupName}
                  onChangeText={setGroupName}
                />
                <TouchableOpacity
                  style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                  onPress={handleCreate}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryBtnText}>{isLoading ? 'Creating...' : 'Create Group'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backBtn} onPress={() => setMode('select')}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: DESIGN_COLORS.textSecondary,
    fontFamily: 'Inter-Medium',
  },
  cardStack: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(169, 92, 51, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
    marginBottom: 4,
  },
  optionSub: {
    fontSize: 13,
    color: DESIGN_COLORS.textSecondary,
    fontFamily: 'Inter-Medium',
  },
  formContainer: {
    backgroundColor: DESIGN_COLORS.card,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  input: {
    backgroundColor: DESIGN_COLORS.background,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: DESIGN_COLORS.textPrimary,
    fontFamily: 'Inter-Medium',
  },
  primaryBtn: {
    backgroundColor: DESIGN_COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  backBtn: {
    padding: 12,
    alignItems: 'center',
  },
  backBtnText: {
    color: DESIGN_COLORS.textSecondary,
    fontFamily: 'Inter-SemiBold',
  },
});
