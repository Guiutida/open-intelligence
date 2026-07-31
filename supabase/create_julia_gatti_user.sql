-- Script SQL para criar o usuário oficial da Júlia Gatti no Supabase Auth
-- Para executar: Copie e cole no SQL Editor do seu painel do Supabase

-- 1. Inserir usuário na tabela auth.users (caso não exista)
-- Substitua 'SUA_SENHA_AQUI' pela senha desejada para a Júlia Gatti
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  user_email text := 'julia@juliagatti.com.br';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      user_email,
      crypt('JuliaGatti2026!', gen_salt('bf')), -- Senha padrao inicial: JuliaGatti2026!
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Júlia Gatti","role":"admin"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );

    -- Inserir identidade correspondente
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      format('{"sub":"%s","email":"%s"}', new_user_id, user_email)::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END $$;
