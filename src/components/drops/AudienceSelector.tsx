import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, typography, borderRadius } from '@/theme';

export type PrivacyLevel = 'private' | 'friends' | 'group';

export interface Group {
  id: string;
  name: string;
}

export interface AudienceSelectorProps {
  selected: PrivacyLevel;
  onSelect: (level: PrivacyLevel) => void;
  groups?: Group[];
  selectedGroupId?: string;
  onGroupSelect?: (id: string) => void;
}

const PRIVACY_OPTIONS = [
  { id: 'private', label: 'Private', icon: '🔒', baseColor: colors.textMuted },
  { id: 'friends', label: 'Friends', icon: '👥', baseColor: colors.mint },
  { id: 'group', label: 'Group', icon: '🏠', baseColor: colors.lavender },
] as const;

/**
 * Audience selector for privacy settings of a drop.
 * Expands to show groups when "Group" is selected.
 */
export const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  selected,
  onSelect,
  groups = [],
  selectedGroupId,
  onGroupSelect
}) => {
  return (
    <View style={styles.container}>
      <Text style={[typography.heading4, styles.title]}>Audience</Text>
      
      <View style={styles.pillWrapper}>
        {PRIVACY_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          
          return (
            <AnimatedPressable
              key={option.id}
              scaleValue={0.95}
              haptic
              onPress={() => onSelect(option.id)}
              style={StyleSheet.flatten([
                styles.pill,
                isSelected 
                  ? { backgroundColor: option.baseColor, borderColor: option.baseColor }
                  : { backgroundColor: 'transparent', borderColor: 'rgba(0,0,0,0.05)' }
              ])}
            >
              <Text style={styles.icon}>{option.icon}</Text>
              <Text style={[
                typography.body,
                styles.label,
                { color: isSelected ? colors.background : colors.text }
              ]}>
                {option.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {/* Group Selector Dropdown / Picker representation */}
      {selected === 'group' && groups.length > 0 && (
        <View style={styles.groupsContainer}>
          {groups.map((group) => (
            <AnimatedPressable
              key={group.id}
              scaleValue={0.98}
              onPress={() => onGroupSelect && onGroupSelect(group.id)}
              style={StyleSheet.flatten([
                styles.groupItem,
                selectedGroupId === group.id ? styles.groupItemSelected : {}
              ])}
            >
              <Text style={[
                typography.body,
                { color: selectedGroupId === group.id ? colors.lavender : colors.text }
              ]}>
                {group.name}
              </Text>
              {selectedGroupId === group.id && (
                <Text style={{ color: colors.lavender }}>✓</Text>
              )}
            </AnimatedPressable>
          ))}
        </View>
      )}
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
  pillWrapper: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: spacing.xs,
    fontSize: 14,
  },
  label: {
    fontWeight: 'bold',
  },
  groupsContainer: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  groupItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});


