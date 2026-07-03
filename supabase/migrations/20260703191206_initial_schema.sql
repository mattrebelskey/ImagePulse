-- ImagePulse initial schema — Milestone A Session 1 (2026-07-03)
--
-- Multi-tenant from day one. user_id is NULLABLE until Session 3 (Supabase Auth)
-- backfills Red's migrated single-tenant rows and adds RLS policies.
-- RLS is ENABLED on every table now with zero policies: deny-by-default for any
-- anon/authenticated access. The Express server connects directly to Postgres as
-- the table owner, which is unaffected by RLS.
-- Data API note: projects created after 2026-04-28 do NOT auto-expose tables to
-- the REST API, and this migration adds no grants — nothing here is reachable
-- over REST until Session 3 wires auth deliberately.

-- ---------- plans & credits (dollar amounts are placeholders; Red prices at Milestone B) ----------
create table public.plans (
  id text primary key,                              -- 'free' | 'starter' | 'pro'; gen-included tier lands later
  name text not null,
  monthly_price_cents integer not null default 0,
  runs_per_month integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.plans (id, name, monthly_price_cents, runs_per_month) values
  ('free',    'Free',    0,    3),
  ('starter', 'Starter', 900,  25),
  ('pro',     'Pro',     1900, 100);

-- ---------- profiles (the brief's "users" table; 1:1 with auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  plan_id text not null default 'free' references public.plans(id),
  credit_balance integer not null default 0,        -- purchased extra runs beyond the plan cap
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- listings state machine (folders were never the point) ----------
create type public.listing_status as enum ('raw', 'production', 'staged', 'shipped', 'retired');
create type public.retired_reason as enum ('didnt_renew', 'not_selling', 'etsy_takedown', 'ip_complaint', 'superseded', 'owner_choice', 'other');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  concept_slug text not null,
  product_type text not null default 'print',
  status public.listing_status not null default 'raw',
  status_history jsonb not null default '[]'::jsonb,   -- [{"status": "...", "at": "..."}]
  retired_reason public.retired_reason,
  retired_note text,
  listing_data jsonb not null default '{}'::jsonb,     -- titles[], chosen_title, description, tags[], price, etsy fields, checklist state
  compliance jsonb not null default '{}'::jsonb,       -- 4-track verdicts + citations; legal text composed server-side at render/push
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_pushes (
  id bigint generated always as identity primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null,                              -- 'printify' | 'printful' | 'etsy'
  external_product_id text,
  shop_id text,
  live_url text,
  pushed_at timestamptz not null default now()
);

-- ---------- ported app tables (History and Saved Packages stay distinct) ----------
create table public.favorite_niches (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  category text,
  keywords jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint favorite_niches_user_title_uniq unique nulls not distinct (user_id, title)
);

create table public.favorite_packages (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  trend_title text not null,
  product_type text,
  prompts jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  titles jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.generation_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  trend_title text not null,
  product_type text,
  prompts jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  titles jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- BYOK keys (Session 4 wires encryption; plaintext keys never touch the DB) ----------
create table public.byok_keys (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null default 'gemini',             -- one row per generator when multi-generator lands
  key_ciphertext text not null,                        -- AES-256-GCM; master key lives in server env, never in DB
  key_iv text not null,
  key_last4 text,                                      -- display hint only
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  constraint byok_keys_user_provider_uniq unique nulls not distinct (user_id, provider)
);

-- ---------- run metering (rows from Session 5 dogfood onward; server-side caps in Milestone B) ----------
create table public.run_ledger (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  run_type text not null default 'package_generation',
  listing_id uuid references public.listings(id) on delete set null,
  niche_title text,
  cost_source text not null default 'byok',            -- 'byok' | 'included' | 'credits'
  created_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index listings_user_status_idx on public.listings (user_id, status);
create index store_pushes_listing_idx on public.store_pushes (listing_id);
create index favorite_niches_user_idx on public.favorite_niches (user_id, created_at desc);
create index favorite_packages_user_idx on public.favorite_packages (user_id, created_at desc);
create index generation_history_user_idx on public.generation_history (user_id, created_at desc);
create index byok_keys_user_idx on public.byok_keys (user_id);
create index run_ledger_user_idx on public.run_ledger (user_id, created_at desc);

-- ---------- updated_at maintenance ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger listings_set_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

-- ---------- RLS: enabled everywhere, zero policies until Session 3 ----------
alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.store_pushes enable row level security;
alter table public.favorite_niches enable row level security;
alter table public.favorite_packages enable row level security;
alter table public.generation_history enable row level security;
alter table public.byok_keys enable row level security;
alter table public.run_ledger enable row level security;
