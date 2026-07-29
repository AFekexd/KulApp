/**
 * KulApp Theme Colors
 * Warm, bespoke, consumer-grade brand palette.
 * Primary: Rich warm brown. Accent: Vibrant orange. Background: Soft cream.
 */

const baseColors = {
  // Core brand
  background: '#2D1B15',       // Deep espresso — main screen bg
  card: '#3E2723',             // Dark brown cards
  cardWarm: '#4E342E',         // Lighter dark brown for alt surfaces

  // Brand primaries
  primary: '#8D6E63',          // Light mud — buttons & highlights
  primaryLight: '#A1887F',     // Lighter mud for hover states
  primarySurface: '#5D4037',   // Deep brown tint for bg highlights

  // Accent
  accent: '#A95C33',           // Dark bronze/rust — CTAs, highlights
  accentLight: '#C36E40',      // Lighter bronze for gradients
  accentSurface: '#4E342E',    // Dark orange-brown surface

  // Secondary
  secondary: '#8D6E63',        // Taupe/mud — secondary elements

  // Semantic
  success: '#33691E',          // Dark swamp green
  error: '#BF360C',            // Deep rust red
  warning: '#F57F17',          // Muddy mustard
  info: '#3E2723',

  // Text
  textPrimary: '#EFEBE9',      // Off-white/light mud — primary text
  textSecondary: '#BCAAA4',    // Muted mud — secondary text
  textMuted: '#8D6E63',        // Darker mud — captions

  // Borders
  border: '#5D4037',           // Dark brown border
  borderLight: '#4E342E',      // Lighter dark brown border
};

// Size/Severity Badges — kept readable with warm palette
const badgeColors = {
  tiny:    { bg: '#E5F1FF', text: '#1A5FA8' },
  small:   { bg: '#E4F4EA', text: '#1A7A3B' },
  medium:  { bg: '#FFF3E0', text: '#B85C00' },
  large:   { bg: '#FCE8E6', text: '#C0271B' },
  massive: { bg: '#F3E8FD', text: '#7219A0' },
};

export const Colors = {
  light: {
    background: baseColors.background,
    surface: baseColors.card,
    surfaceElevated: baseColors.card,
    surfaceWarm: baseColors.cardWarm,
    text: baseColors.textPrimary,
    textSecondary: baseColors.textSecondary,
    textMuted: baseColors.textMuted,
    border: baseColors.border,
    borderLight: baseColors.borderLight,
  },

  // Map dark → light (strictly light-mode app)
  dark: {
    background: baseColors.background,
    surface: baseColors.card,
    surfaceElevated: baseColors.card,
    surfaceBright: baseColors.card,
    text: baseColors.textPrimary,
    textSecondary: baseColors.textSecondary,
    textMuted: baseColors.textMuted,
    border: baseColors.border,
    borderBright: baseColors.border,
  },

  accent: {
    primary: baseColors.primary,
    secondary: baseColors.secondary,
    accent: baseColors.accent,
    accentLight: baseColors.accentLight,
    mint: baseColors.success,
    lavender: badgeColors.massive.text,
    coral: baseColors.error,
    sky: badgeColors.tiny.text,
    gold: baseColors.secondary,
    peach: baseColors.warning,
  },

  semantic: {
    success: baseColors.success,
    warning: baseColors.warning,
    error: baseColors.error,
    info: baseColors.info,
  },

  badges: badgeColors,

  // Bristol Scale (warm light to dark browns)
  bristol: [
    '#D7CCC8', // 1
    '#BCAAA4', // 2
    '#A1887F', // 3
    '#8D6E63', // 4
    '#795548', // 5
    '#5D4037', // 6
    '#3E2723', // 7
  ],
};

/**
 * Adds opacity to a hex color
 */
export const withOpacity = (hexColor: string, opacity: number): string => {
  if (hexColor.startsWith('rgba')) return hexColor;

  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Gets the color for a Bristol scale type
 */
export const bristolColor = (scale: number): string => {
  const index = Math.max(1, Math.min(7, Math.round(scale))) - 1;
  return Colors.bristol[index];
};
