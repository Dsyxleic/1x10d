# 1x10d — Guía de instalación

Web privada de uso personal para Persona 5: The Phantom X. Todo el contenido exige haber iniciado sesión — nadie sin cuenta puede ver nada, ni siquiera la portada.

---

## Paso 1 — Crear el proyecto en Supabase (NUEVO, distinto al de Menhera)

1. https://supabase.com → **New project**. Nómbralo `1x10d`.
2. **Project Settings → API Keys**: copia la **Project URL** y la clave **`anon public`** / **`Publishable key`**.
qweqweqweqeq
## Paso 2 — Base de datos
qweqweqweqweq

1. **SQL Editor → New query**.
2. Pega todo el contenido de `sql/schema.sql` y dale a **Run**.

## Paso 3 — Tu cuenta

1. **Authentication → Users → Add user**. Crea tu usuario (correo + contraseña), marca "Auto Confirm User".
2. Copia su **UID**.
3. **Table Editor → admins → Insert row**: pega el UID en `user_id`, y lo que quieras en `label`.

Si más adelante quieres dar acceso a alguien más, repites este paso 3 con su correo.

## Paso 4 — Conectar la web

Abre `js/supabase-client.js` y sustituye `SUPABASE_URL` y `SUPABASE_ANON_KEY` por los tuyos.

## Paso 5 — Publicar

1. Crea un repositorio **nuevo** en GitHub, por ejemplo `1x10d`.
2. Sube todo el contenido de esta carpeta (igual que hiciste con Menhera: arrastrar todo a "Add file → Upload files").
3. **Settings → Pages** → Source: `main` / `/ (root)` → Save.
4. Tu web quedará en `https://tu-usuario.github.io/1x10d/`.

Como todo exige login, aunque alguien encuentre el link, solo verá la pantalla de acceso — no hay ninguna página pública.

---

## Qué incluye

- **Constructor / Biblioteca**: igual que en Menhera, pero aquí no hay "modo invitado" — como todo el sitio ya requiere sesión, guardas directamente.
- **Personajes / Personas**: igual que en Menhera, con dos campos nuevos en Personajes: **Elemento** y **Rol de combate** (los reales del juego: 10 elementos, 7 roles), que alimentan los filtros de Build.
- **Build** (nuevo): una fila por personaje con rareza, nivel, arma, Mindscape (5 celdas, la última hasta 12), Cards (Sun/Moon/Star/Sky/Space en verde/amarillo/rojo) y Awareness (1 a 6). Filtra por nombre, elemento, rol o rareza. Clic en "Crear build"/"Editar" abre el detalle completo.
- **Notas** (nuevo): notas de texto libre organizadas en carpetas, con guardado automático mientras escribes.
- **Inicio**: un changelog que se rellena solo cada vez que añades un personaje, una persona o guardas una rotación.

## Nota sobre las imágenes

El almacén de imágenes (`images` en Supabase Storage) está marcado como público a nivel de archivo — quien tuviera la URL exacta y aleatoria de una imagen podría verla suelta, pero ningún dato del sitio (nombres, builds, notas) es accesible sin iniciar sesión. Si en algún momento quieres que ni las imágenes sueltas sean accesibles, se puede montar con URLs firmadas y caducidad, pero añade bastante complejidad — dímelo si te importa y lo hacemos.

## Personalización pendiente

- No has puesto ningún logo/favicon para esta web todavía — puedes usar la misma foto tuya de Menhera, otra distinta, o ninguna (funciona igual, solo se ve el icono por defecto del navegador). Dime si quieres que te prepare uno.
