/**
 * Groups Tab — KulAPP
 * Redesigned with animated tab switcher, rich group cards, and Reanimated animations.
 */
import PageTransition from '@/components/PageTransition';
import { useGroupStore } from '@/stores/groupStore';
import { useAuthStore } from '@/stores/authStore';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronDown, Copy, Hash, Plus, UserPlus, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#2D1B15',
  card: '#3E2723',
  primary: '#A95C33',
  secondary: '#8D6E63',
  accent: '#FF9800',
  gold: '#F9A825',
  success: '#4CAF50',
  danger: '#EF5350',
  textPrimary: '#EFEBE9',
  textSecondary: '#BCAAA4',
  textMuted: '#8A7F75',
  border: '#5D4037',
  inputBg: '#2D1B15',
  warmSurface: '#4E342E',
  deepSurface: '#241310',
};

const stringToColor = (str: string) => {
  const palette = ['#A95C33', '#8D6E63', '#FF9800', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

// ─── Animated Group Card ────────────────────────────────────────────────────
function GroupCard({
  group,
  index,
  isExpanded,
  onToggle,
  onCopyCode,
  onLeave,
  members,
}: {
  group: any;
  index: number;
  group: any;
  index: number;
  onCopyCode: (code: string) => void;
}) {
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(500).springify().damping(14)}
      layout={Layout.springify()}
      style={styles.groupCard}
    >
      <TouchableOpacity
        onPress={() => router.push(`/group/${group.id}` as any)}
        activeOpacity={0.75}
        style={styles.groupCardHeader}
      >
        {/* Avatar */}
        <LinearGradient
          colors={[stringToColor(group.name), C.warmSurface]}
          style={styles.groupAvatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.groupAvatarText}>{group.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>

        {/* Info */}
        <View style={styles.groupInfo}>
          <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
          <View style={styles.groupCodeRow}>
            <View style={styles.codePill}>
              <Hash size={10} color={C.primary} />
              <Text style={styles.groupCode}>{group.invite_code}</Text>
            </View>
            <TouchableOpacity
              onPress={() => onCopyCode(group.invite_code)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.copyBtn}
            >
              <Copy size={12} color={C.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chevronWrap}>
          <ChevronDown size={18} color={C.textMuted} style={{ transform: [{ rotate: '-90deg' }] }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function GroupScreen() {
  const {
    groups,
    fetchUserGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    fetchGroupMembers,
    members,
    isLoading: groupsLoading,
  } = useGroupStore();
  const { profile } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabIndicatorX = useSharedValue(0);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  useEffect(() => {
    tabIndicatorX.value = withSpring(activeTab === 'create' ? 0 : 1, { damping: 15 });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(tabIndicatorX.value, [0, 1], [0, 140]) }],
  }));

  const handleCreateGroup = async () => {
    const groupname = newGroupName.trim() || `${profile?.username || 'Group'}-${Math.floor(Math.random() * 900) + 100}`;
    if (!groupname) {
      Alert.alert('Name Required', 'Enter a name for your new group.');
      return;
    }
    setIsSubmitting(true);
    const { group, error } = await createGroup(newGroupName.trim());
    setIsSubmitting(false);
    if (!error && group) {
      Alert.alert('Group Created! 🏠', `"${group.name}" is ready.\nInvite Code: ${group.invite_code}`);
      setNewGroupName('');
    } else {
      Alert.alert('Error', error?.message || 'Failed to create group.');
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim() || joinCode.trim().length < 6) {
      Alert.alert('Invalid Code', 'Enter a valid 6-character invite code.');
      return;
    }
    setIsSubmitting(true);
    const { error } = await joinGroup(joinCode.trim());
    setIsSubmitting(false);
    if (!error) {
      Alert.alert('Joined! 🎉', 'You have successfully joined the group.');
      setJoinCode('');
    } else {
      Alert.alert('Error', error?.message || 'Invalid invite code.');
    }
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied! 📋', `Invite code "${code}" copied to clipboard.`);
  };



  return (
    <PageTransition>
      <View style={styles.screen}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Header ─────────────────────────────── */}
            <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerTitle}>Groups</Text>
                {groups.length > 0 && (
                  <View style={styles.headerBadge}>
                    <Users size={14} color={C.primary} />
                    <Text style={styles.headerBadgeText}>{groups.length}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.headerSub}>Manage your squads and invite friends</Text>
            </Animated.View>

            {/* ── Action Card with Tab Switcher ───────── */}
            <Animated.View entering={FadeInDown.delay(120).duration(500).springify()} style={styles.actionCard}>
              {/* Tab Switcher */}
              <View style={styles.tabSwitcher}>
                <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
                <TouchableOpacity
                  style={styles.tabBtn}
                  onPress={() => setActiveTab('create')}
                  activeOpacity={0.8}
                >
                  <Plus size={14} color={activeTab === 'create' ? C.textPrimary : C.textMuted} />
                  <Text style={[styles.tabBtnText, activeTab === 'create' && styles.tabBtnActive]}>
                    Create
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tabBtn}
                  onPress={() => setActiveTab('join')}
                  activeOpacity={0.8}
                >
                  <UserPlus size={14} color={activeTab === 'join' ? C.textPrimary : C.textMuted} />
                  <Text style={[styles.tabBtnText, activeTab === 'join' && styles.tabBtnActive]}>
                    Join
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Create Form */}
              {activeTab === 'create' && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.formContent}
                >
                  <Text style={styles.formLabel}>Group Name</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="e.g. Dorm 3rd Floor"
                      placeholderTextColor={C.textMuted}
                      value={newGroupName}
                      onChangeText={setNewGroupName}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
                    onPress={handleCreateGroup}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Plus size={16} color="#FFF" />
                        <Text style={styles.primaryBtnText}>Create Group</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Join Form */}
              {activeTab === 'join' && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.formContent}
                >
                  <Text style={styles.formLabel}>Invite Code</Text>
                  <View style={styles.inputWrapper}>
                    <Hash size={16} color={C.textMuted} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.searchInput, styles.codeInput]}
                      placeholder="ABC123"
                      placeholderTextColor={C.textMuted}
                      value={joinCode}
                      onChangeText={(t) => setJoinCode(t.toUpperCase())}
                      autoCapitalize="characters"
                      maxLength={6}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.primaryBtn, styles.joinPrimaryBtn, isSubmitting && styles.btnDisabled]}
                    onPress={handleJoinGroup}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <UserPlus size={16} color="#FFF" />
                        <Text style={styles.primaryBtnText}>Join Group</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>

            {/* ── Your Groups ─────────────────────────── */}
            <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Groups</Text>
              {groups.length > 0 && (
                <Text style={styles.sectionCount}>{groups.length} group{groups.length > 1 ? 's' : ''}</Text>
              )}
            </Animated.View>

            {groupsLoading ? (
              <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={styles.emptyText}>Loading groups…</Text>
              </Animated.View>
            ) : groups.length > 0 ? (
              groups.map((group, idx) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  index={idx}
                  onCopyCode={handleCopyCode}
                />
              ))
            ) : (
              <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Users size={36} color={C.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Groups Yet</Text>
                <Text style={styles.emptyText}>
                  Create a group or join one with an invite code to compete with friends!
                </Text>
              </Animated.View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </PageTransition>
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
    letterSpacing: -1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.warmSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerBadgeText: {
    fontSize: 13,
    fontFamily: 'Nunito-ExtraBold',
    color: C.primary,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: C.textSecondary,
    marginTop: 4,
  },

  // ── Action Card ─────────────────────────────────────
  actionCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#1A0E0B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 4 },
      web: { boxShadow: '0 6px 12px rgba(26,14,11,0.35)' },
    }),
  },

  // ── Tab Switcher ────────────────────────────────────
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: C.deepSurface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 140,
    bottom: 4,
    backgroundColor: C.primary,
    borderRadius: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    zIndex: 1,
  },
  tabBtnText: {
    fontSize: 14,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textMuted,
  },
  tabBtnActive: {
    color: C.textPrimary,
  },

  // ── Form ────────────────────────────────────────────
  formContent: {
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: C.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: C.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  codeInput: {
    fontFamily: 'Nunito-ExtraBold',
    letterSpacing: 3,
    fontSize: 18,
  },
  primaryBtn: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 8px rgba(169, 92, 51, 0.4)' },
    }),
  },
  joinPrimaryBtn: {
    backgroundColor: '#E65100',
    ...Platform.select({
      ios: { shadowColor: '#E65100' },
      web: { boxShadow: '0 4px 8px rgba(230, 81, 0, 0.4)' },
    }),
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },

  // ── Section Header ──────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: C.textSecondary,
  },

  // ── Group Card ──────────────────────────────────────
  groupCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#1A0E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 8px rgba(26,14,11,0.25)' },
    }),
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarText: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFFFFF',
  },
  groupInfo: {
    flex: 1,
    gap: 6,
  },
  groupName: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
  },
  groupCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.warmSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  groupCode: {
    fontSize: 12,
    fontFamily: 'Nunito-ExtraBold',
    color: C.primary,
    letterSpacing: 1.5,
  },
  copyBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: C.warmSurface,
  },

  // ── Expanded ────────────────────────────────────────
  groupExpanded: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.deepSurface,
    padding: 16,
  },
  membersTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: C.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  membersList: {
    gap: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  memberAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  memberAvatarText: {
    fontSize: 14,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFFFFF',
  },
  memberName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: C.textPrimary,
    flex: 1,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249, 168, 37, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 168, 37, 0.25)',
  },
  ownerBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: C.gold,
  },
  membersSub: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: C.textMuted,
    fontStyle: 'italic',
  },
  expandedDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(239, 83, 80, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.2)',
  },
  leaveBtnText: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: C.danger,
  },

  // ── Empty ────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.warmSurface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: C.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 22,
  },
});
