-- Einmal im SQL-Editor des Supabase-Projekts ausführen.
-- Diese Tabelle ist bewusst nur für unkritische, von der Familie geteilte Reisedaten gedacht.

create table if not exists public.trip_state (
  trip_code text primary key check (char_length(trip_code) between 12 and 80),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.trip_state enable row level security;

grant select, insert, update on table public.trip_state to anon, authenticated;

drop policy if exists "trip_state_select" on public.trip_state;
create policy "trip_state_select"
on public.trip_state for select
to anon, authenticated
using (char_length(trip_code) between 12 and 80);

drop policy if exists "trip_state_insert" on public.trip_state;
create policy "trip_state_insert"
on public.trip_state for insert
to anon, authenticated
with check (char_length(trip_code) between 12 and 80);

drop policy if exists "trip_state_update" on public.trip_state;
create policy "trip_state_update"
on public.trip_state for update
to anon, authenticated
using (char_length(trip_code) between 12 and 80)
with check (char_length(trip_code) between 12 and 80);

comment on table public.trip_state is
  'Nicht vertraulicher, über einen Familiencode geteilter Zustand der Schweden-PWA.';
