-- Add metadata fields to submissions table (matching og/ implementation)
-- Note: Using DO block to check if columns exist before adding (PostgreSQL doesn't support IF NOT EXISTS for ADD COLUMN)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='title') THEN
    ALTER TABLE submissions ADD COLUMN title TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='description') THEN
    ALTER TABLE submissions ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='cover_image_url') THEN
    ALTER TABLE submissions ADD COLUMN cover_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='author') THEN
    ALTER TABLE submissions ADD COLUMN author TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='platform') THEN
    ALTER TABLE submissions ADD COLUMN platform TEXT CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'other'));
  END IF;
END $$;

-- Add index for platform queries
CREATE INDEX IF NOT EXISTS idx_submissions_platform ON submissions(platform);

