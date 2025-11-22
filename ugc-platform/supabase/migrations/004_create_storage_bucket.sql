-- Create storage bucket for bounty assets (logos, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bounty-assets',
  'bounty-assets',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload bounty assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can read bounty assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own bounty assets" ON storage.objects;

-- Create storage policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload bounty assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bounty-assets' AND
  (storage.foldername(name))[1] = 'bounty-logos'
);

-- Create storage policy: Allow public read access
CREATE POLICY "Public can read bounty assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'bounty-assets');

-- Create storage policy: Allow users to delete their own uploads
CREATE POLICY "Users can delete their own bounty assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'bounty-assets' AND
  (storage.foldername(name))[1] = 'bounty-logos' AND
  (auth.jwt()->>'sub')::text = (storage.foldername(name))[2]
);

