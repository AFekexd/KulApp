import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';

interface Props {
  region: Region;
  onRegionChangeComplete: (region: Region) => void;
}

export default function MapPickerMap({ region, onRegionChangeComplete }: Props) {
  return (
    <MapView
      style={StyleSheet.absoluteFillObject}
      initialRegion={region}
      region={region}
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation
      showsMyLocationButton
      userInterfaceStyle="dark"
    />
  );
}
