import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/mmkv';

export interface LeaderboardUser {
  id: string;
  rank: number;
  badge: string;
  username: string;
  title: string;
  avatar_url: string | null;
  points: number;
}

export const INITIAL_TOP_USERS: LeaderboardUser[] = [];

const LEADERBOARD_CACHE_KEY = 'kulapp:leaderboard_cache';

const loadCachedLeaderboard = (): LeaderboardUser[] => {
  try {
    const raw = storage.getString(LEADERBOARD_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback
  }
  return [];
};

const saveLeaderboardCache = (users: LeaderboardUser[]) => {
  try {
    storage.set(LEADERBOARD_CACHE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed saving leaderboard cache:', err);
  }
};

interface LeaderboardState {
  topUsers: LeaderboardUser[];
  isLoading: boolean;
  fetchLeaderboard: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  topUsers: loadCachedLeaderboard(),
  isLoading: false,

  fetchLeaderboard: async () => {
    set({ isLoading: true });
    try {
      // Query profiles table in Supabase
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          created_at,
          drops ( id )
        `)
        .limit(20);

      if (!error && data && data.length > 0) {
        const usersWithPoints: LeaderboardUser[] = data.map((p: any) => {
          const dropCount = Array.isArray(p.drops) ? p.drops.length : 0;
          const points = dropCount * 50;
          return {
            id: p.id,
            rank: 0,
            badge: '',
            username: p.username || 'Anonymous',
            title: 'Community Pooper',
            avatar_url: p.avatar_url,
            points: points,
          };
        });

        // Sort descending by points
        usersWithPoints.sort((a, b) => b.points - a.points);

        // Assign rank badges
        const formatted = usersWithPoints.map((u, idx) => ({
          ...u,
          rank: idx + 1,
          badge: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`,
          title: idx === 0 ? 'The Legendary Pooper' : idx === 1 ? 'Bathroom Speedrunner' : idx === 2 ? 'Serial Depositor' : 'Community Pooper',
        }));

        set({ topUsers: formatted });
        saveLeaderboardCache(formatted);
      }
    } catch {
      // Keep cached
    } finally {
      set({ isLoading: false });
    }
  },
}));
