# Testing (E2E + API + Integración)

Este proyecto incluye una suite profesional de tests automatizados para cubrir flujos críticos del negocio.

## Estructura

- `tests/e2e/`: **Playwright** (E2E)
- `tests/api/`: **Vitest** (tests del handler / capa API, con mocks)
- `tests/integration/`: **Vitest** (flujo real API → Supabase RPC, requiere env de test)
- `tests/concurrency/`: **Vitest** (concurrencia contra Supabase RPC, requiere env de test)
- `tests/helpers/`: helpers reutilizables (env + Supabase admin para seed/cleanup)

## Variables de entorno para tests

### Para E2E + integración (recomendado)

Estas variables permiten sembrar datos y validar stock real contra Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`: URL de tu proyecto (ej: `https://xxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (solo server/CI, **nunca** en frontend)

> Para E2E/Frontend, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son obligatorias.  
> Para seed/cleanup y concurrencia, además necesitás `SUPABASE_SERVICE_ROLE_KEY`.

### Para tests de admin (login válido)

- `TEST_ADMIN_EMAIL`
- `TEST_ADMIN_PASSWORD`

> Si estas variables no están, los tests de login válido/CRUD admin se saltean.  
> Además, los tests de `admin-auth.spec.ts` se saltean si faltan `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Scripts

- `npm run test:api`: Vitest (API unit + route handler)
- `npm run test:integration`: Vitest (integración + concurrencia, env-gated)
- `npm run test:e2e`: Playwright (E2E) con servidor dev levantado automáticamente en un puerto separado.

## Notas

- WhatsApp se “mockea” en E2E interceptando `window.open()`. No abre WhatsApp real.
- Los tests están diseñados para ser **independientes**: siembran y limpian datos por test suite.
- Concurrencia: se dispara `POST /api/orders` en paralelo y se valida que no haya overselling.

