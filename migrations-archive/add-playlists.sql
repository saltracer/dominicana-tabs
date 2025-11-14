-- Playlists schema and RLS policies
-- Run this in Supabase SQL editor or via your migration pipeline

-- Tables
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_builtin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  episode_id uuid,
  external_ref jsonb, -- { podcastId, guid, audioUrl }
  position integer not null,
  added_at timestamptz not null default now(),
  constraint playlist_items_episode_or_external
    check (
      (episode_id is not null and external_ref is null)
      or (episode_id is null and external_ref is not null)
    )
);

-- Indexes
create index if not exists idx_playlists_user on public.playlists(user_id);
create unique index if not exists uq_playlists_user_name
  on public.playlists(user_id, name)
  where is_builtin = false;
create index if not exists idx_playlist_items_playlist on public.playlist_items(playlist_id);
create index if not exists idx_playlist_items_order on public.playlist_items(playlist_id, position);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

drop trigger if exists trg_playlists_set_updated_at on public.playlists;
create trigger trg_playlists_set_updated_at
before update on public.playlists
for each row execute function public.set_updated_at();

-- RLS
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;

-- Policies for playlists: only owner can CRUD
drop policy if exists playlists_select on public.playlists;
create policy playlists_select on public.playlists
  for select using (auth.uid() = user_id);

drop policy if exists playlists_insert on public.playlists;
create policy playlists_insert on public.playlists
  for insert with check (auth.uid() = user_id);

drop policy if exists playlists_update on public.playlists;
create policy playlists_update on public.playlists
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists playlists_delete on public.playlists;
create policy playlists_delete on public.playlists
  for delete using (auth.uid() = user_id and is_builtin = false);

-- Policies for playlist_items: allowed if user owns the parent playlist
drop policy if exists playlist_items_select on public.playlist_items;
create policy playlist_items_select on public.playlist_items
  for select using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  );

drop policy if exists playlist_items_insert on public.playlist_items;
create policy playlist_items_insert on public.playlist_items
  for insert with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  );

drop policy if exists playlist_items_update on public.playlist_items;
create policy playlist_items_update on public.playlist_items
  for update using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  );

drop policy if exists playlist_items_delete on public.playlist_items;
create policy playlist_items_delete on public.playlist_items
  for delete using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  );

-- Seed built-in playlist name guidance (not enforced here)
-- The "Downloaded" playlist is virtual in app and not stored here.


