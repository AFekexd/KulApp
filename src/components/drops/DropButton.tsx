import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSpring, 
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, typography, spacing } from '@/theme';

export interface DropButtonProps {
  onPress: () => void;
  icon?: string;
}

const SIZE = 190;

export const DropButton: React.FC<DropButtonProps> = ({ 
  onPress,
  icon = '💣'
}) => {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 14, stiffness: 350 });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 350 });
    onPress();
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + (pulse.value * 0.5),
    transform: [{ scale: 1.08 + (pulse.value * 0.2) }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Dynamic Outer Aura */}
      <Animated.View style={[styles.glowLayer, animatedGlowStyle]}>
        <LinearGradient
          colors={['#FFD700', '#00FFB2', '#FF007A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fullFill}
        />
      </Animated.View>

      {/* Main Interactive Launch Trigger */}
      <Animated.View
        style={[styles.container, animatedContainerStyle]}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Drop the bomb button"
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onPointerDown={handlePressIn}
        onPointerUp={handlePressOut}
      >
        <LinearGradient
          colors={['#FFD700', '#00FFB2', '#B388FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientRing}
        >
          <View style={styles.darkCore}>
            {/* Crown Peak */}
            <View style={styles.crownBadge}>
              <Text style={styles.crownText}>👑</Text>
            </View>

            <Text style={styles.bombEmoji}>{icon}</Text>
            <Text style={styles.launchTitle}>DROP BOMB</Text>

            <LinearGradient
              colors={['#00FFB2', '#64D2FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionPill}
            >
              <Text style={styles.actionPillText}>RELEASE THE BEAST</Text>
            </LinearGradient>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: SIZE + 60,
    height: SIZE + 60,
  },
  fullFill: {
    width: '100%',
    height: '100%',
  },
  glowLayer: {
    position: 'absolute',
    width: SIZE + 16,
    height: SIZE + 16,
    borderRadius: (SIZE + 16) / 2,
    overflow: 'hidden',
    filter: Platform.OS === 'web' ? 'blur(24px)' : undefined,
  },
  container: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    zIndex: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 16,
  },
  gradientRing: {
    flex: 1,
    borderRadius: SIZE / 2,
    padding: 6,
  },
  darkCore: {
    flex: 1,
    backgroundColor: '#0F0A1C',
    borderRadius: (SIZE - 12) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  crownBadge: {
    position: 'absolute',
    top: 10,
  },
  crownText: {
    fontSize: 16,
  },
  bombEmoji: {
    fontSize: 48,
    marginTop: 8,
    marginBottom: 2,
  },
  launchTitle: {
    ...typography.heading3,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 18,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  actionPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  actionPillText: {
    ...typography.caption,
    fontSize: 8,
    fontWeight: '900',
    color: '#0B0716',
    letterSpacing: 1,
  },
});
