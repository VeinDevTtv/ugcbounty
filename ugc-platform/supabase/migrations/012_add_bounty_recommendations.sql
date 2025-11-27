-- Migration: Add Bounty Recommendations Table
-- This migration creates a table to cache AI-generated bounty recommendations for creators

-- Create bounty_recommendations table to cache recommendations per user
CREATE TABLE IF NOT EXISTS bounty_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  bounty_id UUID NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
  match_score NUMERIC NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons JSONB DEFAULT '[]',
  platform_match BOOLEAN DEFAULT false,
  content_style_match BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  last_calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, bounty_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_bounty_recommendations_user_id ON bounty_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_bounty_recommendations_bounty_id ON bounty_recommendations(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_recommendations_match_score ON bounty_recommendations(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_bounty_recommendations_last_calculated_at ON bounty_recommendations(last_calculated_at);

-- Add trigger for updated_at (using existing function)
CREATE TRIGGER update_bounty_recommendations_updated_at
  BEFORE UPDATE ON bounty_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to clarify the table purpose
COMMENT ON TABLE bounty_recommendations IS 'Caches AI-generated bounty recommendations for creators. Recommendations are recalculated every 24 hours or when user creates new submissions.';

