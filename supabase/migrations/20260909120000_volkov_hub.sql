-- Volkov Hub: schema inicial, auditoria e RLS.
-- Execute este arquivo no SQL Editor do Supabase antes de usar o app.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'gestor', 'operador');
create type public.page_status as enum ('ativa', 'pausada', 'bloqueada', 'em_teste');
create type public.monitored_page_status as enum ('acompanhando', 'arquivada', 'prioritaria');
create type public.video_status as enum ('em_teste', 'validado', 'escalado', 'pausado');
create type public.utm_status as enum ('ativa', 'pausada', 'arquivada');
create type public.integration_status as enum ('nao_configurada', 'conectada', 'erro', 'sincronizando');
create type public.product_status as enum ('ativo', 'pausado', 'arquivado');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role public.user_role not null default 'operador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  checkout_url text,
  price numeric(14,2),
  currency text not null default 'BRL',
  status public.product_status not null default 'ativo',
  offer_country text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facebook_pages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  niche text,
  country_language text,
  main_product_id uuid references public.products(id) on delete set null,
  responsible_id uuid references public.profiles(id) on delete set null,
  status public.page_status not null default 'em_teste',
  notes text,
  tags text[] not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.monitored_pages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  niche text,
  country_language text,
  monitoring_reason text,
  status public.monitored_page_status not null default 'acompanhando',
  notes text,
  tags text[] not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  product_id uuid references public.products(id) on delete set null,
  page_id uuid references public.facebook_pages(id) on delete set null,
  video_url text,
  storage_path text,
  thumbnail_url text,
  country_language text,
  platform text,
  creative_type text,
  hook text,
  copy text,
  cta text,
  tags text[] not null default '{}',
  status public.video_status not null default 'em_teste',
  published_at date,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.video_metrics (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  metric_date date not null default current_date,
  spend numeric(14,2) not null default 0,
  views bigint not null default 0,
  clicks bigint not null default 0,
  sales_count integer not null default 0,
  cpa numeric(14,2),
  revenue numeric(14,2) not null default 0,
  roas numeric(14,4),
  profit numeric(14,2),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(video_id, metric_date)
);

