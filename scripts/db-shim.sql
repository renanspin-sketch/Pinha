-- Shim mínimo do Supabase para o cluster temporário local.
-- Fica fora de supabase/tests de propósito (`supabase test db` o executaria).
-- Usado SOMENTE por scripts/test-db-local.sh (nunca por CI nem por migrations).
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant anon, authenticated, service_role to postgres;

create schema extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists pgtap;

create schema auth;
create table auth.users (
  id uuid primary key,  -- sem default, como no GoTrue real
  aud text,
  role text,
  email text unique,
  raw_user_meta_data jsonb default '{}',
  created_at timestamptz default now()
);

create function auth.uid() returns uuid language sql stable as $$
  select nullif(nullif(current_setting('request.jwt.claims', true), '')::json->>'sub', '')::uuid
$$;
create function auth.role() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true), '')::json->>'role'
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;
