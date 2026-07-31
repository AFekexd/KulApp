/**
 * Social Screen — KulAPP
 * 
 * Dedicated Friends & Groups management page.
 * Native iOS 18 inspired, light mode design system.
 * #F7F7F5 background, #7C4D2E accents, 8pt grid, soft rounded cards.
 */
import PageTransition from '@/components/PageTransition';
import { useFriendshipStore } from '@/stores/friendshipStore';
import { useGroupStore } from '@/stores/groupStore';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight, Copy, Crown, Hash, Home, LogOut, Search, UserCheck, UserPlus, Users } from 'lucide-react-native';
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  inputBg: '#F7F7F5',
  warmSurface: '#F7F2EE',
};

type Tab = 'friends' | 'groups';

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777215)).toString(16);
  return '#' + '000000'.substring(0, 6 - color.length) + color;
};

export default function SocialScreen() {
  const router = useRouter();
  const { friends, pendingRequests, fetchFriends, sendFriendRequest, acceptFriendRequest, removeFriend, isLoading: friendsLoading } = useFriendshipStore();
  const { groups, fetchUserGroups, createGroup, joinGroup, leaveGroup, fetchGroupMembers, members, isLoading: groupsLoading } = useGroupStore();

  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [friendSearch, setFriendSearch] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchUserGroups();
  }, []);

  const handleAddFriend = async () => {
    if (!friendSearch.trim()) {
      Alert.alert('Username Required', 'Enter a username to send a friend request.');
      return;
    }
    setIsSubmitting(true);
    const { error } = await sendFriendRequest(friendSearch.trim());
    setIsSubmitting(false);
    if (!error) {
      Alert.alert('Request Sent! 🎉', `Friend request sent to @${friendSearch.trim()}.`);
      setFriendSearch('');
    } else {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
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

  const handleExpandGroup = async (groupId: string) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupId);
      await fetchGroupMembers(groupId);
    }
  };

  const handleLeaveGroup = (groupId: string, groupName: string) => {
    Alert.alert(
      'Leave Group?',
      `Are you sure you want to leave "${groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave', style: 'destructive', onPress: async () => {
            await leaveGroup(groupId);
          }
        },
      ]
    );
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    Alert.alert(
      'Remove Friend?',
      `Remove @${friendName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive', onPress: async () => {
            await removeFriend(friendId);
          }
        },
      ]
    );
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
            {/* ─── Header ─── */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerTitle}>Social</Text>
                <View style={styles.headerBadge}>
                  <Users size={16} color={C.primary} />
                  <Text style={styles.headerBadgeText}>
                    {friends.length + groups.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.headerSub}>
                Manage your friends & groups
              </Text>
            </View>

            {/* ─── Tab Toggle ─── */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'friends' && styles.tabBtnActive]}
                onPress={() => setActiveTab('friends')}
                activeOpacity={0.8}
              >
                <UserPlus size={16} color={activeTab === 'friends' ? '#FFFFFF' : C.textSecondary} />
                <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
                  Friends ({friends.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'groups' && styles.tabBtnActive]}
                onPress={() => setActiveTab('groups')}
                activeOpacity={0.8}
              >
                <Home size={16} color={activeTab === 'groups' ? '#FFFFFF' : C.textSecondary} />
                <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
                  Groups ({groups.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* ━━━━━ FRIENDS TAB ━━━━━ */}
            {activeTab === 'friends' && (
              <View style={styles.tabContent}>
                {/* Add Friend Card */}
                <View style={styles.actionCard}>
                  <Text style={styles.actionCardTitle}>Add a Friend</Text>
                  <Text style={styles.actionCardSub}>Enter their username to send a request</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                      <Search size={16} color={C.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search by username..."
                        placeholderTextColor={C.textMuted}
                        value={friendSearch}
                        onChangeText={setFriendSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.actionBtn, isSubmitting && styles.actionBtnDisabled]}
                      onPress={handleAddFriend}
                      disabled={isSubmitting}
                      activeOpacity={0.85}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.actionBtnText}>Add</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>
                      Pending Requests ({pendingRequests.length})
                    </Text>
                    {pendingRequests.map((req) => (
                      <View key={req.id} style={styles.friendRow}>
                        <View style={[styles.avatar, !req.friend_profile?.avatar_url && { backgroundColor: stringToColor(req.friend_profile?.username || req.id) }]}>
                          {req.friend_profile?.avatar_url ? (
                            <Image source={{ uri: req.friend_profile.avatar_url }} style={styles.avatarImage} contentFit="cover" />
                          ) : (
                            <Text style={styles.avatarText}>
                              {(req.friend_profile?.display_name || req.friend_profile?.username || '?').charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={styles.friendInfo}>
                          <Text style={styles.friendName}>
                            {req.friend_profile?.display_name || req.friend_profile?.username || 'Incoming Request'}
                          </Text>
                          <Text style={styles.friendSub}>
                            {req.friend_profile?.username ? `@${req.friend_profile.username}` : 'Waiting for your response'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => acceptFriendRequest(req.id)}
                        >
                          <UserCheck size={14} color="#FFF" />
                          <Text style={styles.acceptBtnText}>Accept</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Friends List */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Your Friends</Text>

                  {friendsLoading ? (
                    <View style={styles.emptyState}>
                      <ActivityIndicator size="small" color={C.primary} />
                      <Text style={styles.emptyText}>Loading friends...</Text>
                    </View>
                  ) : friends.length > 0 ? (
                    friends.map((friend) => (
                      <TouchableOpacity
                        key={friend.id}
                        style={styles.friendRow}
                        activeOpacity={0.7}
                        onPress={() => router.push(`/(modals)/friend-profile?id=${friend.id}`)}
                      >
                        <View style={[styles.avatar, !friend.avatar_url && { backgroundColor: stringToColor(friend.username || friend.id) }]}>
                          {friend.avatar_url ? (
                            <Image source={{ uri: friend.avatar_url }} style={styles.avatarImage} contentFit="cover" />
                          ) : (
                            <Text style={styles.avatarText}>
                              {(friend.display_name || friend.username || '?').charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={styles.friendInfo}>
                          <Text style={styles.friendName}>
                            {friend.display_name || friend.username}
                          </Text>
                          <Text style={styles.friendSub}>@{friend.username}</Text>
                        </View>
                        <View style={styles.friendMeta}>
                          <View style={styles.streakBadge}>
                            <Text style={styles.streakText}>🔥 {friend.streak_days || 0}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.nudgeBtnSmall}
                            onPress={(e) => {
                              e.stopPropagation();
                              Alert.alert('Poke Sent!', `You poked @${friend.username} with a 🪠!`);
                            }}
                          >
                            <Text style={styles.nudgeBtnSmallText}>🪠</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyEmoji}>👥</Text>
                      <Text style={styles.emptyTitle}>No Friends Yet</Text>
                      <Text style={styles.emptyText}>
                        Add friends by their username to share your poop journey together!
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ━━━━━ GROUPS TAB ━━━━━ */}
            {activeTab === 'groups' && (
              <View style={styles.tabContent}>
                {/* Create Group Card */}
                <View style={styles.actionCard}>
                  <Text style={styles.actionCardTitle}>Create a Group</Text>
                  <Text style={styles.actionCardSub}>Start a new group and invite friends</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                      <Home size={16} color={C.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Group name (e.g. Dorm 3rd Floor)"
                        placeholderTextColor={C.textMuted}
                        value={newGroupName}
                        onChangeText={setNewGroupName}
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.actionBtn, isSubmitting && styles.actionBtnDisabled]}
                      onPress={handleCreateGroup}
                      disabled={isSubmitting}
                      activeOpacity={0.85}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.actionBtnText}>Create</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Join Group Card */}
                <View style={styles.actionCard}>
                  <Text style={styles.actionCardTitle}>Join a Group</Text>
                  <Text style={styles.actionCardSub}>Enter a 6-character invite code</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                      <Hash size={16} color={C.textMuted} style={styles.inputIcon} />
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
                      style={[styles.actionBtn, styles.joinBtn, isSubmitting && styles.actionBtnDisabled]}
                      onPress={handleJoinGroup}
                      disabled={isSubmitting}
                      activeOpacity={0.85}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.actionBtnText}>Join</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Groups List */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Your Groups</Text>

                  {groupsLoading ? (
                    <View style={styles.emptyState}>
                      <ActivityIndicator size="small" color={C.primary} />
                      <Text style={styles.emptyText}>Loading groups...</Text>
                    </View>
                  ) : groups.length > 0 ? (
                    groups.map((group) => (
                      <View key={group.id}>
                        <TouchableOpacity
                          style={styles.groupRow}
                          onPress={() => handleExpandGroup(group.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.groupAvatar}>
                            <Home size={18} color={C.primary} />
                          </View>
                          <View style={styles.groupInfo}>
                            <Text style={styles.groupName}>{group.name}</Text>
                            <View style={styles.groupCodeRow}>
                              <Text style={styles.groupCode}>{group.invite_code}</Text>
                              <TouchableOpacity
                                onPress={() => handleCopyCode(group.invite_code)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Copy size={12} color={C.textMuted} />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <ChevronRight
                            size={18}
                            color={C.textMuted}
                            style={{
                              transform: [{ rotate: expandedGroup === group.id ? '90deg' : '0deg' }],
                            }}
                          />
                        </TouchableOpacity>

                        {/* Expanded: Members + Leave */}
                        {expandedGroup === group.id && (
                          <View style={styles.groupExpanded}>
                            <Text style={styles.membersTitle}>Members</Text>
                            {(members[group.id] || []).length > 0 ? (
                              (members[group.id] || []).map((member) => (
                                <View key={member.id} style={styles.memberRow}>
                                  <View style={[styles.memberAvatar, !member.avatar_url && { backgroundColor: stringToColor(member.username || member.id) }]}>
                                    {member.avatar_url ? (
                                      <Image source={{ uri: member.avatar_url }} style={styles.memberAvatarImage} contentFit="cover" />
                                    ) : (
                                      <Text style={styles.memberAvatarText}>
                                        {(member.display_name || member.username || '?').charAt(0).toUpperCase()}
                                      </Text>
                                    )}
                                  </View>
                                  <Text style={styles.memberName}>
                                    {member.display_name || member.username}
                                  </Text>
                                  {group.created_by === member.id && (
                                    <Crown size={12} color={C.secondary} />
                                  )}
                                </View>
                              ))
                            ) : (
                              <Text style={styles.membersSub}>
                                No members loaded yet
                              </Text>
                            )}
                            <TouchableOpacity
                              style={styles.leaveBtn}
                              onPress={() => handleLeaveGroup(group.id, group.name)}
                              activeOpacity={0.8}
                            >
                              <LogOut size={14} color={C.danger} />
                              <Text style={styles.leaveBtnText}>Leave Group</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyEmoji}>🏠</Text>
                      <Text style={styles.emptyTitle}>No Groups Yet</Text>
                      <Text style={styles.emptyText}>
                        Create a group or join one with an invite code to compete with friends!
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

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
  },

  /* ── Header ── */
  header: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
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
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
  },
  headerSub: {
    fontSize: 14,
    fontWeight: '500',
    color: C.textSecondary,
    marginTop: 4,
  },

  /* ── Tab Toggle ── */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: C.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* ── Tab Content ── */
  tabContent: {
    gap: 16,
  },

  /* ── Action Card (Add/Create/Join) ── */
  actionCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
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
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textPrimary,
    marginBottom: 2,
  },
  actionCardSub: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textSecondary,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textPrimary,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  codeInput: {
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 16,
  },
  actionBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  joinBtn: {
    backgroundColor: C.accent,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ── Section Card ── */
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
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
    marginBottom: 14,
  },

  /* ── Friend Row ── */
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.warmSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.primary,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
  },
  friendSub: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textSecondary,
    marginTop: 1,
  },
  friendMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  streakBadge: {
    backgroundColor: C.warmSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
  },
  removeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.danger,
  },
  nudgeBtnSmall: {
    backgroundColor: C.primary,
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeBtnSmallText: {
    fontSize: 12,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Group Row ── */
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  groupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.warmSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
  },
  groupCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  groupCode: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  /* ── Group Expanded ── */
  groupExpanded: {
    backgroundColor: C.inputBg,
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  membersTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: C.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  memberAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  memberAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.primary,
  },
  memberName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: C.textPrimary,
  },
  membersSub: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textMuted,
    fontStyle: 'italic',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.danger,
    backgroundColor: '#FFF5F5',
  },
  leaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.danger,
  },

  /* ── Empty State ── */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
