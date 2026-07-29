import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useGroupStore } from '@/stores/groupStore';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, typography, spacing, borderRadius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CreateGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createGroup = useGroupStore((state) => state.createGroup);

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setIsSubmitting(true);
    const { group, error } = await createGroup(groupName.trim());
    setIsSubmitting(false);

    if (error || !group) {
      Alert.alert('Failed to create group', error?.message || 'Unknown error');
    } else {
      router.replace(`/group/${group.id}` as any);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{
          headerTitle: 'Create Group',
          presentation: 'modal',
        }} 
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="people-circle" size={80} color={Colors.accent.mint} />
          </View>
          <Text style={[typography.heading1, styles.title]}>New Squad</Text>
          <Text style={[typography.body, styles.subtitle]}>
            Create a private space for your friends to share drops.
          </Text>
        </View>

        <GlassCard  padding={true} style={styles.inputCard}>
          <Text style={[typography.caption, styles.inputLabel]}>GROUP NAME</Text>
          <TextInput
            style={[typography.heading2, styles.input]}
            placeholder="e.g. The Inner Circle"
            placeholderTextColor={'rgba(0,0,0,0.05)'}
            value={groupName}
            onChangeText={setGroupName}
            autoFocus
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
        </GlassCard>

        <View style={styles.footer}>
          <Button
            title="Create Group"
            onPress={handleCreate}
            variant="primary"
            loading={isSubmitting}
            disabled={groupName.trim().length === 0 || isSubmitting}
            size="lg"
            icon={<Ionicons name="add-circle-outline" size={24} color={Colors.dark.background} />}
            style={styles.createButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    color: Colors.dark.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  inputCard: {
    marginBottom: 'auto',
    borderColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
  },
  inputLabel: {
    color: Colors.accent.mint,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  input: {
    color: Colors.dark.text,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
  createButton: {
    width: '100%',
  },
});


