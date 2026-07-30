#!/usr/bin/env node
/**
 * run_migration_backfill.js
 *
 * Usage:
 *  - Set DATABASE_URL (Postgres connection string) in env, or PG_CONNECTION_STRING.
 *  - Optionally set BACKFILL_OWNER_UID to create a default studio owned by that auth uid.
 *  - Optionally set DEFAULT_STUDIO_SLUG (default: "default") and DEFAULT_STUDIO_NAME.
 *
 * Example:
 *  DATABASE_URL="postgres://user:pass@host:5432/db" BACKFILL_OWNER_UID="<AUTH_UID>" node scripts/run_migration_backfill.js
 *
 * This script reads the SQL migration file at supabase/migrations/001_create_studios_and_backfill.sql
 * and executes it. If BACKFILL_OWNER_UID is provided, it will create a studio and update existing rows
 * to reference the new studio id.
 *
 * IMPORTANT: This requires privileges to ALTER TABLE and INSERT (prefer running with a service role / DB owner account).
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const MIGRATION_PATH = path.resolve(__dirname, '..', 'supabase', 'migrations', '001_create_studios_and_backfill.sql');

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL or PG_CONNECTION_STRING is required.');
    process.exit(1);
  }

  const backfillOwner = process.env.BACKFILL_OWNER_UID;
  const studioSlug = process.env.DEFAULT_STUDIO_SLUG || 'default';
  const studioName = process.env.DEFAULT_STUDIO_NAME || 'Studio Padrão';

  const sql = fs.readFileSync(MIGRATION_PATH, 'utf-8');
  console.log('Loaded migration file:', MIGRATION_PATH);

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log('Starting transaction...');
    await client.query('BEGIN');

    // Execute migration SQL (split into statements)
    // Very simple splitter: split on ";\n", keep non-empty
    const parts = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      // Skip purely comment blocks
      if (/^--/.test(part)) continue;
      console.log('Executing SQL chunk (preview):', part.split('\n')[0].slice(0, 200));
      await client.query(part + ';');
    }

    if (backfillOwner) {
      console.log('Creating default studio for owner UID:', backfillOwner);
      const insertRes = await client.query(
        `INSERT INTO public.studios (slug, name, owner_uid) VALUES ($1, $2, $3) RETURNING id`,
        [studioSlug, studioName, backfillOwner]
      );
      const newStudioId = insertRes.rows[0].id;
      console.log('Created studio id:', newStudioId);

      console.log('Updating existing rows to reference new studio id...');
      const tables = ['services', 'professionals', 'clients', 'appointments', 'studio_settings'];
      for (const t of tables) {
        const q = `UPDATE public.${t} SET studio_id = $1 WHERE studio_id IS NULL`;
        const res = await client.query(q, [newStudioId]);
        console.log(`Updated ${res.rowCount} rows in ${t}`);
      }
    } else {
      console.log('No BACKFILL_OWNER_UID provided. Skipping backfill.');
    }

    console.log('Committing transaction...');
    await client.query('COMMIT');
    console.log('Migration & backfill completed successfully.');
  } catch (err) {
    console.error('Error during migration:', err);
    try {
      console.log('Rolling back...');
      await client.query('ROLLBACK');
    } catch (rbErr) {
      console.error('Rollback error:', rbErr);
    }
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
