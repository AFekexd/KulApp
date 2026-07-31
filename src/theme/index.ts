/**
 * KulApp Theme — Barrel Export
 */

import { durations, springConfigs, timingConfigs, transitions } from './animations';
import { bristolColor, Colors, withOpacity } from './colors';
import { borderRadius, hitSlop, iconSize, layout, spacing } from './spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, typography } from './typography';

// Export everything as named exports
export {
  borderRadius, bristolColor, Colors, durations, fontFamily,
  fontSize,
  fontWeight, hitSlop, iconSize, layout, lineHeight, spacing, springConfigs,
  timingConfigs, transitions, typography, withOpacity
};

// Aliases for easier imports in existing components
export const colors = {
  ...Colors.light,
  ...Colors.accent,
  ...Colors.semantic,
  // Convenience shorthands
  bg: Colors.light.background,
  card: Colors.light.surface,
} as const;

export { spacing as Spacing, typography as Typography };

