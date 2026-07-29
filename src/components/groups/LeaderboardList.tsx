import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Colors, typography, spacing, borderRadius, withOpacity } from '@/theme';
import { Flame } from 'lucide-react-native';

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

export type LeaderboardMember = Profile & {
  dropCount: number;
  streak: number;
};

interface LeaderboardListProps {
  members: LeaderboardMember[];
}

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return Colors.accent.gold;
    case 2:
      return '#C0C0C0'; // Silver
    case 3:
      return '#CD7F32'; // Bronze
    default:
      return Colors.dark.textSecondary;
  }
};

const LeaderboardRow = ({ member, index }: { member: LeaderboardMember; index: number }) => {
  const rank = index + 1;
  const rankColor = getRankColor(rank);
  const isTopThree = rank <= 3;

  return (
    <View style={[
      styles.rowContainer, 
      isTopThree && { backgroundColor: withOpacity(rankColor, 0.05), borderColor: withOpacity(rankColor, 0.2) }
    ]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { color: rankColor, fontWeight: isTopThree ? '700' : '500' }]}>
          #{rank}
        </Text>
      </View>
      
      <View style={styles.avatarContainer}>
        {member.avatarUrl ? (
          <Image source={{ uri: member.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {member.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.displayName} numberOfLines={1}>
          {member.displayName}
        </Text>
        <Text style={styles.dropCount}>
          {member.dropCount} {member.dropCount === 1 ? 'drop' : 'drops'}
        </Text>
      </View>
      
      {member.streak > 0 && (
        <View style={styles.streakContainer}>
          <Flame size={16} color={Colors.accent.coral} style={styles.streakIcon} />
          <Text style={styles.streakText}>{member.streak}</Text>
        </View>
      )}
    </View>
  );
};

export const LeaderboardList: React.FC<LeaderboardListProps> = ({ members }) => {
  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => <LeaderboardRow member={item} index={index} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rankContainer: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    ...typography.heading4,
    fontSize: 16,
  },
  avatarContainer: {
    marginHorizontal: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.borderBright,
  },
  avatarInitial: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: Colors.accent.mint,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.xs,
    justifyContent: 'center',
  },
  displayName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    marginBottom: 2,
  },
  dropCount: {
    ...typography.caption,
    color: Colors.dark.textSecondary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(Colors.accent.coral, 0.1),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  streakIcon: {
    marginRight: 4,
  },
  streakText: {
    ...typography.label,
    color: Colors.accent.coral,
  },
});

