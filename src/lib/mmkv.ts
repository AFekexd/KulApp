/**
 * KulApp Local Storage
 * 
 * Uses react-native-mmkv for ultra-fast synchronous key-value storage.
 * Requires a development build (not Expo Go).
 */
import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';
import { Drop, UserPreferences, DEFAULT_USER_PREFERENCES } from '@/types/database';

const isWeb = Platform.OS === 'web';

const createWebStorage = (id: string): MMKV => {
  const getKey = (k: string) => `${id}-${k}`;
  return {
    set: (key: string, value: string | number | boolean) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(getKey(key), String(value));
      }
    },
    getString: (key: string) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(getKey(key)) ?? undefined;
      }
      return undefined;
    },
    getNumber: (key: string) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(getKey(key));
        return val ? Number(val) : undefined;
      }
      return undefined;
    },
    getBoolean: (key: string) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(getKey(key)) === 'true';
      }
      return undefined;
    },
    contains: (key: string) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(getKey(key)) !== null;
      }
      return false;
    },
    delete: (key: string) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(getKey(key));
      }
    },
    remove: (key: string) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(getKey(key));
      }
    },
    getAllKeys: () => [],
    clearAll: () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(window.localStorage).forEach((k) => {
          if (k.startsWith(`${id}-`)) window.localStorage.removeItem(k);
        });
      }
    },
    recrypt: () => {},
    addOnValueChangedListener: () => ({ remove: () => {} }),
  } as unknown as MMKV;
};

/** Main app storage instance */
export const storage: MMKV = isWeb ? createWebStorage('kulapp-storage') : createMMKV({ id: 'kulapp-storage' });

/** Auth session storage (separate instance for clean sign-out) */
export const authStorage: MMKV = isWeb ? createWebStorage('kulapp-auth') : createMMKV({ id: 'kulapp-auth' });

/**
 * Typed helper methods for common local cache operations.
 */
export const LocalCache = {
  // ---- Drop Queue (offline sync) ----
  getDropQueue: (): Drop[] => {
    const queue = storage.getString('drop_queue');
    return queue ? JSON.parse(queue) : [];
  },

  addToDropQueue: (drop: Drop) => {
    const queue = LocalCache.getDropQueue();
    queue.push(drop);
    storage.set('drop_queue', JSON.stringify(queue));
  },

  clearDropQueue: () => {
    storage.remove('drop_queue');
  },

  // ---- Daily Count ----
  getDailyCount: (date: string): number => {
    return storage.getNumber(`daily_count_${date}`) ?? 0;
  },

  incrementDailyCount: (date: string) => {
    const current = LocalCache.getDailyCount(date);
    storage.set(`daily_count_${date}`, current + 1);
  },

  // ---- Streak ----
  getStreak: (): number => {
    return storage.getNumber('streak') ?? 0;
  },

  setStreak: (n: number) => {
    storage.set('streak', n);
  },

  // ---- Last Drop Time ----
  getLastDropTime: (): string | null => {
    return storage.getString('last_drop_time') ?? null;
  },

  setLastDropTime: (time: string) => {
    storage.set('last_drop_time', time);
  },

  // ---- User Preferences ----
  getUserPreferences: (): UserPreferences => {
    const prefs = storage.getString('user_prefs');
    return prefs ? JSON.parse(prefs) : DEFAULT_USER_PREFERENCES;
  },

  setUserPreferences: (prefs: UserPreferences) => {
    storage.set('user_prefs', JSON.stringify(prefs));
  },

  // ---- Generic helpers ----
  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },

  set: (key: string, value: string | number | boolean) => {
    storage.set(key, value);
  },

  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },
};

