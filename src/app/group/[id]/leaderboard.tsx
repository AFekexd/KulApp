import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useGroups } from '@/hooks/useGroups';
import { LeaderboardList, LeaderboardMember } from '@/components/groups/LeaderboardList';
import { Colors, typography, spacing } from '@/theme';

export default function LeaderboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { members, fetchGroupMembers, isLoading } = useGroups();
  
  useEffect(() => {
    if (id) {
      fetchGroupMembers(id);
    }
  }, [id, fetchGroupMembers]);

  const groupMembers = members[id] || [];

  const data: LeaderboardMember[] = useMemo(() => {
    // Ideally we would fetch stats. For now, let's just create a dummy score based on their profile or randomize if we just have members
    const mapped = groupMembers.map((member: any) => ({
      id: member.id,
      displayName: member.display_name || member.username || 'Unknown',
      avatarUrl: member.avatar_url || undefined,
      dropCount: member.total_drops || Math.floor(Math.random() * 50) + 1, // Placeholder
      streak: Math.floor(Math.random() * 5), // Placeholder
    }));
    
    // Sort descending by score
    mapped.sort((a, b) => b.dropCount - a.dropCount);
    
    // Assign ranks (LeaderboardList handles rank natively by index, but we can return it)
    return mapped;
  }, [groupMembers]);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: 'Leaderboard',
          presentation: 'modal',
        }} 
      />
      
      {isLoading && groupMembers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.mint} />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No members found.</Text>
        </View>
      ) : (
        <LeaderboardList members={data} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: Colors.dark.textMuted,
  },
});
