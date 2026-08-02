-- ============================================================================
-- KulApp — Database Migration
-- Migration: 002_add_location_to_drops.sql
-- Description: Adds latitude and longitude columns to drops table
-- ============================================================================

ALTER TABLE drops ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE drops ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
