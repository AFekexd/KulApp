import { useGroupStore } from '@/stores/groupStore';
import { useCallback } from 'react';

/**
 * Custom hook wrapping the groupStore.
 * Provides a clean interface for UI components to interact with groups.
 */
export const useGroups = () => {
  const store = useGroupStore();

  const handleCreateGroup = useCallback(async (name: string) => {
    return await store.createGroup(name);
  }, [store]);

  const handleJoinGroup = useCallback(async (inviteCode: string) => {
    return await store.joinGroup(inviteCode);
  }, [store]);

  const handleLeaveGroup = useCallback(async (groupId: string) => {
    return await store.leaveGroup(groupId);
  }, [store]);

  return {
    groups: store.groups,
    currentGroup: store.currentGroup,
    members: store.members,
    isLoading: store.isLoading,
    fetchUserGroups: store.fetchUserGroups,
    fetchGroupMembers: store.fetchGroupMembers,
    createGroup: handleCreateGroup,
    joinGroup: handleJoinGroup,
    leaveGroup: handleLeaveGroup,
  };
};
