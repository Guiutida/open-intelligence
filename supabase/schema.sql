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

-- Políticas: acesso total público (sistema sem autenticação por ora)
CREATE POLICY "acesso_total_services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_professionals" ON public.professionals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_studio_settings" ON public.studio_settings FOR ALL USING (true) WITH CHECK (true);

-- NOTA: Não há seed data. Configure tudo pelo painel administrativo.
