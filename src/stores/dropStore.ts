import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/mmkv';
import type { Drop, DropInsert, BristolScale, Intensity, PrivacyLevel } from '@/types/database';

// ============================================================================
// Types
// ============================================================================

interface RecordDropParams {
  bristolScale?: BristolScale;
  intensity?: Intensity;
  privacyLevel: PrivacyLevel;
  targetGroupId?: string;
  customTitle?: string;
}

interface DropState {
  drops: Drop[];
  todayCount: number;
  currentStreak: number;
  isRecording: boolean;
  pendingSync: DropInsert[];

  recordDrop: (params: RecordDropParams) => Promise<void>;
  syncPendingDrops: () => Promise<void>;
  fetchUserDrops: (userId: string, limit?: number) => Promise<void>;
  deleteDrop: (dropId: string) => Promise<void>;
  loadLocalState: () => void;
  calculateStreak: (drops: Drop[]) => number;
}

// ============================================================================
// Storage Keys
// ============================================================================

const KEYS = {
  PENDING_SYNC: 'kulapp:pending_drops',
  TODAY_COUNT: 'kulapp:today_count',
  TODAY_DATE: 'kulapp:today_date',
  STREAK: 'kulapp:streak',
  LAST_DROP: 'kulapp:last_drop_time',
  DROPS: 'kulapp:drops',
} as const;

// ============================================================================
// Helpers
// ============================================================================

/** Simple UUID v4 generator for offline drops */
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/** Get today's date as YYYY-MM-DD string */
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// ============================================================================
// Store
// ============================================================================

/**
 * Zustand store for drop (stool) records.
 * Implements offline-first caching via MMKV and syncs with Supabase.
 */
