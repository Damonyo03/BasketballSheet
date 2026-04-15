-- ============================================
-- POST PROPER NORTHSIDE BASKETBALL
-- Supabase Database Schema
-- ============================================

-- Enable realtime
alter publication supabase_realtime add table games;
alter publication supabase_realtime add table game_events;

-- ---- Teams ----
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  logo_url text,
  color text default '#FF6B1A',
  wins int default 0,
  losses int default 0,
  points_for int default 0,
  points_against int default 0,
  created_at timestamptz default now()
);

-- ---- Players ----
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  jersey_number text not null,
  position text, -- PG, SG, SF, PF, C
  height text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---- Games ----
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid references teams(id),
  away_team_id uuid references teams(id),
  home_score int default 0,
  away_score int default 0,
  quarter int default 1, -- 1-4, 5+ for OT
  time_remaining text default '10:00',
  status text default 'scheduled', -- scheduled, live, finished, cancelled
  q1_home int default 0,
  q1_away int default 0,
  q2_home int default 0,
  q2_away int default 0,
  q3_home int default 0,
  q3_away int default 0,
  q4_home int default 0,
  q4_away int default 0,
  scheduled_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now()
);

-- ---- Game Events (Play-by-play) ----
create table if not exists game_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id),
  team_id uuid references teams(id),
  event_type text not null, -- 'fg2', 'fg3', 'ft', 'rebound', 'assist', 'steal', 'block', 'turnover', 'foul'
  points int default 0,
  quarter int,
  game_time text,
  description text,
  created_at timestamptz default now()
);

-- ---- Player Game Stats (aggregated per game) ----
create table if not exists player_game_stats (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  team_id uuid references teams(id),
  minutes int default 0,
  points int default 0,
  fg_made int default 0,
  fg_attempted int default 0,
  three_made int default 0,
  three_attempted int default 0,
  ft_made int default 0,
  ft_attempted int default 0,
  rebounds int default 0,
  assists int default 0,
  steals int default 0,
  blocks int default 0,
  turnovers int default 0,
  fouls int default 0,
  created_at timestamptz default now(),
  unique(game_id, player_id)
);

-- ---- Indexes ----
create index if not exists idx_games_status on games(status);
create index if not exists idx_game_events_game_id on game_events(game_id);
create index if not exists idx_player_game_stats_player on player_game_stats(player_id);
create index if not exists idx_players_team on players(team_id);

-- ---- Seed Data: Teams ----
insert into teams (name, short_name, color) values
  ('Northside Ballers', 'NSB', '#FF6B1A'),
  ('Eastside Raiders', 'ESR', '#4A90D9'),
  ('Westside Kings', 'WSK', '#22C55E'),
  ('Southgate FC', 'SGF', '#A855F7'),
  ('Uptown Wolves', 'UTW', '#EAB308'),
  ('Riverdale Stars', 'RDS', '#EC4899')
on conflict do nothing;
