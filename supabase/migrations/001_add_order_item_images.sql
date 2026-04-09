-- Add new columns to order_items for storing mockup and original design images
-- Run this in Supabase SQL Editor

-- Add columns for original high-quality design images (for sablon/printing)
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS original_front_image_url TEXT,
ADD COLUMN IF NOT EXISTS original_back_image_url TEXT,
ADD COLUMN IF NOT EXISTS mockup_url TEXT;

-- Create storage bucket for order images if it doesn't exist
-- Run this separately in Supabase Storage or via Dashboard:
-- 1. Go to Storage → Create bucket: "order-images"
-- 2. Set bucket to public
-- 3. Add policy: "Public access" → Allow read for all, Allow insert for authenticated users

-- Storage policy for order-images bucket (run in SQL Editor if needed):
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-images');

CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'order-images'
  AND auth.role() = 'authenticated'
);
