import { test as base, expect, type Page } from '@playwright/test';
import { hasEnv } from '../helpers/env';
import { cleanupProduct, seedProductWithVariant, setVariantStock, type TestProductSeed } from '../helpers/supabaseAdmin';

type Fixtures = {
  seed: TestProductSeed;
  mockWhatsApp: {
    openedUrls: string[];
  };
};

export const test = base.extend<Fixtures>({
  seed: async ({}, use) => {
    if (
      !hasEnv([
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
      ])
    ) {
      // Provide a dummy seed; tests that require it should skip.
      await use({
        productId: '',
        variantId: '',
        name: '',
        category: '',
        retail_price: 0,
        wholesale_price: 0,
      });
      return;
    }

    const seed = await seedProductWithVariant();
    await use(seed);
    await cleanupProduct(seed.productId);
  },

  mockWhatsApp: async ({ page }, use) => {
    const openedUrls: string[] = [];
    await mockWindowOpen(page, openedUrls);
    await use({ openedUrls });
  },
});

export { expect };

async function mockWindowOpen(page: Page, openedUrls: string[]) {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__openedUrls = [];
    const original = window.open;
    window.open = function (url?: string | URL, target?: string, features?: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__openedUrls.push(String(url));
      return original.call(window, url as any, target as any, features as any);
    };
  });

  await page.exposeFunction('__pushOpenedUrl', (url: string) => openedUrls.push(url));

  // Sync collected urls after actions
  page.on('load', async () => {
    try {
      const urls = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ((window as any).__openedUrls ?? []) as string[];
      });
      urls.forEach((u) => openedUrls.push(u));
    } catch {
      // ignore
    }
  });
}

