#!/usr/bin/env node
/**
 * migrate_base64_to_storage.js
 *
 * Purpose: Find rows that store images as base64 data URLs and migrate them to Supabase Storage.
 *
 * Requirements (env vars):
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY (server-side only)
 *  - BUCKET_NAME (optional, default: "studio-media")
 *
 * Usage:
 *   npm install @supabase/supabase-js
 *   SUPABASE_URL="https://xyz.supabase.co" SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" node scripts/migrate_base64_to_storage.js
 *
 * Options (env vars):
 *  - DRY_RUN=true  -> only print what would be done
 *  - BATCH_SIZE=50 -> number of rows processed per table in one run
 *  - TABLES=professionals,clients,studio_settings -> comma separated list to process
 *
 * Notes:
 *  - This script uses the Supabase service role key so run only in a trusted environment.
 *  - For studio_settings, only keys 'logo_url' and 'cover_url' are considered.
 */

const { createClient } = require('@supabase/supabase-js');
const { Buffer } = require('buffer');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.BUCKET_NAME || 'studio-media';
const DRY = (process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 100);
const TABLES = (process.env.TABLES || 'professionals,clients,studio_settings').split(',').map(s => s.trim());

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

function parseDataUrl(dataUrl) {
  // data:[<mime type>][;base64],<data>
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const b64 = match[2];
  const buffer = Buffer.from(b64, 'base64');
  let ext = 'bin';
  if (mime === 'image/png') ext = 'png';
  else if (mime === 'image/jpeg' || mime === 'image/jpg') ext = 'jpg';
  else if (mime === 'image/webp') ext = 'webp';
  else if (mime === 'image/svg+xml') ext = 'svg';
  return { mime, buffer, ext };
}

async function processProfessionals() {
  console.log('\nProcessing professionals avatars...');
  const { data, error } = await supabase.rpc('pg_sleep', { p_seconds: 0 }); // noop to ensure client ready

  // Query rows with avatar like 'data:%'
  const { data: rows, error: qerr } = await supabase
    .from('professionals')
    .select('id, avatar')
    .ilike('avatar', 'data:%')
    .limit(BATCH_SIZE);

  if (qerr) {
    console.error('Error querying professionals:', qerr);
    return;
  }
  if (!rows || rows.length === 0) {
    console.log('No professional avatars to migrate.');
    return;
  }

  for (const row of rows) {
    try {
      const parsed = parseDataUrl(row.avatar || '');
      if (!parsed) {
        console.warn('Skipping professional', row.id, '— avatar not a data URL');
        continue;
      }
      const filename = `professionals/${row.id}_${Date.now()}.${parsed.ext}`;
      console.log('Uploading professional', row.id, '->', filename);
      if (!DRY) {
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filename, parsed.buffer, {
          contentType: parsed.mime,
          upsert: false,
        });
        if (upErr) {
          console.error('Upload failed for', row.id, upErr);
          continue;
        }
        const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;
        const { error: updErr } = await supabase.from('professionals').update({ avatar: publicUrl }).eq('id', row.id);
        if (updErr) {
          console.error('Failed to update DB for professional', row.id, updErr);
        } else {
          console.log('Updated professional avatar to', publicUrl);
        }
      }
    } catch (e) {
      console.error('Error processing professional', row.id, e);
    }
  }
}

async function processClients() {
  console.log('\nProcessing clients avatars...');
  const { data: rows, error: qerr } = await supabase
    .from('clients')
    .select('id, avatar')
    .ilike('avatar', 'data:%')
    .limit(BATCH_SIZE);

  if (qerr) {
    console.error('Error querying clients:', qerr);
    return;
  }
  if (!rows || rows.length === 0) {
    console.log('No client avatars to migrate.');
    return;
  }

  for (const row of rows) {
    try {
      const parsed = parseDataUrl(row.avatar || '');
      if (!parsed) {
        console.warn('Skipping client', row.id, '— avatar not a data URL');
        continue;
      }
      const filename = `clients/${row.id}_${Date.now()}.${parsed.ext}`;
      console.log('Uploading client', row.id, '->', filename);
      if (!DRY) {
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filename, parsed.buffer, {
          contentType: parsed.mime,
          upsert: false,
        });
        if (upErr) {
          console.error('Upload failed for', row.id, upErr);
          continue;
        }
        const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;
        const { error: updErr } = await supabase.from('clients').update({ avatar: publicUrl }).eq('id', row.id);
        if (updErr) {
          console.error('Failed to update DB for client', row.id, updErr);
        } else {
          console.log('Updated client avatar to', publicUrl);
        }
      }
    } catch (e) {
      console.error('Error processing client', row.id, e);
    }
  }
}

async function processStudioSettings() {
  console.log('\nProcessing studio_settings (logo_url, cover_url)...');
  // keys to consider
  const keys = ['logo_url', 'cover_url'];
  const { data: rows, error: qerr } = await supabase
    .from('studio_settings')
    .select('id, key, value')
    .in('key', keys)
    .ilike('value', 'data:%')
    .limit(BATCH_SIZE);

  if (qerr) {
    console.error('Error querying studio_settings:', qerr);
    return;
  }
  if (!rows || rows.length === 0) {
    console.log('No studio_settings entries to migrate.');
    return;
  }

  for (const row of rows) {
    try {
      const parsed = parseDataUrl(row.value || '');
      if (!parsed) {
        console.warn('Skipping studio_settings', row.id, 'key', row.key, '— value not a data URL');
        continue;
      }
      const filename = `studio_settings/${row.key}_${row.id}_${Date.now()}.${parsed.ext}`;
      console.log('Uploading studio_settings', row.id, row.key, '->', filename);
      if (!DRY) {
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filename, parsed.buffer, {
          contentType: parsed.mime,
          upsert: false,
        });
        if (upErr) {
          console.error('Upload failed for', row.id, upErr);
          continue;
        }
        const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;
        const { error: updErr } = await supabase.from('studio_settings').update({ value: publicUrl }).eq('id', row.id);
        if (updErr) {
          console.error('Failed to update DB for studio_settings', row.id, updErr);
        } else {
          console.log('Updated studio_settings', row.id, '->', publicUrl);
        }
      }
    } catch (e) {
      console.error('Error processing studio_settings', row.id, e);
    }
  }
}

async function main() {
  console.log('Starting migration to bucket:', BUCKET, 'DRY_RUN=', DRY);
  if (TABLES.includes('professionals')) await processProfessionals();
  if (TABLES.includes('clients')) await processClients();
  if (TABLES.includes('studio_settings')) await processStudioSettings();
  console.log('\nMigration run finished.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
