import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * These tests target the business boundary: validateAndCreateOrder()
 * We mock the Supabase client RPC boundary to validate mapping and error handling.
 */

vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      rpc: vi.fn(),
    },
  };
});

import { supabase } from '@/lib/supabase';
import { validateAndCreateOrder } from '@/lib/order';

describe('validateAndCreateOrder() (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when phone invalid', async () => {
    await expect(validateAndCreateOrder('', [])).rejects.toThrow(/teléfono/i);
  });

  it('throws when items empty', async () => {
    await expect(validateAndCreateOrder('+5491112345678', [])).rejects.toThrow(/al menos un producto/i);
  });

  it('calls Supabase RPC with expected args', async () => {
    (supabase.rpc as any).mockResolvedValue({
      data: {
        id: '1',
        order_number: 'X',
        customer_phone: '+5491112345678',
        total_price: 1000,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      error: null,
    });

    const order = await validateAndCreateOrder('+5491112345678', [
      { product_id: 'p1', variant_id: 'v1', quantity: 1 },
    ]);

    expect(supabase.rpc).toHaveBeenCalledWith('create_order_and_decrement_stock', {
      p_customer_phone: '+5491112345678',
      p_items: [{ product_id: 'p1', variant_id: 'v1', quantity: 1 }],
    });
    expect(order.order_number).toBe('X');
  });

  it('throws when RPC returns error', async () => {
    (supabase.rpc as any).mockResolvedValue({
      data: null,
      error: new Error('Stock insuficiente'),
    });

    await expect(
      validateAndCreateOrder('+5491112345678', [{ product_id: 'p1', variant_id: 'v1', quantity: 1 }])
    ).rejects.toThrow(/stock/i);
  });
});

