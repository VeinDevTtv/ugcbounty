-- Migration: Add indexes for analytics queries
-- These indexes optimize time-based queries for the analytics dashboard

-- Index on submissions.created_at for time-series analytics
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

-- Index on bounties.created_at for time-series analytics
CREATE INDEX IF NOT EXISTS idx_bounties_created_at ON bounties(created_at);

-- Composite index on submissions for user_id + created_at (for creator analytics)
CREATE INDEX IF NOT EXISTS idx_submissions_user_created ON submissions(user_id, created_at);

-- Composite index on submissions for bounty_id + created_at (for business analytics)
CREATE INDEX IF NOT EXISTS idx_submissions_bounty_created ON submissions(bounty_id, created_at);

-- Composite index on bounties for creator_id + created_at (for business analytics)
CREATE INDEX IF NOT EXISTS idx_bounties_creator_created ON bounties(creator_id, created_at);

-- Index on submissions.platform for platform breakdown queries
CREATE INDEX IF NOT EXISTS idx_submissions_platform ON submissions(platform) WHERE platform IS NOT NULL;

