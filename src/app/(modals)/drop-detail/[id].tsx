import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useFeedStore, FeedItem } from '@/stores/feedStore';
import { ReactionBar, EmojiType } from '@/components/feed/ReactionBar';
import { colors, Typography, Spacing, borderRadius, bristolColor } from '@/theme';

export default function DropDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const feedItems = useFeedStore((state) => state.feedItems);
  const fetchFeed = useFeedStore((state) => state.fetchFeed);
  const addReaction = useFeedStore((state) => state.addReaction);
  const removeReaction = useFeedStore((state) => state.removeReaction);
  
  const [drop, setDrop] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [userReactions, setUserReactions] = useState<EmojiType[]>([]);

  useEffect(() => {
    const loadDrop = async () => {
      setLoading(true);
      let item = feedItems.find(i => i.id === id);
      
      if (!item) {
        await fetchFeed();
        item = useFeedStore.getState().feedItems.find(i => i.id === id);
      }
      
      if (item) {
        setDrop(item);
      }
      setLoading(false);
    };

    if (id) {
      loadDrop();
    }
  }, [id, feedItems, fetchFeed]);

  const handleToggleReaction = (emoji: EmojiType) => {
    if (!drop) return;
    
    if (userReactions.includes(emoji)) {
      setUserReactions(prev => prev.filter(e => e !== emoji));
      removeReaction(drop.id, emoji);
    } else {
      setUserReactions(prev => [...prev, emoji]);
      addReaction(drop.id, emoji);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.mint} />
      </View>
    );
  }

  if (!drop) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Drop not found</Text>
      </View>
    );
  }

  const dropColor = bristolColor(drop.bristol_scale);

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.glassCard}>
        <View style={styles.header}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: dropColor }]}>
            <Text style={styles.bristolEmoji}>
              {drop.bristol_scale >= 1 && drop.bristol_scale <= 2 ? '🧱' : 
               drop.bristol_scale >= 3 && drop.bristol_scale <= 4 ? '💩' : 
               '💦'}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.username}>@{drop.profiles?.username || 'unknown'}</Text>
            <Text style={styles.timestamp}>
              {new Date(drop.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        {drop.custom_title && (
          <Text style={styles.customTitle}>"{drop.custom_title}"</Text>
        )}

        <View style={styles.reactionContainer}>
          <ReactionBar
            reactions={(drop.reactions as Record<EmojiType, number>) || {}}
            userReactions={userReactions}
            onToggle={handleToggleReaction}
          />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  glassCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  bristolEmoji: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    ...Typography.heading3,
    color: colors.text,
    fontWeight: 'bold',
  },
  timestamp: {
    ...Typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  customTitle: {
    ...Typography.heading2,
    color: colors.text,
    marginVertical: Spacing.lg,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  reactionContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: borderRadius.lg,
  },
  errorText: {
    ...Typography.bodyLarge,
    color: colors.error,
  }
});

