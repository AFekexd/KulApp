import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { ReactionBar } from '@/components/feed/ReactionBar';
import { EmojiType } from '@/components/feed/ReactionBar';
import { colors, spacing, typography, borderRadius } from '@/theme';

export interface FeedItem {
  id: string;
  user_name: string;
  avatar_url?: string;
  timestamp: string; // e.g. '5m ago'
  bristol_scale: number;
  bristol_emoji: string;
  bristol_name: string;
  intensity: string;
  title?: string;
  photo_url?: string;
  reactions: Record<EmojiType, number>;
  user_reactions: EmojiType[];
}

export interface DropCardProps {
  item: FeedItem;
  onReact: (dropId: string, emoji: EmojiType) => void;
}

/**
 * Feed card displaying a single drop entry.
 */
export const DropCard: React.FC<DropCardProps> = ({ item, onReact }) => {
  return (
    <View style={styles.wrapper}>
      <GlassCard padding={false} >
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
              <View>
                <Text style={[typography.heading4, styles.userName]}>{item.user_name}</Text>
                <Text style={[typography.caption, styles.timestamp]}>{item.timestamp}</Text>
              </View>
            </View>
            <Badge 
              label={item.intensity} 
              color={item.intensity === 'Heavy Artillery' ? colors.coral : colors.mint} 
            />
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.bristolContainer}>
              <Text style={styles.bristolEmoji}>{item.bristol_emoji}</Text>
              <Text style={[typography.heading3, styles.bristolName]}>{item.bristol_name}</Text>
              <Text style={[typography.caption, styles.bristolScale]}>
                Type {item.bristol_scale}
              </Text>
            </View>

            {item.title && (
              <Text style={[typography.body, styles.title]}>
                "{item.title}"
              </Text>
            )}

            {item.photo_url && (
              <View style={styles.photoContainer}>
                <Image 
                  source={{ uri: item.photo_url }} 
                  style={styles.photo} 
                  blurRadius={10} // Blurred thumbnail
                />
              </View>
            )}
          </View>

          {/* Footer - Reactions */}
          <View style={styles.footer}>
            <ReactionBar 
              reactions={item.reactions}
              userReactions={item.user_reactions}
              onToggle={(emoji) => onReact(item.id, emoji)}
            />
          </View>

        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: spacing.sm,
  },
  container: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  userName: {
    color: colors.text,
  },
  timestamp: {
    color: colors.textMuted,
  },
  body: {
    marginBottom: spacing.md,
  },
  bristolContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  bristolEmoji: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  bristolName: {
    color: colors.text,
    marginRight: spacing.sm,
  },
  bristolScale: {
    color: colors.textMuted,
  },
  title: {
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  photoContainer: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  footer: {
    marginTop: spacing.xs,
  },
});


