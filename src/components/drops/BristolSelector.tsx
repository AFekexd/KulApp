import React from 'react';
import { StyleSheet, Text, ScrollView, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Emoji } from '@/components/ui/Emoji';
import { colors, spacing, typography, borderRadius } from '@/theme';

export type BristolScale = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface BristolSelectorProps {
  selected: BristolScale;
  onSelect: (scale: BristolScale) => void;
}

const BRISTOL_TYPES = [
  { scale: 1, emoji: '🏐', name: 'The Pebbles', color: '#8B4513' }, // Brown shades or theme colors
  { scale: 2, emoji: '🥜', name: 'The Cluster', color: '#A0522D' },
  { scale: 3, emoji: '🌭', name: 'The Hot Dog', color: '#CD853F' },
  { scale: 4, emoji: '🐍', name: 'The Snake', color: '#DAA520' },
  { scale: 5, emoji: '💧', name: 'The Blob', color: '#F4A460' },
  { scale: 6, emoji: '☁️', name: 'The Cloud', color: '#D2B48C' },
  { scale: 7, emoji: '🌊', name: 'The Tsunami', color: '#BC8F8F' },
];

/**
 * Scrollable selector for the 7 Bristol scale types.
 */
export const BristolSelector: React.FC<BristolSelectorProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={[typography.heading4, styles.title]}>Classification</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BRISTOL_TYPES.map((type) => {
          const isSelected = selected === type.scale;
          
          return (
            <AnimatedPressable
              key={type.scale}
              scaleValue={0.9}
              haptic
              onPress={() => onSelect(type.scale as BristolScale)}
              style={StyleSheet.flatten([
                styles.itemContainer,
                isSelected ? styles.itemSelected : styles.itemUnselected,
                isSelected ? { borderColor: colors.mint, backgroundColor: 'rgba(0,0,0,0.05)' } : undefined
              ])}
            >
              <Emoji symbol={type.emoji} size={28} style={{ marginBottom: spacing.xs }} />
              <Text style={[
                typography.caption, 
                styles.name,
                { color: isSelected ? colors.text : colors.textMuted }
              ]} numberOfLines={1}>
                {type.name}
              </Text>
              <Text style={[typography.caption, styles.scaleNumber, { color: type.color }]}>
                Type {type.scale}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  itemContainer: {
    width: 90,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    padding: spacing.sm,
  },
  itemUnselected: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  itemSelected: {
    // Border color applied dynamically
  },
  emoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  name: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scaleNumber: {
    textAlign: 'center',
    marginTop: 2,
  },
});


