import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { colors, spacing, typography } from '@/theme';
import { Emoji } from '@/components/ui/Emoji';

export interface StreakCounterProps {
  /** The current streak count */
  count: number;
}

/**
 * Displays the user's current streak with animated count-up and fire emoji.
 */
export const StreakCounter: React.FC<StreakCounterProps> = ({ count }) => {
  const [displayCount, setDisplayCount] = useState(0);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  const isHot = count > 7;

  useEffect(() => {
    // Initial mount animation
    scale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 12 })
    );
    opacity.value = withTiming(1, { duration: 500 });

    // Animated count up
    let start = 0;
    const duration = 1000;
    const increment = count / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= count) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.row}>
        <Text style={[
          typography.heading1, 
          styles.number,
          isHot && { color: colors.gold || '#FFD700' }
        ]}>
          {displayCount}
        </Text>
        <Emoji symbol="🔥" size={48} style={{ marginLeft: spacing.sm }} />
      </View>
      <Text style={[typography.body, styles.label]}>day streak</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  number: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.text,
  },
  emoji: {
    fontSize: 48,
    marginLeft: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
});
