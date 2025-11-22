-- Add role column to user_profiles table
-- Role determines if user is a 'creator' (submits to bounties) or 'business' (creates bounties)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('creator', 'business'));

-- Add comment to clarify the field purpose
COMMENT ON COLUMN user_profiles.role IS 'User role: creator (submits to bounties) or business (creates bounties). NULL for users who have not selected a role yet.';

-- Add index for performance when querying by role
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

