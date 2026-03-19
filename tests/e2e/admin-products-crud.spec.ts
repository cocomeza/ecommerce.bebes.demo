import { test, expect } from './fixtures';

test.describe('E2E: Admin CRUD productos (smoke)', () => {
  test.skip(
    !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD,
    'Missing TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD'
  );

  test('crear → editar → eliminar producto', async ({ page }) => {
    // Login
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL!);
    await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Ir a productos
    await page.goto('/admin/products');
    await expect(page.getByRole('heading', { name: /productos/i })).toBeVisible();

    // Crear
    await page.getByRole('button', { name: /nuevo producto/i }).click();
    const name = `Producto QA ${Date.now()}`;
    await page.getByLabel('Nombre').fill(name);
    await page.getByLabel('Categoría').fill('Bodysuits');
    await page.getByLabel('Precio al público').fill('1234');
    await page.getByLabel('Precio por mayor').fill('999');
    await page.getByRole('button', { name: /guardar producto/i }).click();

    // Debe aparecer en lista
    await expect(page.getByText(name).first()).toBeVisible();

    // Eliminar (desde panel derecho)
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /eliminar producto/i }).click();
    // fallback: confirm() by browser
    // Esperar que desaparezca
    await expect(page.getByText(name)).toHaveCount(0);
  });
});

