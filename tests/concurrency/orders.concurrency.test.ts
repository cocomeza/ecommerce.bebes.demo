import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasEnv } from '../helpers/env';
import {
  cleanupProduct,
  getVariantStock,
  seedProductWithVariant,
  setVariantStock,
} from '../helpers/supabaseAdmin';

/**
 * Concurrency test: send multiple requests concurrently.
 * Validates: no overselling (stock never goes below 0; only up to stock orders succeed).
 */

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

describe('Concurrency: orders do not oversell', () => {
  const canRun = hasEnv(REQUIRED_ENV);
  let seed: Awaited<ReturnType<typeof seedProductWithVariant>> | null = null;

  beforeAll(async () => {
    if (!canRun) return;
    seed = await seedProductWithVariant();
    await setVariantStock(seed.variantId, 2);
  });

  afterAll(async () => {
    if (!canRun || !seed) return;
    await cleanupProduct(seed.productId);
  });

  it.skipIf(!canRun)('only up to stock requests succeed', async () => {
    if (!seed) throw new Error('seed missing');

    const { POST } = await import('@/app/api/orders/route');

    const req = () =>
      POST(
        new Request('http://test/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_phone: '+5491112345678',
            items: [{ product_id: seed.productId, variant_id: seed.variantId, quantity: 1 }],
          }),
        })
      );

    const results = await Promise.allSettled([req(), req(), req(), req(), req()]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<Response>[];
    const ok = await Promise.all(
      fulfilled.map(async (r) => ({ status: r.value.status, body: await r.value.json().catch(() => ({})) }))
    );

    const successCount = ok.filter((x) => x.status === 200).length;
    const failCount = ok.filter((x) => x.status !== 200).length;

    // Stock was 2, so at most 2 should succeed.
    expect(successCount).toBeLessThanOrEqual(2);
    expect(successCount + failCount).toBe(fulfilled.length);

    const remaining = await getVariantStock(seed.variantId);
    expect(remaining).toBeGreaterThanOrEqual(0);
    expect(remaining).toBe(2 - successCount);
  });
});

