/*
 Backfill creator_id on Events by matching event.artist to user full_name or email.
 Usage:
   # preview (dry run)
   DATABASE_URL="postgres://..." node scripts/backfill_creator_id.cjs

   # apply changes
   DATABASE_URL="postgres://..." node scripts/backfill_creator_id.cjs --apply

 Note: Use your Supabase service_role key connection string as DATABASE_URL for write access.
*/

const { Client } = require('pg');

async function main() {
  const apply = process.argv.includes('--apply');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Please set DATABASE_URL environment variable (service role connection string recommended)');
    process.exit(2);
  }
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log('Fetching candidate matches (this is a dry-run unless --apply is provided)');
    const previewSql = `
      WITH users_normalized AS (
        SELECT id, lower(coalesce(user_metadata->>'full_name', email)) AS norm
        FROM auth.users
      )
      SELECT e.id as event_id, e.artist, e.creator_id, u.id as matched_user_id, u.norm as matched_norm
      FROM public."Events" e
      JOIN users_normalized u
        ON lower(coalesce(e.artist, '')) = u.norm
      WHERE e.creator_id IS NULL
      ORDER BY e.id;
    `;
    const res = await client.query(previewSql);
    if (!res.rows.length) {
      console.log('No candidate rows found for exact-match backfill');
      return;
    }
    console.log('Preview matches:');
    for (const r of res.rows) {
      console.log(`event ${r.event_id} artist='${r.artist}' -> user ${r.matched_user_id} (${r.matched_norm})`);
    }
    if (!apply) {
      console.log('\nDry run complete. Run with --apply to perform updates.');
      return;
    }

    console.log('\nApplying backfill updates...');
    // Use the deterministic update that picks the first matching user per event
    const updateSql = `
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
        AND ec.rn = 1
      RETURNING e.id as updated_event_id, e.creator_id as new_creator;
    `;

    const updateRes = await client.query(updateSql);
    console.log(`Updated ${updateRes.rowCount} rows`);
    for (const row of updateRes.rows) {
      console.log(`event ${row.updated_event_id} -> creator ${row.new_creator}`);
    }
  } catch (err) {
    console.error('Error during backfill', err);
  } finally {
    await client.end();
  }
}

main();
