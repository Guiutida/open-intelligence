-- Script para limpar os dados de seed falsos do banco de dados
-- Execute este script no SQL Editor do Supabase (painel admin da sua VPS)

-- Limpa agendamentos primeiro (tem FK para professionals e services)
TRUNCATE TABLE public.appointments CASCADE;

-- Limpa clientes
TRUNCATE TABLE public.clients CASCADE;

-- Limpa profissionais falsos (Camila Duarte, Rafaela Nunes, Bianca Moreira)
TRUNCATE TABLE public.professionals CASCADE;

-- Limpa serviços falsos
TRUNCATE TABLE public.services CASCADE;

-- Confirma limpeza
SELECT 'services' as tabela, COUNT(*) as registros FROM public.services
UNION ALL
SELECT 'professionals', COUNT(*) FROM public.professionals
UNION ALL
SELECT 'clients', COUNT(*) FROM public.clients
UNION ALL
SELECT 'appointments', COUNT(*) FROM public.appointments;
