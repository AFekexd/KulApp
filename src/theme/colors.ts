/**
 * PoopTracker Theme Colors
 * Native iOS 18 inspired - Minimal, clean, playful, light mode.
 */

const baseColors = {
  background: '#F7F7F5',
  card: '#FFFFFF',
  primary: '#7C4D2E', // Brown
  secondary: '#C89A5A', // Gold/Tan
  success: '#4CAF50',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  
  textPrimary: '#1B1B1B',
  textSecondary: '#6B6B6B',
  textMuted: '#999999',
  
  border: '#ECECEC',
  borderLight: '#F2F2F2',
};

// Size/Severity Badges
const badgeColors = {
  tiny: { bg: '#E5F1FF', text: '#0066CC' }, // Blue
  small: { bg: '#E6F4EA', text: '#137333' }, // Green
  medium: { bg: '#FFF8E1', text: '#F9A825' }, // Yellow/Orange
  large: { bg: '#FCE8E6', text: '#C5221F' }, // Red
  massive: { bg: '#F3E8FD', text: '#7B1FA2' }, // Purple
};

export const Colors = {
  light: {
    background: baseColors.background,
    surface: baseColors.card,
    surfaceElevated: baseColors.card,
    text: baseColors.textPrimary,
    textSecondary: baseColors.textSecondary,
    textMuted: baseColors.textMuted,
    border: baseColors.border,
    borderLight: baseColors.borderLight,
  },
  
  // For backwards compatibility with existing imports temporarily, 
  // map 'dark' to 'light' since this is a strictly light-mode app now
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
    mint: baseColors.success, // Aliased for legacy
    lavender: badgeColors.massive.text, // Aliased for legacy
    coral: baseColors.error, // Aliased for legacy
    sky: badgeColors.tiny.text, // Aliased for legacy
    gold: baseColors.secondary, // Aliased for legacy
    peach: badgeColors.medium.text, // Aliased for legacy
  },
  
  semantic: {
    success: baseColors.success,
    warning: baseColors.warning,
    error: baseColors.error,
    info: baseColors.info,
  },

  badges: badgeColors,

  // Bristol Scale (Light to Dark Brown)
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
 * @param hexColor Hex color string
 * @param opacity Opacity value between 0 and 1
 * @returns rgba string
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
 * @param scale Bristol scale type (1-7)
 * @returns Hex color string
 */
export const bristolColor = (scale: number): string => {
  const index = Math.max(1, Math.min(7, Math.round(scale))) - 1;
  return Colors.bristol[index];
};
