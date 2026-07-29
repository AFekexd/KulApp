import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, typography, spacing, borderRadius, springConfigs, withOpacity } from '@/theme';
import { Users, ChevronRight } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface Group {
  id: string;
  name: string;
  description?: string;
}

export interface GroupCardProps {
  group: Group;
  memberCount: number;
  onPress: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, memberCount, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, springConfigs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.snappy);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <BlurView  tint="dark" style={styles.blurContainer}>
        <View style={styles.iconContainer}>
          <Users size={24} color={Colors.accent.mint} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={styles.memberCount}>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Text>
        </View>

        <View style={styles.chevronContainer}>
          <ChevronRight size={20} color={Colors.dark.textSecondary} />
        </View>
      </BlurView>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    minHeight: 80,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xxl,
    backgroundColor: withOpacity(Colors.accent.mint, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  groupName: {
    ...typography.heading4,
    marginBottom: spacing.xs,
  },
  memberCount: {
    ...typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  chevronContainer: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

