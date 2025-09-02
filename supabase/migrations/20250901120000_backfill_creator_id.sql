-- Backfill creator_id for existing rows in public."Events"
-- Strategy:
-- 1) Exact-match the event.artist to the user's full_name (user_metadata->>'full_name') or email (case-insensitive).
-- 2) Only update rows where creator_id IS NULL.
-- 3) If multiple users match the same event artist, pick one deterministically (ORDER BY id) using ROW_NUMBER and only update rn = 1.

-- NOTE: Run this using a DB tool with appropriate privileges (service role). Test on a copy or run inside a transaction first.

WITH users_normalized AS (
  SELECT id, lower(coalesce(user_metadata->>'full_name', email)) AS norm
  FROM auth.users
), events_candidates AS (
  SELECT
    e.id AS event_id,
    u.id AS user_id,
    ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY u.id) AS rn
  FROM public."Events" e
  JOIN users_normalized u
    ON lower(coalesce(e.artist, '')) = u.norm
  WHERE e.creator_id IS NULL
)
UPDATE public."Events" e
SET creator_id = ec.user_id
FROM events_candidates ec
WHERE e.id = ec.event_id
  AND ec.rn = 1;

-- If you want to use a more permissive/fuzzy matching strategy (risky, may produce false positives),
-- uncomment and run the block below instead of the above. It matches when artist ILIKE user's name or email.
-- Be careful and review results before committing in production.

-- WITH users_normalized AS (
--   SELECT id, lower(coalesce(user_metadata->>'full_name', email)) AS norm
--   FROM auth.users
-- ), events_candidates AS (
--   SELECT
--     e.id AS event_id,
--     u.id AS user_id,
--     ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY u.id) AS rn
--   FROM public."Events" e
--   JOIN users_normalized u
--     ON lower(coalesce(e.artist, '')) ILIKE ('%' || u.norm || '%')
--   WHERE e.creator_id IS NULL
-- )
-- UPDATE public."Events" e
-- SET creator_id = ec.user_id
-- FROM events_candidates ec
-- WHERE e.id = ec.event_id
--   AND ec.rn = 1;
