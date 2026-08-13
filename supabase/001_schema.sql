-- ============================================================================
-- Code Runner — database schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: every statement is idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: one row per player, created automatically on signup.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  xp            integer not null default 0 check (xp >= 0),
  streak        integer not null default 0 check (streak >= 0),
  best_streak   integer not null default 0 check (best_streak >= 0),
  recoveries    integer not null default 0 check (recoveries >= 0),
  inventory     jsonb   not null default '{}'::jsonb,
  achievements  jsonb   not null default '[]'::jsonb,
  settings      jsonb   not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- mission_progress: best result per player per mission.
-- ---------------------------------------------------------------------------
create table if not exists public.mission_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  mission_id   text not null,
  level        integer not null check (level between 1 and 100),
  best_tier    text check (best_tier in ('bronze','silver','gold')),
  attempts     integer not null default 0 check (attempts >= 0),
  hints_used   integer not null default 0 check (hints_used >= 0),
  languages    text[]  not null default '{}',
  first_cleared_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, mission_id)
);

create index if not exists mission_progress_user_level_idx
  on public.mission_progress (user_id, level);

-- ---------------------------------------------------------------------------
-- submissions: an append-only audit log. Useful for analytics later, and the
-- only record of what a player actually wrote.
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  mission_id   text not null,
  language     text not null,
  source_code  text not null,
  tier         text check (tier in ('bronze','silver','gold')),
  passed       boolean not null,
  runtime_ms   numeric,
  created_at   timestamptz not null default now()
);

create index if not exists submissions_user_idx on public.submissions (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: a player can only ever see or touch their own rows.
-- Without these policies every table above would be world-readable through the
-- anon key, which ships in the browser bundle.
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.mission_progress enable row level security;
alter table public.submissions      enable row level security;

drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile write"  on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile write"  on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own progress read"   on public.mission_progress;
drop policy if exists "own progress write"  on public.mission_progress;
drop policy if exists "own progress update" on public.mission_progress;
create policy "own progress read"   on public.mission_progress for select using (auth.uid() = user_id);
create policy "own progress write"  on public.mission_progress for insert with check (auth.uid() = user_id);
create policy "own progress update" on public.mission_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own submissions read"  on public.submissions;
drop policy if exists "own submissions write" on public.submissions;
create policy "own submissions read"  on public.submissions for select using (auth.uid() = user_id);
create policy "own submissions write" on public.submissions for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Integrity guard.
--
-- Progression is computed in the browser (see SECURITY.md), so the database
-- enforces the invariants it can check on its own. This will not stop a
-- determined cheat, and is not claimed to: it stops casual tampering and
-- catches genuine client bugs, which is worth having either way.
-- ---------------------------------------------------------------------------
create or replace function public.check_level_unlock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cleared integer;
begin
  if new.best_tier is null then
    return new;
  end if;

  -- A cleared level requires every earlier level to be cleared too.
  select count(*) into cleared
  from public.mission_progress
  where user_id = new.user_id
    and level < new.level
    and best_tier is not null;

  if cleared < new.level - 1 then
    raise exception 'level % cannot be cleared before levels 1..%', new.level, new.level - 1;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_level_unlock on public.mission_progress;
create trigger enforce_level_unlock
  before insert or update on public.mission_progress
  for each row execute function public.check_level_unlock();

-- ---------------------------------------------------------------------------
-- Create a profile row automatically when a user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(coalesce(new.email, 'runner'), '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
