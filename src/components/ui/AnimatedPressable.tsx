import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export interface AnimatedPressableProps extends PressableProps {
  /** The value to scale down to on press */
  scaleValue?: number;
  /** Children can be React elements */
  children: React.ReactNode;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Haptic feedback style */
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  /** Optional style wrapper */
  style?: ViewStyle;
}

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

/**
 * A generic wrapper for Pressable that adds spring scale animation and optional haptics.
 */
export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  scaleValue = 0.97,
  children,
  haptic = false,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  onPressIn,
  onPressOut,
  style,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleValue, { damping: 15, stiffness: 300 });
    if (haptic) {
      Haptics.impactAsync(hapticStyle);
    }
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    if (onPressOut) onPressOut(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableComponent
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressableComponent>
  );
};
