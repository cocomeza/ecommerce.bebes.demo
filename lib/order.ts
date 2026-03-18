/**
 * Stock seguro y creación de pedidos (atómica).
 *
 * La operación crítica (validar stock + crear pedido + descontar stock) debe
 * ejecutarse del lado de PostgreSQL en una sola transacción.
 *
 * Esto se logra mediante una función RPC en Supabase:
 *   create_order_and_decrement_stock(p_customer_phone text, p_items jsonb)
 *
 * Importante: debés crear esa función en tu base de datos (ver docs).
 */

import { supabase } from './supabase';
import type { CreateOrderItemInput, Order } from './types';

export async function validateAndCreateOrder(
  customer_phone: string,
  items: CreateOrderItemInput[]
): Promise<Order> {
  if (!customer_phone || typeof customer_phone !== 'string') {
    throw new Error('Número de teléfono inválido');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('El pedido debe incluir al menos un producto');
  }

  const { data, error } = await supabase.rpc('create_order_and_decrement_stock', {
    p_customer_phone: customer_phone,
    p_items: items,
  });

  if (error) throw error;
  return data as Order;
}
