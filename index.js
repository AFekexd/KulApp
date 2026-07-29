import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

// Register Android home screen widget background task handler
registerWidgetTaskHandler(widgetTaskHandler);

// Load Expo Router entry point
import 'expo-router/entry';
