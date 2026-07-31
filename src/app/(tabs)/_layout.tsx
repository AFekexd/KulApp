/**
 * Tabs Layout — KulAPP
 * High-fidelity, floating glassmorphism tab bar with a prominent FAB.
 */
import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import { Home, Rss, User, Users } from 'lucide-react-native';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DESIGN_COLORS = {
  background: '#2D1B15',
  card: '#3E2723',
  primary: '#EFEBE9',
  accent: '#A95C33',
  accentSurface: '#4E342E',
  primarySurface: '#3E2723',
  success: '#33691E',
  textPrimary: '#EFEBE9',
  textSecondary: '#BCAAA4',
  border: '#5D4037',
};



export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom > 0 ? insets.bottom : 12,
          left: '2%',
          right: '2%',
          borderRadius: 40,
          height: 72,
          borderTopWidth: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(45, 27, 21, 0.7)',
          paddingBottom: 0,
          paddingHorizontal: 16,
          ...Platform.select({
            ios: {
              shadowColor: '#1A0E0B',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            },
            android: { elevation: 12 },
            web: {
              boxShadow: '0 10px 20px rgba(26, 14, 11, 0.15)',
              backdropFilter: 'blur(24px)',
            },
          }),
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={70} style={{ flex: 1, borderRadius: 40, overflow: 'hidden' }} />
          ) : undefined
        ),
        tabBarShowLabel: false,
        tabBarItemStyle: { paddingVertical: 0, justifyContent: 'center' },
        sceneStyle: { backgroundColor: DESIGN_COLORS.background },
      }}
    >

      {/* 1. HOME TAB */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Home
                size={22}
                color={focused ? DESIGN_COLORS.primary : DESIGN_COLORS.textSecondary}
                style={[styles.tabIcon, focused && styles.activeTabIcon]}
              />
              <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>Home</Text>
            </View>
          ),
        }}
      />

      {/* 2. REPORTS FEED TAB */}
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Reports',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Rss
                size={22}
                color={focused ? DESIGN_COLORS.primary : DESIGN_COLORS.textSecondary}
                style={[styles.tabIcon, focused && styles.activeTabIcon]}
              />
              <Text style={[styles.tabLabel, focused && styles.activeTabLabel]} numberOfLines={1}>Feed</Text>
            </View>
          ),
        }}
      />

      {/* 3. CENTER (+) QUICK DROP REPORT CTA BUTTON */}
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarButton: (props) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/(modals)/quick-drop')}
              style={[props.style, styles.centerBtnContainer]}
            >
              <View style={styles.centerBtnCircle}>
                <Text style={styles.centerBtnPlus}>+</Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* 4. SOCIAL TAB — Friends & Groups */}
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Users
                size={22}
                color={focused ? DESIGN_COLORS.primary : DESIGN_COLORS.textSecondary}
                style={[styles.tabIcon, focused && styles.activeTabIcon]}
              />
              <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>Social</Text>
            </View>
          ),
        }}
      />

      {/* 5. PROFILE TAB */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <User
                size={22}
                color={focused ? DESIGN_COLORS.primary : DESIGN_COLORS.textSecondary}
                style={[styles.tabIcon, focused && styles.activeTabIcon]}
              />
              <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>Profile</Text>
            </View>
          ),
        }}
      />

      {/* Hidden: Stats/Leaderboard (accessible via navigation but not in tab bar) */}
      <Tabs.Screen
        name="stats"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIcon: {
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: DESIGN_COLORS.textSecondary,
  },
  activeTabLabel: {
    color: DESIGN_COLORS.primary,
    fontFamily: 'Nunito-ExtraBold',
  },

  centerBtnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBtnCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: DESIGN_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#2D1B15',
    ...Platform.select({
      ios: {
        shadowColor: DESIGN_COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
      web: { boxShadow: '0 0 16px rgba(169, 92, 51, 0.6)' },
    }),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },

  centerBtnPlus: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFFFFF',
    marginTop: -2,
  },
});
