/**
 * Quick Drop Modal — KulAPP
 * Native iOS 18 styled drop logger with GSAP smooth animations,
 * dynamic location search, empty default location & transparent backdrop.
 */
import { useAuthStore } from '@/stores/authStore';
import { useDropStore } from '@/stores/dropStore';
import { useFeedStore } from '@/stores/feedStore';
import { useGroupStore } from '@/stores/groupStore';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Home, Map, MapPin, Navigation, Plus, Users, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DESIGN_COLORS = {
  background: '#2D1B15',
  card: '#3E2723',
  primary: '#8D6E63',
  secondary: '#A95C33',
  textPrimary: '#EFEBE9',
  textSecondary: '#BCAAA4',
  border: '#5D4037',
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
  const { groups, fetchUserGroups } = useGroupStore();
  const { selectedMapLocation, setSelectedMapLocation } = useDropStore();

  const [bristolScale, setBristolScale] = useState<number>(4);
  const [sizeBadge, setSizeBadge] = useState<'Tiny' | 'Small' | 'Medium' | 'Large' | 'Massive'>('Medium');

  const [locationSearch, setLocationSearch] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const [customTitle, setCustomTitle] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GPS State
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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
    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && sheetRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        sheetRef.current,
        { y: 350, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }

    // 2. React Native Animation Fallback
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.back(0.8)),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [backdropAnim, sheetTranslateY]);

  // Set default group if not selected
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups]);

  const handleClose = () => {
    if (Platform.OS === 'web' && sheetRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(sheetRef.current, {
        y: 350,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push('/(tabs)');
          }
        },
      });
      return;
    }

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 400,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/(tabs)');
      }
    });
  };

  const scrollBristol = (direction: 'left' | 'right') => {
    if (bristolScrollRef.current) {
      const scrollAmount = direction === 'left' ? 0 : 450;
      bristolScrollRef.current.scrollTo({ x: scrollAmount, animated: true });
    }
  };

  const performReverseGeocoding = async (lat: number, lon: number) => {
    setIsLocating(true);
    let locationName = '';

    // 1. Try Native Geocoding (Not supported on Web)
    if (Platform.OS !== 'web') {
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });
        if (reverseGeocode && reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          locationName = [place.city || place.subregion || place.region, place.street || place.name].filter(Boolean).join(', ').trim();
        }
      } catch (e) {
        console.warn('Native reverse geocoding failed', e);
      }
    }

    // 2. Try Nominatim (OpenStreetMap) Fallback (For Web or if Native fails)
    if (!locationName) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const data = await response.json();
        if (data && data.address) {
          locationName = [
            data.address.city || data.address.town || data.address.village || data.address.county,
            data.address.road || data.address.pedestrian
          ].filter(Boolean).join(', ').trim();
        }
      } catch (e) {
        console.warn('Nominatim fallback failed', e);
      }
    }

    // 3. Fallback to Coordinates if all APIs fail
    if (locationName) {
      setLocationSearch(locationName);
      setSelectedLocation(locationName);
    } else {
      const fallback = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setLocationSearch(fallback);
      setSelectedLocation(fallback);
    }
    
    setIsLocating(false);
  };

  useEffect(() => {
    if (selectedMapLocation) {
      const { latitude: lat, longitude: lon } = selectedMapLocation;
      setLatitude(lat);
      setLongitude(lon);
      setSelectedMapLocation(null);
      performReverseGeocoding(lat, lon);
    }
  }, [selectedMapLocation]);

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Please enable location services in your settings to use this feature.');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { coords } = location;
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);

      await performReverseGeocoding(coords.latitude, coords.longitude);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch location.');
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const finalLocation = selectedLocation.trim() || locationSearch.trim() || 'Unknown Location';
    const titleToUse = customTitle.trim() || `${finalLocation} Session 💩`;
    const finalGroup = selectedGroup || null;
    const finalGroupObj = groups.find(g => g.id === finalGroup);

    await recordDrop({
      bristolScale: bristolScale as any,
      intensity: sizeBadge === 'Massive' ? 'HEAVY_ARTILLERY' : sizeBadge === 'Large' ? 'HEAVY_ARTILLERY' : 'NORMAL',
      customTitle: titleToUse,
      targetGroupId: finalGroup,
      locationName: finalLocation,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
    });

    addFeedItem({
      user_id: activeUserId,
      bristol_scale: bristolScale,
      intensity: sizeBadge === 'Massive' ? 5 : sizeBadge === 'Large' ? 4 : sizeBadge === 'Medium' ? 3 : 2,
      size_badge: sizeBadge,
      location: finalLocation,
      latitude: latitude,
      longitude: longitude,
      custom_title: titleToUse,
      target_group_id: finalGroup,
      groups: finalGroupObj ? { name: finalGroupObj.name } : null,
      profiles: {
        username: activeUsername,
        avatar_url: profile?.avatar_url || null,
      },
    });

    setIsSubmitting(false);
    handleClose();
  };

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} ref={backdropRef as any}>
        {Platform.OS !== 'web' && (
           <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
        )}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>
      <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: sheetTranslateY }] }]} ref={sheetRef as any}>
        {/* Handle */}
        <View style={styles.sheetHandle} />

        {/* Modal Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>New Poop Drop 💩</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <X size={16} color={DESIGN_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          
          {/* Section 0: Select Group */}
          {groups.length > 0 && (
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Post To Group</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeWrapRow}>
                {groups.map((g) => {
                  const isSelected = selectedGroup === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.locOptionBtn, isSelected && styles.locOptionActive]}
                      onPress={() => setSelectedGroup(g.id)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Home size={12} color={isSelected ? DESIGN_COLORS.primary : DESIGN_COLORS.textSecondary} />
                        <Text style={[styles.locOptionText, isSelected && styles.locOptionTextActive]}>
                          {g.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Section 1: Texture (Bristol Scale) */}
          <View style={styles.formSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionLabel}>1. Texture (Bristol Scale)</Text>
              <View style={styles.arrowScrollRow}>
                <TouchableOpacity style={styles.scrollArrowBtn} onPress={() => scrollBristol('left')}>
                  <ChevronLeft size={16} color={DESIGN_COLORS.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.scrollArrowBtn} onPress={() => scrollBristol('right')}>
                  <ChevronRight size={16} color={DESIGN_COLORS.textPrimary} />
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
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionLabel}>3. Location</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={styles.gpsBtn}
                  onPress={handleGetLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Navigation size={14} color={DESIGN_COLORS.textPrimary} />
                      <Text style={styles.gpsBtnText}>Locate Me</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() => router.push('/(modals)/map-picker')}
                  disabled={isLocating}
                >
                  <Map size={14} color={DESIGN_COLORS.textPrimary} />
                  <Text style={styles.gpsBtnText}>Map</Text>
                </TouchableOpacity>
              </View>
            </View>

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} color={isSelected ? DESIGN_COLORS.primary : DESIGN_COLORS.textSecondary} />
                      <Text style={[styles.locOptionText, isSelected && styles.locOptionTextActive]}>
                        {loc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {locationSearch.trim() !== '' && !filteredLocations.some(l => l.toLowerCase() === locationSearch.trim().toLowerCase()) && (
                <TouchableOpacity
                  style={[styles.locOptionBtn, styles.locOptionActive]}
                  onPress={() => setSelectedLocation(locationSearch.trim())}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Plus size={12} color={DESIGN_COLORS.primary} />
                    <Text style={styles.locOptionTextActive}>
                      Add "{locationSearch.trim()}"
                    </Text>
                  </View>
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
        {/* Submit */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#A95C33', '#8D6E63']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'LOGGING...' : 'LOG THIS DROP 💩'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheetContainer: {
    backgroundColor: '#38221D',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    maxHeight: '90%',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: { elevation: 20 },
      web: { boxShadow: '0 -6px 30px rgba(0,0,0,0.3)' },
    }),
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4E342E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    gap: 20,
    paddingBottom: 40,
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
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  subLabel: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
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
    backgroundColor: '#4E342E',
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bristolRow: {
    gap: 12,
    paddingRight: 10,
    paddingVertical: 8,
  },
  bristolCard: {
    width: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  bristolCardActive: {
    backgroundColor: 'rgba(169, 92, 51, 0.2)',
    borderColor: DESIGN_COLORS.secondary,
  },
  bristolEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  bristolScaleNum: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  bristolName: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: DESIGN_COLORS.textSecondary,
    textAlign: 'center',
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
    backgroundColor: '#4E342E',
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
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  sizeOptionTextActive: {
    color: '#FFFFFF',
  },
  locOptionBtn: {
    backgroundColor: '#4E342E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
  },
  locOptionActive: {
    backgroundColor: '#5D4037',
    borderColor: DESIGN_COLORS.primary,
  },
  locOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  locOptionTextActive: {
    color: DESIGN_COLORS.secondary,
    fontFamily: 'Inter-Bold',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(169, 92, 51, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(169, 92, 51, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  gpsBtnText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textPrimary,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: DESIGN_COLORS.textPrimary,
  },
  footerRow: {
    marginTop: 10,
  },
  submitBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: DESIGN_COLORS.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 6px 20px rgba(169, 92, 51, 0.4)' },
    }),
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
});

