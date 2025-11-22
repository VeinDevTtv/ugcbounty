-- Migration: Optimize role queries for better performance
-- This ensures proper indexing for role-based queries and user lookups

-- Verify and create index on user_id if it doesn't exist (for fast user lookups)
-- Note: user_id is the primary key, so it should already have an index, but we'll verify
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_lookup ON user_profiles(user_id);

-- Ensure role index exists (from migration 008)
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Create composite index for common query pattern: user_id + role
-- This optimizes queries that check both user_id and role together
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_role ON user_profiles(user_id, role) WHERE role IS NOT NULL;

-- Add comment explaining the indexes
COMMENT ON INDEX idx_user_profiles_user_id_lookup IS 'Index for fast user lookups by user_id';
COMMENT ON INDEX idx_user_profiles_role IS 'Index for filtering users by role';
COMMENT ON INDEX idx_user_profiles_user_role IS 'Composite index for user_id + role queries (only includes rows with roles)';

-- Verify the role column constraints
DO $$
BEGIN
    -- Check if CHECK constraint exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'user_profiles_role_check'
    ) THEN
        -- Add CHECK constraint if it doesn't exist
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_role_check 
        CHECK (role IS NULL OR role IN ('creator', 'business'));
    END IF;
END $$;

-- Analyze tables to update statistics for query planner
ANALYZE user_profiles;

