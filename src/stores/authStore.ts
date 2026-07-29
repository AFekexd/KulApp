import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/mmkv';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { Platform } from 'react-native';

type Profile = Database['public']['Tables']['profiles']['Row'];

const ACTIVE_PROFILE_KEY = 'kulapp:active_profile';

const DEFAULT_PROFILE: Profile = {
  id: 'user-me',
  username: 'PoopMaster',
  display_name: 'Poop Master',
  avatar_url: null,
  current_level: 1,
  total_xp: 0,
  streak_days: 0,
  default_privacy: 'FRIENDS',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const loadLocalProfile = (): Profile | null => {
  try {
    const raw = storage.getString(ACTIVE_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Fallback
  }
  return DEFAULT_PROFILE;
};

const saveLocalProfile = (profile: Profile | null) => {
  try {
    if (profile) {
      storage.set(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
    } else {
      storage.remove(ACTIVE_PROFILE_KEY);
    }
  } catch (err) {
    console.error('Failed saving active profile:', err);
  }
};

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: loadLocalProfile() || DEFAULT_PROFILE,
  isLoading: true,
  isInitialized: false,
  isAuthenticated: true,
  isGuest: false,

  initialize: async () => {
    try {
      const { data: { session }, error } = await (supabase as any).auth.getSession();
      if (error) throw error;
      
      const localProf = loadLocalProfile();
      set({ 
        session, 
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        profile: localProf || get().profile,
      });

      if (session) {
        await get().fetchProfile();
      }

      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        set({ 
          session: newSession, 
          isAuthenticated: true,
          isGuest: false,
        });
        
        if (newSession) {
          await get().fetchProfile();
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  signInWithEmail: async (email: string, pass: string) => {
    try {
      const usernameFromEmail = email.split('@')[0] || 'User';
      const userProfile: Profile = {
        id: `user-${Date.now()}`,
        username: usernameFromEmail,
        display_name: usernameFromEmail,
        avatar_url: null,
        current_level: 1,
        total_xp: 0,
        streak_days: 0,
        default_privacy: 'FRIENDS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set({ 
        profile: userProfile, 
        isAuthenticated: true, 
        isGuest: false 
      });
      saveLocalProfile(userProfile);

      await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error') };
    }
  },

  signUpWithEmail: async (email: string, pass: string, username: string) => {
    try {
      const userProfile: Profile = {
        id: `user-${Date.now()}`,
        username: username.trim(),
        display_name: username.trim(),
        avatar_url: null,
        current_level: 1,
        total_xp: 0,
        streak_days: 0,
        default_privacy: 'FRIENDS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set({ 
        profile: userProfile, 
        isAuthenticated: true, 
        isGuest: false 
      });
      saveLocalProfile(userProfile);

      await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            username: username.trim(),
            full_name: username.trim(),
          },
        },
      });

      try {
        await (supabase as any).from('profiles').upsert(userProfile);
      } catch (e) {
        // Sync info
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error') };
    }
  },

  signInWithApple: async () => {
    return { error: new Error('Apple Sign-In is not configured.') };
  },

  signInWithGoogle: async () => {
    try {
      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        return { error };
      }
      return { error: new Error('Google Sign-In requires native client configuration.') };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error('Unknown error') };
    }
  },

  continueAsGuest: () => {
    const guestProfile: Profile = {
      id: `guest-${Date.now()}`,
      username: 'PoopExplorer',
      display_name: 'Poop Explorer 💩',
      avatar_url: null,
      current_level: 1,
      total_xp: 0,
      streak_days: 0,
      default_privacy: 'PRIVATE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set({
      isGuest: true,
      isAuthenticated: true,
      profile: guestProfile,
    });
    saveLocalProfile(guestProfile);
  },

  signOut: async () => {
    try {
      await (supabase as any).auth.signOut();
      storage.remove(ACTIVE_PROFILE_KEY);
      storage.remove('kulapp:feed_cache');
      storage.remove('kulapp:leaderboard_cache');
      set({ 
        session: null, 
        profile: {
          id: 'guest-user',
          username: 'Anonymous',
          display_name: 'Guest Pooper',
          avatar_url: null,
          current_level: 1,
          total_xp: 0,
          streak_days: 0,
          default_privacy: 'PRIVATE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, 
        isAuthenticated: false, 
        isGuest: true 
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  fetchProfile: async () => {
    const session = get().session;
    if (!session?.user) return;

    try {
      const { data: profile, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error && profile) {
        set({ profile });
        saveLocalProfile(profile);
      }
    } catch (error) {
      console.error('Exception fetching profile:', error);
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const current = get().profile;
    if (!current) return { error: new Error('No profile loaded') };

    const updatedProfile: Profile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    set({ profile: updatedProfile });
    saveLocalProfile(updatedProfile);

    try {
      await (supabase as any)
        .from('profiles')
        .upsert(updatedProfile);
    } catch (e) {
      // Sync log
    }

    return { error: null };
  }
}));
