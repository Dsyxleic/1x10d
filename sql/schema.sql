-- 1) Cuentas con acceso (tú, y quien añadas en el futuro)
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  label text
);

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- 2) Personajes (roster compartido por Constructor / Personajes / Build)
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtype text,
  role_combat text,       -- Assassin / Sweeper / Medic / Saboteur / Guardian / Strategist / Navigator
  element text,           -- Physical / Gun / Fire / Ice / Electric / Wind / Psychokinesis / Nuclear / Bless / Curse
  avatar_url text,
  link_url text,
  color_bg text not null default '#1a1422',
  color_text text not null default '#ede6f2',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists character_actions (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references characters(id) on delete cascade,
  label text not null,
  icon_url text,
  sort_order int default 0
);

-- 3) Jefes y modos (para el Constructor / Biblioteca)
create table if not exists bosses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists game_modes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- 4) Personas
create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  link_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists persona_skills (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid references personas(id) on delete cascade,
  label text not null,
  icon_url text,
  sort_order int default 0
);

-- 5) Rotaciones (Constructor / Biblioteca)
create table if not exists rotations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  boss_id uuid references bosses(id) on delete set null,
  game_mode_id uuid references game_modes(id) on delete set null,
  dps_character_id uuid references characters(id) on delete set null,
  wonder_knife text,
  grid jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6) Build de personajes — seguimiento de progreso de cuenta
create table if not exists character_builds (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references characters(id) on delete cascade unique,
  rarity text check (rarity in ('4','5')),
  level int default 1,
  has_weapon boolean default false,
  weapon_level int default 0,
  -- mindscape: 5 celdas [{value, max}], la última suele llegar a 12
  mindscape jsonb not null default '[{"value":0,"max":5},{"value":0,"max":5},{"value":0,"max":5},{"value":0,"max":5},{"value":0,"max":12}]'::jsonb,
  -- cards: sun/moon/star/sky/space -> "red" | "yellow" | "green" | null
  cards jsonb not null default '{"sun":null,"moon":null,"star":null,"sky":null,"space":null}'::jsonb,
  -- awareness 1 a 6, cada una true/false
  awareness jsonb not null default '[false,false,false,false,false,false]'::jsonb,
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 7) Changelog de Inicio (se rellena desde la web al crear cosas)
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  type text not null,     -- 'character' | 'persona' | 'rotation' | 'build'
  label text not null,
  created_at timestamptz default now()
);

-- 8) Notas con carpetas
create table if not exists note_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references note_folders(id) on delete set null,
  title text not null default 'Sin título',
  content text default '',
  sort_order int default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security: TODO requiere sesión + estar en "admins"
-- (no existe ningún nivel público en este proyecto)
-- ============================================================
alter table characters enable row level security;
alter table character_actions enable row level security;
alter table bosses enable row level security;
alter table game_modes enable row level security;
alter table personas enable row level security;
alter table persona_skills enable row level security;
alter table rotations enable row level security;
alter table character_builds enable row level security;
alter table activity_log enable row level security;
alter table note_folders enable row level security;
alter table notes enable row level security;
alter table admins enable row level security;

create policy "member access characters" on characters for all using (is_admin()) with check (is_admin());
create policy "member access character_actions" on character_actions for all using (is_admin()) with check (is_admin());
create policy "member access bosses" on bosses for all using (is_admin()) with check (is_admin());
create policy "member access game_modes" on game_modes for all using (is_admin()) with check (is_admin());
create policy "member access personas" on personas for all using (is_admin()) with check (is_admin());
create policy "member access persona_skills" on persona_skills for all using (is_admin()) with check (is_admin());
create policy "member access rotations" on rotations for all using (is_admin()) with check (is_admin());
create policy "member access character_builds" on character_builds for all using (is_admin()) with check (is_admin());
create policy "member access activity_log" on activity_log for all using (is_admin()) with check (is_admin());
create policy "member access note_folders" on note_folders for all using (is_admin()) with check (is_admin());
create policy "member access notes" on notes for all using (is_admin()) with check (is_admin());

create policy "no client access to admins" on admins for all using (false);

-- ============================================================
-- Storage: bucket para imágenes de personajes/personas
-- (marcado como público a nivel de archivo: quien tenga la URL
-- exacta y aleatoria podría ver la imagen suelta, pero ningún
-- dato -nombres, builds, notas- es accesible sin iniciar sesión.
-- Créalo desde Supabase Dashboard > Storage > New bucket "images",
-- marcado como Public, o deja que este script lo haga)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "public read images" on storage.objects for select using (bucket_id = 'images');
create policy "admin upload images" on storage.objects for insert with check (bucket_id = 'images' and is_admin());
create policy "admin update images" on storage.objects for update using (bucket_id = 'images' and is_admin());
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'images' and is_admin());
