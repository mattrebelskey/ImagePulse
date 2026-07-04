-- ImagePulse Session 3 — Auth + multi-tenancy (2026-07-03)
--
-- IMPORTANT tenancy model: the api/ functions connect over the transaction
-- pooler as the TABLE OWNER, and owners bypass RLS entirely. For the api/
-- path, tenancy is enforced by the explicit `WHERE user_id = $1` on every
-- query (api/_lib/auth.js verifies the JWT; each handler scopes by user).
-- The policies below guard the OTHER path — supabase-js / the Data API —
-- which today is used for auth only.
--
-- Grants: DELIBERATELY NONE. Projects created after 2026-04-28 do not expose
-- tables to the Data API, and supabase-js in this app touches no tables, so
-- anon/authenticated get no table grants. Policies are defense-in-depth for
-- the day grants/exposure change; writes stay deny-by-default everywhere
-- (all writes go through api/). byok_keys gets NO policy at all: key
-- ciphertext must never be readable from a client, even in that future.

-- ---------- profiles: create a row for every new auth user ----------
-- SECURITY DEFINER because the trigger fires as supabase_auth_admin, which
-- has no INSERT grant on public.profiles. Mitigations per Supabase guidance:
-- empty search_path, EXECUTE revoked below (PUBLIC gets it by default).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users created before this trigger existed.
insert into public.profiles (id, email, display_name)
select id, email, split_part(email, '@', 1)
from auth.users
on conflict (id) do nothing;

-- ---------- backfill single-tenant rows to Red, then enforce NOT NULL ----------
-- Pre-auth rows (4 generation_history rows + any favorites) belong to Red.
-- Looked up by email so this migration carries no hardcoded UUID. Guard
-- property: if somehow rows exist but Red's user does not, user_id stays
-- NULL and the SET NOT NULL below fails loudly instead of silently orphaning.
update public.favorite_niches
  set user_id = (select id from auth.users where email = 'matt.rebelskey@gmail.com')
  where user_id is null;
update public.favorite_packages
  set user_id = (select id from auth.users where email = 'matt.rebelskey@gmail.com')
  where user_id is null;
update public.generation_history
  set user_id = (select id from auth.users where email = 'matt.rebelskey@gmail.com')
  where user_id is null;

alter table public.favorite_niches alter column user_id set not null;
alter table public.favorite_packages alter column user_id set not null;
alter table public.generation_history alter column user_id set not null;

-- listings / store_pushes / byok_keys / run_ledger keep nullable user_id for
-- now — they are empty and their write paths land in Sessions 4-5, which
-- decide their constraints.

-- ---------- RLS policies (RLS itself enabled since Session 1) ----------
-- Minimal true-to-product set: users can READ their own rows; plans are
-- world-readable (public pricing grid at Milestone B). NO write policies —
-- every write goes through api/ as owner, so client-side writes stay denied
-- even if table grants ever appear.

create policy "plans are viewable by everyone"
  on public.plans for select
  to anon, authenticated
  using (true);

create policy "users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "users can view own listings"
  on public.listings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can view own store pushes"
  on public.store_pushes for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can view own favorite niches"
  on public.favorite_niches for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can view own favorite packages"
  on public.favorite_packages for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can view own generation history"
  on public.generation_history for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can view own run ledger"
  on public.run_ledger for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- byok_keys: intentionally NO policy (deny-all). Ciphertext/IV must never be
-- client-readable; the api/ owner path is the only reader.
