import React from 'react';
import { StyleSheet, Text, ActivityIndicator, Pressable, PressableProps, ViewStyle, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, spacing, typography, borderRadius } from '@/theme';

export interface ButtonProps extends PressableProps {
  /** Button text label */
  title: string;
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Shows loading indicator and disables press */
  loading?: boolean;
  /** Optional icon to render alongside text */
  icon?: React.ReactNode;
  /** Whether the button should take full width of container */
  fullWidth?: boolean;
  /** Optional style override for container */
  style?: ViewStyle;
}

/**
 * Clean, flat button component for iOS 18 style.
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.lg, // 16px
      paddingHorizontal: size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg,
      paddingVertical: size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md,
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: Colors.light.background,
          borderWidth: 1,
          borderColor: Colors.light.border,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#FFF0F0',
          borderWidth: 1,
          borderColor: '#FFD1D1',
        };
      case 'primary':
      default:
        return {
          ...baseStyle,
          backgroundColor: Colors.accent.primary,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.light.textMuted;
    switch (variant) {
      case 'secondary':
      case 'ghost':
        return Colors.light.text;
      case 'danger':
        return Colors.semantic.error;
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" style={styles.iconSpacing} />
      ) : icon ? (
        <Animated.View style={styles.iconSpacing}>{icon}</Animated.View>
      ) : null}
      <Text style={[styles.text, typography.button, { color: getTextColor() }]}>
        {title}
      </Text>
    </>
  );

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={disabled || loading ? undefined : onPress}
        style={getContainerStyle()}
        disabled={disabled || loading}
        {...rest}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
  iconSpacing: {
    marginRight: spacing.sm,
  },
});
