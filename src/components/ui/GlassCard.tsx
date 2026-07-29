import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { Colors, spacing, borderRadius } from '@/theme';

export interface CardProps {
  /** Card contents */
  children: React.ReactNode;
  /** Optional styles for the card container */
  style?: ViewStyle;
  /** Whether to apply default padding */
  padding?: boolean;
}

/**
 * Clean, flat card component with subtle shadow for iOS 18 style.
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = true,
}) => {
  return (
    <View
      style={[
        styles.container,
        padding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Export GlassCard as an alias so existing imports don't break immediately
export const GlassCard = Card;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  padding: {
    padding: spacing.lg,
  },
});
