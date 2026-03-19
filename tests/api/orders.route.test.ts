import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/orders/route';

vi.mock('@/lib/order', () => ({
  validateAndCreateOrder: vi.fn(async () => ({
    id: 'order-id',
    order_number: 'ABC-123',
    customer_phone: '+5491112345678',
    total_price: 1000,
    status: 'pending',
    created_at: new Date().toISOString(),
  })),
}));

describe('POST /api/orders (route handler)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('400 when phone missing', async () => {
    const res = await POST(
      new Request('http://test/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [] }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/teléfono/i);
  });

  it('400 when items empty', async () => {
    const res = await POST(
      new Request('http://test/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_phone: '+5491112345678', items: [] }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/al menos un producto/i);
  });

  it('400 when payload invalid (quantity <= 0)', async () => {
    const res = await POST(
      new Request('http://test/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_phone: '+5491112345678',
          items: [{ product_id: 'p', variant_id: 'v', quantity: 0 }],
        }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/cantidad/i);
  });

  it('accepts extra fields (e.g. price manipulation) but does not validate price', async () => {
    const res = await POST(
      new Request('http://test/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_phone: '+5491112345678',
          items: [{ product_id: 'p', variant_id: 'v', quantity: 1, price: -999999 }],
        }),
      })
    );

    // We do not reject price manipulation at the route level.
    // Price is computed in Postgres RPC, not trusted from client.
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.order_number).toBeTruthy();
  });
});

