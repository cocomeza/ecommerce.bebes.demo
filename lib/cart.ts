'use client';

import { CartItem } from './types';
import { CART_STORAGE_KEY, LOCALE } from './constants';

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem(CART_STORAGE_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const addToCart = (item: CartItem): void => {
  const cart = getCart();
  const existingIndex = cart.findIndex(
    (i) => i.product.id === item.product.id && i.variant.id === item.variant.id
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
};

export const updateCartItemQuantity = (productId: string, variantId: string, quantity: number): void => {
  const cart = getCart();
  const index = cart.findIndex(
    (item) => item.product.id === productId && item.variant.id === variantId
  );

  if (index > -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    saveCart(cart);
  }
};

export const removeFromCart = (productId: string, variantId: string): void => {
  const cart = getCart();
  const filtered = cart.filter(
    (item) => !(item.product.id === productId && item.variant.id === variantId)
  );
  saveCart(filtered);
};

export const clearCart = (): void => {
  saveCart([]);
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.product.retail_price * item.quantity, 0);
};

export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};

export const generateWhatsAppMessage = (phone: string, orderNumber: string): string => {
  const cart = getCart();
  const total = getCartTotal();

  let message = `Hola, quiero realizar el siguiente pedido:\n\n`;
  message += `Pedido Nº ${orderNumber}\n\n`;

  cart.forEach((item) => {
    message += `Producto: ${item.product.name}\n`;
    message += `Talla: ${item.variant.size}\n`;
    message += `Color: ${item.variant.color}\n`;
    message += `Cantidad: ${item.quantity}\n`;
    message += `Precio: $${(item.product.retail_price * item.quantity).toLocaleString(LOCALE)}\n\n`;
  });

  message += `Total: $${total.toLocaleString(LOCALE)}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

/**
 * Creates the order via API (validates stock and decrements atomically).
 * Returns the order_number on success; throws on failure.
 */
export const saveOrderToDatabase = async (phone: string): Promise<string> => {
  const cart = getCart();
  if (cart.length === 0) throw new Error('El carrito está vacío');

  const items = cart.map((item) => ({
    product_id: item.product.id,
    variant_id: item.variant.id,
    quantity: item.quantity,
    price: item.product.retail_price,
  }));

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_phone: phone, items }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error al guardar el pedido');

  return data.order_number as string;
};
