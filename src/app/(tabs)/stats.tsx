/**
 * Leaderboard & Stats Screen — KulAPP
 * Native iOS 18 style leaderboard & personal statistics.
 */
import { useAuthStore } from '@/stores/authStore';
import { useDropStore } from '@/stores/dropStore';
import { useGroupStore } from '@/stores/groupStore';
import { LeaderboardUser, useLeaderboardStore } from '@/stores/leaderboardStore';
import { Crown, Home, Medal, Trophy, Users } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const DESIGN_COLORS = {
  background: '#2D1B15',
  card: '#3E2723',
  primary: '#A95C33', // Replaced with bronze for highlights
  secondary: '#8D6E63', // taupe/mud
  textPrimary: '#EFEBE9',
  textSecondary: '#BCAAA4',
  border: '#5D4037',
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const { topUsers, fetchLeaderboard } = useLeaderboardStore();
  const { profile } = useAuthStore();
  const { drops } = useDropStore();
  const { groups, fetchUserGroups } = useGroupStore();

  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('');

  useEffect(() => {
    fetchUserGroups().then(() => {
      const g = useGroupStore.getState().groups;
      if (g.length > 0) {
        setActiveGroupFilter(g[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (activeGroupFilter) {
      fetchLeaderboard(activeGroupFilter);
    }
  }, [activeGroupFilter]);

  const activeName = profile?.display_name || profile?.username || 'User';
  
  // Calculate points based on selected group
  const myRelevantDrops = drops.filter(d => d.target_group_id === activeGroupFilter);
  const myPoints = myRelevantDrops.length * 50;

  // Build merged dynamic user list
  const activeUserRankItem: LeaderboardUser = {
    id: profile?.id || 'my-profile',
    rank: 0,
    badge: '',
    username: `${activeName} (You)`,
    title: 'Active Community Member',
    avatar_url: profile?.avatar_url || null,
    points: myPoints,
  };

  const combinedList = [...topUsers];
  if (activeGroupFilter && !combinedList.some(u => u.username.includes('(You)'))) {
    combinedList.push(activeUserRankItem);
  }

  // Sort descending by points
  combinedList.sort((a, b) => b.points - a.points);
  const rankedUsers = combinedList.map((u, idx) => ({
    ...u,
    rank: idx + 1,
    badge: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`,
  }));

  const firstUser = rankedUsers[0] || null;
  const secondUser = rankedUsers[1] || null;
  const thirdUser = rankedUsers[2] || null;

  return (
    <View style={styles.screenOuter}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.headerGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.title}>Leaderboard</Text>
              <Trophy size={28} color={DESIGN_COLORS.primary} />
            </View>
            <Text style={styles.subtitle}>Group rankings and top poopers</Text>
          </View>

          {groups.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconWrap}>
                <Users size={36} color={DESIGN_COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Groups Yet</Text>
              <Text style={styles.emptyText}>
                You need to join or create a group to view leaderboards and compete with friends.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push('/(tabs)/group')}
              >
                <Text style={styles.primaryBtnText}>Go to Groups</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Filter Pills: Group Scope */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillRow}>
                {groups.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.filterPill, activeGroupFilter === g.id && styles.filterPillActive]}
                    onPress={() => setActiveGroupFilter(g.id)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Home size={14} color={activeGroupFilter === g.id ? '#FFFFFF' : DESIGN_COLORS.textSecondary} />
                      <Text style={[styles.filterPillText, activeGroupFilter === g.id && styles.filterPillTextActive]}>
                        {g.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Podium Top 3 */}
              {rankedUsers.length > 0 && (
                <View style={styles.podiumContainer}>
                  {/* Rank 2 */}
                  {secondUser && (
                    <View style={[styles.podiumCard, styles.podiumSecond]}>
                      <Medal size={24} color="#A0A0A0" />
                      <View style={styles.podiumAvatar}>
                        <Text style={styles.podiumAvatarText}>
                          {secondUser.username.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{secondUser.username}</Text>
                      <Text style={styles.podiumScore}>{secondUser.points.toLocaleString()} XP</Text>
                    </View>
                  )}

                  {/* Rank 1 */}
                  {firstUser && (
                    <View style={[styles.podiumCard, styles.podiumFirst]}>
                      <Crown size={24} color={DESIGN_COLORS.secondary} />
                      <View style={[styles.podiumAvatar, styles.firstAvatar]}>
                        <Text style={[styles.podiumAvatarText, { color: '#2D1B15' }]}>
                          {firstUser.username.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{firstUser.username}</Text>
                      <Text style={[styles.podiumScore, { color: DESIGN_COLORS.primary, fontFamily: 'Inter-Bold' }]}>
                        {firstUser.points.toLocaleString()} XP
                      </Text>
                    </View>
                  )}

                  {/* Rank 3 */}
                  {thirdUser && (
                    <View style={[styles.podiumCard, styles.podiumThird]}>
                      <Medal size={24} color="#CD7F32" />
                      <View style={styles.podiumAvatar}>
                        <Text style={styles.podiumAvatarText}>
                          {thirdUser.username.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{thirdUser.username}</Text>
                      <Text style={styles.podiumScore}>{thirdUser.points.toLocaleString()} XP</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Full Leaderboard List */}
              <View style={styles.listCard}>
                <Text style={styles.listCardTitle}>Full Rankings</Text>

                {rankedUsers.length === 0 ? (
                  <Text style={styles.emptyText}>No drops recorded in this group yet.</Text>
                ) : (
                  rankedUsers.map((user: LeaderboardUser, idx: number) => {
                    const isMe = user.username.includes('(You)');
                    return (
                      <View
                        key={user.id || idx}
                        style={[
                          styles.rankRow,
                          isMe && styles.myRankRow,
                          idx === rankedUsers.length - 1 && styles.noBorder
                        ]}
                      >
                        <View style={{ width: 24, alignItems: 'center' }}>
                          {user.rank === 1 ? (
                            <Crown size={16} color={DESIGN_COLORS.secondary} />
                          ) : user.rank === 2 ? (
                            <Medal size={16} color="#A0A0A0" />
                          ) : user.rank === 3 ? (
                            <Medal size={16} color="#CD7F32" />
                          ) : (
                            <Text style={styles.rankNum}>{user.rank}</Text>
                          )}
                        </View>
                        <View style={[styles.rowAvatar, isMe && styles.myAvatar]}>
                          <Text style={[styles.rowAvatarText, isMe && { color: '#2D1B15' }]}>
                            {user.username.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.rowMeta}>
                          <Text style={[styles.rowUsername, isMe && styles.myText]}>{user.username}</Text>
                          <Text style={styles.rowTitle}>{user.title}</Text>
                        </View>
                        <Text style={styles.rowXp}>{user.points.toLocaleString()} XP</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </>
          )}

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
  headerGroup: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: DESIGN_COLORS.textSecondary,
  },
  filterPillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    backgroundColor: DESIGN_COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: DESIGN_COLORS.primary,
    borderColor: DESIGN_COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 4,
  },
  podiumCard: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  podiumFirst: {
    paddingVertical: 20,
    borderColor: DESIGN_COLORS.secondary,
    borderWidth: 2,
  },
  podiumSecond: {
    paddingVertical: 14,
  },
  podiumThird: {
    paddingVertical: 14,
  },
  podiumMedal: {
    fontSize: 24,
  },
  podiumAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4E342E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstAvatar: {
    backgroundColor: DESIGN_COLORS.primary,
  },
  podiumAvatarText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.primary,
  },
  podiumName: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  podiumScore: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  listCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 20,
    gap: 16,
  },
  listCardTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_COLORS.border,
    gap: 12,
  },
  myRankRow: {
    backgroundColor: '#4E342E',
    borderRadius: 12,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  rankNum: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    width: 24,
    textAlign: 'center',
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4E342E',
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myAvatar: {
    backgroundColor: DESIGN_COLORS.primary,
    borderColor: DESIGN_COLORS.primary,
  },
  rowAvatarText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  rowMeta: {
    flex: 1,
  },
  rowUsername: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  myText: {
    color: DESIGN_COLORS.primary,
    fontFamily: 'Inter-Bold',
  },
  rowTitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: DESIGN_COLORS.textSecondary,
  },
  rowXp: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.primary,
  },
  emptyText: {
    fontSize: 13,
    color: DESIGN_COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  emptyStateContainer: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    alignItems: 'center',
    padding: 30,
    gap: 12,
    marginTop: 20,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#4E342E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  primaryBtn: {
    backgroundColor: DESIGN_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});
