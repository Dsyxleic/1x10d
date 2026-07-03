-- ============================================================
-- 1x10d — Migración: iconos personalizados
-- Permite subir una imagen propia para cada elemento/rol,
-- en vez de usar el emoji por defecto.
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

create table if not exists icon_assets (
  category text not null check (category in ('element','role')),
  key text not null,
  image_url text,
  updated_at timestamptz default now(),
  primary key (category, key)
);

alter table icon_assets enable row level security;
create policy "member access icon_assets" on icon_assets for all using (is_admin()) with check (is_admin());
