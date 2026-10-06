-- ============================================================
-- Einrichtung der profiles-Tabelle für den Login
-- Ausführen im Supabase-Dashboard: SQL Editor -> New query
-- ============================================================

-- 1) Tabelle anlegen
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- 2) Row Level Security aktivieren
alter table public.profiles enable row level security;

-- 3) Policy: E-Mails dürfen ausgelesen werden
--    (genau das ermöglicht die Meldung "Kein Konto gefunden." beim Login)
create policy "Profiles koennen gelesen werden"
  on public.profiles
  for select
  using (true);

-- 4) Trigger: Profil wird beim Registrieren automatisch angelegt
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 5) Falls es schon Konten gibt, diese nachtragen:
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
