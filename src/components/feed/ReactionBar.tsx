import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Emoji } from '@/components/ui/Emoji';
import { colors, spacing, typography, borderRadius } from '@/theme';

export type EmojiType = '🧻' | '👑' | '☣️' | '🚒';

export interface ReactionBarProps {
  reactions: Record<EmojiType, number>;
  userReactions: EmojiType[];
  onToggle: (emoji: EmojiType) => void;
}

const REACTIONS: { emoji: EmojiType; color: string }[] = [
  { emoji: '🧻', color: colors.text },
  { emoji: '👑', color: colors.gold || '#FFD700' },
  { emoji: '☣️', color: colors.mint },
  { emoji: '🚒', color: colors.coral },
];

/**
 * Horizontal reaction bar for interacting with drops.
 */
export const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions,
  userReactions,
  onToggle
}) => {
  return (
    <View style={styles.container}>
      {REACTIONS.map(({ emoji, color }) => {
        const hasReacted = userReactions.includes(emoji);
        const count = reactions[emoji] || 0;

        return (
          <AnimatedPressable
            key={emoji}
            scaleValue={0.8}
            haptic
            onPress={() => onToggle(emoji)}
            style={StyleSheet.flatten([
              styles.button,
              hasReacted ? { backgroundColor: `${color}33`, borderColor: color } : styles.buttonInactive
            ])}
          >
            <Emoji symbol={emoji} size={18} />
            {count > 0 && (
              <Text style={[
                typography.caption,
                styles.count,
                { color: hasReacted ? color : colors.textMuted }
              ]}>
                {count}
              </Text>
            )}
          </AnimatedPressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    minWidth: 50,
    justifyContent: 'center',
  },
  buttonInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emoji: {
    fontSize: 16,
  },
  count: {
    marginLeft: spacing.xs,
    fontWeight: 'bold',
  },
});


