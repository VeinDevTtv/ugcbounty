-- Add instructions field to bounties table
-- Instructions contain the exact requirements that submitted videos must meet to be accepted
ALTER TABLE bounties 
ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Add comment to clarify the field purpose
COMMENT ON COLUMN bounties.instructions IS 'Exact instructions that submitted videos must follow to be accepted for this bounty. Used for validation.';

