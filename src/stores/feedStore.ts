import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/mmkv';

export interface FeedItem {
  id: string;
  user_id: string;
  bristol_scale: number;
  intensity: number;
  size_badge: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Massive';
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  verification_pct: number;
  reactions_count: number;
  is_upvoted?: boolean;
  created_at: string;
  custom_title: string | null;
  target_group_id?: string | null;
  groups?: { name: string } | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  reactions?: Record<string, number>;
}

export const INITIAL_FEED_ITEMS: FeedItem[] = [];

const FEED_CACHE_KEY = 'kulapp:feed_cache';

const loadCachedFeed = (): FeedItem[] => {
  try {
    const raw = storage.getString(FEED_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Empty fallback
  }
  return [];
};

const saveFeedCache = (items: FeedItem[]) => {
  try {
    storage.set(FEED_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed saving feed cache:', err);
  }
};

interface FeedState {
  feedItems: FeedItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  subscription: any | null;
  
  fetchFeed: () => Promise<void>;
  addFeedItem: (item: Partial<FeedItem>) => Promise<void>;
  toggleUpvote: (dropId: string) => Promise<void>;
  addReaction: (dropId: string, emojiType: string) => Promise<void>;
  removeReaction: (dropId: string, emojiType: string) => Promise<void>;
  subscribeToFeed: () => void;
  unsubscribeFromFeed: () => void;
  refreshFeed: () => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  feedItems: loadCachedFeed(),
  isLoading: false,
  isRefreshing: false,
  subscription: null,

  addFeedItem: async (newItemData: Partial<FeedItem>) => {
    const dropId = `drop-${Date.now()}`;
    const newItem: FeedItem = {
      id: dropId,
      user_id: newItemData.user_id || 'local-user',
      bristol_scale: newItemData.bristol_scale || 4,
      intensity: newItemData.intensity || 3,
      size_badge: newItemData.size_badge || 'Medium',
      location: newItemData.location || 'Oak Street',
      latitude: newItemData.latitude ?? null,
      longitude: newItemData.longitude ?? null,
      verification_pct: 100,
      reactions_count: 0,
      is_upvoted: false,
      created_at: new Date().toISOString(),
      custom_title: newItemData.custom_title || 'Fresh Drop',
      target_group_id: newItemData.target_group_id || null,
      groups: newItemData.groups || null,
      profiles: {
        username: newItemData.profiles?.username || 'User',
        avatar_url: newItemData.profiles?.avatar_url || null,
      },
      reactions: {},
      ...newItemData,
    };

    const updated = [newItem, ...get().feedItems];
    set({ feedItems: updated });
    saveFeedCache(updated);
  },

  fetchFeed: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await (supabase as any)
        .from('drops')
        .select(`
          id,
          user_id,
          bristol_scale,
          intensity,
          location_name,
          latitude,
          longitude,
          created_at,
          custom_title,
          profiles:user_id ( username, display_name, avatar_url )
        `)
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        const formattedData: FeedItem[] = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          bristol_scale: item.bristol_scale || 4,
          intensity: item.intensity === 'HEAVY_ARTILLERY' ? 4 : 2,
          size_badge: item.intensity === 'HEAVY_ARTILLERY' ? 'Large' : 'Medium',
          location: item.location_name || 'Oak Street',
          latitude: item.latitude ?? null,
          longitude: item.longitude ?? null,
          verification_pct: 100,
          reactions_count: 0,
          is_upvoted: false,
          created_at: item.created_at || new Date().toISOString(),
          custom_title: item.custom_title || 'Community Drop',
          target_group_id: item.target_group_id,
          groups: item.groups || null,
          profiles: {
            username: item.profiles?.display_name || item.profiles?.username || 'User',
            avatar_url: item.profiles?.avatar_url || null,
          },
          reactions: {},
        }));

        set({ feedItems: formattedData });
        saveFeedCache(formattedData);
      }
    } catch {
      // Retain cached items
    } finally {
      set({ isLoading: false });
    }
  },

  toggleUpvote: async (dropId: string) => {
    const updated = get().feedItems.map((item) => {
      if (item.id === dropId) {
        const isUpvoted = !item.is_upvoted;
        const newCount = isUpvoted ? item.reactions_count + 1 : Math.max(0, item.reactions_count - 1);
        return {
          ...item,
          is_upvoted: isUpvoted,
          reactions_count: newCount,
        };
      }
      return item;
    });

    set({ feedItems: updated });
    saveFeedCache(updated);

    try {
      const targetItem = updated.find(i => i.id === dropId);
      if (targetItem?.is_upvoted) {
        await (supabase as any).from('reactions').insert({
          drop_id: dropId,
          user_id: targetItem.user_id,
          emoji_type: 'TP',
        });
      } else {
        await (supabase as any).from('reactions').delete().eq('drop_id', dropId);
      }
    } catch (e) {
      // Sync log
    }
  },

  addReaction: async (dropId: string, emojiType: string) => {
    await get().toggleUpvote(dropId);
  },

  removeReaction: async (dropId: string, emojiType: string) => {
    await get().toggleUpvote(dropId);
  },

  refreshFeed: async () => {
    set({ isRefreshing: true });
    await get().fetchFeed();
    set({ isRefreshing: false });
  },

  subscribeToFeed: () => {
    const { subscription } = get();
    if (subscription) return;

    const sub = (supabase as any)
      .channel('public:drops')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'drops' },
        () => {
          get().fetchFeed();
        }
      )
      .subscribe();

    set({ subscription: sub });
  },

  unsubscribeFromFeed: () => {
    const { subscription } = get();
    if (subscription) {
      supabase.removeChannel(subscription);
      set({ subscription: null });
    }
  },
}));
