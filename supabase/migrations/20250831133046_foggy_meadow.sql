/*
  # Fix Events table RLS policy

  1. Security Changes
    - Add policy to allow anonymous users to insert events
    - Add policy to allow anonymous users to select events
    - Keep RLS enabled for security

  This allows the application to create and view events without requiring authentication.
*/

-- Allow anonymous users to insert events
CREATE POLICY "Allow anonymous insert on Events"
  ON public."Events"
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to select events  
CREATE POLICY "Allow anonymous select on Events"
  ON public."Events"
  FOR SELECT
  TO anon
  USING (true);