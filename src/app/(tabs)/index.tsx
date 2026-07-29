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
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient colors={['#2D1B15', '#3E2723']} style={styles.screenOuter}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* FLOATING HEADER */}
          <View style={styles.floatingHeader}>
            <View style={styles.floatingTitleGroup}>
              <Text style={styles.appTitle}>💩 PoopTracker</Text>
              <Text style={styles.appSubtitle}>Ready to drop one?</Text>
            </View>
            <TouchableOpacity 
              style={styles.floatingProfileBtn} 
              onPress={() => router.push('/profile')}
            >
              <Text style={{fontSize: 22}}>🧻</Text>
            </TouchableOpacity>
          </View>

            {/* WIDGET GRID (2-COLUMN) */}
            <View style={styles.widgetGrid}>
              
              {/* WIDGET 1: 1x1 Square Stats */}
              <View style={[styles.widget1x1, styles.widgetBrown, styles.shadowBrown, styles.whiteBorder]}>
                <Text style={styles.widgetEmoji}>{todayCount > 0 ? '💩' : '🚽'}</Text>
                <Text style={[styles.widgetNumber, styles.whiteText]}>{todayCount}</Text>
                <Text style={[styles.widgetLabel, styles.whiteText]}>Drops Today</Text>
              </View>

              {/* WIDGET 2: 1x1 Square Rank */}
              <View style={[styles.widget1x1, styles.widgetOlive, styles.shadowOlive, styles.whiteBorder]}>
                <Text style={styles.widgetEmoji}>🏅</Text>
                <Text style={[styles.widgetNumber, styles.whiteText]}>{totalLoggedCount > 0 ? '#1' : '-'}</Text>
                <Text style={[styles.widgetLabel, styles.whiteText]}>Local Rank</Text>
              </View>

              {/* WIDGET 3: 2x2 Large Pet Centerpiece */}
              <View style={[styles.widget2x2, styles.shadowSoft, styles.whiteBorder, { backgroundColor: '#3E2723' }]}>
                <View style={styles.levelWidgetHeader}>
                  <Text style={[styles.widgetTitle, { color: '#EFEBE9' }]}>Your Log</Text>
                  <View style={styles.levelPill}>
                    <Text style={[styles.levelPillText, { color: '#EFEBE9' }]}>Lvl {currentLevel}</Text>
                  </View>
                </View>
                
                <View style={styles.petContainer}>
                  <Text style={styles.petEmoji}>{currentLevel < 2 ? '💩' : (currentLevel < 4 ? '💩💩' : '💩💩💩')}</Text>
                </View>

                {/* Interactive Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#5D4037' }, styles.whiteBorder]}>
                    <Text style={{fontSize: 20}}>🌽</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4E342E' }, styles.whiteBorder]}>
                    <Text style={{fontSize: 20}}>🥜</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6D4C41' }, styles.whiteBorder]}>
                    <Text style={{fontSize: 20}}>🪠</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: '#FFF' }]} />
                </View>
                <Text style={[styles.progressText, styles.whiteText]}>{currentXP.toLocaleString()} XP • {nextLevelXP - currentXP} to next stage</Text>
              </View>

              {/* WIDGET 4: 2x1 Medium Recent Feed */}
              <View style={[styles.widget2x1, styles.shadowSoft, styles.whiteBorder, { backgroundColor: '#3E2723' }]}>
                <Text style={styles.widgetTitle}>Recent Logs 💩</Text>
                
                <View style={styles.feedList}>
                  {feedItems.slice(0, 2).map((item) => (
                    <View key={item.id} style={[styles.feedMiniCard]}>
                      <View style={styles.feedAvatar}>
                        <Text style={styles.feedAvatarText}>{item.userHandle.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.feedMiniInfo}>
                        <Text style={styles.feedUserName}>{item.userHandle}</Text>
                        <Text style={styles.feedTime}>{formatTimeAgo(item.createdAt)}</Text>
                      </View>
                      <Text style={{fontSize: 18}}>💨</Text>
                    </View>
                  ))}
                  {feedItems.length === 0 && (
                     <Text style={styles.emptySub}>No recent activity</Text>
                  )}
                </View>
              </View>

            </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// iOS WIDGET GRID STYLES
