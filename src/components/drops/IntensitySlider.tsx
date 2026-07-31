import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Emoji } from '@/components/ui/Emoji';
import { colors, spacing, typography, borderRadius } from '@/theme';

export type Intensity = 'light' | 'standard' | 'heavy';

export interface IntensitySliderProps {
  selected: Intensity;
  onSelect: (intensity: Intensity) => void;
}

const INTENSITY_OPTIONS = [
  { id: 'light', label: 'Light Breeze', emoji: '🌬️' },
  { id: 'standard', label: 'Standard Issue', emoji: '💩' },
  { id: 'heavy', label: 'Heavy Artillery', emoji: '💣' },
] as const;

/**
 * Horizontal segmented buttons for selecting drop intensity.
 */
export const IntensitySlider: React.FC<IntensitySliderProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={[typography.heading4, styles.title]}>Intensity</Text>
      
      <View style={styles.segmentsWrapper}>
        {INTENSITY_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          
          return (
            <AnimatedPressable
              key={option.id}
              scaleValue={0.95}
              haptic
              onPress={() => onSelect(option.id)}
              style={StyleSheet.flatten([
                styles.segment,
                isSelected ? styles.segmentSelected : styles.segmentUnselected
              ])}
            >
              <Emoji symbol={option.emoji} size={24} style={{ marginBottom: spacing.xs }} />
              <Text style={[
                typography.caption,
                styles.label,
                { color: isSelected ? colors.text : colors.textMuted }
              ]}>
                {option.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    color: colors.text,
  },
  segmentsWrapper: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  segmentUnselected: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  segmentSelected: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderColor: colors.mint,
  },
  emoji: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
  },
});


