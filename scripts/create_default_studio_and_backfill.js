#!/usr/bin/env node
/**
 * create_default_studio_and_backfill.js
 *
 * Creates a default studio (slug = 'default') if not exists (owner_uid = NULL)
 * and backfills studio_id on core tables (services, professionals, clients, appointments, studio_settings).
 *
 * Usage:
 *  - Set DATABASE_URL env var (Postgres connection string)
 *  - node scripts/create_default_studio_and_backfill.js
 *
 * The script is idempotent: if a studio with slug 'default' already exists, it will use that id.
 * It runs updates inside a transaction and prints the used studio id and counts of updated rows.
 */

const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL or PG_CONNECTION_STRING is required.');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query('BEGIN');

    // Check if default studio already exists
    const { rows: found } = await client.query("SELECT id FROM public.studios WHERE slug = 'default' LIMIT 1");
    let studioId;
    if (found && found.length > 0) {
      studioId = found[0].id;
      console.log('Found existing default studio id:', studioId);
    } else {
      const insertRes = await client.query(
        "INSERT INTO public.studios (slug, name, owner_uid) VALUES ($1, $2, NULL) RETURNING id",
        ['default', 'Studio Padrão']
      );
      studioId = insertRes.rows[0].id;
      console.log('Created new default studio id:', studioId);
    }

    // Backfill tables
    const tables = ['services', 'professionals', 'clients', 'appointments', 'studio_settings'];
    for (const t of tables) {
      const res = await client.query(`UPDATE public.${t} SET studio_id = $1 WHERE studio_id IS NULL`, [studioId]);
      console.log(`Updated ${res.rowCount} rows in ${t}`);
    }

    await client.query('COMMIT');
    console.log('Backfill completed successfully. Studio ID used:', studioId);
  } catch (err) {
    console.error('Error during backfill:', err);
    try {
      await client.query('ROLLBACK');
    } catch (rb) {
      console.error('Rollback failed:', rb);
    }
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}
