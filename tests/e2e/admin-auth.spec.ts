import { test, expect } from './fixtures';

test.describe('E2E: Admin auth + route protection', () => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );

  test('redirect to /admin/login when not authenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // AdminAuthGuard is client-side; depending on hydration/network it may briefly show loading.
    await expect
      .poll(
        async () => {
          const urlOk = /\/admin\/login/.test(page.url());
          const loginVisible = await page.getByRole('heading', { name: /iniciar sesión/i }).isVisible().catch(() => false);
          return urlOk || loginVisible;
        },
        { timeout: 30_000 }
      )
      .toBe(true);
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('noexiste@example.com');
    await page.getByLabel(/contraseña/i).fill('incorrecta');
    await page.getByRole('button', { name: /ingresar/i }).click();
    // Sonner toast renders in DOM; we check for generic failure text
    await expect(page.getByText(/no se pudo iniciar sesión|invalid|error/i)).toBeVisible({ timeout: 15_000 });
  });

  test('valid login enters admin', async ({ page }) => {
    test.skip(
      !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD,
      'Missing TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD'
    );

    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL!);
    await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: /inicio/i })).toBeVisible();
  });
});

