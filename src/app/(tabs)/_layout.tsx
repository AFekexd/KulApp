/**
 * Tabs Layout — PoopTracker
 * Native iOS 18 bottom tab bar with 8pt spacing system & elevated center (+) CTA button.
 */
import { Tabs, useRouter } from 'expo-router';
import { Text, View, StyleSheet, Platform, TouchableOpacity } from 'react-native';

const DESIGN_COLORS = {
  background: '#F7F7F5',
  card: '#FFFFFF',
  primary: '#7C4D2E',
  textPrimary: '#1B1B1B',
  textSecondary: '#6B6B6B',
  border: '#ECECEC',
};

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DESIGN_COLORS.card,
          borderTopWidth: 1,
          borderTopColor: DESIGN_COLORS.border,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          borderRadius: 28,
          height: 68,
          paddingBottom: 0,
          paddingHorizontal: 8,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
            },
            android: { elevation: 8 },
            web: { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' },
          }),
        },
        tabBarShowLabel: false,
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
              <Text style={[styles.tabIcon, focused && styles.activeTabIcon]}>🏠</Text>
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
              <Text style={[styles.tabIcon, focused && styles.activeTabIcon]}>📍</Text>
              <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>Reports</Text>
            </View>
          ),
        }}
      />

      {/* 3. CENTER (+) QUICK DROP REPORT CTA BUTTON */}
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarButton: () => (
            <TouchableOpacity
              style={styles.centerBtnContainer}
              activeOpacity={0.85}
              onPress={() => router.push('/(modals)/quick-drop')}
            >
              <View style={styles.centerBtnCircle}>
                <Text style={styles.centerBtnPlus}>+</Text>
              </View>
              <Text style={styles.centerBtnLabel}>Report</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* 4. LEADERBOARD TAB */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Text style={[styles.tabIcon, focused && styles.activeTabIcon]}>🏆</Text>
              <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>Leaderboard</Text>
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
              <Text style={[styles.tabIcon, focused && styles.activeTabIcon]}>👤</Text>
              <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>Profile</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 6,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
  },
  activeTabLabel: {
    color: DESIGN_COLORS.primary,
    fontWeight: '800',
  },

  // ELEVATED CENTER CTA (+) BUTTON
  centerBtnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerBtnCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: DESIGN_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: DESIGN_COLORS.card,
    ...Platform.select({
      ios: {
        shadowColor: DESIGN_COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 4px 14px rgba(124, 77, 46, 0.35)' },
    }),
  },
  centerBtnPlus: {
    fontSize: 30,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: -2,
  },
  centerBtnLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: DESIGN_COLORS.primary,
    marginTop: 2,
  },
});
