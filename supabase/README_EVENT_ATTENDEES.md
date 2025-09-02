This project added a new table `event_attendees` to track which users attend which events.

Migration file:
- supabase/migrations/20250901150000_create_event_attendees.sql

Notes:
- The migration creates `event_attendees(id uuid, event_id, user_id, created_at)` and a unique index on (event_id, user_id).
- The migration adds a foreign key to `auth.users(id)` for `user_id`. It comments out the FK to `Events` since Events.id in this project may not be a uuid; adjust if necessary.

How to run:
- Apply the SQL using your Supabase migration tooling or psql against the database.
- Ensure the SQL function gen_random_uuid() exists (pgcrypto or pgcrypto extension). If not present, replace with uuid_generate_v4() after enabling the uuid-ossp extension.

Client:
- The frontend now uses `event_attendees` to insert/delete attendance rows when a user clicks Attend/Leave in the event modal.
- The app updates `Events.attendees` count as a convenience summary; the source of truth for attendance membership is the `event_attendees` table.
