/**
 * POST /api/orders – Create order with stock validation and atomic decrement.
 * Body: { customer_phone: string, items: { product_id, variant_id, quantity, price }[] }
 * Returns: { order_number, id, ... } or 400/500 with error message.
 */

import { NextResponse } from 'next/server';
import { validateAndCreateOrder } from '@/lib/order';
import type { OrderItemInput } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_phone, items } = body as {
      customer_phone?: string;
      items?: OrderItemInput[];
    };

    if (!customer_phone || typeof customer_phone !== 'string' || !customer_phone.trim()) {
      return NextResponse.json(
        { error: 'Número de teléfono del cliente es requerido' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'El pedido debe incluir al menos un producto' },
        { status: 400 }
      );
    }

    const validItems: OrderItemInput[] = [];
    for (const it of items) {
      if (
        typeof it?.product_id === 'string' &&
        typeof it?.variant_id === 'string' &&
        typeof it?.quantity === 'number' &&
        it.quantity > 0 &&
        typeof it?.price === 'number' &&
        it.price >= 0
      ) {
        validItems.push({
          product_id: it.product_id,
          variant_id: it.variant_id,
          quantity: it.quantity,
          price: it.price,
        });
      }
    }

    if (validItems.length !== items.length) {
      return NextResponse.json(
        { error: 'Cada producto debe tener cantidad (número positivo) y precio válidos' },
        { status: 400 }
      );
    }

    const order = await validateAndCreateOrder(customer_phone.trim(), validItems);

    return NextResponse.json({
      id: order.id,
      order_number: order.order_number,
      customer_phone: order.customer_phone,
      total_price: order.total_price,
      status: order.status,
      created_at: order.created_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear el pedido';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
