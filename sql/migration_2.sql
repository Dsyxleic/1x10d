-- ============================================================
-- 1x10d — Migración 2
-- Arregla: falta la columna "role" (rol libre para el Constructor)
-- que el formulario de Personajes ya intentaba guardar.
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

alter table characters add column if not exists role text;
