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

-- Existing rows remain unowned and inaccessible through the application.
alter table public.analyses add column if not exists owner_hash text;
alter table public.analyses add column if not exists input_json jsonb;
alter table public.analyses add column if not exists receipt_hash text;
alter table public.analyses add column if not exists completed_priorities integer[] not null default '{}';
alter table public.analyses add column if not exists share_token_hash text;
alter table public.analyses add column if not exists share_expires_at timestamptz;
create index if not exists analyses_owner_created_idx on public.analyses(owner_hash, created_at desc);
create unique index if not exists analyses_receipt_idx on public.analyses(receipt_hash) where receipt_hash is not null;
create unique index if not exists analyses_share_idx on public.analyses(share_token_hash) where share_token_hash is not null;
revoke all on public.analyses from anon, authenticated;
grant select, insert, update, delete on public.analyses to service_role;

create table if not exists public.careerlens_limits (
  key text primary key,
  window_started_at timestamptz not null,
  requests integer not null
);
alter table public.careerlens_limits enable row level security;
revoke all on public.careerlens_limits from anon, authenticated;

create or replace function public.consume_careerlens_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare count_now integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or length(p_key) <> 64 then
    return false;
  end if;
  insert into public.careerlens_limits as quota(key, window_started_at, requests)
  values (p_key, clock_timestamp(), 1)
  on conflict(key) do update set
    requests = case when quota.window_started_at <= clock_timestamp() - make_interval(secs => p_window_seconds) then 1 else quota.requests + 1 end,
    window_started_at = case when quota.window_started_at <= clock_timestamp() - make_interval(secs => p_window_seconds) then clock_timestamp() else quota.window_started_at end
  returning requests into count_now;
  return count_now <= p_limit;
end;
$$;
revoke all on function public.consume_careerlens_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_careerlens_limit(text, integer, integer) to service_role;

-- The app inserts through a server-only service role key.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY to the browser.
