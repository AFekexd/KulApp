/**
 * Tabs Layout — KulAPP
 * High-fidelity, floating glassmorphism tab bar with a prominent FAB.
 * Completely rewritten with a Custom Tab Bar for pixel-perfect overflow and positioning.
 */
import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import { Home, Plus, Rss, User, Users } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

// Custom Tab Bar Component for 100% control over layout, overflowing FAB, and blur effects
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Define our visible tabs in order. 'spacer' leaves room for the absolute FAB.
  const tabs = [
    { name: 'index', icon: Home, label: 'Home' },
    { name: 'feed', icon: Rss, label: 'Feed' },
    { name: 'spacer' },
    { name: 'group', icon: Users, label: 'Group' },
    { name: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <View style={[styles.tabBarContainer, { bottom: Math.max(insets.bottom, 0) }]}>
      {/* 
        Background Layer: 
        This is separated so we can apply overflow: 'hidden' for the blur/background 
        borderRadius clipping, while keeping the parent overflow: 'visible' for the FAB.
      */}
      <View style={styles.backgroundLayer}>
        {Platform.OS === 'ios' ? (
          <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFillObject} />
        ) : undefined}
      </View>

      {/* Navigation Items */}
      <View style={styles.tabBarInner}>
        {tabs.map((tab, index) => {
          if (tab.name === 'spacer') {
            return <View key="spacer" style={styles.spacer} />;
          }

          // Find the actual route index from React Navigation state
          const routeIndex = state.routes.findIndex((r: any) => r.name === tab.name);
          if (routeIndex === -1) return null; // Fallback if route is missing

          const isFocused = state.index === routeIndex;
          const route = state.routes[routeIndex];
          const Icon = tab.icon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={tab.name}
              onPress={onPress}
              style={styles.tabButton}
            >
              <Icon
                size={22}
                color={isFocused ? DESIGN_COLORS.primary : DESIGN_COLORS.textSecondary}
                style={[styles.icon, isFocused && styles.activeIcon]}
              />
              <Text style={[styles.tabLabel, isFocused && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/(modals)/quick-drop')}
        style={styles.fabContainer}
      >
        <View style={styles.fabInner}>
          <Plus size={30} color="#FFFFFF" strokeWidth={3} style={{ marginTop: 2 }} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: DESIGN_COLORS.background },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="group" />
      <Tabs.Screen name="profile" />
      {/* Hidden Screens */}
      <Tabs.Screen name="report" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    alignSelf: 'center',
    width: '96%',
    maxWidth: 420,
    height: 60,
    zIndex: 100,
    // CRITICAL: Must be visible so the FAB can pop out of the top
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: { elevation: 16 },
      web: { boxShadow: '0 10px 30px rgba(0, 0, 0, 0)' },
    }),
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    overflow: 'hidden', // Clips the blur view perfectly
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(45, 27, 21, 0.92)',
  },
  tabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  spacer: {
    width: 72, // Matches the width of the FAB + borders to create a nice gap
  },
  icon: {
    marginBottom: 4,
  },
  activeIcon: {
    transform: [{ scale: 1.15 }],
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: DESIGN_COLORS.textSecondary,
  },
  activeTabLabel: {
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.primary,
  },

  // FAB Styles
  fabContainer: {
    position: 'absolute',
    top: -10, // Pops out exactly by this amount
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    // The cut-out effect: Thick border matching the background behind the tab bar
    borderWidth: 6,
    borderColor: DESIGN_COLORS.background,
    backgroundColor: DESIGN_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: DESIGN_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: DESIGN_COLORS.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 6px 12px rgba(169,92,51,0.6)' },
    }),
  },
});
