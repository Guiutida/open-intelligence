# 📋 PRODUCTION CHECKLIST: SAAS COMMERCIAL (100% REAL)

> **OBJETIVO INEGOCIÁVEL:**  
> Transformar o projeto em um Software como Serviço (SaaS) Multi-tenant de Agendamento e Gestão **100% pronto para produção**, seguro, automatizado e comercializável.  
> **Nenhum fluxo pode ser simulado, mockado ou depender de armazenamento local/temporário.**

---

## 🎯 Regras de Ouro da Implementação
1. **Zero Simulação:** Pagamentos, e-mails, mensagens de WhatsApp e banco de dados devem ser reais e integrados via APIs de produção.
2. **Isolamento Total de Dados (Multi-Tenant):** Cada estúdio tem acesso **estritamente restrito** aos seus próprios dados através de Supabase RLS.
3. **Automação Server-Side:** Nenhuma rotina crítica (como lembretes ou confirmação de pagamento) pode depender do navegador do cliente estar aberto.
4. **Pronto para Vender:** O sistema deve conter auto-cadastro de clientes SaaS e cobrança de mensalidade recorrente.

---

## 📌 FASE 1: Banco de Dados, Multi-Tenancy & Segurança (Supabase)
- [x] **1.1 Restaurar e Aplicar Migrações SQL**
  - Restaurar o arquivo `supabase/migrations/001_create_studios_and_backfill.sql`.
  - Aplicar no Supabase a criação da tabela `studios` e adição das chaves estrangeiras `studio_id` nas tabelas `services`, `professionals`, `clients`, `appointments` e `studio_settings`.
- [x] **1.2 Habilitar Row Level Security (RLS)**
  - Configurar políticas RLS no Supabase para garantir que usuários autenticados só leiam/escrevam dados vinculados ao seu `studio_id`.
- [x] **1.3 Roteamento Dinâmico de Estúdios**
  - Implementar resolução de estúdio por slug na URL público (`/s/:studioSlug/agendar` ou subdomínios dinâmicos).
- [x] **1.4 Upload de Imagens no Supabase Storage**
  - Configurar bucket público `studio-assets` no Supabase Storage com RLS.
  - Conectar o componente `ImageUpload` para gerar URLs públicas reais de avatares e logos.
- [x] **1.5 Remoção Total de Mocks e LocalStorage**
  - Remover fallbacks silenciosos para `mock-data.ts` e `localStorage` no `src/lib/db-service.ts`.

---

## 💳 FASE 2: Gateway de Pagamento Real (PIX & Cartão)
- [x] **2.1 Seleção e Configuração do Gateway**
  - Criar conta de produção em Gateway de Pagamento (Mercado Pago, Asaas, Pagar.me ou EFI).
  - Obter e armazenar chaves secretas de API nas variáveis de ambiente do servidor.
- [x] **2.2 Endpoint Backend de Geração de PIX**
  - Criar Supabase Edge Function ou Endpoint Node `/api/create-pix-charge`.
  - Retornar imagem QR Code em Base64 real + string `pix_copia_e_cola` VÁLIDOS do banco central.
- [x] **2.3 Webhook para Baixa Automática de Pagamento**
  - Criar endpoint público `/api/webhooks/pix` com validação de assinatura de segurança.
  - Ao receber evento de pagamento confirmado (`payment.approved`), atualizar status do agendamento no Supabase para `'confirmado'`.
- [x] **2.4 Eliminar Simulação na Tela de Agendamento**
  - Remover botão *"Simular pagamento (teste)"* e chave PIX zerada de `src/routes/agendar.tsx`.
  - Adicionar polling ou escuta em tempo real (Supabase Realtime / WebSockets) na tela de checkout para detectar o pagamento e redirecionar o cliente automaticamente.

---

## 📱 FASE 3: Comunicação & Notificações Automáticas
- [x] **3.1 Provedor de E-mail Transacional**
  - Configurar conta no **Resend**, **SendGrid** ou **Postmark**.
  - Criar templates HTML de confirmação, reagendamento e cancelamento.
- [x] **3.2 Integração com API de WhatsApp**
  - Conectar provedor de WhatsApp (Evolution API, Z-API ou Twilio).
  - Enviar mensagem automática no WhatsApp do cliente após a confirmação do PIX.
- [x] **3.3 Lembretes Automáticos Server-Side (Cron Job)**
  - Criar rotina agendada no servidor (Supabase `pg_cron`, QStash ou Vercel Cron).
  - Executar a cada 30 minutos enviando e-mail/WhatsApp 24h e 2h antes da consulta agendada.

---

## 💰 FASE 4: Onboarding & Cobrança do SaaS (Monetização)
- [x] **4.1 Tela de Auto-Cadastro para Estabelecimentos (`/cadastrar`)**
  - Criar formulário de registro para novos donos de estúdio.
  - Criar usuário no Supabase Auth + registro na tabela `studios` com slug único.
- [x] **4.2 Recuperação de Senha (`/login`)**
  - Adicionar opção "Esqueci minha senha" com disparo de e-mail de redefinição real.
- [x] **4.3 Assinatura do SaaS (Recorrência)**
  - Integrar checkout transparente de assinatura do SaaS (Stripe Billing, Asaas Assinaturas ou Mercado Pago Subscriptions).
  - Definir planos (ex: Starter, Pro, Enterprise).
- [x] **4.4 Bloqueio por Inadimplência**
  - Restringir acesso ao dashboard caso o status da assinatura do estúdio seja `'past_due'` ou `'canceled'`.

---

## 🛡️ FASE 5: LGPD, PWA & Publicação em Produção
- [x] **5.1 Termos de Uso e LGPD**
  - Criar páginas `/termos` e `/privacidade`.
  - Adicionar aceite obrigatório de termos no checkout e no cadastro.
- [x] **5.2 Configuração PWA (App Instalável)**
  - Adicionar `manifest.json`, ícones da aplicação e Service Worker (`sw.js`).
  - Permitir instalação nativa no iOS/Android para clientes e gestores.
- [x] **5.3 Deploy Final & Domínio Próprio**
  - Apontar domínio próprio com HTTPS/SSL ativado.
  - Configurar variáveis de ambiente seguras (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.).
  - Rodar suíte final de testes de ponta a ponta (E2E).

---

*Este checklist é o guia definitivo e inalterável de desenvolvimento do projeto.*
