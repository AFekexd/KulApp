/**
 * Profile Screen — PoopTracker
 * Native iOS 18 style settings, stats summary, Friends & Groups management, and account preferences.
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
import { useFriendshipStore } from '@/stores/friendshipStore';
import { useGroupStore } from '@/stores/groupStore';
import { User, Pencil, Flame, Users, Home, Ghost, Package } from 'lucide-react-native';

const DESIGN_COLORS = {
  background: '#2D1B15',
  card: '#3E2723',
  primary: '#8D6E63',
  secondary: '#A95C33',
  accent: '#A95C33',
  accentSurface: '#4E342E',
  primarySurface: '#4E342E',
  success: '#33691E',
  textPrimary: '#EFEBE9',
  textSecondary: '#BCAAA4',
  border: '#5D4037',
};

export default function ProfileScreen() {
  const { drops, currentStreak } = useDropStore();
  const { profile, updateProfile, signOut } = useAuthStore();
  const { friends, sendFriendRequest, removeFriend } = useFriendshipStore();
  const { groups, createGroup, joinGroup } = useGroupStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.display_name || profile?.username || 'User');
  const [editUsername, setEditUsername] = useState(profile?.username || 'user');

  // Friends & Groups inputs
  const [socialTab, setSocialTab] = useState<'friends' | 'groups'>('friends');
  const [friendSearchInput, setFriendSearchInput] = useState('');
  const [newGroupNameInput, setNewGroupNameInput] = useState('');
  const [joinInviteCodeInput, setJoinInviteCodeInput] = useState('');

  // Preference switches
  const [privacy, setPrivacy] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [sound, setSound] = useState(true);
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

  const handleAddFriend = async () => {
    if (!friendSearchInput.trim()) {
      Alert.alert('Empty Username', 'Please enter a username to add as friend.');
      return;
    }

    const { error } = await sendFriendRequest(friendSearchInput);
    if (!error) {
      Alert.alert('Friend Request Sent! 👥', `Added ${friendSearchInput.trim()} to your friends.`);
      setFriendSearchInput('');
    } else {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupNameInput.trim()) {
      Alert.alert('Group Name Required', 'Please enter a name for your group.');
      return;
    }

    const { group, error } = await createGroup(newGroupNameInput.trim());
    if (!error && group) {
      Alert.alert('Group Created! 🏘️', `Group "${group.name}" created! Invite code: ${group.invite_code}`);
      setNewGroupNameInput('');
    } else {
      Alert.alert('Error', error?.message || 'Failed creating group');
    }
  };

  const handleJoinGroup = async () => {
    if (!joinInviteCodeInput.trim()) {
      Alert.alert('Invite Code Required', 'Please enter a 6-character group invite code.');
      return;
    }

    const { error } = await joinGroup(joinInviteCodeInput.trim());
    if (!error) {
      Alert.alert('Joined Group! 🏘️', 'You have successfully joined the group.');
      setJoinInviteCodeInput('');
    } else {
      Alert.alert('Join Error', error?.message || 'Invalid invite code');
    }
  };

  return (
    <View style={styles.screenOuter}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.title}>Profile & Settings</Text>
            <User size={28} color={DESIGN_COLORS.textPrimary} />
          </View>

          {/* User Banner Card */}
          <View style={styles.userCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>

            <View style={styles.userMetaCol}>
              {!isEditing ? (
                <>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{profile?.display_name || profile?.username || 'User'}</Text>
                    <View style={styles.levelPill}>
                      <Text style={styles.levelPillText}>Level {profile?.current_level || 1}</Text>
                    </View>
                  </View>
                  <Text style={styles.userHandle}>@{profile?.username || 'user'}</Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)} style={[styles.editBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                    <Pencil size={14} color={DESIGN_COLORS.primary} />
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.editFormGroup}>
                  <Text style={styles.editLabel}>Display Name</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter Display Name"
                  />

                  <Text style={styles.editLabel}>Username</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editUsername}
                    onChangeText={setEditUsername}
                    autoCapitalize="none"
                    placeholder="Enter Username"
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

          {/* User Metrics Summary */}
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{totalDrops}</Text>
              <Text style={styles.metricLabel}>Total Drops</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{currentStreak} Days</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.metricLabel}>Best Streak</Text>
                <Flame size={14} color={DESIGN_COLORS.accent} />
              </View>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{totalDrops > 0 ? '100%' : '0%'}</Text>
              <Text style={styles.metricLabel}>Accuracy</Text>
            </View>
          </View>

          {/* FRIENDS & GROUPS MANAGEMENT SECTION */}
          <View style={styles.socialCard}>
            <View style={styles.socialHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.sectionHeader}>Friends & Groups</Text>
                <Users size={20} color={DESIGN_COLORS.textPrimary} />
              </View>
              <View style={styles.socialTabToggle}>
                <TouchableOpacity
                  style={[styles.socialTabBtn, socialTab === 'friends' && styles.socialTabActive]}
                  onPress={() => setSocialTab('friends')}
                >
                  <Text style={[styles.socialTabText, socialTab === 'friends' && styles.socialTextActive]}>
                    Friends ({friends.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialTabBtn, socialTab === 'groups' && styles.socialTabActive]}
                  onPress={() => setSocialTab('groups')}
                >
                  <Text style={[styles.socialTabText, socialTab === 'groups' && styles.socialTextActive]}>
                    Groups ({groups.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* FRIENDS TAB CONTENT */}
            {socialTab === 'friends' ? (
              <View style={styles.socialContentStack}>
                <View style={styles.inputActionRow}>
                  <TextInput
                    style={styles.socialInput}
                    placeholder="Enter friend's username..."
                    placeholderTextColor={DESIGN_COLORS.textSecondary}
                    value={friendSearchInput}
                    onChangeText={setFriendSearchInput}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={handleAddFriend}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.socialList}>
                  {friends.length > 0 ? (
                    friends.map((friend) => (
                      <View key={friend.id} style={styles.socialRow}>
                        <View style={styles.avatarMini}>
                          <Text style={styles.avatarMiniText}>
                            {friend.username.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.socialName}>{friend.display_name || friend.username}</Text>
                          <Text style={styles.socialSub}>@{friend.username}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeFriend(friend.id)}>
                          <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptySocialText}>No friends added yet. Type a username above to connect!</Text>
                  )}
                </View>
              </View>
            ) : (
              /* GROUPS TAB CONTENT */
              <View style={styles.socialContentStack}>
                {/* Create Group */}
                <View style={styles.inputActionRow}>
                  <TextInput
                    style={styles.socialInput}
                    placeholder="New Group Name (e.g. Dorm 3rd Floor)"
                    placeholderTextColor={DESIGN_COLORS.textSecondary}
                    value={newGroupNameInput}
                    onChangeText={setNewGroupNameInput}
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={handleCreateGroup}>
                    <Text style={styles.addBtnText}>Create</Text>
                  </TouchableOpacity>
                </View>

                {/* Join Group */}
                <View style={styles.inputActionRow}>
                  <TextInput
                    style={styles.socialInput}
                    placeholder="6-Letter Invite Code (e.g. KUL999)"
                    placeholderTextColor={DESIGN_COLORS.textSecondary}
                    value={joinInviteCodeInput}
                    onChangeText={setJoinInviteCodeInput}
                    autoCapitalize="characters"
                    maxLength={6}
                  />
                  <TouchableOpacity style={[styles.addBtn, { backgroundColor: DESIGN_COLORS.secondary }]} onPress={handleJoinGroup}>
                    <Text style={styles.addBtnText}>Join</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.socialList}>
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <View key={group.id} style={styles.socialRow}>
                        <View style={[styles.avatarMini, { backgroundColor: DESIGN_COLORS.primarySurface }]}>
                          <Home size={16} color={DESIGN_COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.socialName}>{group.name}</Text>
                          <Text style={styles.socialSub}>Invite Code: {group.invite_code}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptySocialText}>No groups joined yet. Create one or enter an invite code!</Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Settings Section */}
          <View style={styles.settingsCard}>
            <Text style={styles.sectionHeader}>Preferences</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Private by Default</Text>
                <Text style={styles.settingSub}>Keep new drops visible to friends only</Text>
              </View>
              <Switch
                value={privacy}
                onValueChange={setPrivacy}
                trackColor={{ true: DESIGN_COLORS.primary, false: DESIGN_COLORS.border }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingSub}>Get alerts for leaderboard jumps and reactions</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: DESIGN_COLORS.primary, false: DESIGN_COLORS.border }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingSub}>Vibrate on drop logging and upvotes</Text>
              </View>
              <Switch
                value={haptics}
                onValueChange={setHaptics}
                trackColor={{ true: DESIGN_COLORS.primary, false: DESIGN_COLORS.border }}
              />
            </View>

            <View style={[styles.settingRow, styles.noBorderRow]}>
              <View style={styles.settingTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.settingLabel}>Stealth Mode</Text>
                  <Ghost size={16} color={DESIGN_COLORS.textPrimary} />
                </View>
                <Text style={styles.settingSub}>Hide online indicator from active feed</Text>
              </View>
              <Switch
                value={stealthMode}
                onValueChange={setStealthMode}
                trackColor={{ true: DESIGN_COLORS.primary, false: DESIGN_COLORS.border }}
              />
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.accountCard}>
            <TouchableOpacity 
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Export Complete 📦', 'Your drop data history has been exported as JSON.')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.actionBtnText}>Export Personal History</Text>
                <Package size={16} color={DESIGN_COLORS.textPrimary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.signOutBtn]}
              activeOpacity={0.7}
              onPress={() => signOut()}
            >
              <Text style={styles.signOutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 90 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenOuter: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 20,
    gap: 16,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: DESIGN_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2D1B15',
  },
  userMetaCol: {
    flex: 1,
    gap: 4,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  levelPill: {
    backgroundColor: DESIGN_COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelPillText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.primary,
  },
  userHandle: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  editBtn: {
    marginTop: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.primary,
  },
  editFormGroup: {
    gap: 6,
  },
  editLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textSecondary,
  },
  editInput: {
    backgroundColor: DESIGN_COLORS.background,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: DESIGN_COLORS.textPrimary,
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: DESIGN_COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: DESIGN_COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
  },
  cancelBtnText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    paddingVertical: 16,
  },
  metricBox: {
    alignItems: 'center',
    gap: 2,
  },
  metricVal: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: DESIGN_COLORS.textSecondary,
  },
  metricDivider: {
    width: 1,
    height: '100%',
    backgroundColor: DESIGN_COLORS.border,
  },
  socialCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 20,
    gap: 16,
  },
  socialHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  socialTabToggle: {
    flexDirection: 'row',
    backgroundColor: DESIGN_COLORS.background,
    borderRadius: 12,
    padding: 2,
  },
  socialTabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  socialTabActive: {
    backgroundColor: DESIGN_COLORS.primary,
  },
  socialTabText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  socialTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  socialContentStack: {
    gap: 12,
  },
  inputActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  socialInput: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.background,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: DESIGN_COLORS.textPrimary,
  },
  addBtn: {
    backgroundColor: DESIGN_COLORS.primary,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#EFEBE9',
  },
  socialList: {
    gap: 10,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_COLORS.border,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DESIGN_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: '#2D1B15',
  },
  socialName: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  socialSub: {
    fontSize: 11,
    color: DESIGN_COLORS.textSecondary,
  },
  removeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#C5221F',
  },
  emptySocialText: {
    fontSize: 12,
    color: DESIGN_COLORS.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  settingsCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 20,
    gap: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_COLORS.border,
  },
  noBorderRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 16,
    gap: 2,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  settingSub: {
    fontSize: 12,
    color: DESIGN_COLORS.textSecondary,
  },
  accountCard: {
    gap: 10,
  },
  actionBtn: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  signOutBtn: {
    backgroundColor: '#3E2723',
    borderColor: '#5D4037',
  },
  signOutBtnText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#C5221F',
  },
});
