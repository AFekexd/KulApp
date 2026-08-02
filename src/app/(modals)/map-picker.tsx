import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { useDropStore } from '@/stores/dropStore';
import MapPickerMap from '@/components/MapPickerMap';

// Define Region locally to avoid importing from react-native-maps entirely
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapPickerModal() {
  const router = useRouter();
  const { setSelectedMapLocation } = useDropStore();

  const [region, setRegion] = useState<Region>({
    latitude: 47.4979, // Budapest default
    longitude: 19.0402,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [markerCoordinate, setMarkerCoordinate] = useState({ latitude: 47.4979, longitude: 19.0402 });

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setMarkerCoordinate({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      }
    })();
  }, []);

  const handleConfirm = () => {
    setSelectedMapLocation({ latitude: markerCoordinate.latitude, longitude: markerCoordinate.longitude });
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(modals)/quick-drop');
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(modals)/quick-drop');
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={{ color: 'white', marginBottom: 20 }}>Maps are not supported on Web in this configuration.</Text>
        <TouchableOpacity onPress={handleClose} style={styles.confirmBtn}>
          <Text style={styles.confirmText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={styles.container} entering={FadeIn}>
      <MapPickerMap
        region={region}
        onRegionChangeComplete={(r: Region) => {
          setRegion(r);
          setMarkerCoordinate({ latitude: r.latitude, longitude: r.longitude });
        }}
      />

      <View style={styles.centerMarker} pointerEvents="none">
        <Text style={{ fontSize: 40 }}>📍</Text>
      </View>

      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Move pin to select</Text>
        <View style={{ width: 40 }} />
      </BlurView>

      <Animated.View entering={SlideInDown.delay(200)} style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Check color="#fff" size={20} />
          <Text style={styles.confirmText}>Confirm Location</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  centerMarker: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  confirmBtn: {
    backgroundColor: '#A95C33',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
