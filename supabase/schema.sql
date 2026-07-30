-- Script de Criação do Banco de Dados - Studio Júlia Gatti

-- 1. Tabela de Serviços
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- em minutos
  color TEXT NOT NULL DEFAULT 'var(--gold)',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Profissionais
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  tag TEXT DEFAULT 'Nova', -- 'VIP' | 'Recorrente' | 'Nova'
  notes TEXT,
  total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  visits_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL, -- ex: "09:00", "14:00"
  status TEXT NOT NULL DEFAULT 'confirmado', -- 'confirmado' | 'pendente' | 'concluido' | 'cancelado'
  notes TEXT,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela de Configurações do Studio (nome, foto, redes sociais, horários, endereço)
CREATE TABLE IF NOT EXISTS public.studio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,   -- ex: 'studio_name', 'whatsapp', 'instagram', 'cover_url', 'address', 'hours'
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_settings ENABLE ROW LEVEL SECURITY;

-- 0) Criar tabela de studios (tenants) para suportar multi-tenancy
CREATE TABLE IF NOT EXISTS public.studios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text,
  owner_uid uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1) Adicionar coluna studio_id (nullable por enquanto) para migrar dados existentes
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);
ALTER TABLE public.studio_settings ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id);

-- IMPORTANT: Backfill existente (ex.: criar um studio padrão e atualizar rows existentes)
-- SQL exemplo (executar manualmente no Supabase):
-- INSERT INTO public.studios (slug, name, owner_uid) VALUES ('default', 'Studio Padrão', '<OWNER_AUTH_UID>');
-- UPDATE public.services SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;
-- UPDATE public.professionals SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;
-- UPDATE public.clients SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;
-- UPDATE public.appointments SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;
-- UPDATE public.studio_settings SET studio_id = '<THE_NEW_STUDIO_ID>' WHERE studio_id IS NULL;

-- 2) Políticas RLS: permitir SELECT público (página pública/landing), mas restringir operações de escrita (INSERT/UPDATE/DELETE) ao owner do studio

-- SERVICES: SELECT público
CREATE POLICY "public_select_services" ON public.services FOR SELECT USING (true);

-- SERVICES: chỉ owner pode inserir/atualizar/deletar (e também SELECT/USING garante leitura para owner)
CREATE POLICY "owners_manage_services" ON public.services FOR ALL
  USING ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = services.studio_id AND s.owner_uid = auth.uid()) )
  WITH CHECK ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = services.studio_id AND s.owner_uid = auth.uid()) );

-- PROFESSIONALS
CREATE POLICY "public_select_professionals" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "owners_manage_professionals" ON public.professionals FOR ALL
  USING ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = professionals.studio_id AND s.owner_uid = auth.uid()) )
  WITH CHECK ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = professionals.studio_id AND s.owner_uid = auth.uid()) );

-- CLIENTS: SELECT only for owners (sensitive)
CREATE POLICY "owners_select_clients" ON public.clients FOR SELECT
  USING ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = clients.studio_id AND s.owner_uid = auth.uid()) );
CREATE POLICY "owners_manage_clients" ON public.clients FOR ALL
  USING ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = clients.studio_id AND s.owner_uid = auth.uid()) )
  WITH CHECK ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = clients.studio_id AND s.owner_uid = auth.uid()) );

-- APPOINTMENTS: public booking flow must INSERT appointments (clients unauthenticated).
-- Strategy: allow INSERT into appointments for rows that have studio_id set AND do not set protected columns (e.g., status only owner can set)
-- For now allow public INSERT but restrict UPDATE/DELETE to owners
CREATE POLICY "public_insert_appointments" ON public.appointments FOR INSERT
  WITH CHECK (true);
CREATE POLICY "owners_manage_appointments" ON public.appointments FOR UPDATE, DELETE
  USING ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = appointments.studio_id AND s.owner_uid = auth.uid()) )
  WITH CHECK ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = appointments.studio_id AND s.owner_uid = auth.uid()) );

-- STUDIO_SETTINGS: leitura pública (para renderizar landing), escrita apenas por owner
CREATE POLICY "public_select_studio_settings" ON public.studio_settings FOR SELECT USING (true);
CREATE POLICY "owners_manage_studio_settings" ON public.studio_settings FOR ALL
  USING ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = studio_settings.studio_id AND s.owner_uid = auth.uid()) )
  WITH CHECK ( EXISTS (SELECT 1 FROM public.studios s WHERE s.id = studio_settings.studio_id AND s.owner_uid = auth.uid()) );

-- NOTA: ajustar políticas conforme necessário para permitir integração com backend/Workers (ex.: service role) usando jwt.claims or service_role key.