create table public.inspirations (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  monitored_page_id uuid references public.monitored_pages(id) on delete set null,
  thumbnail_url text,
  title text,
  niche text,
  country text,
  tags text[] not null default '{}',
  reason_saved text,
  discovered_at date,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.utm_links (
  id uuid primary key default gen_random_uuid(),
  internal_name text not null,
  product_id uuid references public.products(id) on delete set null,
  page_id uuid references public.facebook_pages(id) on delete set null,
  video_id uuid references public.videos(id) on delete set null,
  base_url text not null,
  utm_source text default 'facebook',
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  final_url text,
  status public.utm_status not null default 'ativa',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  order_id text unique,
  product_id uuid references public.products(id) on delete set null,
  page_id uuid references public.facebook_pages(id) on delete set null,
  utm_link_id uuid references public.utm_links(id) on delete set null,
  gross_revenue numeric(14,2) not null default 0,
  net_revenue numeric(14,2) not null default 0,
  currency text not null default 'BRL',
  sold_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ad_spend (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.facebook_pages(id) on delete set null,
  video_id uuid references public.videos(id) on delete set null,
  platform text not null default 'Facebook',
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'BRL',
  spent_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text not null,
  status public.integration_status not null default 'nao_configurada',
  config jsonb not null default '{}',
  last_synced_at timestamptz,
  last_error text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider)
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index sales_sold_at_idx on public.sales(sold_at desc);
create index ad_spend_spent_at_idx on public.ad_spend(spent_at desc);
create index videos_page_id_idx on public.videos(page_id);
create index utm_links_page_id_idx on public.utm_links(page_id);
create index activity_logs_entity_idx on public.activity_logs(entity_type, entity_id);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create or replace function public.set_created_by() returns trigger language plpgsql security definer set search_path = public as $$ begin if new.created_by is null then new.created_by = auth.uid(); end if; return new; end; $$;
create or replace function public.create_profile() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles (id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), new.email) on conflict (id) do nothing; return new; end; $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;
create or replace function public.is_manager() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'gestor')); $$;
-- Postgres does not supply URL escaping natively; use a safe basic encoder for query values.
create or replace function public.url_encode(value text) returns text language sql immutable as $$ select replace(replace(replace(replace(coalesce(value,''), '%', '%25'), ' ', '%20'), '&', '%26'), '#', '%23'); $$;
create or replace function public.audit_row() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.activity_logs (actor_id, entity_type, entity_id, action, before_data, after_data)
  values (auth.uid(), tg_table_name, coalesce(new.id, old.id), lower(tg_op), case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end, case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return coalesce(new, old);
end; $$;
create or replace function public.make_utm_url() returns trigger language plpgsql as $$
declare separator text;
begin
  separator := case when position('?' in new.base_url) > 0 then '&' else '?' end;
  new.final_url := new.base_url || case when coalesce(new.utm_source, new.utm_medium, new.utm_campaign, new.utm_content, new.utm_term) is null then '' else separator || concat_ws('&',
    case when new.utm_source is not null then 'utm_source=' || url_encode(new.utm_source) end,
    case when new.utm_medium is not null then 'utm_medium=' || url_encode(new.utm_medium) end,
    case when new.utm_campaign is not null then 'utm_campaign=' || url_encode(new.utm_campaign) end,
    case when new.utm_content is not null then 'utm_content=' || url_encode(new.utm_content) end,
    case when new.utm_term is not null then 'utm_term=' || url_encode(new.utm_term) end) end;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile();
do $$ declare tab text; begin foreach tab in array array['profiles','products','facebook_pages','monitored_pages','videos','video_metrics','inspirations','utm_links','sales','ad_spend','integrations'] loop execute format('create trigger %I before update on public.%I for each row execute procedure public.set_updated_at()', 'set_updated_at_' || tab, tab); end loop; foreach tab in array array['products','facebook_pages','monitored_pages','videos','video_metrics','inspirations','utm_links','sales','ad_spend','integrations'] loop execute format('create trigger %I before insert on public.%I for each row execute procedure public.set_created_by()', 'set_created_by_' || tab, tab); end loop; end $$;
create trigger make_utm_url before insert or update of base_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term on public.utm_links for each row execute procedure public.make_utm_url();
do $$ declare tab text; begin foreach tab in array array['products','facebook_pages','monitored_pages','videos','video_metrics','inspirations','utm_links','sales','ad_spend','integrations'] loop execute format('create trigger %I after insert or update or delete on public.%I for each row execute procedure public.audit_row()', 'audit_' || tab, tab); end loop; end $$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.facebook_pages enable row level security;
alter table public.monitored_pages enable row level security;
alter table public.videos enable row level security;
alter table public.video_metrics enable row level security;
alter table public.inspirations enable row level security;
alter table public.utm_links enable row level security;
alter table public.sales enable row level security;
alter table public.ad_spend enable row level security;
alter table public.integrations enable row level security;
alter table public.activity_logs enable row level security;

create policy "authenticated can read profiles" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "users update own profile basics" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Operadores podem gerir ativos de marketing; gestores e admins também.
do $$ declare tab text; begin foreach tab in array array['products','facebook_pages','monitored_pages','videos','inspirations','utm_links'] loop
  execute format('create policy "read %1$s" on public.%1$I for select to authenticated using (true)', tab);
  execute format('create policy "write %1$s" on public.%1$I for all to authenticated using (true) with check (true)', tab);
end loop; end $$;

-- Métricas financeiras, vendas e gastos são exclusivos de gestor/admin.
do $$ declare tab text; begin foreach tab in array array['video_metrics','sales','ad_spend'] loop
  execute format('create policy "managers manage %1$s" on public.%1$I for all to authenticated using (public.is_manager()) with check (public.is_manager())', tab);
end loop; end $$;

create policy "authenticated read integrations" on public.integrations for select to authenticated using (true);
create policy "admins manage integrations" on public.integrations for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read activity logs" on public.activity_logs for select to authenticated using (public.is_admin());

-- Storage privado de vídeos e thumbnails. Crie o bucket privado `volkov-media` no painel ou descomente abaixo.
-- insert into storage.buckets (id, name, public) values ('volkov-media', 'volkov-media', false) on conflict do nothing;
create policy "authenticated read volkov media" on storage.objects for select to authenticated using (bucket_id = 'volkov-media');
create policy "operators upload volkov media" on storage.objects for insert to authenticated with check (bucket_id = 'volkov-media');
create policy "owners update volkov media" on storage.objects for update to authenticated using (bucket_id = 'volkov-media' and owner_id = auth.uid()::text);
create policy "owners delete volkov media" on storage.objects for delete to authenticated using (bucket_id = 'volkov-media' and owner_id = auth.uid()::text);

comment on table public.monitored_pages is 'Cadastro manual de referências públicas; não autoriza nem implementa scraping.';
comment on table public.integrations is 'Credenciais nunca devem ser salvas em config; use variáveis de ambiente e Edge Functions.';
