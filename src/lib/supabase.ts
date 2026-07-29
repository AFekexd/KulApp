/**
 * KulApp Supabase Client
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { authStorage } from '@/lib/mmkv';
import { Database } from '@/types/database';

// Custom storage adapter for Supabase Auth using MMKV
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return authStorage.getString(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    authStorage.set(key, value);
  },
  removeItem: (key: string) => {
    authStorage.remove(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper type to get a specific table's Row type
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

