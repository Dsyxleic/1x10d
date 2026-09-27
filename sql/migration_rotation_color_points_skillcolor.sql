-- Color propio de la rotación (para la banda de la Biblioteca), puntos conseguidos y captura
alter table rotations add column if not exists color text;
alter table rotations add column if not exists points bigint;
alter table rotations add column if not exists screenshot_url text;

-- Color automático por skill (HL amarillo, teurgia roja, etc, sin marcarlo a mano cada vez)
alter table character_actions add column if not exists default_color text;
alter table persona_skills add column if not exists default_color text;
