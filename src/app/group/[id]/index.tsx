/**
 * Group Details Screen
 * Shows group members, feed, and stats.
 */
import PageTransition from '@/components/PageTransition';
import { FeedItem, useFeedStore } from '@/stores/feedStore';
import { useGroupStore } from '@/stores/groupStore';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Copy, Crown, LogOut, MapPin, Search, ThumbsUp, Trophy, Hash } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Reusing colors from the design system
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
  warmSurface: '#4E342E',
  deepSurface: '#241310',
};

const getSizeBadgeStyle = (size: string) => {
  switch (size) {
    case 'Tiny': return { bg: 'rgba(0, 102, 204, 0.15)', text: '#66B2FF' };
    case 'Small': return { bg: 'rgba(19, 115, 51, 0.15)', text: '#81C995' };
    case 'Medium': return { bg: 'rgba(183, 129, 3, 0.15)', text: '#FDE293' };
    case 'Large': return { bg: 'rgba(197, 34, 31, 0.15)', text: '#F28B82' };
    case 'Massive': return { bg: 'rgba(123, 31, 162, 0.15)', text: '#D7A1F9' };
    default: return { bg: 'rgba(183, 129, 3, 0.15)', text: '#FDE293' };
  }
};

const stringToColor = (str: string) => {
  const palette = ['#A95C33', '#8D6E63', '#FF9800', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
};

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { groups, members: allMembers, fetchGroupMembers, leaveGroup } = useGroupStore();
  const { feedItems, toggleUpvote, refreshFeed, isRefreshing } = useFeedStore();

  const group = useMemo(() => groups.find((g) => g.id === id), [groups, id]);
  const groupMembers = useMemo(() => allMembers[id] || [], [allMembers, id]);

  const groupFeed = useMemo(() => {
    return feedItems.filter(item => item.target_group_id === id);
  }, [feedItems, id]);

  useEffect(() => {
    if (id) {
      fetchGroupMembers(id);
    }
  }, [id]);

  const handleCopyCode = async () => {
    if (group?.invite_code) {
      await Clipboard.setStringAsync(group.invite_code);
      Alert.alert('Copied! 📋', `Invite code "${group.invite_code}" copied to clipboard.`);
    }
  };

  const handleLeaveGroup = () => {
    if (!group) return;
    Alert.alert(
      'Leave Group?',
      `Are you sure you want to leave "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => { 
            await leaveGroup(group.id); 
            router.back();
          },
        },
      ]
    );
  };

  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading Group...</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color={C.textPrimary} />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <LinearGradient
          colors={[stringToColor(group.name), C.warmSurface]}
          style={styles.largeAvatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.largeAvatarText}>{group.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>

        <Text style={styles.groupName}>{group.name}</Text>
        
        <TouchableOpacity style={styles.codePill} onPress={handleCopyCode} activeOpacity={0.7}>
          <Hash size={12} color={C.primary} />
          <Text style={styles.groupCode}>{group.invite_code}</Text>
          <Copy size={12} color={C.textMuted} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.leaderboardBtn}
        onPress={() => router.push(`/group/${id}/leaderboard` as any)}
        activeOpacity={0.8}
      >
        <Trophy size={16} color="#FFF" />
        <Text style={styles.leaderboardBtnText}>View Leaderboard</Text>
      </TouchableOpacity>

      {/* Horizontal Members List */}
      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Members · {groupMembers.length}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersScroll}>
          {groupMembers.map((member, idx) => (
            <Animated.View 
              key={member.id} 
              entering={FadeIn.delay(idx * 50).duration(300)} 
              style={styles.memberAvatarContainer}
            >
              <View style={[styles.memberAvatar, { backgroundColor: stringToColor(member.username || member.id) }]}>
                {member.avatar_url ? (
                  <Image source={{ uri: member.avatar_url }} style={styles.memberAvatarImage} contentFit="cover" />
                ) : (
                  <Text style={styles.memberAvatarText}>
                    {(member.display_name || member.username || '?').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              {group.created_by === member.id && (
                <View style={styles.ownerBadgeMini}>
                  <Crown size={8} color={C.gold} />
                </View>
              )}
              <Text style={styles.memberFirstName} numberOfLines={1}>
                {(member.display_name || member.username).split(' ')[0]}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.feedHeaderRow}>
        <Text style={styles.sectionTitle}>Group Activity</Text>
      </View>
    </Animated.View>
  );

  const renderFooter = () => (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.footerContainer}>
      <TouchableOpacity
        style={styles.leaveBtn}
        onPress={handleLeaveGroup}
        activeOpacity={0.8}
      >
        <LogOut size={16} color={C.danger} />
        <Text style={styles.leaveBtnText}>Leave Group</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FlatList
          data={groupFeed}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={renderFooter()}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 20) + 80 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshFeed}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
              <Search size={32} color={C.textSecondary} />
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptySub}>Drops logged in this group will appear here.</Text>
            </Animated.View>
          }
          renderItem={({ item: report }) => {
            const badgeStyle = getSizeBadgeStyle(report.size_badge || 'Medium');
            return (
              <View style={styles.reportCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.authorGroup}>
                    <View style={[styles.feedAvatarCircle, !report.profiles?.avatar_url && { backgroundColor: C.border }]}>
                      {report.profiles?.avatar_url ? (
                        <Image source={{ uri: report.profiles.avatar_url }} style={styles.feedAvatarImage} contentFit="cover" />
                      ) : (
                        <Text style={styles.feedAvatarText}>
                          {report.profiles.username.slice(0, 2).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.feedUsername}>{report.profiles.username}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={styles.timeAgo}>{formatTimeAgo(report.created_at)}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.sizeBadge, { backgroundColor: badgeStyle.bg }]}>
                    <Text style={[styles.sizeBadgeText, { color: badgeStyle.text }]}>
                      {report.size_badge}
                    </Text>
                  </View>
                </View>

                {/* Report Content */}
                <View style={styles.cardBody}>
                  <Text style={styles.reportTitle}>{report.custom_title || `${report.location} Session`}</Text>

                  <View style={styles.locationMetaRow}>
                    <MapPin size={13} color={C.textSecondary} />
                    <Text style={styles.locationText}>{report.location}</Text>
                  </View>
                </View>

                {/* Footer Actions */}
                <View style={styles.cardFooter}>
                  <Text style={styles.reactionsText}>
                    {report.reactions_count} {report.reactions_count === 1 ? 'reaction' : 'reactions'}
                  </Text>

                  <TouchableOpacity
                    style={[styles.upvoteBtn, report.is_upvoted && styles.upvoteBtnActive]}
                    activeOpacity={0.7}
                    onPress={() => toggleUpvote(report.id)}
                  >
                    <ThumbsUp size={12} color={report.is_upvoted ? C.primary : C.textSecondary} />
                    <Text style={[styles.upvoteLabel, report.is_upvoted && styles.upvoteLabelActive]}>
                      {report.is_upvoted ? 'Upvoted' : 'Upvote'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    color: C.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  
  // Header section
  headerContainer: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    backgroundColor: C.deepSurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: C.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  largeAvatarText: {
    fontSize: 32,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFF',
  },
  groupName: {
    fontSize: 26,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.warmSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  groupCode: {
    fontSize: 14,
    fontFamily: 'Nunito-ExtraBold',
    color: C.primary,
    letterSpacing: 2,
  },
  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 20,
    ...Platform.select({
      ios: { shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  leaderboardBtnText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#FFF',
  },

  // Members
  membersSection: {
    width: '100%',
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textSecondary,
    marginBottom: 12,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  membersScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  memberAvatarContainer: {
    alignItems: 'center',
    width: 60,
    position: 'relative',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
  },
  memberAvatarText: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFF',
  },
  memberFirstName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: C.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  ownerBadgeMini: {
    position: 'absolute',
    top: -4,
    right: 2,
    backgroundColor: C.bg,
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.gold,
  },
  feedHeaderRow: {
    width: '100%',
    marginTop: 32,
    marginBottom: -8, // to offset listContent gap
  },

  // Feed Cards
  reportCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  feedAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  feedAvatarText: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFF',
  },
  feedUsername: {
    fontSize: 15,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
  },
  timeAgo: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: C.textSecondary,
  },
  sizeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sizeBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
  },
  cardBody: {
    gap: 4,
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
  },
  locationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: C.textSecondary,
  },
  metaDot: {
    fontSize: 12,
    color: C.border,
  },
  verificationBadge: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: C.success,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  reactionsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: C.textSecondary,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  upvoteBtnActive: {
    backgroundColor: 'rgba(169, 92, 51, 0.15)',
    borderColor: C.primary,
  },
  upvoteLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: C.textSecondary,
  },
  upvoteLabelActive: {
    color: C.primary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: C.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: C.textSecondary,
    textAlign: 'center',
  },

  // Footer
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.25)',
    width: '100%',
  },
  leaveBtnText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: C.danger,
  },
});
