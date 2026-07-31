import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Swords, Trophy, Flame, Star, ChevronLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Profile } from '@/types/database';

const { width } = Dimensions.get('window');

const DESIGN_COLORS = {
  card: 'rgba(62, 39, 35, 0.75)',
  primary: '#A95C33',
  textPrimary: '#FFFFFF',
  textSecondary: '#BCAAA4',
  border: 'rgba(255, 255, 255, 0.1)',
  win: '#4CAF50',
  lose: '#d32f2f',
  tie: '#FF9800',
};

export default function FriendVsModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const friendId = params.id as string;
  const { profile: currentUser } = useAuthStore();

  const [friend, setFriend] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFriendProfile() {
      if (!friendId) return;
      try {
        const { data, error } = await supabase
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
    loadFriendProfile();
  }, [friendId]);

  if (!friendId || !currentUser) {
    return (
      <BlurView intensity={80} tint="dark" style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Data unavailable.</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    );
  }

  const renderComparisonRow = (label: string, icon: React.ReactNode, myVal: number, friendVal: number) => {
    const isWin = myVal > friendVal;
    const isLose = myVal < friendVal;
    const isTie = myVal === friendVal;

    return (
      <View style={styles.vsRow}>
        <View style={styles.vsCol}>
          <Text style={[styles.vsValue, isWin && styles.textWin, isLose && styles.textLose]}>
            {myVal}
          </Text>
        </View>
        <View style={styles.vsCenterCol}>
          <View style={styles.vsIconWrapper}>
            {icon}
          </View>
          <Text style={styles.vsLabel}>{label}</Text>
        </View>
        <View style={styles.vsCol}>
          <Text style={[styles.vsValue, isLose && styles.textWin, isWin && styles.textLose]}>
            {friendVal}
          </Text>
        </View>
      </View>
    );
  };

  const getAvatarChar = (p: Profile | null | undefined) => {
    return (p?.display_name || p?.username || '?').charAt(0).toUpperCase();
  };

  return (
    <BlurView intensity={90} tint="dark" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <ChevronLeft size={24} color={DESIGN_COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Head-to-Head</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <X size={24} color={DESIGN_COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={DESIGN_COLORS.primary} />
          </View>
        ) : friend ? (
          <View style={styles.content}>
            
            {/* Fighter Avatars Row */}
            <View style={styles.fightersRow}>
              {/* Current User */}
              <View style={styles.fighter}>
                <View style={styles.avatarGlowWrapperMe}>
                  <LinearGradient colors={['#A95C33', '#8D6E63']} style={styles.avatarGradient}>
                    {currentUser.avatar_url ? (
                      <Image source={{ uri: currentUser.avatar_url }} style={styles.avatarImage} contentFit="cover" />
                    ) : (
                      <Text style={styles.avatarText}>{getAvatarChar(currentUser)}</Text>
                    )}
                  </LinearGradient>
                </View>
                <Text style={styles.fighterName}>You</Text>
              </View>

              {/* VS Badge */}
              <View style={styles.vsBadge}>
                <Swords size={28} color="#FFD700" />
                <Text style={styles.vsText}>VS</Text>
              </View>

              {/* Friend User */}
              <View style={styles.fighter}>
                <View style={styles.avatarGlowWrapperFriend}>
                  <LinearGradient colors={['#7C4D2E', '#3E2723']} style={styles.avatarGradient}>
                    {friend.avatar_url ? (
                      <Image source={{ uri: friend.avatar_url }} style={styles.avatarImage} contentFit="cover" />
                    ) : (
                      <Text style={styles.avatarText}>{getAvatarChar(friend)}</Text>
                    )}
                  </LinearGradient>
                </View>
                <Text style={styles.fighterName}>{friend.display_name || friend.username}</Text>
              </View>
            </View>

            {/* Stats Comparison */}
            <View style={styles.statsCard}>
              <Text style={styles.statsCardTitle}>Battle of the Bowels</Text>
              
              {renderComparisonRow('Level', <Star size={20} color="#FFC107" />, currentUser.current_level || 1, friend.current_level || 1)}
              <View style={styles.divider} />
              
              {renderComparisonRow('Total XP', <Trophy size={20} color="#FF9800" />, currentUser.total_xp || 0, friend.total_xp || 0)}
              <View style={styles.divider} />
              
              {renderComparisonRow('Streak', <Flame size={20} color="#FF5722" />, currentUser.streak_days || 0, friend.streak_days || 0)}
            </View>

            <TouchableOpacity 
              style={styles.primaryBtn} 
              activeOpacity={0.8}
              onPress={() => alert('Challenge sent! ⚔️')}
            >
              <LinearGradient
                colors={['#A95C33', '#795548']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>Send Challenge ⚔️</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.errorText}>User not found</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fightersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    marginTop: 20,
  },
  fighter: {
    alignItems: 'center',
    flex: 1,
  },
  avatarGlowWrapperMe: {
    padding: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.2)', // slight green glow for 'You'
    borderRadius: 60,
    marginBottom: 12,
  },
  avatarGlowWrapperFriend: {
    padding: 4,
    backgroundColor: 'rgba(211, 47, 47, 0.2)', // slight red glow for opponent
    borderRadius: 60,
    marginBottom: 12,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2D1B15',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 36,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFF',
  },
  fighterName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  vsBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  vsText: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFD700',
    marginTop: 4,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  statsCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    marginBottom: 30,
  },
  statsCardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  vsCol: {
    flex: 1,
    alignItems: 'center',
  },
  vsCenterCol: {
    flex: 1.2,
    alignItems: 'center',
  },
  vsValue: {
    fontSize: 24,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  textWin: {
    color: DESIGN_COLORS.win,
  },
  textLose: {
    color: DESIGN_COLORS.lose,
  },
  vsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  vsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: DESIGN_COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: DESIGN_COLORS.border,
    marginVertical: 4,
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
