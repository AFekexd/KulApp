/**
 * PoopTracker Theme Typography
 * Native iOS 18 typography (SF Pro / System Default)
 */
import { Platform } from 'react-native';
import { Colors } from './colors';

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  default: 'System',
})!;

export const fontFamily = {
  heading: systemFont,
  body: systemFont,
  mono: 'monospace',
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 34,
  display: 40,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const lineHeight = {
  body: (size: number) => Math.round(size * 1.5),
  heading: (size: number) => Math.round(size * 1.2),
};

export const typography = {
  heading1: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading(fontSize.xxxl),
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  heading2: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading(fontSize.xxl),
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  heading3: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.heading(fontSize.xl),
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  heading4: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.heading(fontSize.lg),
    color: Colors.light.text,
  },
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.body(fontSize.md),
    color: Colors.light.text,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.body(fontSize.base),
    color: Colors.light.text,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.body(fontSize.sm),
    color: Colors.light.textSecondary,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.body(fontSize.xs),
    color: Colors.light.textSecondary,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.body(fontSize.sm),
    color: Colors.light.text,
  },
  button: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.body(fontSize.base),
    color: Colors.light.text,
  },
};
