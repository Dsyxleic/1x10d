-- ============================================================
-- 1x10d — Migración: foto por skill de Persona
-- (character_actions ya tenía icon_url; esto lo iguala para personas)
-- ============================================================

alter table persona_skills add column if not exists icon_url text;
