/**
 * Home Screen — KulAPP
 * Designed like an experienced Figma product designer built it for native iOS 18.
 * Minimal, clean, playful, light mode, 8pt spacing system, flat design.
 * Fully interactive and state-reactive with clean empty states.
 */
import PageTransition from '@/components/PageTransition';
import { useAuthStore } from '@/stores/authStore';
import { useDropStore } from '@/stores/dropStore';
import { useFeedStore } from '@/stores/feedStore';
import { useLeaderboardStore } from '@/stores/leaderboardStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Emoji } from '@/components/ui/Emoji';

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

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();
  const { topUsers, fetchLeaderboard } = useLeaderboardStore();
  const { feedItems, toggleUpvote, fetchFeed } = useFeedStore();
  const { todayCount, currentStreak, drops, loadLocalState } = useDropStore();
  const { profile } = useAuthStore();

  const userDisplayName = profile?.display_name || profile?.username || 'User';
  const userHandle = profile?.username || 'user';
  const userInitials = userDisplayName.slice(0, 2).toUpperCase();

  // Animation values
  const floatValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  React.useEffect(() => {
    fetchFeed();
    fetchLeaderboard();
    loadLocalState();

    // Start continuous floating animation
    floatValue.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite
      true // Reverse
    );

    // Start a subtle breathing/scaling animation
    scaleValue.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPetStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatValue.value },
        { scale: scaleValue.value }
      ],
    };
  });

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
    <PageTransition>
      <View style={styles.screenOuter}>
        {/* Animated Background */}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#2D1B15' }]} />

        {/* Floating Background Particles */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: 0.1, transform: [{ scale: 1.5 }] },
            useAnimatedStyle(() => ({
              transform: [
                { translateY: floatValue.value * 2 },
                { rotate: `${floatValue.value * 0.5}deg` }
              ]
            }))
          ]}
        >
          <Emoji symbol="💨" size={40} style={{ position: 'absolute', top: '10%', left: '10%' }} />
          <Emoji symbol="🧻" size={60} style={{ position: 'absolute', top: '30%', right: '20%' }} />
          <Emoji symbol="💩" size={50} style={{ position: 'absolute', top: '60%', left: '15%' }} />
          <Emoji symbol="🚽" size={80} style={{ position: 'absolute', bottom: '15%', right: '10%' }} />
        </Animated.View>

        <SafeAreaView style={styles.container} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* FLOATING HEADER */}
            <View style={styles.floatingHeader}>
              <View style={styles.floatingTitleGroup}>
                <Text style={styles.appTitle}>💩 KulAPP</Text>
                <Text style={styles.appSubtitle}>Ready to drop one?</Text>
              </View>
              <TouchableOpacity
                style={styles.floatingProfileBtn}
                onPress={() => router.push('/profile')}
              >
                <Emoji symbol="🧻" size={22} />
              </TouchableOpacity>
            </View>

            {/* WIDGET GRID (2-COLUMN) */}
            <View style={styles.widgetGrid}>

              {/* WIDGET 1: 1x1 Square Stats */}
              <View style={[styles.widget1x1, styles.widgetBrown, styles.shadowBrown, styles.whiteBorder]}>
                <Emoji symbol={todayCount > 0 ? '💩' : '🚽'} size={54} style={{ marginBottom: 8 }} />
                <Text style={[styles.widgetNumber, styles.whiteText]}>{todayCount}</Text>
                <Text style={[styles.widgetLabel, styles.whiteText]}>Drops Today</Text>
              </View>

              {/* WIDGET 2: 1x1 Square Rank */}
              <View style={[styles.widget1x1, styles.widgetOlive, styles.shadowOlive, styles.whiteBorder]}>
                <Emoji symbol="🏅" size={54} style={{ marginBottom: 8 }} />
                <Text style={[styles.widgetNumber, styles.whiteText]}>{totalLoggedCount > 0 ? '#1' : '-'}</Text>
                <Text style={[styles.widgetLabel, styles.whiteText]}>Local Rank</Text>
              </View>

              {/* WIDGET 3: 2x2 Large Pet Centerpiece */}
              <View style={[styles.widget2x2, styles.shadowSoft, styles.whiteBorder, { backgroundColor: '#3E2723', overflow: 'hidden' }]}>
                <View style={styles.levelWidgetHeader}>
                  <Text style={[styles.widgetTitle, { color: '#EFEBE9' }]}>Your Log</Text>
                  <View style={styles.levelPill}>
                    <Text style={[styles.levelPillText, { color: '#EFEBE9' }]}>Lvl {currentLevel}</Text>
                  </View>
                </View>

                <Animated.View style={[styles.petContainer, animatedPetStyle]}>
                  <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                    <Emoji symbol="💩" size={140} style={{
                      ...Platform.select({
                        ios: { shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 10 }, shadowRadius: 10, shadowOpacity: 1 },
                        web: { filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.1))' } as any,
                      })
                    }} />

                    {/* Level 2: Sunglasses */}
                    {currentLevel === 2 && (
                      <Emoji symbol="🕶️" size={130} style={{ position: 'absolute', top: '15%', zIndex: 10 }} />
                    )}

                    {/* Level 3: Top Hat */}
                    {currentLevel === 3 && (
                      <Emoji symbol="🎩" size={75} style={{ position: 'absolute', top: '-10%', left: '10%', zIndex: 10, transform: [{ rotate: '-15deg' }] }} />
                    )}

                    {/* Level 4+: Crown (or Troll hair) */}
                    {currentLevel >= 4 && (
                      <Emoji symbol="👑" size={80} style={{ position: 'absolute', top: '-6%', zIndex: 10 }} />
                    )}
                  </View>
                </Animated.View>

                {/* Interactive Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#5D4037' }, styles.whiteBorder]}>
                    <Emoji symbol="🌽" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4E342E' }, styles.whiteBorder]}>
                    <Emoji symbol="🥜" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6D4C41' }, styles.whiteBorder]}>
                    <Emoji symbol="🪠" size={20} />
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
                      <View style={[styles.feedAvatar, !item.profiles?.avatar_url && { backgroundColor: '#5D4037' }]}>
                        {item.profiles?.avatar_url ? (
                          <Image source={{ uri: item.profiles.avatar_url }} style={styles.feedAvatarImage} contentFit="cover" />
                        ) : (
                          <Text style={styles.feedAvatarText}>{item.profiles.username.charAt(0).toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={styles.feedMiniInfo}>
                        <Text style={styles.feedUserName}>{item.profiles.username}</Text>
                        <Text style={styles.feedTime}>{formatTimeAgo(item.created_at)}</Text>
                      </View>
                      <Emoji symbol="💨" size={18} />
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
      </View>
    </PageTransition>
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 8px 16px rgba(0,0,0,0.15)' },
    }),
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
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 10 },
        textShadowRadius: 10,
      },
      web: { textShadow: '0px 10px 10px rgba(0,0,0,0.1)' },
    }),
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
  feedAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    ...Platform.select({
      ios: {
        shadowColor: '#1A0E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 25,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 10px 25px rgba(26,14,11,0.8)' },
    }),
  },
  shadowBrown: {
    ...Platform.select({
      ios: {
        shadowColor: '#1A0E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 25,
      },
      android: { elevation: 6 },
      web: { boxShadow: '0 10px 25px rgba(26,14,11,0.8)' },
    }),
  },
  shadowOlive: {
    ...Platform.select({
      ios: {
        shadowColor: '#1A0E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 25,
      },
      android: { elevation: 6 },
      web: { boxShadow: '0 10px 25px rgba(26,14,11,0.8)' },
    }),
  }
});