// ============================================
const styles = StyleSheet.create({
  screenOuter: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },

  // FLOATING HEADER
  floatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  floatingTitleGroup: {
    flex: 1,
  },
  appTitle: {
    fontSize: 26,
    fontFamily: 'Nunito-ExtraBold',
    color: '#EFEBE9',
  },
  appSubtitle: {
    fontSize: 15,
    fontFamily: 'Nunito-ExtraBold',
    color: '#BCAAA4',
    opacity: 0.8,
    marginTop: 2,
  },
  floatingProfileBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },

  // WIDGET GRID
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  
  whiteBorder: {
    borderWidth: 4,
    borderColor: 'rgba(93, 64, 55, 0.5)',
  },
  whiteText: {
    color: '#EFEBE9',
  },
  
  // 1x1 SQUARE WIDGET
  widget1x1: {
    width: '47%',
    aspectRatio: 1, // Make it a perfect square
    borderRadius: 36, // Massive squishy corners
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetBrown: {
    backgroundColor: '#4E342E', // Solid brown
  },
  widgetOlive: {
    backgroundColor: '#556B2F', // Solid olive green
  },
  
  // 2x1 WIDGET
  widget2x1: {
    width: '100%',
    borderRadius: 36,
    padding: 32,
  },
  // 2x2 WIDGET
  widget2x2: {
    width: '100%',
    aspectRatio: 1, // 2x2 perfect square
    borderRadius: 36,
    padding: 32,
  },

  // WIDGET TYPOGRAPHY
  widgetEmoji: {
    fontSize: 54,
    marginBottom: 8,
  },
  widgetNumber: {
    fontSize: 36,
    fontFamily: 'Nunito-ExtraBold',
    textAlign: 'center',
  },
  widgetLabel: {
    fontSize: 15,
    fontFamily: 'Nunito-ExtraBold',
    textAlign: 'center',
    marginTop: 4,
  },

  // PET CENTERPIECE
  levelWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: '#EFEBE9',
  },
  levelPill: {
    backgroundColor: '#5D4037', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelPillText: {
    fontSize: 14,
    fontFamily: 'Nunito-ExtraBold',
    color: '#EFEBE9', // match bg
  },
  petContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petEmoji: {
    fontSize: 140, 
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 10,
  },
  
  // INTERACTIVE ACTIONS
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: 16,
    marginBottom: 32,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  // PROGRESS
  progressTrack: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 7,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Nunito-ExtraBold',
    textAlign: 'center',
  },

  // MINI FEED LIST (Inside Widget)
  feedList: {
    marginTop: 16,
    gap: 12,
  },
  feedMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E342E',
    padding: 12,
    borderRadius: 20,
  },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5D4037',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  feedAvatarText: {
    fontSize: 14,
    fontFamily: 'Nunito-ExtraBold',
    color: '#EFEBE9',
  },
  feedMiniInfo: {
    flex: 1,
  },
  feedUserName: {
    fontSize: 15,
    fontFamily: 'Nunito-ExtraBold',
    color: '#EFEBE9',
  },
  feedTime: {
    fontSize: 13,
    fontFamily: 'Nunito-ExtraBold',
    color: '#BCAAA4',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Nunito-ExtraBold',
    color: '#8A7F75',
    textAlign: 'center',
    padding: 16,
  },

  // SHADOWS (TINTED)
  shadowSoft: {
    shadowColor: '#1A0E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 4,
  },
  shadowBrown: {
    shadowColor: '#1A0E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 6,
  },
  shadowOlive: {
    shadowColor: '#1A0E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 6,
  }
});
