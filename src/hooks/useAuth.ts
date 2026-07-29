import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Custom hook wrapping the authStore.
 * Handles initialization on first mount.
 */
export const useAuth = () => {
  const {
    session,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated,
    initialize,
    signInWithApple,
    signInWithGoogle,
    signOut,
    fetchProfile,
    updateProfile,
  } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    session,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated,
    initialize,
    signInWithApple,
    signInWithGoogle,
    signOut,
    fetchProfile,
    updateProfile,
  };
};
