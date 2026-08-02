-- ============================================================================
-- KulApp — Database Migration
-- Migration: 003_add_location_name_to_drops.sql
-- Description: Adds location_name column to drops table
-- ============================================================================

ALTER TABLE drops ADD COLUMN IF NOT EXISTS location_name TEXT;
