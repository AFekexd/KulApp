/**
 * Quick Drop Modal — PoopTracker
 * Native iOS 18 styled drop logger with GSAP smooth animations,
 * dynamic location search, empty default location & transparent backdrop.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import gsap from 'gsap';
import { useDropStore } from '@/stores/dropStore';
import { useFeedStore } from '@/stores/feedStore';
import { useAuthStore } from '@/stores/authStore';

const DESIGN_COLORS = {
  background: '#F7F7F5',
  card: '#FFFFFF',
  primary: '#7C4D2E',
  secondary: '#C89A5A',
  textPrimary: '#1B1B1B',
  textSecondary: '#6B6B6B',
  border: '#ECECEC',
};

const BRISTOL_TYPES = [
  { scale: 1, name: 'Hard lumps', emoji: '🥜' },
  { scale: 2, name: 'Lumpy sausage', emoji: '🌭' },
  { scale: 3, name: 'Sausage w/ cracks', emoji: '🥖' },
  { scale: 4, name: 'Smooth snake', emoji: '🐍' },
  { scale: 5, name: 'Soft blobs', emoji: '💧' },
  { scale: 6, name: 'Fluffy pieces', emoji: '☁️' },
  { scale: 7, name: 'Entirely liquid', emoji: '🌊' },
];

const SIZE_BADGES: Array<'Tiny' | 'Small' | 'Medium' | 'Large' | 'Massive'> = [
  'Tiny',
  'Small',
  'Medium',
  'Large',
  'Massive',
];

export default function QuickDropModal() {
  const router = useRouter();
  const { recordDrop } = useDropStore();
  const { feedItems, addFeedItem } = useFeedStore();
  const { profile } = useAuthStore();

  const [bristolScale, setBristolScale] = useState<number>(4);
  const [sizeBadge, setSizeBadge] = useState<'Tiny' | 'Small' | 'Medium' | 'Large' | 'Massive'>('Medium');
  
  // Location is EMPTY by default as requested!
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const [customTitle, setCustomTitle] = useState<string>('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'group' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation & Scroll refs
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(400)).current;
  const sheetRef = useRef<View>(null);
  const backdropRef = useRef<View>(null);
  const bristolScrollRef = useRef<ScrollView>(null);

  const activeUsername = profile?.display_name || profile?.username || 'Pooper';
  const activeUserId = profile?.id || 'local-user';

  // Gather unique locations logged across the app for search & quick selection
  const availableLocations = useMemo(() => {
    const defaultList = ['Oak Street', 'Central Park', 'Main Avenue', 'Home Bathroom 🏠', 'Office Restroom 🏢'];
    const loggedList = feedItems.map((item) => item.location).filter(Boolean);
    const combined = Array.from(new Set([...loggedList, ...defaultList]));
    return combined;
  }, [feedItems]);

  // Filter locations based on search text
  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return availableLocations;
    return availableLocations.filter((loc) =>
      loc.toLowerCase().includes(locationSearch.trim().toLowerCase())
    );
  }, [availableLocations, locationSearch]);

  useEffect(() => {
    // 1. Web GSAP Animation
    if (Platform.OS === 'web' && sheetRef.current && backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        sheetRef.current,
        { y: 350, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
    }

    // 2. React Native Animation Fallback
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropAnim, sheetTranslateY]);

  const handleClose = () => {
    if (Platform.OS === 'web' && sheetRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(sheetRef.current, {
        y: 350,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => router.back(),
      });
      return;
    }

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 400,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const scrollBristol = (direction: 'left' | 'right') => {
    if (bristolScrollRef.current) {
      const scrollAmount = direction === 'left' ? 0 : 450;
      bristolScrollRef.current.scrollTo({ x: scrollAmount, animated: true });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const finalLocation = selectedLocation.trim() || locationSearch.trim() || 'Unknown Location';
    const titleToUse = customTitle.trim() || `${finalLocation} Session 💩`;

    await recordDrop({
      bristolScale: bristolScale as any,
      intensity: sizeBadge === 'Massive' ? 'HEAVY_ARTILLERY' : sizeBadge === 'Large' ? 'HEAVY_ARTILLERY' : 'NORMAL',
      privacyLevel: privacy === 'private' ? 'PRIVATE' : 'PUBLIC' as any,
      customTitle: titleToUse,
    });

    addFeedItem({
      user_id: activeUserId,
      bristol_scale: bristolScale,
      intensity: sizeBadge === 'Massive' ? 5 : sizeBadge === 'Large' ? 4 : sizeBadge === 'Medium' ? 3 : 2,
      size_badge: sizeBadge,
      location: finalLocation,
      custom_title: titleToUse,
      privacy_level: privacy,
      profiles: {
        username: activeUsername,
        avatar_url: profile?.avatar_url || null,
      },
    });

    setIsSubmitting(false);
    handleClose();
  };

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Translucent Dimmed Backdrop Overlay */}
      <Animated.View
        ref={backdropRef as any}
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* GSAP Smooth Animated Bottom Sheet */}
      <Animated.View
        ref={sheetRef as any}
        style={[
          styles.sheetContainer,
          {
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <View style={styles.sheetHandle} />

        {/* Modal Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>New Poop Drop 💩</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          {/* Section 1: Texture (Bristol Scale) */}
          <View style={styles.formSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionLabel}>1. Texture (Bristol Scale)</Text>
              <View style={styles.arrowScrollRow}>
                <TouchableOpacity style={styles.scrollArrowBtn} onPress={() => scrollBristol('left')}>
                  <Text style={styles.scrollArrowText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scrollArrowBtn} onPress={() => scrollBristol('right')}>
                  <Text style={styles.scrollArrowText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={bristolScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bristolRow}
              scrollEventThrottle={16}
            >
              {BRISTOL_TYPES.map((item) => {
                const isSelected = bristolScale === item.scale;
                return (
                  <TouchableOpacity
                    key={item.scale}
                    style={[styles.bristolCard, isSelected && styles.bristolCardActive]}
                    onPress={() => setBristolScale(item.scale)}
                  >
                    <Text style={styles.bristolEmoji}>{item.emoji}</Text>
                    <Text style={[styles.bristolScaleNum, isSelected && styles.textWhite]}>
                      Type {item.scale}
                    </Text>
                    <Text style={[styles.bristolName, isSelected && styles.textWhiteSub]} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Section 2: Size Badge */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>2. Size Badge</Text>
            <View style={styles.badgeWrapRow}>
              {SIZE_BADGES.map((badge) => {
                const isSelected = sizeBadge === badge;
                return (
                  <TouchableOpacity
                    key={badge}
                    style={[styles.sizeOptionBtn, isSelected && styles.sizeOptionActive]}
                    onPress={() => setSizeBadge(badge)}
                  >
                    <Text style={[styles.sizeOptionText, isSelected && styles.sizeOptionTextActive]}>
                      {badge}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 3: Location (Search & Custom Selection) */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>3. Location 📍</Text>

            {/* Location Search Input */}
            <TextInput
              style={styles.textInput}
              placeholder="Search or enter location name (e.g. Central Park)"
              placeholderTextColor={DESIGN_COLORS.textSecondary}
              value={locationSearch || selectedLocation}
              onChangeText={(text) => {
                setLocationSearch(text);
                setSelectedLocation(text);
              }}
            />

            {/* Existing Locations Search Chips */}
            <Text style={styles.subLabel}>Community & Popular Locations:</Text>
            <View style={styles.badgeWrapRow}>
              {filteredLocations.map((loc) => {
                const isSelected = (selectedLocation || locationSearch).trim().toLowerCase() === loc.toLowerCase();
                return (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.locOptionBtn, isSelected && styles.locOptionActive]}
                    onPress={() => {
                      setSelectedLocation(loc);
                      setLocationSearch(loc);
                    }}
                  >
                    <Text style={[styles.locOptionText, isSelected && styles.locOptionTextActive]}>
                      📍 {loc}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {locationSearch.trim() !== '' && !filteredLocations.some(l => l.toLowerCase() === locationSearch.trim().toLowerCase()) && (
                <TouchableOpacity
                  style={[styles.locOptionBtn, styles.locOptionActive]}
                  onPress={() => setSelectedLocation(locationSearch.trim())}
                >
                  <Text style={styles.locOptionTextActive}>
                    ➕ Add "{locationSearch.trim()}"
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Section 4: Custom Title */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>4. Custom Title (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Morning Ritual, Tactical Drop..."
              placeholderTextColor={DESIGN_COLORS.textSecondary}
              value={customTitle}
              onChangeText={setCustomTitle}
              maxLength={40}
            />
          </View>

          {/* Section 5: Privacy */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>5. Audience Privacy & Group Targeting</Text>
            <View style={styles.privacyRow}>
              {(['public', 'friends', 'group', 'private'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.privacyBtn, privacy === p && styles.privacyBtnActive]}
                  onPress={() => setPrivacy(p)}
                >
                  <Text style={[styles.privacyText, privacy === p && styles.privacyTextActive]}>
                    {p === 'public' ? '🌍 Public' : p === 'friends' ? '👥 Friends' : p === 'group' ? '🏘️ Group' : '🔒 Private'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {privacy === 'group' && (
              <View style={{ marginTop: 6, gap: 6 }}>
                <Text style={styles.subLabel}>Target Group:</Text>
                <View style={styles.badgeWrapRow}>
                  {['Dorm 3rd Floor 🏢', 'Office Squad ☕', 'Weekend Poopers 💩'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.locOptionBtn, styles.locOptionActive]}
                    >
                      <Text style={styles.locOptionTextActive}>🏘️ {g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Logging Drop...' : 'LOG THIS DROP 💩'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: DESIGN_COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: '85%',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
      web: { boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' },
    }),
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DESIGN_COLORS.border,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_COLORS.textSecondary,
  },
  formContent: {
    gap: 20,
    paddingBottom: 10,
  },
  formSection: {
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
    marginTop: 2,
  },
  arrowScrollRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scrollArrowBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F7F7F5',
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArrowText: {
    fontSize: 14,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
    marginTop: -2,
  },
  bristolRow: {
    gap: 10,
    paddingRight: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
      },
    }),
  },
  bristolCard: {
    width: 105,
    backgroundColor: '#F7F7F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  bristolCardActive: {
    backgroundColor: DESIGN_COLORS.primary,
    borderColor: DESIGN_COLORS.primary,
  },
  bristolEmoji: {
    fontSize: 24,
  },
  bristolScaleNum: {
    fontSize: 12,
    fontWeight: '800',
    color: DESIGN_COLORS.textPrimary,
  },
  bristolName: {
    fontSize: 10,
    fontWeight: '500',
    color: DESIGN_COLORS.textSecondary,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textWhiteSub: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  badgeWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeOptionBtn: {
    backgroundColor: '#F7F7F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
  },
  sizeOptionActive: {
    backgroundColor: DESIGN_COLORS.primary,
    borderColor: DESIGN_COLORS.primary,
  },
  sizeOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  sizeOptionTextActive: {
    color: '#FFFFFF',
  },
  locOptionBtn: {
    backgroundColor: '#F7F7F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
  },
  locOptionActive: {
    backgroundColor: '#F7F2EE',
    borderColor: DESIGN_COLORS.primary,
  },
  locOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
  },
  locOptionTextActive: {
    color: DESIGN_COLORS.primary,
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: '#F7F7F5',
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: DESIGN_COLORS.textPrimary,
  },
  privacyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  privacyBtn: {
    flex: 1,
    backgroundColor: '#F7F7F5',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    alignItems: 'center',
  },
  privacyBtnActive: {
    backgroundColor: DESIGN_COLORS.primary,
    borderColor: DESIGN_COLORS.primary,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
  },
  privacyTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footerRow: {
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: DESIGN_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DESIGN_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
