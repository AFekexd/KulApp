/**
 * Profile Screen — PoopTracker
 * Native iOS 18 style. Light mode. Stats summary, profile editing, preferences, account.
 * Social / Friends & Groups are on their own dedicated tab.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDropStore } from '@/stores/dropStore';
import { useAuthStore } from '@/stores/authStore';
import { Pencil, Flame, Ghost, Package, LogOut, ChevronRight } from 'lucide-react-native';

const C = {
  bg: '#F7F7F5',
  card: '#FFFFFF',
  primary: '#7C4D2E',
  secondary: '#C89A5A',
  accent: '#A95C33',
  success: '#4CAF50',
  danger: '#D32F2F',
  textPrimary: '#1B1B1B',
  textSecondary: '#6B6B6B',
  textMuted: '#9E9E9E',
  border: '#ECECEC',
  warmSurface: '#F7F2EE',
};

export default function ProfileScreen() {
  const { drops, currentStreak } = useDropStore();
  const { profile, updateProfile, signOut } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.display_name || profile?.username || 'User');
  const [editUsername, setEditUsername] = useState(profile?.username || 'user');

  // Preference switches
  const [privacy, setPrivacy] = useState(false);
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

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ─── Header ─── */}
          <Text style={styles.headerTitle}>Profile</Text>

          {/* ─── User Card ─── */}
          <View style={styles.userCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>{userInitials}</Text>
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
                <Text style={styles.settingLabel}>Private by Default</Text>
                <Text style={styles.settingSub}>Keep new drops visible to friends only</Text>
              </View>
              <Switch
                value={privacy}
                onValueChange={setPrivacy}
                trackColor={{ true: C.primary, false: C.border }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingSub}>Alerts for leaderboard jumps and reactions</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: C.primary, false: C.border }}
                thumbColor="#FFFFFF"
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
                trackColor={{ true: C.primary, false: C.border }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.settingLabel}>Stealth Mode</Text>
                  <Ghost size={14} color={C.textPrimary} />
                </View>
                <Text style={styles.settingSub}>Hide your online indicator from feed</Text>
              </View>
              <Switch
                value={stealthMode}
                onValueChange={setStealthMode}
                trackColor={{ true: C.primary, false: C.border }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* ─── Account Actions ─── */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Export Complete 📦', 'Your data has been exported as JSON.')}
            >
              <Package size={18} color={C.textPrimary} />
              <Text style={styles.actionText}>Export Personal History</Text>
              <ChevronRight size={16} color={C.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, styles.actionRowDanger]}
              activeOpacity={0.7}
              onPress={() => signOut()}
            >
              <LogOut size={18} color={C.danger} />
              <Text style={styles.actionTextDanger}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },

  /* ── Header ── */
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    }),
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.warmSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.primary,
  },
  userMeta: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
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
    fontWeight: '800',
    color: C.primary,
  },
  userHandle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },

  /* ── Edit Form ── */
  editForm: {
    gap: 6,
  },
  editLabel: {
    fontSize: 11,
    fontWeight: '700',
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
    fontWeight: '800',
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
    fontWeight: '600',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
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
    fontSize: 20,
    fontWeight: '800',
    color: C.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
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
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },
  settingSub: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textSecondary,
  },

  /* ── Account Actions ── */
  actionsGroup: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },
  actionRowDanger: {
    borderColor: '#FFEBEE',
    backgroundColor: '#FFFAFA',
  },
  actionTextDanger: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: C.danger,
  },
});
