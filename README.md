# Volkov Hub

Painel interno da Volkov para páginas de Facebook, criativos, UTMs e resultado financeiro. Construído com Next.js App Router, TypeScript, Tailwind, Supabase, Lucide e Recharts.

## O que já está pronto

- Login por e-mail e senha com Supabase Auth, sem cadastro público na aplicação.
- Perfis `admin`, `gestor` e `operador`, reforçados por RLS no banco.
- Dashboard que calcula métricas a partir de `sales` e `ad_spend` reais — sem dados demonstrativos.
- CRUDs para páginas internas e monitoradas, vídeos, inspirações, produtos e UTMs.
- Estrutura de integrações e importação CSV para vendas e gastos.
- Tema escuro responsivo, com menu de operação, estados vazios e tratamentos de erro.
- Logo original em PNG e uma versão vetorial editável em SVG em `public/`.

## Instalação local

1. Instale Node.js 20+ e copie as variáveis de ambiente:

   ```bash
   cp .env.example .env.local
   ```

2. Crie um projeto no Supabase e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `.env.local`.

3. No **SQL Editor** do Supabase, execute o arquivo [20260909120000_volkov_hub.sql](./supabase/migrations/20260909120000_volkov_hub.sql).

4. Em **Authentication > Providers > Email**, desative **Confirm email**. Não habilite cadastro público: os usuários devem ser criados manualmente por um administrador no painel Supabase em **Authentication > Users**.

5. Depois de criar o primeiro usuário, defina-o como administrador:

   ```sql
   update public.profiles set role = 'admin' where email = 'seu-email@empresa.com';
   ```

6. Instale e rode:

   ```bash
   npm install
   npm run dev
   ```

   Acesse `http://localhost:3000`.

## Storage

Crie um bucket privado chamado `volkov-media` em **Storage**. As políticas para ele já estão declaradas na migration. Guarde chaves de integração somente em variáveis de ambiente/Edge Functions, jamais na tabela `integrations`.

## Importação CSV

A tela Financeiro aceita CSV com cabeçalho. Para vendas, use no mínimo `gross_revenue,sold_at`; para gastos, `amount,spent_at`. Campos adicionais suportados estão descritos ao lado do seletor de arquivo na própria tela.

## Integrações futuras

UTM5, MCP e Meta/Facebook aparecem como configurações estruturadas, porém nenhuma credencial, scraping ou sincronização foi inventada. Antes de ativá-las, implemente uma função de servidor/Edge Function usando a documentação e as chaves autorizadas da plataforma.

## Verificação

```bash
npm run typecheck
npm run build
```

Para deploy, importe o repositório na Vercel e replique as duas variáveis públicas de Supabase em **Project Settings > Environment Variables**.
