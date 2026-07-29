import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

// Register Android home screen widget background task handler
if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}

// Load Expo Router entry point
import 'expo-router/entry';
