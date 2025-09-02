-- Create event_attendees table to track which users attend which events
-- Columns: id (uuid), event_id (references Events), user_id (references auth.users), created_at
-- Unique constraint to prevent duplicate attendance records

-- Ensure pgcrypto is available for gen_random_uuid(); if your DB prefers uuid-ossp, replace accordingly.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.event_attendees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure referential integrity if Events table uses uuid id; adjust type if Events uses integer
-- Add foreign key constraints when appropriate
-- If Events.id is not uuid, comment out the FK or change type accordingly.

-- Optional FK to Events (uncomment if Events.id is uuid)
-- ALTER TABLE public.event_attendees
--   ADD CONSTRAINT fk_event
--   FOREIGN KEY (event_id) REFERENCES public."Events"(id) ON DELETE CASCADE;

ALTER TABLE public.event_attendees
  ADD CONSTRAINT event_attendees_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

BEGIN;
ALTER TABLE public.event_attendees
  ALTER COLUMN event_id TYPE text USING event_id::text;
DROP INDEX IF EXISTS idx_event_user_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_user_unique ON public.event_attendees(event_id, user_id);
COMMIT;
