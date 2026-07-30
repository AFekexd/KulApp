import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Trophy, Star, UserMinus, ShieldAlert } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { useFriendshipStore } from '@/stores/friendshipStore';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
const { width } = Dimensions.get('window');

const DESIGN_COLORS = {
  card: 'rgba(62, 39, 35, 0.75)', // Glassy dark brown
  primary: '#A95C33',
  primaryDim: 'rgba(169, 92, 51, 0.15)',
  textPrimary: '#FFFFFF',
  textSecondary: '#BCAAA4',
  border: 'rgba(255, 255, 255, 0.1)',
  danger: '#d32f2f',
  dangerDim: 'rgba(211, 47, 47, 0.15)',
};

export default function FriendProfileModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const friendId = params.id as string;
  const { removeFriend } = useFriendshipStore();

  const [friend, setFriend] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!friendId) return;
      try {
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', friendId)
          .single();

        if (data) setFriend(data);
      } catch (e) {
        console.error('Error loading friend profile', e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [friendId]);

  if (!friendId) {
    return (
      <BlurView intensity={80} tint="dark" style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>No friend ID provided.</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    );
  }

  const avatarLetter = (friend?.display_name || friend?.username || '?').charAt(0).toUpperCase();

  return (
    <BlurView intensity={90} tint="dark" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.closeBtnGlass} onPress={() => router.back()}>
            <X size={20} color={DESIGN_COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={DESIGN_COLORS.primary} />
          </View>
        ) : friend ? (
          <View style={styles.content}>
            
            {/* Avatar Section with Glassmorphism */}
            <View style={styles.avatarGlowWrapper}>
              <LinearGradient
                colors={['#A95C33', '#8D6E63']}
                style={styles.avatarGradient}
              >
                {friend.avatar_url ? (
                  <Image 
                    source={{ uri: friend.avatar_url }} 
                    style={styles.avatarImage} 
                    contentFit="cover" 
                  />
                ) : (
                  <Text style={styles.avatarText}>{avatarLetter}</Text>
                )}
              </LinearGradient>
            </View>

            <Text style={styles.name}>{friend.display_name || friend.username}</Text>
            <Text style={styles.username}>@{friend.username || friend.id.slice(0, 8)}</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statIconGlow}>
                  <Star size={22} color="#FFC107" />
                </View>
                <Text style={styles.statValue}>Lvl {friend.current_level || 1}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconGlow}>
                  <Trophy size={22} color="#FF9800" />
                </View>
                <Text style={styles.statValue}>🔥 {friend.streak_days || 0}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.primaryBtn} 
                activeOpacity={0.8}
                onPress={() => alert('Poke sent! 🪠')}
              >
                <LinearGradient
                  colors={['#A95C33', '#795548']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  <Text style={styles.primaryBtnText}>Poke with Plunger 🪠</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dangerBtn} 
                activeOpacity={0.7}
                onPress={async () => {
                  await removeFriend(friendId);
                  router.back();
                }}
              >
                <UserMinus size={18} color={DESIGN_COLORS.danger} />
                <Text style={styles.dangerBtnText}>Remove Friend</Text>
              </TouchableOpacity>
            </View>

          </View>
        ) : (
          <View style={styles.centered}>
            <ShieldAlert size={48} color={DESIGN_COLORS.textSecondary} />
            <Text style={[styles.errorText, { marginTop: 16 }]}>User not found</Text>
          </View>
        )}
      </SafeAreaView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  closeBtnGlass: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlowWrapper: {
    padding: 6,
    backgroundColor: 'rgba(169, 92, 51, 0.2)',
    borderRadius: 70,
    marginBottom: 20,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2D1B15',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 52,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFF',
  },
  name: {
    fontSize: 32,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: DESIGN_COLORS.textSecondary,
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
  },
  statIconGlow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: DESIGN_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    color: '#FFF',
  },
  dangerBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: DESIGN_COLORS.dangerDim,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.3)',
  },
  dangerBtnText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.danger,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textSecondary,
  },
  closeBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 20,
  },
  closeBtnText: {
    color: DESIGN_COLORS.textPrimary,
    fontFamily: 'Inter-Bold',
  },
});
