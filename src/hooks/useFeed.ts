import { useEffect } from 'react';
import { useFeedStore } from '@/stores/feedStore';

/**
 * Custom hook wrapping feedStore.
 * Handles realtime subscription lifecycle.
 */
export const useFeed = () => {
  const {
    feedItems,
    isLoading,
    isRefreshing,
    fetchFeed,
    refreshFeed,
    subscribeToFeed,
    unsubscribeFromFeed,
    addReaction,
    removeReaction
  } = useFeedStore();

  useEffect(() => {
    fetchFeed();
    subscribeToFeed();

    return () => {
      unsubscribeFromFeed();
    };
  }, [fetchFeed, subscribeToFeed, unsubscribeFromFeed]);

  return {
    feedItems,
    isLoading,
    isRefreshing,
    refreshFeed,
    addReaction,
    removeReaction
  };
};
