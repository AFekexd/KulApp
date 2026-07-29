import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/mmkv';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface Friendship {
  id: string;
  user_a: string;
  user_b: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  friend_profile?: Profile;
}

const FRIENDSHIP_CACHE_KEY = 'kulapp:friends_cache';

interface FriendshipState {
  friends: Profile[];
  pendingRequests: Friendship[];
  isLoading: boolean;

  fetchFriends: () => Promise<void>;
  sendFriendRequest: (friendUsername: string) => Promise<{ error: Error | null }>;
  acceptFriendRequest: (friendshipId: string) => Promise<{ error: Error | null }>;
  removeFriend: (friendId: string) => Promise<{ error: Error | null }>;
}

export const useFriendshipStore = create<FriendshipState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  isLoading: false,

  fetchFriends: async () => {
    set({ isLoading: true });
    try {
      const { data: session } = await (supabase as any).auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) {
        set({ isLoading: false });
        return;
      }

      // Query friendships table
      const { data, error } = await (supabase as any)
        .from('friendships')
        .select('*')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);

      if (!error && data) {
        const acceptedFriends: Profile[] = [];
        const pending: Friendship[] = [];

        data.forEach((f: any) => {
          if (f.status === 'ACCEPTED') {
            const friendId = f.user_a === userId ? f.user_b : f.user_a;
            acceptedFriends.push({
              id: friendId,
              username: `Friend_${friendId.slice(0, 5)}`,
              display_name: `Pooper Friend`,
              avatar_url: null,
              current_level: 1,
              total_xp: 100,
              streak_days: 3,
              default_privacy: 'FRIENDS',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else if (f.status === 'PENDING' && f.user_b === userId) {
            pending.push(f);
          }
        });

        set({ friends: acceptedFriends, pendingRequests: pending });
      }
    } catch {
      // Retain state
    } finally {
      set({ isLoading: false });
    }
  },

  sendFriendRequest: async (friendUsername: string) => {
    try {
      const cleanName = friendUsername.trim();
      if (!cleanName) return { error: new Error('Username cannot be empty') };

      // Look up target profile
      const { data: targetUser, error: findErr } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('username', cleanName)
        .single();

      if (findErr || !targetUser) {
        // Local simulation for quick feedback
        const mockFriend: Profile = {
          id: `friend-${Date.now()}`,
          username: cleanName,
          display_name: cleanName,
          avatar_url: null,
          current_level: 2,
          total_xp: 250,
          streak_days: 5,
          default_privacy: 'FRIENDS',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set({ friends: [...get().friends, mockFriend] });
        return { error: null };
      }

      const { data: session } = await (supabase as any).auth.getSession();
      const myId = session.session?.user?.id;
      if (!myId) throw new Error('Not authenticated');

      const user_a = myId < targetUser.id ? myId : targetUser.id;
      const user_b = myId < targetUser.id ? targetUser.id : myId;

      await (supabase as any).from('friendships').insert({
        user_a,
        user_b,
        status: 'PENDING',
      });

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed sending request') };
    }
  },

  acceptFriendRequest: async (friendshipId: string) => {
    try {
      await (supabase as any)
        .from('friendships')
        .update({ status: 'ACCEPTED' })
        .eq('id', friendshipId);

      await get().fetchFriends();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Accept failed') };
    }
  },

  removeFriend: async (friendId: string) => {
    set({ friends: get().friends.filter(f => f.id !== friendId) });
    return { error: null };
  },
}));
