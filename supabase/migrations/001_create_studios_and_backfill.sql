-- Migration: Create studios (tenants), add studio_id columns, reminder flags, subscription fields, and configure multi-tenant RLS policies
BEGIN;

-- 1) Create studios table with subscription status and plan fields
CREATE TABLE IF NOT EXISTS public.studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'trialing' | 'past_due' | 'canceled'
  subscription_plan TEXT NOT NULL DEFAULT 'pro',       -- 'starter' | 'pro' | 'enterprise'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Add studio_id columns (nullable for incremental backfill)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE;
ALTER TABLE public.studio_settings ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE;

-- 3) Add reminder flags to appointments for server-side notification control
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reminder_2h_sent BOOLEAN NOT NULL DEFAULT false;

COMMIT;

-- 4) Enable Row Level Security on all core tables
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_settings ENABLE ROW LEVEL SECURITY;

-- 5) Configure Multi-Tenant RLS Policies

-- STUDIOS: Owner manages their studio; Public read by slug
DROP POLICY IF EXISTS "public_select_studios" ON public.studios;
CREATE POLICY "public_select_studios" ON public.studios FOR SELECT USING (true);

DROP POLICY IF EXISTS "owner_manage_studio" ON public.studios;
CREATE POLICY "owner_manage_studio" ON public.studios FOR ALL
  USING (owner_uid = auth.uid())
  WITH CHECK (owner_uid = auth.uid());

-- SERVICES: Public read for active booking; Owner manages
DROP POLICY IF EXISTS "public_select_services" ON public.services;
CREATE POLICY "public_select_services" ON public.services FOR SELECT USING (active = true OR studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()));

DROP POLICY IF EXISTS "owner_manage_services" ON public.services;
CREATE POLICY "owner_manage_services" ON public.services FOR ALL
  USING (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()))
  WITH CHECK (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()));

-- PROFESSIONALS: Public read active; Owner manages
DROP POLICY IF EXISTS "public_select_professionals" ON public.professionals;
CREATE POLICY "public_select_professionals" ON public.professionals FOR SELECT USING (active = true OR studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()));

DROP POLICY IF EXISTS "owner_manage_professionals" ON public.professionals;
CREATE POLICY "owner_manage_professionals" ON public.professionals FOR ALL
  USING (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()))
  WITH CHECK (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()));

-- CLIENTS: Only studio owners manage their clients
DROP POLICY IF EXISTS "owner_manage_clients" ON public.clients;
CREATE POLICY "owner_manage_clients" ON public.clients FOR ALL
  USING (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()))
  WITH CHECK (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()));

-- APPOINTMENTS: Public checkout inserts; Owner manages
DROP POLICY IF EXISTS "public_insert_appointments" ON public.appointments;
CREATE POLICY "public_insert_appointments" ON public.appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "owner_manage_appointments" ON public.appointments;
CREATE POLICY "owner_manage_appointments" ON public.appointments FOR ALL
  USING (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()))
  WITH CHECK (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()));

-- STUDIO SETTINGS: Public read settings; Owner manages
DROP POLICY IF EXISTS "public_select_studio_settings" ON public.studio_settings;
CREATE POLICY "public_select_studio_settings" ON public.studio_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "owner_manage_studio_settings" ON public.studio_settings;
CREATE POLICY "owner_manage_studio_settings" ON public.studio_settings FOR ALL
  USING (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()))
  WITH CHECK (studio_id IN (SELECT id FROM public.studios WHERE owner_uid = auth.uid()));
