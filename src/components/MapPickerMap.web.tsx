import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function MapPickerMap(props: any) {
  return (
    <View style={styles.container}>
      <Text style={{ color: 'white' }}>Maps are not supported on Web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
