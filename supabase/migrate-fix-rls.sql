-- MIGRAÇÃO: Corrigir políticas RLS e adicionar tabela studio_settings
-- Execute este script no SQL Editor da sua VPS Supabase

-- 1. Corrigir política de services (estava só SELECT, precisa de ALL)
DROP POLICY IF EXISTS "Permitir leitura pública de serviços" ON public.services;
DROP POLICY IF EXISTS "acesso_total_services" ON public.services;
CREATE POLICY "acesso_total_services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- 2. Corrigir política de professionals (estava só SELECT, precisa de ALL)
DROP POLICY IF EXISTS "Permitir leitura pública de profissionais" ON public.professionals;
DROP POLICY IF EXISTS "acesso_total_professionals" ON public.professionals;
CREATE POLICY "acesso_total_professionals" ON public.professionals FOR ALL USING (true) WITH CHECK (true);

-- 3. Garantir políticas completas nas outras tabelas
DROP POLICY IF EXISTS "Permitir leitura e gravação de agendamentos" ON public.appointments;
DROP POLICY IF EXISTS "acesso_total_appointments" ON public.appointments;
CREATE POLICY "acesso_total_appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura e gravação de clientes" ON public.clients;
DROP POLICY IF EXISTS "acesso_total_clients" ON public.clients;
CREATE POLICY "acesso_total_clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- 4. Criar tabela de configurações do studio (redes sociais, horários, endereço, foto)
CREATE TABLE IF NOT EXISTS public.studio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.studio_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "acesso_total_studio_settings" ON public.studio_settings;
CREATE POLICY "acesso_total_studio_settings" ON public.studio_settings FOR ALL USING (true) WITH CHECK (true);

-- 5. Inserir configurações padrão do Studio Júlia Gatti
INSERT INTO public.studio_settings (key, value) VALUES
  ('studio_name', 'Studio Júlia Gatti'),
  ('tagline', 'Extensão de Cílios'),
  ('whatsapp', '(13) 99117-6958'),
  ('instagram', '@studiojuliagatti'),
  ('facebook', ''),
  ('address', 'Baixada Santista · São Paulo'),
  ('maps_url', 'https://maps.google.com/?q=Studio+Julia+Gatti'),
  ('cover_url', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=75'),
  ('logo_url', ''),
  ('rating', '5.0'),
  ('reviews', '0'),
  ('hours', '[{"day":"Segunda","time":"09:00 – 19:00"},{"day":"Terça","time":"09:00 – 19:00"},{"day":"Quarta","time":"09:00 – 20:00"},{"day":"Quinta","time":"09:00 – 20:00"},{"day":"Sexta","time":"09:00 – 20:00"},{"day":"Sábado","time":"09:00 – 16:00"},{"day":"Domingo","time":"Fechado"}]')
ON CONFLICT (key) DO NOTHING;

-- Verificar resultado
SELECT key, value FROM public.studio_settings ORDER BY key;
