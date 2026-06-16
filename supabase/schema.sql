create extension if not exists "pgcrypto";

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  portfolio_url text,
  input_text text not null,
  tech_stack text not null,
  result_json jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.analyses enable row level security;

-- The app inserts through a server-only service role key.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY to the browser.
