-- Migration: Create studios (tenants) and add studio_id to core tables
BEGIN;

-- 1) Create studios table
CREATE TABLE IF NOT EXISTS public.studios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text,
  owner_uid uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Add studio_id columns (nullable to allow incremental backfill)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);
ALTER TABLE public.studio_settings ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);

COMMIT;

-- BACKFILL INSTRUCTIONS (run manually)
-- 1) Create a default studio (replace <OWNER_AUTH_UID> with the owner user's auth.uid() value):
--    INSERT INTO public.studios (slug, name, owner_uid) VALUES ('default', 'Studio Padrão', '<OWNER_AUTH_UID>') RETURNING id;
-- 2) Copy the returned id and run (replace <THE_NEW_STUDIO_ID>):
--    UPDATE public.services SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;
--    UPDATE public.professionals SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;
--    UPDATE public.clients SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;
--    UPDATE public.appointments SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;
--    UPDATE public.studio_settings SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;

-- NOTES:
-- * Run these scripts using psql or Supabase SQL editor with a service role key if needed.
-- * After backfill, update policies if you want public SELECT limited per studio slug.
-- * Ensure you don't expose the service_role key to the browser. Use server-side tools for automated backfill if preferred.
