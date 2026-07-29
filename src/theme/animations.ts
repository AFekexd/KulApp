/**
 * KulApp Theme Animations
 */
import { Easing } from 'react-native-reanimated';

export const springConfigs = {
  bouncy: { damping: 8, stiffness: 150 },
  snappy: { damping: 15, stiffness: 200 },
  gentle: { damping: 20, stiffness: 100 },
};

export const timingConfigs = {
  fast: { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  normal: { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  slow: { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
};

export const durations = {
  QUICK: 150,
  NORMAL: 300,
  SLOW: 500,
  SPLASH: 1000,
};

export const transitions = {
  fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
  fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
  scaleIn: { from: { transform: [{ scale: 0.9 }], opacity: 0 }, to: { transform: [{ scale: 1 }], opacity: 1 } },
  scaleOut: { from: { transform: [{ scale: 1 }], opacity: 1 }, to: { transform: [{ scale: 0.9 }], opacity: 0 } },
  slideUp: { from: { transform: [{ translateY: 20 }], opacity: 0 }, to: { transform: [{ translateY: 0 }], opacity: 1 } },
  slideDown: { from: { transform: [{ translateY: -20 }], opacity: 0 }, to: { transform: [{ translateY: 0 }], opacity: 1 } },
};
