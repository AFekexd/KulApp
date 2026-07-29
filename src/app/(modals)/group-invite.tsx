import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useGroupStore } from '@/stores/groupStore';
import { InviteCodeInput } from '@/components/groups/InviteCodeInput';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, Typography, Spacing, borderRadius } from '@/theme';

export default function GroupInviteModal() {
  const router = useRouter();
  const joinGroup = useGroupStore((state) => state.joinGroup);
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter an invite code.');
      return;
    }
    
    setLoading(true);
    const { error } = await joinGroup(code);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message || 'Failed to join group.');
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Group</Text>
      
      <View style={styles.inputContainer}>
        <InviteCodeInput 
          value={code}
          onChangeText={setCode}
        />
      </View>

      <AnimatedPressable
        onPress={handleJoin}
        disabled={loading}
        style={StyleSheet.flatten([styles.button, loading && styles.buttonDisabled])}
      >
        <Text style={styles.buttonText}>{loading ? 'Joining...' : 'Join'}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.mint,
    paddingVertical: Spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.bodyLarge,
    color: colors.background,
    fontWeight: 'bold',
  },
});

