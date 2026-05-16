-- Supabase Schema for DealLens Phase 4 (Multi-Tenant Investor Platform)

-- 1. Create the profiles table
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  created_at  timestamptz default now(),
  full_name   text not null,
  handle      text unique not null,
  email       text not null
);

-- 2. Create the analyses table (with user ownership)
create table if not exists analyses (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz default now(),
  user_id           uuid references profiles(id) on delete cascade, -- Nullable for public submissions
  startup_name      text not null,
  file_name         text not null,
  report            jsonb not null,
  overall_score     numeric(3,1),
  status            text not null default 'pending',
  category          text,
  short_description text,
  founder_email     text,
  raw_text          text
);

-- 3. Create the investor_preferences table (per user)
create table if not exists investor_preferences (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references profiles(id) on delete cascade unique,
  created_at               timestamptz default now(),
  interested_categories    text[] default '{}',
  disqualified_categories  text[] default '{}'
);

-- 4. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table analyses enable row level security;
alter table investor_preferences enable row level security;

-- 5. RLS Policies

-- Profiles: Users can only see and update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Public can view handles" on profiles for select using (true); -- Needed for public submission pages

-- Analyses:
-- 1. Users can view and manage their own deals
create policy "Users manage own analyses" on analyses for all using (auth.uid() = user_id);
-- 2. Public can insert analyses (via bio links)
create policy "Public insert analyses" on analyses for insert with check (true);

-- Preferences: Users manage their own preferences
create policy "Users manage own preferences" on investor_preferences for all using (auth.uid() = user_id);

-- 6. Trigger to automatically create a profile row is NOT used here 
-- (we will handle it in our signup route to generate the handle)
