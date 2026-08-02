-- ============================================================================
-- KulApp — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates all core tables, indexes, RLS policies, and triggers
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- PROFILES — User profiles linked to Supabase Auth
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profiles — extends Supabase auth.users';

-- GROUPS — Social groups (e.g., "Dorm 3rd Floor")
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE groups IS 'Social groups for sharing drops within a community';
COMMENT ON COLUMN groups.invite_code IS 'Unique 6-character alphanumeric code for joining';

-- GROUP MEMBERSHIPS — Many-to-many user↔group
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'ADMIN', 'OWNER')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

COMMENT ON TABLE group_members IS 'Maps users to their groups with role info';

-- DROPS — The core stool record ("a drop")
CREATE TABLE drops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bristol_scale INTEGER CHECK (bristol_scale BETWEEN 1 AND 7) DEFAULT 4,
  intensity TEXT DEFAULT 'NORMAL'
    CHECK (intensity IN ('LIGHT', 'NORMAL', 'HEAVY_ARTILLERY')),
  custom_title TEXT,
  photo_url TEXT,
  target_group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  duration_seconds INTEGER, -- Optional: time spent
  notes TEXT,              -- Optional: private notes
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE drops IS 'Core stool tracking records — the heart of KulApp';
COMMENT ON COLUMN drops.bristol_scale IS 'Bristol Stool Scale type 1-7';
COMMENT ON COLUMN drops.intensity IS 'Subjective intensity: LIGHT, NORMAL, or HEAVY_ARTILLERY';
COMMENT ON COLUMN drops.photo_url IS 'Optional photo URL — always rendered with NSFW blur';

-- REACTIONS — Strava-style emoji reactions on drops
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drop_id UUID REFERENCES drops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji_type TEXT NOT NULL
    CHECK (emoji_type IN ('TP', 'CROWN', 'BIOHAZARD', 'FIRE')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(drop_id, user_id, emoji_type) -- One reaction type per user per drop
);

COMMENT ON TABLE reactions IS 'Emoji reactions on drops: 🧻 TP, 👑 Crown, ☣️ Biohazard, 🚒 Fire';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Drops: fast lookup by user and chronological feed
CREATE INDEX idx_drops_user_id ON drops(user_id);
CREATE INDEX idx_drops_created_at ON drops(created_at DESC);
CREATE INDEX idx_drops_user_date ON drops(user_id, created_at DESC);
CREATE INDEX idx_drops_group ON drops(target_group_id) WHERE target_group_id IS NOT NULL;

-- Group members: fast membership checks
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- Reactions: fast aggregation per drop
CREATE INDEX idx_reactions_drop ON reactions(drop_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true); -- Profiles are publicly readable (username, avatar, etc.)

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- GROUPS ----
CREATE POLICY "groups_select_member"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- Allow anyone to read group by invite code (for joining)
CREATE POLICY "groups_select_by_invite"
  ON groups FOR SELECT
  USING (true); -- Needed so users can look up groups by invite_code to join

CREATE POLICY "groups_insert_authenticated"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_update_owner"
  ON groups FOR UPDATE
  USING (auth.uid() = created_by);

-- ---- GROUP MEMBERS ----
-- Fix infinite recursion by using direct user_id check instead of self-referencing subquery
CREATE POLICY "group_members_select_self"
  ON group_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "group_members_insert_self"
  ON group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "group_members_delete_self"
  ON group_members FOR DELETE
  USING (user_id = auth.uid());

-- ---- DROPS ----
-- Users can always see their own drops
CREATE POLICY "drops_select_own"
  ON drops FOR SELECT
  USING (user_id = auth.uid());

-- Users can see GROUP-level drops if they're in the target group
CREATE POLICY "drops_select_group"
  ON drops FOR SELECT
  USING (
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = drops.target_group_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "drops_insert_own"
  ON drops FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "drops_update_own"
  ON drops FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "drops_delete_own"
  ON drops FOR DELETE
  USING (user_id = auth.uid());

-- ---- REACTIONS ----
-- Reactions visible if the drop is visible (simplified: allow all reads,
-- since drop-level RLS already controls visibility)
CREATE POLICY "reactions_select_all"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "reactions_insert_own"
  ON reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete_own"
  ON reactions FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-create profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || LEFT(NEW.id::text, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update `updated_at` timestamp on profile changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Get daily drop count for a user
CREATE OR REPLACE FUNCTION public.get_daily_count(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM drops
  WHERE user_id = p_user_id
  AND created_at::date = p_date;
$$;

-- Get current streak (consecutive days with at least one drop)
CREATE OR REPLACE FUNCTION public.get_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_drop BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM drops
      WHERE user_id = p_user_id
      AND created_at::date = check_date
    ) INTO has_drop;

    IF NOT has_drop THEN
      -- If today has no drops, check if yesterday does (user might not have gone yet today)
      IF check_date = CURRENT_DATE THEN
        check_date := check_date - 1;
        CONTINUE;
      END IF;
      EXIT;
    END IF;

    streak := streak + 1;
    check_date := check_date - 1;
  END LOOP;

  RETURN streak;
END;
$$;

-- Get the user's most active hour ("bathroom timezone")
CREATE OR REPLACE FUNCTION public.get_peak_hour(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT EXTRACT(HOUR FROM created_at)::INTEGER as peak_hour
  FROM drops
  WHERE user_id = p_user_id
  GROUP BY peak_hour
  ORDER BY COUNT(*) DESC
  LIMIT 1;
$$;

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for tables that need live updates
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE drops;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- ============================================================================
-- STORAGE BUCKETS (run via Supabase Dashboard or API)
-- ============================================================================

-- Note: Storage bucket creation is typically done via the Supabase Dashboard.
-- If using supabase CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('drop-photos', 'drop-photos', false);
