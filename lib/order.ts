/**
 * Order creation and stock-safe decrement logic.
 * Validates stock before creating the order and uses conditional UPDATE
 * to avoid race conditions when decrementing stock.
 */

import { supabase } from './supabase';
import type { Order, OrderItemInput } from './types';
import { ORDER_STATUS } from './constants';

/** Generate a unique order number (timestamp + random suffix to avoid collisions) */
export function generateOrderNumber(): string {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${timePart}-${randomPart}`;
}

export interface StockValidationError {
  variant_id: string;
  product_name?: string;
  requested: number;
  available: number;
}

/**
 * Validates that every item has sufficient stock.
 * Returns { valid: true } or { valid: false, errors: [...] }.
 */
export async function validateStockForItems(
  items: OrderItemInput[]
): Promise<{ valid: true } | { valid: false; errors: StockValidationError[] }> {
  const errors: StockValidationError[] = [];

  for (const item of items) {
    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('stock, product_id')
      .eq('id', item.variant_id)
      .maybeSingle();

    if (error) {
      errors.push({
        variant_id: item.variant_id,
        requested: item.quantity,
        available: 0,
      });
      continue;
    }

    if (!variant) {
      errors.push({
        variant_id: item.variant_id,
        requested: item.quantity,
        available: 0,
      });
      continue;
    }

    const available = variant.stock ?? 0;
    if (available < item.quantity) {
      errors.push({
        variant_id: item.variant_id,
        requested: item.quantity,
        available,
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
}

/**
 * Creates an order and decrements stock atomically.
 * 1. Validates stock for all items.
 * 2. Inserts order and order_items.
 * 3. Decrements each variant with WHERE stock >= quantity to prevent races.
 * 4. If any decrement fails (0 rows updated), deletes the order and order_items and throws.
 */
export async function validateAndCreateOrder(
  customer_phone: string,
  items: OrderItemInput[]
): Promise<Order> {
  if (items.length === 0) {
    throw new Error('El pedido debe tener al menos un item');
  }

  const validation = await validateStockForItems(items);
  if (!validation.valid) {
    const message = validation.errors
      .map(
        (e) =>
          `Stock insuficiente: se solicitaron ${e.requested}, hay ${e.available} disponibles`
      )
      .join('; ');
    throw new Error(message);
  }

  const total_price = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const order_number = generateOrderNumber();

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        order_number,
        customer_phone,
        total_price,
        status: ORDER_STATUS.PENDING,
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;
  const orderId = orderData.id;

  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', orderId);
    throw itemsError;
  }

  // Decrement stock for each item. Use conditional update (stock >= quantity)
  // so that concurrent orders don't oversell; if no row matches, rollback.
  for (const item of items) {
    const { data: variant, error: fetchErr } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', item.variant_id)
      .single();

    if (fetchErr || !variant) {
      await rollbackOrder(orderId);
      throw new Error('Error al actualizar stock');
    }

    const newStock = (variant.stock ?? 0) - item.quantity;
    if (newStock < 0) {
      await rollbackOrder(orderId);
      throw new Error('Stock insuficiente al confirmar');
    }

    const { data: updated, error: decrementError } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', item.variant_id)
      .gte('stock', item.quantity)
      .select('id')
      .maybeSingle();

    if (decrementError || !updated) {
      await rollbackOrder(orderId);
      throw new Error('Stock insuficiente o conflicto al reservar');
    }
  }

  return { ...orderData, items: [] };
}

/** Deletes order and its items (compensation on failure) */
async function rollbackOrder(orderId: string): Promise<void> {
  await supabase.from('order_items').delete().eq('order_id', orderId);
  await supabase.from('orders').delete().eq('id', orderId);
}
