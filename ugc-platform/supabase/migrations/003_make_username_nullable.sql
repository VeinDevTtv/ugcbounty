-- Migration: Make username nullable in user_profiles
-- This migration removes the NOT NULL and UNIQUE constraints from the username column
-- to match the og implementation where username is optional (Clerk users may not have usernames)

-- Drop unique constraint first (must be done before removing NOT NULL)
-- PostgreSQL auto-generates constraint names like 'user_profiles_username_key' for unique constraints
ALTER TABLE user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_username_key;

-- Remove NOT NULL constraint from username column
-- This allows NULL values to match the og schema pattern where username TEXT (nullable)
ALTER TABLE user_profiles 
  ALTER COLUMN username DROP NOT NULL;

-- Note: Username is now nullable to match og implementation.
-- The webhook handler generates a default username (user_<first8chars>) when Clerk doesn't provide one,
-- but the database schema allows NULL values for cases where no username is needed.

