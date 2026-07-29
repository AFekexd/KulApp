import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useGroups } from '@/hooks/useGroups';
import { useFeed } from '@/hooks/useFeed';
import { DropCard, FeedItem as DropCardFeedItem } from '@/components/drops/DropCard';
import { Button } from '@/components/ui/Button';
import { Colors, typography, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { FeedItem } from '@/stores/feedStore';
import { EmojiType } from '@/components/feed/ReactionBar';

export default function GroupFeedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { groups, fetchUserGroups } = useGroups();
  const { feedItems, isLoading, refreshFeed, addReaction, removeReaction } = useFeed();

  // Find the current group details
  const group = useMemo(() => groups.find((g) => g.id === id), [groups, id]);

  useEffect(() => {
    if (!group) {
      fetchUserGroups();
    }
  }, [group, fetchUserGroups]);

  // Map FeedItem to DropCardFeedItem format
  const mappedFeedItems: DropCardFeedItem[] = useMemo(() => {
    return feedItems.map((item: FeedItem) => {
      let bristolName = 'Normal';
      let bristolEmoji = '💩';
      
      switch(item.bristol_scale) {
        case 1: bristolName = 'Hard Lumps'; bristolEmoji = '🪨'; break;
        case 2: bristolName = 'Lumpy'; bristolEmoji = '🌭'; break;
        case 3: bristolName = 'Cracked'; bristolEmoji = '🌽'; break;
        case 4: bristolName = 'Smooth'; bristolEmoji = '🐍'; break;
        case 5: bristolName = 'Soft Blobs'; bristolEmoji = '☁️'; break;
        case 6: bristolName = 'Mushy'; bristolEmoji = '🥣'; break;
        case 7: bristolName = 'Liquid'; bristolEmoji = '💦'; break;
      }

      let intensityName = 'Regular';
      if (item.intensity > 80) intensityName = 'Heavy Artillery';
      else if (item.intensity > 50) intensityName = 'Solid Effort';
      else if (item.intensity < 20) intensityName = 'Light Duty';

      // Mock relative time
      const date = new Date(item.created_at);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let timestamp = `${diffMins}m ago`;
      if (diffMins > 60) {
        timestamp = `${Math.floor(diffMins / 60)}h ago`;
      }
      if (diffMins > 1440) {
        timestamp = `${Math.floor(diffMins / 1440)}d ago`;
      }

      // Convert server reactions object to string keys if needed
      const reactions = item.reactions || {};
      
      return {
        id: item.id,
        user_name: item.profiles?.username || 'Unknown User',
        avatar_url: item.profiles?.avatar_url || undefined,
        timestamp,
        bristol_scale: item.bristol_scale,
        bristol_emoji: bristolEmoji,
        bristol_name: bristolName,
        intensity: intensityName,
        title: item.custom_title || undefined,
        reactions: reactions as any,
        user_reactions: [], // Ideally map this from logged-in user's reactions
      };
    });
  }, [feedItems]);

  const handleReact = (dropId: string, emoji: EmojiType) => {
    const item = feedItems.find(i => i.id === dropId);
    if (!item) return;
    
    // Toggle logic: if user already reacted, remove it. Else add it.
    // Assuming you can add reactions freely for now based on the store method.
    addReaction(dropId, emoji);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={[typography.heading2, styles.groupName]}>
        {group?.name || 'Loading Group...'}
      </Text>
      <Text style={[typography.body, styles.groupDescription]}>
        See what your friends are dropping
      </Text>
      
      <Button
        title="View Leaderboard"
        onPress={() => router.push(`/group/${id}/leaderboard` as any)}
        variant="primary"
        style={styles.leaderboardButton}
        icon={<Ionicons name="trophy-outline" size={20} color={Colors.dark.background} />}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerTitle: group?.name || 'Group',
        }} 
      />
      
      {isLoading && feedItems.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.mint} />
        </View>
      ) : (
        <FlatList
          data={mappedFeedItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DropCard item={item} onReact={handleReact} />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          onRefresh={refreshFeed}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No drops yet in this group.</Text>
            </View>
          }
        />
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
  headerContainer: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: Colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    marginBottom: spacing.md,
  },
  groupName: {
    color: Colors.dark.text,
    marginBottom: spacing.xs,
  },
  groupDescription: {
    color: Colors.dark.textSecondary,
    marginBottom: spacing.lg,
  },
  leaderboardButton: {
    width: '100%',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: Colors.dark.textMuted,
    textAlign: 'center',
  },
});
