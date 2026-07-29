/**
 * Home Screen — PoopTracker
 * Designed like an experienced Figma product designer built it for native iOS 18.
 * Minimal, clean, playful, light mode, 8pt spacing system, flat design.
 * Fully interactive and state-reactive with clean empty states.
 */
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform, 
  Modal, 
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLeaderboardStore, LeaderboardUser } from '@/stores/leaderboardStore';
import { useFeedStore, FeedItem } from '@/stores/feedStore';
import { useDropStore } from '@/stores/dropStore';
import { useAuthStore } from '@/stores/authStore';

const DESIGN_COLORS = {
  background: '#F7F7F5',
  card: '#FFFFFF',
  primary: '#7C4D2E',
  secondary: '#C89A5A',
  success: '#4CAF50',
  textPrimary: '#1B1B1B',
  textSecondary: '#6B6B6B',
  border: '#ECECEC',
};

const getSizeBadgeStyle = (size: string) => {
  switch (size) {
    case 'Tiny':
      return { bg: '#E5F1FF', text: '#0066CC' };
    case 'Small':
      return { bg: '#E6F4EA', text: '#137333' };
    case 'Medium':
      return { bg: '#FFF8E1', text: '#B78103' };
    case 'Large':
      return { bg: '#FCE8E6', text: '#C5221F' };
    case 'Massive':
      return { bg: '#F3E8FD', text: '#7B1FA2' };
    default:
      return { bg: '#FFF8E1', text: '#B78103' };
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const { topUsers, fetchLeaderboard } = useLeaderboardStore();
  const { feedItems, toggleUpvote, fetchFeed } = useFeedStore();
  const { todayCount, currentStreak, drops, loadLocalState } = useDropStore();
  const { profile } = useAuthStore();

  const userDisplayName = profile?.display_name || profile?.username || 'User';
  const userHandle = profile?.username || 'user';
  const userInitials = userDisplayName.slice(0, 2).toUpperCase();

  React.useEffect(() => {
    fetchFeed();
    fetchLeaderboard();
    loadLocalState();
  }, []);

  const [notificationVisible, setNotificationVisible] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  // Real dynamic XP & Level based on actual user drops
  const totalLoggedCount = drops.length;
  const currentXP = totalLoggedCount * 50;
  const currentLevel = Math.floor(currentXP / 100) + 1;
  const nextLevelXP = currentLevel * 100;
  const progressPct = Math.min(100, Math.round((currentXP / Math.max(1, nextLevelXP)) * 100));

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} h ago`;
    return `${Math.floor(hours / 24)} d ago`;
  };

  return (
    <View style={styles.screenOuter}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.appTitle}>PoopTracker</Text>
              <Text style={styles.appSubtitle}>Community poop tracking</Text>
            </View>

            <TouchableOpacity 
              style={styles.bellButton}
              activeOpacity={0.7}
              onPress={() => {
                setNotificationVisible(true);
                setUnreadNotifications(false);
              }}
            >
              <Text style={styles.bellIcon}>🔔</Text>
              {unreadNotifications && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>

          {/* LARGE STAT CARDS */}
          <View style={styles.statsContainer}>
            {/* Card 1: Today's Reports */}
            <View style={styles.statCard}>
              <View style={styles.statHeaderRow}>
                <Text style={styles.statLabel}>Today's Reports</Text>
                <Text style={styles.statEmoji}>💩</Text>
              </View>
              <Text style={styles.statNumber}>{todayCount}</Text>
              <Text style={styles.statSubtext}>{todayCount > 0 ? `${todayCount} logged today!` : 'No drops yet today'}</Text>
            </View>

            {/* Card 2: Community Rank */}
            <View style={styles.statCard}>
              <View style={styles.statHeaderRow}>
                <Text style={styles.statLabel}>Community Rank</Text>
                <Text style={styles.statEmoji}>🏆</Text>
              </View>
              <Text style={styles.statValueHighlight}>{totalLoggedCount > 0 ? '#1 Active' : 'Unranked'}</Text>
              <Text style={styles.statSubtext}>Streak: {currentStreak} Days 🔥</Text>
            </View>

            {/* Card 3: Poop Score */}
            <View style={[styles.statCard, styles.fullWidthStatCard]}>
              <View style={styles.statHeaderRow}>
                <Text style={styles.statLabel}>Poop Score</Text>
                <Text style={styles.statScoreBadge}>Level {currentLevel}</Text>
              </View>
              <Text style={styles.statNumber}>{currentXP.toLocaleString()} XP</Text>
              
              {/* Progress bar to next level */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.progressText}>{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP to Level {currentLevel + 1}</Text>
              </View>
            </View>
          </View>

          {/* LEADERBOARD SECTION */}
          <View style={styles.cardSection}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionCardTitle}>🏆 Top Poopers</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>This Week</Text>
              </View>
            </View>

            <View style={styles.leaderboardList}>
              {topUsers.length > 0 ? (
                topUsers.slice(0, 5).map((user: LeaderboardUser, idx: number) => (
                  <View 
                    key={user.id || idx} 
                    style={[
                      styles.leaderboardRow,
                      idx === Math.min(topUsers.length, 5) - 1 && styles.noBorderRow
                    ]}
                  >
                    <View style={[
                      styles.rankBadge,
                      idx === 0 ? styles.goldBadge : idx === 1 ? styles.silverBadge : idx === 2 ? styles.bronzeBadge : styles.neutralBadge
                    ]}>
                      <Text style={[
                        styles.rankBadgeText,
                        idx < 3 ? styles.medalText : styles.neutralRankText
                      ]}>
                        {user.badge}
                      </Text>
                    </View>

                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitials}>
                        {user.username.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.userInfoCol}>
                      <Text style={styles.usernameText} numberOfLines={1}>
                        {user.username}
                      </Text>
                      <Text style={styles.userTitleText} numberOfLines={1}>
                        {user.title}
                      </Text>
                    </View>

                    <View style={styles.xpCol}>
                      <Text style={styles.xpNumberText}>{user.points.toLocaleString()} XP</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyLeaderboardBox}>
                  <Text style={styles.emptyLeaderboardText}>No community rankings yet.</Text>
                  <Text style={styles.emptyLeaderboardSub}>Log your first drop to get on the leaderboard! 💩</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={styles.fullLeaderboardBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/stats')}
            >
              <Text style={styles.fullLeaderboardBtnText}>View Full Leaderboard</Text>
            </TouchableOpacity>
          </View>

          {/* RECENT REPORTS SECTION */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Reports</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/feed')}>
                <Text style={styles.seeAllText}>See all 〉</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reportsStack}>
              {feedItems.length > 0 ? (
                feedItems.slice(0, 4).map((report: FeedItem) => {
                  const badgeStyle = getSizeBadgeStyle(report.size_badge || 'Medium');
                  return (
                    <View key={report.id} style={styles.reportCard}>
                      <View style={styles.reportHeader}>
                        <View style={styles.reportIconCircle}>
                          <Text style={styles.reportPoopIcon}>💩</Text>
                        </View>

                        <View style={styles.reportMainInfo}>
                          <View style={styles.reportTitleRow}>
                            <Text style={styles.reportLocationText}>{report.location}</Text>
                            <View style={[styles.sizeBadge, { backgroundColor: badgeStyle.bg }]}>
                              <Text style={[styles.sizeBadgeText, { color: badgeStyle.text }]}>
                                {report.size_badge}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.reportMetaRow}>
                            <Text style={styles.verificationBadge}>
                              ✓ Verified {report.verification_pct}%
                            </Text>
                            <Text style={styles.metaDot}>•</Text>
                            <Text style={styles.reportTimeText}>{formatTimeAgo(report.created_at)}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Reaction / Upvote Footer */}
                      <View style={styles.reportFooter}>
                        <Text style={styles.reactionCountText}>
                          {report.reactions_count} {report.reactions_count === 1 ? 'reaction' : 'reactions'}
                        </Text>

                        <TouchableOpacity 
                          style={[
                            styles.upvoteBtn,
                            report.is_upvoted && styles.upvoteBtnActive
                          ]}
                          activeOpacity={0.7}
                          onPress={() => toggleUpvote(report.id)}
                        >
                          <Text style={styles.upvoteIcon}>👍</Text>
                          <Text style={[
                            styles.upvoteLabel,
                            report.is_upvoted && styles.upvoteLabelActive
                          ]}>
                            {report.is_upvoted ? 'Upvoted' : 'Upvote'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyReportCard}>
                  <Text style={styles.emptyReportEmoji}>💩</Text>
                  <Text style={styles.emptyReportTitle}>No recent reports</Text>
                  <Text style={styles.emptyReportSub}>Tap the + button below to log your first drop!</Text>
                </View>
              )}
            </View>
          </View>

          {/* ACHIEVEMENTS CARD */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionCardTitle}>Achievements</Text>
            
            <View style={styles.achievementsGrid}>
              <TouchableOpacity 
                style={styles.achievementItem} 
                activeOpacity={0.7}
                onPress={() => setSelectedAchievement(totalLoggedCount > 0 ? 'First Dump: Logged your first stool session! Unlocked 💩' : 'First Dump: Log your first drop to unlock!')}
              >
                <Text style={styles.achievementEmoji}>💩</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.achievementName}>First Dump</Text>
                  <Text style={styles.achievementSub}>{totalLoggedCount > 0 ? 'Unlocked ✓' : 'Locked 🔒'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.achievementItem}
                activeOpacity={0.7}
                onPress={() => setSelectedAchievement(totalLoggedCount >= 5 ? 'Top 100: Ranked in community! Unlocked 🏆' : 'Top 100: Log 5 drops to unlock!')}
              >
                <Text style={styles.achievementEmoji}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.achievementName}>Top 100</Text>
                  <Text style={styles.achievementSub}>{totalLoggedCount >= 5 ? 'Unlocked ✓' : 'Locked 🔒'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.achievementItem}
                activeOpacity={0.7}
                onPress={() => setSelectedAchievement(currentStreak >= 7 ? '7-Day Streak: Logged drops 7 days in a row! Unlocked 🔥' : '7-Day Streak: Log 7 days in a row!')}
              >
                <Text style={styles.achievementEmoji}>🔥</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.achievementName}>7-Day Streak</Text>
                  <Text style={styles.achievementSub}>{currentStreak >= 7 ? 'Unlocked ✓' : 'Locked 🔒'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.achievementItem}
                activeOpacity={0.7}
                onPress={() => setSelectedAchievement(totalLoggedCount >= 10 ? 'Community Hero: 10+ verified drops! Unlocked 👑' : 'Community Hero: Log 10+ drops!')}
              >
                <Text style={styles.achievementEmoji}>👑</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.achievementName}>Community Hero</Text>
                  <Text style={styles.achievementSub}>{totalLoggedCount >= 10 ? 'Unlocked ✓' : 'Locked 🔒'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* PROFILE PREVIEW CARD */}
          <View style={styles.cardSection}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{userInitials}</Text>
              </View>
              <View style={styles.profileMetaGroup}>
                <View style={styles.profileNameRow}>
                  <Text style={styles.profileName}>{userDisplayName}</Text>
                  <View style={styles.profileLevelPill}>
                    <Text style={styles.profileLevelText}>Level {currentLevel}</Text>
                  </View>
                </View>
                <Text style={styles.profileHandle}>@{userHandle}</Text>
              </View>
            </View>

            <View style={styles.profileXpSection}>
              <View style={styles.profileXpRow}>
                <Text style={styles.profileXpTitle}>XP Progress</Text>
                <Text style={styles.profileXpVal}>{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
            </View>

            <View style={styles.profileStatsFooter}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{todayCount}</Text>
                <Text style={styles.profileStatLabel}>Today's Contribution</Text>
              </View>
              <View style={styles.profileDivider} />
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{totalLoggedCount > 0 ? '#1' : '-'}</Text>
                <Text style={styles.profileStatLabel}>Weekly Rank</Text>
              </View>
            </View>
          </View>

          {/* Extra padding for floating bottom bar */}
          <View style={{ height: 90 }} />
        </ScrollView>
      </SafeAreaView>

      {/* NOTIFICATION MODAL */}
      <Modal
        visible={notificationVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setNotificationVisible(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications 🔔</Text>
              <TouchableOpacity onPress={() => setNotificationVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.noNotificationsText}>No new notifications right now.</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ACHIEVEMENT DETAIL MODAL */}
      <Modal
        visible={!!selectedAchievement}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedAchievement(null)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Achievement Status 🏆</Text>
              <TouchableOpacity onPress={() => setSelectedAchievement(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.achievementModalText}>{selectedAchievement}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
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
    gap: 24,
  },

  // HEADER
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleGroup: {
    gap: 2,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
    letterSpacing: -0.8,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_COLORS.textSecondary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DESIGN_COLORS.card,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  bellIcon: {
    fontSize: 20,
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DESIGN_COLORS.primary,
  },

  // STAT CARDS
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 16,
    gap: 8,
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
  fullWidthStatCard: {
    minWidth: '100%',
    marginTop: 4,
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
  },
  statEmoji: {
    fontSize: 18,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  statValueHighlight: {
    fontSize: 20,
    fontWeight: '800',
    color: DESIGN_COLORS.primary,
    letterSpacing: -0.3,
  },
  statSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: DESIGN_COLORS.textSecondary,
  },
  statScoreBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: DESIGN_COLORS.primary,
    backgroundColor: '#F7F2EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  // PROGRESS BAR
  progressContainer: {
    marginTop: 4,
    gap: 6,
  },
  progressTrack: {
    height: 8,
    backgroundColor: DESIGN_COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DESIGN_COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
  },

  // SECTION CARD COMMON
  cardSection: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  activePill: {
    backgroundColor: '#F7F7F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: DESIGN_COLORS.textSecondary,
  },

  // LEADERBOARD
  leaderboardList: {
    gap: 12,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_COLORS.border,
    gap: 12,
  },
  noBorderRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldBadge: {
    backgroundColor: '#FFF8E1',
  },
  silverBadge: {
    backgroundColor: '#F1F3F4',
  },
  bronzeBadge: {
    backgroundColor: '#FCE8E6',
  },
  neutralBadge: {
    backgroundColor: '#F7F7F5',
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  medalText: {
    fontSize: 14,
  },
  neutralRankText: {
    fontSize: 13,
    color: DESIGN_COLORS.textSecondary,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFEBE9',
    borderWidth: 1,
    borderColor: '#D7CCC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: '800',
    color: DESIGN_COLORS.primary,
  },
  userInfoCol: {
    flex: 1,
  },
  usernameText: {
    fontSize: 14,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  userTitleText: {
    fontSize: 11,
    fontWeight: '500',
    color: DESIGN_COLORS.textSecondary,
    marginTop: 1,
  },
  xpCol: {
    alignItems: 'flex-end',
  },
  xpNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: DESIGN_COLORS.primary,
  },
  fullLeaderboardBtn: {
    backgroundColor: '#F7F7F5',
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  fullLeaderboardBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: DESIGN_COLORS.primary,
  },
  emptyLeaderboardBox: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  emptyLeaderboardText: {
    fontSize: 14,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  emptyLeaderboardSub: {
    fontSize: 12,
    color: DESIGN_COLORS.textSecondary,
  },

  // RECENT REPORTS SECTION
  sectionContainer: {
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: DESIGN_COLORS.primary,
  },
  reportsStack: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 16,
    gap: 12,
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
  emptyReportCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyReportEmoji: {
    fontSize: 32,
  },
  emptyReportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  emptyReportSub: {
    fontSize: 12,
    color: DESIGN_COLORS.textSecondary,
    textAlign: 'center',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7F2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportPoopIcon: {
    fontSize: 22,
  },
  reportMainInfo: {
    flex: 1,
    gap: 4,
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportLocationText: {
    fontSize: 15,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  sizeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sizeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  reportMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verificationBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: DESIGN_COLORS.success,
  },
  metaDot: {
    fontSize: 12,
    color: DESIGN_COLORS.border,
  },
  reportTimeText: {
    fontSize: 12,
    color: DESIGN_COLORS.textSecondary,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: DESIGN_COLORS.border,
  },
  reactionCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F7F7F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
  },
  upvoteBtnActive: {
    backgroundColor: '#F7F2EE',
    borderColor: DESIGN_COLORS.primary,
  },
  upvoteIcon: {
    fontSize: 12,
  },
  upvoteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: DESIGN_COLORS.textSecondary,
  },
  upvoteLabelActive: {
    color: DESIGN_COLORS.primary,
  },

  // ACHIEVEMENTS
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#F7F7F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 12,
    gap: 10,
  },
  achievementEmoji: {
    fontSize: 22,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  achievementSub: {
    fontSize: 10,
    fontWeight: '500',
    color: DESIGN_COLORS.textSecondary,
    marginTop: 1,
  },
  achievementModalText: {
    fontSize: 14,
    color: DESIGN_COLORS.textPrimary,
    lineHeight: 20,
    marginTop: 8,
  },

  // PROFILE PREVIEW
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DESIGN_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileMetaGroup: {
    flex: 1,
    gap: 2,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
  },
  profileLevelPill: {
    backgroundColor: '#F7F2EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  profileLevelText: {
    fontSize: 11,
    fontWeight: '800',
    color: DESIGN_COLORS.primary,
  },
  profileHandle: {
    fontSize: 12,
    fontWeight: '500',
    color: DESIGN_COLORS.textSecondary,
  },
  profileXpSection: {
    gap: 6,
    marginTop: 4,
  },
  profileXpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileXpTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
  },
  profileXpVal: {
    fontSize: 12,
    fontWeight: '700',
    color: DESIGN_COLORS.primary,
  },
  profileStatsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F7F7F5',
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  profileStatItem: {
    alignItems: 'center',
    gap: 2,
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: DESIGN_COLORS.textSecondary,
  },
  profileDivider: {
    width: 1,
    height: '100%',
    backgroundColor: DESIGN_COLORS.border,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
  },
  modalClose: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_COLORS.textSecondary,
    padding: 4,
  },
  noNotificationsText: {
    fontSize: 13,
    color: DESIGN_COLORS.textSecondary,
    paddingVertical: 8,
  },
});
