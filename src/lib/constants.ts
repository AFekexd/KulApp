/**
 * KulAPP Constants
 */
import { Colors } from '@/theme/colors';

export const APP_NAME = 'KulAPP';

export const REACTIONS = {
  TP: { emoji: '🧻', label: 'Send Paper', color: Colors.dark.text },
  CROWN: { emoji: '👑', label: 'King', color: Colors.accent.gold },
  BIOHAZARD: { emoji: '☣️', label: 'Biohazard', color: Colors.accent.coral },
  FIRE: { emoji: '🚒', label: 'Call Firefighters', color: Colors.accent.peach },
};

export const BRISTOL_SCALE = [
  { type: 1, name: 'Type 1', emoji: '🪨', description: 'Separate hard lumps, like nuts', character: 'The Marble' },
  { type: 2, name: 'Type 2', emoji: '🐛', description: 'Sausage-shaped but lumpy', character: 'The Caterpillar' },
  { type: 3, name: 'Type 3', emoji: '🌽', description: 'Like a sausage but with cracks', character: 'The Corncob' },
  { type: 4, name: 'Type 4', emoji: '🐍', description: 'Like a sausage or snake, smooth', character: 'The Snake' },
  { type: 5, name: 'Type 5', emoji: '☁️', description: 'Soft blobs with clear-cut edges', character: 'The Cloud' },
  { type: 6, name: 'Type 6', emoji: '🥣', description: 'Fluffy pieces with ragged edges', character: 'The Porridge' },
  { type: 7, name: 'Type 7', emoji: '🌊', description: 'Watery, no solid pieces', character: 'The Tsunami' },
];

export const INTENSITY_LEVELS = {
  LIGHT: { label: 'Light Breeze', emoji: '🌬️', value: 'LIGHT' },
  NORMAL: { label: 'Standard Issue', emoji: '💩', value: 'NORMAL' },
  HEAVY_ARTILLERY: { label: 'Heavy Artillery', emoji: '💣', value: 'HEAVY_ARTILLERY' },
};


export const FUNNY_TITLES = [
  'The Morning Ritual',
  'Emergency Summit',
  'The Sequel',
  'Operation Dumbo Drop',
  'Code Brown',
  'Release the Kraken',
  'Dropping the Kids at the Pool',
  'Nature Calls',
  'The Download',
  'Ghost in the Shell',
  'The Awakening',
  'Unfinished Business',
  'Taking the Throne',
  'Royal Decree',
  'The Exorcism',
  'Clear and Present Danger',
  'The Phantom Menace',
  'A New Hope',
  'The Empire Strikes Back',
  'Return of the Jedi',
];
