# Dockerfile para Coolify usando Node 22 Alpine
FROM node:22-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências usando npm install para garantir compatibilidade completa
RUN npm install

# Copia todo o código-fonte
COPY . .

# Recebe variáveis de ambiente em tempo de build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Compila o projeto TanStack Start / Nitro
RUN npm run build

# ESTÁGIO DE EXECUÇÃO (Production)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copia apenas o build compilado (.output) e package.json
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
