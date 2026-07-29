import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

export interface BadgeProps {
  /** The text label to display inside the badge */
  label: string;
  /** The accent color of the badge */
  color?: string;
  /** Size of the badge */
  size?: 'sm' | 'md';
  /** Emoji or string icon to prepend to label */
  icon?: string;
  /** Container styles override */
  style?: ViewStyle;
}

/**
 * A small pill component for showing tags, status, or types.
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  color = colors.mint,
  size = 'sm',
  icon,
  style,
}) => {
  // Convert hex/rgb to rgba for 20% opacity background if needed.
  // We'll use a hack to add opacity if it's hex, otherwise rely on default background.
  const isHex = color.startsWith('#');
  const bgColor = isHex ? `${color}33` : 'rgba(255,255,255,0.1)';

  return (
    <View style={[
      styles.container, 
      { backgroundColor: bgColor },
      size === 'sm' ? styles.smPadding : styles.mdPadding,
      style
    ]}>
      {icon && <Text style={[styles.icon, size === 'sm' ? typography.caption : typography.body]}>{icon}</Text>}
      <Text style={[
        styles.text, 
        size === 'sm' ? typography.caption : typography.body,
        { color }
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  smPadding: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  mdPadding: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
  icon: {
    marginRight: spacing.xs,
  },
});
