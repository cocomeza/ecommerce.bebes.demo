# Desplegar en Vercel

Este proyecto está preparado para ejecutarse en [Vercel](https://vercel.com).

## Pasos

### 1. Subir el proyecto

- Conecta tu repositorio (GitHub, GitLab o Bitbucket) con Vercel, o
- Usa la [CLI de Vercel](https://vercel.com/docs/cli): `npm i -g vercel` y luego `vercel` en la raíz del proyecto.

### 2. Variables de entorno

En el panel de Vercel: **Project → Settings → Environment Variables** agrega:

| Nombre | Descripción |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase (ej. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (public) de Supabase |

Puedes definirlas para **Production**, **Preview** y **Development** según necesites.

### 3. Deploy

- Con Git: cada push a la rama principal (o la que configures) genera un deploy.
- Con CLI: `vercel --prod` para producción.

### 4. Base de datos

Asegúrate de tener en Supabase las tablas necesarias. En la documentación del proyecto verás el esquema en `docs/supabase-schema.sql` y `docs/ARCHITECTURE.md`.

## Notas

- El **build** puede ejecutarse sin variables de entorno; la app fallará en runtime si no están configuradas en Vercel.
- Las variables `NEXT_PUBLIC_*` son necesarias tanto en build como en runtime para que la app se conecte a Supabase.
