-- SCRIPT DE SEED: Serviços de Extensão de Cílios para o Studio Júlia Gatti
-- Execute este script no SQL Editor do seu painel do Supabase

BEGIN;

-- 1. Garante que o estúdio da Júlia Gatti existe na tabela public.studios
INSERT INTO public.studios (slug, name, subscription_status, subscription_plan)
VALUES ('julia-gatti', 'Studio Júlia Gatti', 'active', 'pro')
ON CONFLICT (slug) DO NOTHING;

-- 2. Obtém o ID do estúdio e insere os serviços de extensão de cílios
WITH studio_ref AS (
  SELECT id FROM public.studios WHERE slug = 'julia-gatti' LIMIT 1
)
INSERT INTO public.services (name, price, duration, color, description, active, studio_id)
SELECT name, price, duration, color, description, true, studio_ref.id
FROM studio_ref, (VALUES
  ('Volume Brasileiro (Cílios YY)', 190.00, 130, 'var(--gold)', 'Aplicação de fios em formato Y para um olhar marcante, volumoso e leve.'),
  ('Volume Russo Artesanal', 240.00, 150, 'var(--blush-deep)', 'Fans artesanais de 3D a 6D para máximo preenchimento e glamour.'),
  ('Clássico Fio a Fio', 160.00, 120, 'var(--chart-3)', 'Aplicação de um fio sintético sobre cada cílio natural. Efeito rímel elegante.'),
  ('Volume Híbrido', 200.00, 130, 'var(--chart-2)', 'Mistura perfeita entre o Fio a Fio e Volume Russo para efeito texturizado.'),
  ('Lash Lifting + Nutrição com Keratina', 140.00, 60, 'var(--chart-5)', 'Curvatura e tingimento dos cílios naturais promovendo olhar levantado por até 8 semanas.'),
  ('Manutenção de Extensão (Até 20 dias)', 120.00, 90, 'var(--chart-4)', 'Higienização profunda e reposição de fios para clientes do studio.')
) AS s(name, price, duration, color, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.services WHERE name = s.name AND studio_id = studio_ref.id
);

-- 3. Insere a equipe de profissionais da Júlia Gatti
WITH studio_ref AS (
  SELECT id FROM public.studios WHERE slug = 'julia-gatti' LIMIT 1
)
INSERT INTO public.professionals (name, role, avatar, rating, active, studio_id)
SELECT name, role, avatar, rating, true, studio_ref.id
FROM studio_ref, (VALUES
  ('Júlia Gatti', 'Master Lash Designer & Fundadora', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80', 5.0),
  ('Driely Santos', 'Lash Designer Specialist', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80', 4.9)
) AS p(name, role, avatar, rating)
WHERE NOT EXISTS (
  SELECT 1 FROM public.professionals WHERE name = p.name AND studio_id = studio_ref.id
);

COMMIT;

-- Confirmação dos dados gravados
SELECT s.name as servico, s.price as valor, s.duration as duracao_min, st.name as estudio
FROM public.services s
JOIN public.studios st ON st.id = s.studio_id
WHERE st.slug = 'julia-gatti';
