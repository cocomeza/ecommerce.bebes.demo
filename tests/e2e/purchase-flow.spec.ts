import { test, expect } from './fixtures';
import { hasEnv } from '../helpers/env';
import { setVariantStock } from '../helpers/supabaseAdmin';

test.describe('E2E: compra + WhatsApp', () => {
  test.skip(
    !hasEnv([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
    ]),
    'Missing Supabase test env'
  );

  test('flujo completo: productos → detalle → carrito → checkout', async ({ page, seed }) => {
    await page.goto('/');

    // Ir a productos
    await page.getByRole('link', { name: /productos/i }).first().click();
    await expect(page).toHaveURL(/\/products/);

    // Abrir detalle del primer producto (seed debería aparecer)
    await page.getByText(seed.name).first().click();
    await expect(page).toHaveURL(new RegExp(`/product/${seed.productId}`));

    // Elegir variante (si aparece)
    await page.getByRole('button', { name: /NB/i }).first().click().catch(() => {});

    // Añadir al carrito
    await page.getByRole('button', { name: /añadir al carrito|añadido al carrito/i }).click();

    // Abrir carrito (icono)
    await page.getByRole('button', { name: '' }).filter({ has: page.locator('svg') }).nth(0).click().catch(() => {});
    // Más robusto: click en icono carrito del header
    await page.locator('nav').getByRole('button').nth(0).click().catch(() => {});

    // Si no se abrió por selector, abrimos desde mobile menu no aplica. Intento directo:
    await page.evaluate(() => window.dispatchEvent(new Event('cartUpdated')));

    // El Drawer usa input tel placeholder
    await page.getByPlaceholder(/Ej\./i).fill('+5491112345678');

    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/orders') && r.request().method() === 'POST'),
      page.getByRole('button', { name: /enviar pedido por whatsapp/i }).click(),
    ]);

    expect(resp.status()).toBe(200);
  });

  test('checkout error: stock insuficiente → no abre WhatsApp', async ({ page, seed, mockWhatsApp }) => {
    // dejar sin stock
    await setVariantStock(seed.variantId, 0);

    await page.goto(`/product/${seed.productId}`);
    await page.getByRole('button', { name: /añadir al carrito/i }).click();

    // abrir carrito
    await page.locator('nav').getByRole('button').nth(0).click().catch(() => {});

    await page.getByPlaceholder(/Ej\./i).fill('+5491112345678');

    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/orders') && r.request().method() === 'POST'),
      page.getByRole('button', { name: /enviar pedido por whatsapp/i }).click(),
    ]);

    expect(resp.status()).toBe(400);

    // confirm no window.open(wa.me) happened
    expect(mockWhatsApp.openedUrls.join(' ')).not.toMatch(/wa\.me/i);
  });
});

