/**
 * Leaderboard & Stats Screen — PoopTracker
 * Native iOS 18 style leaderboard & personal statistics.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLeaderboardStore, LeaderboardUser } from '@/stores/leaderboardStore';
import { useAuthStore } from '@/stores/authStore';
import { useDropStore } from '@/stores/dropStore';

const DESIGN_COLORS = {
  background: '#F7F7F5',
  card: '#FFFFFF',
  primary: '#7C4D2E',
  secondary: '#C89A5A',
  textPrimary: '#1B1B1B',
  textSecondary: '#6B6B6B',
  border: '#ECECEC',
};

export default function LeaderboardScreen() {
  const { topUsers, fetchLeaderboard } = useLeaderboardStore();
  const { profile } = useAuthStore();
  const { drops } = useDropStore();
  const [filter, setFilter] = useState<'week' | 'month' | 'all'>('week');

  React.useEffect(() => {
    fetchLeaderboard();
  }, []);

  const activeName = profile?.display_name || profile?.username || 'User';
  const myPoints = drops.length * 50;

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
  if (!combinedList.some(u => u.username.includes('(You)'))) {
    combinedList.push(activeUserRankItem);
  }

  // Sort descending by points
  combinedList.sort((a, b) => b.points - a.points);
  const rankedUsers = combinedList.map((u, idx) => ({
    ...u,
    rank: idx + 1,
    badge: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`,
  }));

  const firstUser = rankedUsers[0] || topUsers[0];
  const secondUser = rankedUsers[1] || topUsers[1];
  const thirdUser = rankedUsers[2] || topUsers[2];

  return (
    <View style={styles.screenOuter}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.headerGroup}>
            <Text style={styles.title}>Leaderboard 🏆</Text>
            <Text style={styles.subtitle}>Community rankings and top poopers</Text>
          </View>

          {/* Time Filter Tabs */}
          <View style={styles.filterRow}>
            {(['week', 'month', 'all'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.filterBtn, filter === t && styles.filterBtnActive]}
                onPress={() => setFilter(t)}
              >
                <Text style={[styles.filterText, filter === t && styles.filterTextActive]}>
                  {t === 'week' ? 'This Week' : t === 'month' ? 'This Month' : 'All Time'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Podium Top 3 */}
          <View style={styles.podiumContainer}>
            {/* Rank 2 */}
            {secondUser && (
              <View style={[styles.podiumCard, styles.podiumSecond]}>
                <Text style={styles.podiumMedal}>🥈</Text>
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
                <Text style={styles.podiumMedal}>🥇</Text>
                <View style={[styles.podiumAvatar, styles.firstAvatar]}>
                  <Text style={[styles.podiumAvatarText, { color: '#FFF' }]}>
                    {firstUser.username.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{firstUser.username}</Text>
                <Text style={[styles.podiumScore, { color: DESIGN_COLORS.primary, fontWeight: '800' }]}>
                  {firstUser.points.toLocaleString()} XP
                </Text>
              </View>
            )}

            {/* Rank 3 */}
            {thirdUser && (
              <View style={[styles.podiumCard, styles.podiumThird]}>
                <Text style={styles.podiumMedal}>🥉</Text>
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

          {/* Full Leaderboard List */}
          <View style={styles.listCard}>
            <Text style={styles.listCardTitle}>Full Rankings</Text>

            {rankedUsers.map((user: LeaderboardUser, idx: number) => {
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
                  <Text style={styles.rankNum}>{user.badge}</Text>
                  <View style={[styles.rowAvatar, isMe && styles.myAvatar]}>
                    <Text style={[styles.rowAvatarText, isMe && { color: '#FFF' }]}>
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
            })}
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
  headerGroup: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: DESIGN_COLORS.textSecondary,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  filterBtnActive: {
    backgroundColor: DESIGN_COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
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
    backgroundColor: '#EFEBE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstAvatar: {
    backgroundColor: DESIGN_COLORS.primary,
  },
  podiumAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: DESIGN_COLORS.primary,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  podiumScore: {
    fontSize: 11,
    fontWeight: '600',
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
    fontWeight: '800',
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
    backgroundColor: '#F7F2EE',
    borderRadius: 12,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  rankNum: {
    fontSize: 16,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F7F5',
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
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  rowMeta: {
    flex: 1,
  },
  rowUsername: {
    fontSize: 14,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  myText: {
    color: DESIGN_COLORS.primary,
    fontWeight: '800',
  },
  rowTitle: {
    fontSize: 11,
    color: DESIGN_COLORS.textSecondary,
  },
  rowXp: {
    fontSize: 14,
    fontWeight: '800',
    color: DESIGN_COLORS.primary,
  },
});
