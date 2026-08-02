/**
 * KulApp Database Types
 * Aligned with updated PostgreSQL Schema (Section 3 of Project Spec)
 */

export type BristolScale = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SizeBadge = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Massive';
export type Intensity = 'LIGHT' | 'NORMAL' | 'HEAVY_ARTILLERY';
export type EmojiType = 'TP' | 'CROWN' | 'BIOHAZARD' | 'FIRE';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          current_level: number;
          total_xp: number;
          streak_days: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          current_level?: number;
          total_xp?: number;
          streak_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          current_level?: number;
          total_xp?: number;
          streak_days?: number;
          updated_at?: string;
        };
      };
      drops: {
        Row: {
          id: string;
          user_id: string;
          size_badge: SizeBadge;
          location_name: string;
          verification_score: number;
          reaction_count: number;
          photo_url: string | null;
          custom_title?: string | null;
          bristol_scale?: BristolScale;
          intensity?: Intensity;
          target_group_id?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          size_badge?: SizeBadge;
          location_name?: string;
          verification_score?: number;
          reaction_count?: number;
          photo_url?: string | null;
          custom_title?: string | null;
          bristol_scale?: BristolScale;
          intensity?: Intensity;
          target_group_id?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: {
          size_badge?: SizeBadge;
          location_name?: string;
          verification_score?: number;
          reaction_count?: number;
          photo_url?: string | null;
          custom_title?: string | null;
          target_group_id?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          invite_code: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          invite_code: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          invite_code?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          badge_title: string;
          emoji_icon: string;
        };
        Insert: {
          id?: string;
          badge_title: string;
          emoji_icon: string;
        };
        Update: {
          badge_title?: string;
          emoji_icon?: string;
        };
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          unlocked_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Drop = Database['public']['Tables']['drops']['Row'];
export type DropInsert = Database['public']['Tables']['drops']['Insert'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];

export interface UserPreferences {
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
  soundEffects: boolean;
  stealthMode: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  notificationsEnabled: true,
  hapticFeedback: true,
  soundEffects: true,
  stealthMode: false,
};
