-- Add logo_url and company_name columns to bounties table
-- Note: Using DO block to check if columns exist before adding (PostgreSQL doesn't support IF NOT EXISTS for ADD COLUMN)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bounties' AND column_name='logo_url') THEN
    ALTER TABLE bounties ADD COLUMN logo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bounties' AND column_name='company_name') THEN
    ALTER TABLE bounties ADD COLUMN company_name TEXT;
  END IF;
END $$;

-- Create index for better query performance on company_name
CREATE INDEX IF NOT EXISTS idx_bounties_company_name ON bounties(company_name);

