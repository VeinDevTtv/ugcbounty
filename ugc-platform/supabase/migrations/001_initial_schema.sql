-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  total_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create bounties table
CREATE TABLE IF NOT EXISTS bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  total_bounty NUMERIC NOT NULL,
  rate_per_1k_views NUMERIC NOT NULL,
  claimed_bounty NUMERIC DEFAULT 0,
  creator_id UUID REFERENCES user_profiles(user_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID REFERENCES bounties(id),
  user_id UUID REFERENCES user_profiles(user_id),
  video_url TEXT NOT NULL,
  view_count NUMERIC DEFAULT 0,
  earned_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  validation_explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bounties_creator_id ON bounties(creator_id);
CREATE INDEX IF NOT EXISTS idx_submissions_bounty_id ON submissions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bounties_updated_at
  BEFORE UPDATE ON bounties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can read their own profiles, bounties are public for reading)
-- These are basic policies - adjust based on your authentication requirements

-- User profiles: Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- User profiles: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Bounties: Everyone can read bounties
CREATE POLICY "Bounties are publicly readable"
  ON bounties
  FOR SELECT
  USING (true);

-- Bounties: Only creators can create/update/delete their own bounties
CREATE POLICY "Creators can manage their own bounties"
  ON bounties
  FOR ALL
  USING (auth.uid() = creator_id);

-- Submissions: Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
  ON submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Submissions: Users can create their own submissions
CREATE POLICY "Users can create their own submissions"
  ON submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Submissions: Users can update their own pending submissions
CREATE POLICY "Users can update their own pending submissions"
  ON submissions
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Note: Admin validation policies would need to be added based on your authentication setup
-- For now, admin operations will require service role key (server-side only)

