-- Migration: Add rosary_final_prayers column to user_liturgy_preferences table
-- This adds the JSONB column to store user's customized final prayer configuration

-- Add rosary_final_prayers column to existing tables (migration)
-- Run this if the table already exists without this column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'rosary_final_prayers'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN rosary_final_prayers JSONB DEFAULT '[{"id": "hail_holy_queen", "order": 1}, {"id": "versicle_response", "order": 2}, {"id": "rosary_prayer", "order": 3}]'::jsonb;
  END IF;
END $$;
