/**
 * PoopTracker Theme — Barrel Export
 */

import { Colors, withOpacity, bristolColor } from './colors';
import { spacing, borderRadius, iconSize, hitSlop, layout } from './spacing';
import { typography, fontFamily, fontSize, fontWeight, lineHeight } from './typography';
import { transitions, springConfigs, timingConfigs, durations } from './animations';

// Export everything as named exports
export {
  Colors,
  withOpacity,
  bristolColor,
  
  spacing,
  borderRadius,
  iconSize,
  hitSlop,
  layout,
  
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  
  transitions,
  springConfigs,
  timingConfigs,
  durations,
};

// Aliases for easier imports in existing components
export const colors = {
  ...Colors.light,
  ...Colors.accent,
  ...Colors.semantic,
} as const;

export { typography as Typography };
export { spacing as Spacing };
