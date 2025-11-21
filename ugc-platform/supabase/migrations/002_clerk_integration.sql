-- Migration: Clerk Integration
-- This migration updates the database schema and RLS policies to work with Clerk authentication

-- First, we need to handle Clerk user IDs (strings) vs UUID
-- Option 1: Change user_id to TEXT to accommodate Clerk string IDs
-- Option 2: Keep UUID and add clerk_user_id column
-- We'll go with Option 1 for simplicity, but this requires dropping and recreating foreign keys

-- IMPORTANT: Drop RLS policies FIRST before altering column types
-- PostgreSQL doesn't allow altering column types that are used in policy definitions
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Bounties are publicly readable" ON bounties;
DROP POLICY IF EXISTS "Creators can manage their own bounties" ON bounties;
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can create their own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can update their own pending submissions" ON submissions;

-- Drop existing foreign key constraints
ALTER TABLE bounties DROP CONSTRAINT IF EXISTS bounties_creator_id_fkey;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_bounty_id_fkey;

-- Change user_id column type from UUID to TEXT to support Clerk string IDs
-- Now that policies are dropped, we can safely alter the column type
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key constraints with TEXT type
ALTER TABLE bounties 
  ALTER COLUMN creator_id TYPE TEXT,
  ADD CONSTRAINT bounties_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES user_profiles(user_id);

ALTER TABLE submissions 
  ALTER COLUMN user_id TYPE TEXT,
  ADD CONSTRAINT submissions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id);

-- Keep bounty_id as UUID since it's not tied to Clerk
ALTER TABLE submissions 
  ADD CONSTRAINT submissions_bounty_id_fkey 
    FOREIGN KEY (bounty_id) REFERENCES bounties(id);

-- Create new RLS policies that work with Clerk JWT tokens
-- Clerk JWT contains user ID in the 'sub' claim

-- User profiles: Users can view their own profile
CREATE POLICY "Users can view their own profile (Clerk)"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'sub')::text = user_id);

-- User profiles: Users can update their own profile
CREATE POLICY "Users can update their own profile (Clerk)"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- User profiles: Users can insert their own profile
CREATE POLICY "Users can insert their own profile (Clerk)"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- Bounties: Everyone can read bounties (public)
CREATE POLICY "Bounties are publicly readable (Clerk)"
  ON bounties
  FOR SELECT
  TO authenticated
  USING (true);

-- Bounties: Only creators can create/update/delete their own bounties
CREATE POLICY "Creators can manage their own bounties (Clerk)"
  ON bounties
  FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'sub')::text = creator_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = creator_id);

-- Submissions: Users can view their own submissions
CREATE POLICY "Users can view their own submissions (Clerk)"
  ON submissions
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'sub')::text = user_id);

-- Submissions: Users can create their own submissions
CREATE POLICY "Users can create their own submissions (Clerk)"
  ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- Submissions: Users can update their own pending submissions
CREATE POLICY "Users can update their own pending submissions (Clerk)"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'sub')::text = user_id AND status = 'pending')
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- Note: Admin validation policies would need to be added based on your authentication setup
-- For now, admin operations will require service role key (server-side only)

