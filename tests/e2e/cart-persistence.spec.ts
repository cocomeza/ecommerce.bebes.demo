import { test, expect } from './fixtures';
import { hasEnv } from '../helpers/env';

test.describe('E2E: carrito persistente (localStorage)', () => {
  test.skip(
    !hasEnv([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
    ]),
    'Missing Supabase test env'
  );

  test('agregar al carrito → refresh → sigue', async ({ page, seed }) => {
    await page.goto(`/product/${seed.productId}`);
    await page.getByRole('button', { name: /añadir al carrito/i }).click();

    // Recargar
    await page.reload();

    // Abrir el carrito desde el icono en navbar (desktop)
    await page.locator('nav').getByRole('button').first().click().catch(() => {});

    // Ver que hay al menos 1 item en el drawer
    await expect(page.getByText(/carrito/i)).toBeVisible();
    await expect(page.getByText(seed.name)).toBeVisible();
  });
});

