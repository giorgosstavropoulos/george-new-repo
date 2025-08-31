/*
  # Fix storage bucket RLS policy

  1. Security Changes
    - Add policy to allow anonymous users to upload to event-images bucket
    - Add policy to allow anonymous users to view images from event-images bucket

  This allows the application to upload and view event images without requiring authentication.
*/

-- Allow anonymous users to upload to event-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload files
CREATE POLICY "Allow anonymous upload to event-images"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'event-images');

-- Allow anonymous users to view files
CREATE POLICY "Allow anonymous select from event-images"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'event-images');