-- Colores por jefe (para las tarjetas de la Biblioteca)
alter table bosses add column if not exists color text default '#7a1518';

-- Notas ligadas a un personaje en concreto
alter table notes add column if not exists character_id uuid references characters(id) on delete set null;

-- Personas: elemento y colores propios (igual que los personajes)
alter table personas add column if not exists element text;
alter table personas add column if not exists color_bg text default '#1c1a20';
alter table personas add column if not exists color_text text default '#f1ece7';
