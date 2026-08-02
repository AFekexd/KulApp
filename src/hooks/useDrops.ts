import { storage } from '@/lib/mmkv';
import { useDropStore } from '@/stores/dropStore';
import type { BristolScale, Intensity } from '@/types/database';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';

/**
 * Primary hook for drop operations.
 * Exposes recording, stats, and data from the dropStore.
 */
export const useDrops = () => {
  const {
    loadLocalState,
    todayCount,
    currentStreak,
    drops,
    isRecording,
    recordDrop,
    syncPendingDrops,
    fetchUserDrops,
    deleteDrop,
    pendingSync,
  } = useDropStore();

  // Load local state on mount
  useEffect(() => {
    loadLocalState();
  }, [loadLocalState]);

  // Compute last drop time
  const lastDropTime = (() => {
    const stored = storage.getString('KulAPP:last_drop_time');
    if (!stored) return null;
    const date = new Date(stored);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  })();

  return {
    todayCount,
    currentStreak,
    lastDropTime,
    drops,
    isRecording,
    pendingSyncCount: pendingSync.length,
    recordDrop,
    syncPendingDrops,
    fetchUserDrops,
    deleteDrop,
  };
};

/**
 * Mutation hook for recording a drop with haptic feedback.
 */
export const useRecordDrop = () => {
  const { recordDrop } = useDropStore();

  return useMutation({
    mutationFn: async (params: {
      bristolScale?: BristolScale;
      intensity?: Intensity;
      targetGroupId?: string;
      customTitle?: string;
    }) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await recordDrop(params);
    },
  });
};

/**
 * Query hook for fetching a user's drops.
 */
export const useUserDrops = (userId: string | undefined) => {
  const { fetchUserDrops, drops } = useDropStore();

  return useQuery({
    queryKey: ['drops', userId],
    queryFn: async () => {
      if (!userId) return null;
      await fetchUserDrops(userId);
      return useDropStore.getState().drops;
    },
    enabled: !!userId,
    initialData: drops.length > 0 ? drops : undefined,
  });
};

/**
 * Hook returning today's stats at a glance.
 */
export const useTodayStats = () => {
  const { todayCount, currentStreak, drops } = useDropStore();

  const lastDropTime = drops.length > 0 ? new Date(drops[0].created_at) : null;

  return {
    todayCount,
    currentStreak,
    lastDropTime,
  };
};