export const useDropStore = create<DropState>((set, get) => ({
  drops: [],
  todayCount: 0,
  currentStreak: 0,
  isRecording: false,
  pendingSync: [],

  /**
   * Load persisted state from MMKV.
   * Called on app startup and after foregrounding.
   */
  loadLocalState: () => {
    try {
      const pendingStr = storage.getString(KEYS.PENDING_SYNC);
      const dropsStr = storage.getString(KEYS.DROPS);
      const todayDate = storage.getString(KEYS.TODAY_DATE);
      const todayCount = storage.getNumber(KEYS.TODAY_COUNT);
      const streak = storage.getNumber(KEYS.STREAK);

      // Reset today count if it's a new day
      const isToday = todayDate === getTodayString();

      set({
        pendingSync: pendingStr ? JSON.parse(pendingStr) : [],
        drops: dropsStr ? JSON.parse(dropsStr) : [],
        todayCount: isToday ? (todayCount ?? 0) : 0,
        currentStreak: streak ?? 0,
      });

      // If new day, reset the date marker
      if (!isToday) {
        storage.set(KEYS.TODAY_DATE, getTodayString());
        storage.set(KEYS.TODAY_COUNT, 0);
      }
    } catch (e) {
      console.error('[DropStore] Failed to load local state:', e);
    }
  },

  /**
   * Calculate streak from a sorted array of drops (newest first).
   * Returns the number of consecutive days with at least one drop.
   */
  calculateStreak: (drops: Drop[]): number => {
    if (drops.length === 0) return 0;

    const uniqueDays = new Set<string>();
    for (const drop of drops) {
      uniqueDays.add(drop.created_at.split('T')[0]);
    }

    const sortedDays = Array.from(uniqueDays).sort().reverse();
    const today = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Streak must include today or yesterday
    if (sortedDays[0] !== today && sortedDays[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const diffMs = prevDate.getTime() - currDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (Math.round(diffDays) === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  /**
   * Record a new drop. Saves locally first (offline-first), then syncs.
   */
  recordDrop: async (params: RecordDropParams) => {
    set({ isRecording: true });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'local-user';

      const newDrop: DropInsert = {
        id: generateId(),
        user_id: userId,
        bristol_scale: params.bristolScale ?? 4,
        intensity: params.intensity ?? 'NORMAL',
        privacy_level: params.privacyLevel,
        target_group_id: params.targetGroupId ?? null,
        custom_title: params.customTitle ?? null,
        created_at: new Date().toISOString(),
      };

      // 1. Save locally first (optimistic update)
      const currentPending = get().pendingSync;
      const updatedPending = [...currentPending, newDrop];

      set((state) => {
        const newTodayCount = state.todayCount + 1;
        const newDrops = [newDrop as Drop, ...state.drops];
        const newStreak = state.calculateStreak(newDrops);

        // Persist to MMKV
        storage.set(KEYS.PENDING_SYNC, JSON.stringify(updatedPending));
        storage.set(KEYS.DROPS, JSON.stringify(newDrops));
        storage.set(KEYS.TODAY_COUNT, newTodayCount);
        storage.set(KEYS.TODAY_DATE, getTodayString());
        storage.set(KEYS.STREAK, newStreak);
        storage.set(KEYS.LAST_DROP, new Date().toISOString());

        return {
          drops: newDrops,
          todayCount: newTodayCount,
          currentStreak: newStreak,
          pendingSync: updatedPending,
        };
      });

      // 2. Attempt remote sync
      await get().syncPendingDrops();
    } catch (error) {
      console.error('[DropStore] Error recording drop:', error);
    } finally {
      set({ isRecording: false });
    }
  },

  /**
   * Sync all pending drops to Supabase.
   * Failed items remain in the queue for retry.
   */
  syncPendingDrops: async () => {
    const { pendingSync } = get();
    if (pendingSync.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      // User is not authenticated; keep drops in pending sync queue until login
      return;
    }

    const remaining: DropInsert[] = [];

    for (const drop of pendingSync) {
      try {
        const dropToInsert = { ...drop };
        // Fix user_id if it was recorded while offline/unauthenticated
        if (dropToInsert.user_id === 'local-user') {
          dropToInsert.user_id = userId;
        }

        const { error } = await supabase.from('drops').insert(dropToInsert as any);
        if (error) {
          console.error(`[DropStore] Sync failed for ${drop.id}:`, error.message);
          remaining.push(drop);
        }
      } catch {
        remaining.push(drop);
      }
    }

    set({ pendingSync: remaining });
    storage.set(KEYS.PENDING_SYNC, JSON.stringify(remaining));
  },

  /**
   * Fetch user's drops from Supabase.
   */
  fetchUserDrops: async (userId: string, limit = 50) => {
    // Guard: Prevent querying Supabase with invalid UUIDs from local/guest profiles
    if (!userId || userId === 'user-me' || userId.startsWith('user-') || userId.startsWith('guest-')) {
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('drops')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      if (data) {
        const streak = get().calculateStreak(data);
        const todayDrops = data.filter(
          (d: any) => d.created_at.split('T')[0] === getTodayString()
        );

        set({
          drops: data,
          currentStreak: streak,
          todayCount: todayDrops.length,
        });

        // Persist
        storage.set(KEYS.DROPS, JSON.stringify(data));
        storage.set(KEYS.STREAK, streak);
        storage.set(KEYS.TODAY_COUNT, todayDrops.length);
        storage.set(KEYS.TODAY_DATE, getTodayString());
      }
    } catch (error) {
      console.error('[DropStore] Error fetching drops:', error);
    }
  },

  /**
   * Delete a drop (optimistic + remote).
   */
  deleteDrop: async (dropId: string) => {
    // Optimistic removal
    set((state) => ({
      drops: state.drops.filter((d) => d.id !== dropId),
      pendingSync: state.pendingSync.filter((d) => d.id !== dropId),
    }));

    // Update MMKV
    const { pendingSync, drops } = get();
    storage.set(KEYS.PENDING_SYNC, JSON.stringify(pendingSync));
    storage.set(KEYS.DROPS, JSON.stringify(drops));

    try {
      const { error } = await supabase
        .from('drops')
        .delete()
        .eq('id', dropId);

      if (error) throw error;
    } catch (error) {
      console.error('[DropStore] Error deleting drop:', error);
      // Re-fetch to restore consistency
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        get().fetchUserDrops(session.user.id);
      }
    }
  },
}));


