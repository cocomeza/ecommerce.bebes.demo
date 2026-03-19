import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasEnv } from '../helpers/env';
import {
  cleanupProduct,
  getVariantStock,
  seedProductWithVariant,
  setVariantStock,
} from '../helpers/supabaseAdmin';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

describe('Integration: Supabase RPC create_order_and_decrement_stock', () => {
  const canRun = hasEnv(REQUIRED_ENV);

  let seed: Awaited<ReturnType<typeof seedProductWithVariant>> | null = null;

  beforeAll(async () => {
    if (!canRun) return;
    seed = await seedProductWithVariant();
  });

  afterAll(async () => {
    if (!canRun || !seed) return;
    await cleanupProduct(seed.productId);
  });

  it.skipIf(!canRun)('decrements stock and creates order', async () => {
    if (!seed) throw new Error('seed missing');

    const before = await getVariantStock(seed.variantId);
    expect(before).toBeGreaterThanOrEqual(1);

    // Call API handler directly (unit boundary), which calls RPC internally.
    const { POST } = await import('@/app/api/orders/route');
    const res = await POST(
      new Request('http://test/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_phone: '+5491112345678',
          items: [{ product_id: seed.productId, variant_id: seed.variantId, quantity: 1 }],
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.order_number).toBeTruthy();

    const after = await getVariantStock(seed.variantId);
    expect(after).toBe(before - 1);
  });

  it.skipIf(!canRun)('returns controlled error on insufficient stock and does not decrement', async () => {
    if (!seed) throw new Error('seed missing');

    await setVariantStock(seed.variantId, 0);
    const before = await getVariantStock(seed.variantId);
    expect(before).toBe(0);

    const { POST } = await import('@/app/api/orders/route');
    const res = await POST(
      new Request('http://test/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_phone: '+5491112345678',
          items: [{ product_id: seed.productId, variant_id: seed.variantId, quantity: 1 }],
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(String(body.error).toLowerCase()).toContain('stock');

    const after = await getVariantStock(seed.variantId);
    expect(after).toBe(0);
  });
});

