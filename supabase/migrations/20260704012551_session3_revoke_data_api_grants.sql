-- ImagePulse Session 3 follow-up — revoke Data API role grants (2026-07-03)
--
-- CORRECTS an assumption in 20260704011300_session3_auth_rls.sql: live
-- inspection showed the post-2026-04-28 "not exposed" default did NOT mean
-- "no grants". Reality on this project:
--   * PostgREST db_schema still includes `public`, AND
--   * schema-scoped default privileges (for role postgres) grant FULL table
--     rights (incl. INSERT/UPDATE/DELETE on byok_keys) to anon/authenticated.
-- Until now only RLS deny-by-default stood between the anon key and the
-- tables. Per the plan-of-record decision — supabase-js is auth-only, all
-- data access goes through api/ as owner — the API roles get NO table
-- grants. If a future session adopts supabase-js data access, it must GRANT
-- deliberately (and plans/pricing reads at Milestone B go through api/ or a
-- deliberate re-grant then).
--
-- service_role grants are left intact (platform convention; we never ship
-- that key anywhere). supabase_admin's own default-privilege entry cannot be
-- altered from here (postgres is not a member of supabase_admin); it only
-- affects Supabase-internal object creation, and RLS still covers that gap.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Stop future postgres-created tables/sequences in public from being
-- auto-granted to the API roles (RLS policies stay the second layer).
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
