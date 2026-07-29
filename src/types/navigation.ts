/**
 * KulApp Navigation Types
 * Used for Expo Router typed routes
 */

export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  '+not-found': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'reset-password': undefined;
};

export type TabsParamList = {
  index: undefined;
  friends: undefined;
  groups: undefined;
  profile: undefined;
};

export type DropModalParamList = {
  'new-drop': undefined;
  'drop-details': { id: string };
};

export type GroupStackParamList = {
  'group-details': { id: string };
  'group-settings': { id: string };
  'new-group': undefined;
};

// Map of all valid routes for type-safe navigation
export type AppRoutes = 
  | '/'
  | '/(auth)/login'
  | '/(auth)/register'
  | '/(tabs)'
  | '/(tabs)/friends'
  | '/(tabs)/groups'
  | '/(tabs)/profile'
  | '/new-drop'
  | `/drop-details/${string}`
  | `/groups/${string}`
  | `/groups/${string}/settings`
  | '/groups/new';
