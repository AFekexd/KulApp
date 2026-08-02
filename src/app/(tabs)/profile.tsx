/**
 * Profile Screen — KulAPP
 * Native iOS 18 style. Dark mode theme. Stats summary, profile editing, preferences, account.
 * Social / Friends & Groups are on their own dedicated tab.
 */
import PageTransition from '@/components/PageTransition';
import { useAuthStore } from '@/stores/authStore';
import { useDropStore } from '@/stores/dropStore';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronRight, Flame, Ghost, LogOut, Package, Pencil } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#2D1B15',
  card: '#3E2723',
  primary: '#A95C33',
  secondary: '#8D6E63',
  accent: '#FF9800',
  success: '#33691E',
  danger: '#D32F2F',
  dangerDim: 'rgba(211, 47, 47, 0.15)',
  textPrimary: '#EFEBE9',
  textSecondary: '#BCAAA4',
  textMuted: '#8A7F75',
  border: '#5D4037',
  warmSurface: '#4E342E',
};

export default function ProfileScreen() {
  const { drops, currentStreak } = useDropStore();
  const { profile, updateProfile, signOut } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editName, setEditName] = useState(profile?.display_name || profile?.username || 'User');
  const [editUsername, setEditUsername] = useState(profile?.username || 'user');

  // Update edit form when profile changes (e.g. account switch)
  useEffect(() => {
    if (!isEditing && profile) {
      setEditName(profile.display_name || profile.username || 'User');
      setEditUsername(profile.username || 'user');
    }
  }, [profile, isEditing]);

  // Fetch drops when profile screen is opened to ensure Total Drops is accurate
  useEffect(() => {
    if (profile?.id && profile.id !== 'guest-user') {
      useDropStore.getState().fetchUserDrops(profile.id);
    }
  }, [profile?.id]);

  // Preference switches
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [stealthMode, setStealthMode] = useState(false);

  const totalDrops = drops.length;
  const userInitials = (editName || 'User').slice(0, 2).toUpperCase();

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Display name cannot be empty.');
      return;
    }

    await updateProfile({
      display_name: editName.trim(),
      username: editUsername.trim().toLowerCase(),
    });

    setIsEditing(false);
    Alert.alert('Profile Saved! 💾', 'Your profile details have been updated.');
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        const { error } = await useAuthStore.getState().uploadAvatar(result.assets[0].uri);
        if (error) {
          Alert.alert('Upload Failed', error.message);
        } else {
          Alert.alert('Success', 'Profile picture updated successfully!');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageTransition>
      <View style={styles.screen}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* ─── Header ─── */}
            <Text style={styles.headerTitle}>Profile</Text>

            {/* ─── User Card ─── */}
            <View style={styles.userCard}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={handlePickAvatar} disabled={isUploading} activeOpacity={0.8}>
                  {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} contentFit="cover" />
                  ) : (
                    <View style={styles.avatarLarge}>
                      <Text style={styles.avatarText}>{userInitials}</Text>
                    </View>
                  )}
                  <View style={styles.editAvatarBadge}>
                    <Camera size={14} color="#FFF" />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.userMeta}>
                {!isEditing ? (
                  <>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>
                        {profile?.display_name || profile?.username || 'User'}
                      </Text>
                      <View style={styles.levelPill}>
                        <Text style={styles.levelPillText}>
                          Lvl {profile?.current_level || 1}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.userHandle}>@{profile?.username || 'user'}</Text>
                    <TouchableOpacity
                      onPress={() => setIsEditing(true)}
                      style={styles.editBtn}
                      activeOpacity={0.7}
                    >
                      <Pencil size={13} color={C.primary} />
                      <Text style={styles.editBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.editForm}>
                    <Text style={styles.editLabel}>Display Name</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Enter Display Name"
                      placeholderTextColor={C.textMuted}
                    />

                    <Text style={styles.editLabel}>Username</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editUsername}
                      onChangeText={setEditUsername}
                      autoCapitalize="none"
                      placeholder="Enter Username"
                      placeholderTextColor={C.textMuted}
                    />

                    <View style={styles.editBtnRow}>
                      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                        <Text style={styles.saveBtnText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* ─── Stats Row ─── */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalDrops}</Text>
                <Text style={styles.statLabel}>Total Drops</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>{currentStreak}</Text>
                  <Flame size={16} color={C.accent} />
                </View>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {totalDrops > 0 ? '100%' : '0%'}
                </Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>

            {/* ─── Preferences ─── */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Preferences</Text>


              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingSub}>Alerts for leaderboard jumps and reactions</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: C.warmSurface, true: C.primary }}
                  thumbColor="#FFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Haptic Feedback</Text>
                  <Text style={styles.settingSub}>Vibrate on drop logging and upvotes</Text>
                </View>
                <Switch
                  value={haptics}
                  onValueChange={setHaptics}
                  trackColor={{ false: C.warmSurface, true: C.primary }}
                  thumbColor="#FFF"
                />
              </View>

              <View style={[styles.settingRow, styles.settingRowLast]}>
                <View style={styles.settingInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.settingLabel}>Stealth Mode</Text>
                    <Ghost size={14} color={C.textSecondary} />
                  </View>
                  <Text style={styles.settingSub}>Hide your online indicator from feed</Text>
                </View>
                <Switch
                  value={stealthMode}
                  onValueChange={setStealthMode}
                  trackColor={{ false: C.warmSurface, true: C.primary }}
                  thumbColor="#FFF"
                />
              </View>
            </View>

            {/* ─── Actions ─── */}
            <View style={styles.actionsGroup}>
              <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
                <Package size={20} color={C.textPrimary} />
                <Text style={styles.actionText}>Export Personal History</Text>
                <ChevronRight size={18} color={C.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionRow, styles.actionRowDanger]}
                activeOpacity={0.7}
                onPress={signOut}
              >
                <LogOut size={20} color={C.danger} />
                <Text style={styles.actionTextDanger}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
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
    gap: 20,
  },

  /* ── Header ── */
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
    letterSpacing: -1,
  },

  /* ── User Card ── */
  userCard: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#1A0E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 10px rgba(26,14,11,0.3)' },
    }),
  },
  avatarLarge: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: C.warmSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: C.border,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: C.primary,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.card,
  },
  avatarText: {
    fontSize: 22,
    fontFamily: 'Nunito-ExtraBold',
    color: C.primary,
  },
  userMeta: {
    flex: 1,
    gap: 3,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
  },
  levelPill: {
    backgroundColor: C.warmSurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelPillText: {
    fontSize: 11,
    fontFamily: 'Nunito-ExtraBold',
    color: C.primary,
  },
  userHandle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: C.textSecondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  editBtnText: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: C.primary,
  },

  /* ── Edit Form ── */
  editForm: {
    gap: 6,
  },
  editLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: C.textSecondary,
  },
  editInput: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: C.textPrimary,
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  saveBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: C.bg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: C.textSecondary,
  },

  /* ── Stats Row ── */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#1A0E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 10px rgba(26,14,11,0.3)' },
    }),
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: C.textSecondary,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: C.border,
    alignSelf: 'center',
  },

  /* ── Section Card ── */
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#1A0E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 10px rgba(26,14,11,0.3)' },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
    marginBottom: 12,
  },

  /* ── Setting Row ── */
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
    gap: 2,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: C.textPrimary,
  },
  settingSub: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: C.textSecondary,
  },

  /* ── Account Actions ── */
  actionsGroup: {
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: C.textPrimary,
  },
  actionRowDanger: {
    borderColor: 'rgba(211, 47, 47, 0.3)',
    backgroundColor: C.dangerDim,
  },
  actionTextDanger: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: C.danger,
  },
});
