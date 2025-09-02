-- Add creator_id to Events so we can track who created each event
-- This migration adds a nullable uuid column. Optionally add a foreign key to auth.users if desired.

ALTER TABLE public."Events"
  ADD COLUMN IF NOT EXISTS creator_id uuid;

-- Optional foreign key (uncomment if your DB allows referencing auth.users):
-- ALTER TABLE public."Events"
--   ADD CONSTRAINT events_creator_fkey FOREIGN KEY (creator_id) REFERENCES auth.users (id) ON DELETE SET NULL;
