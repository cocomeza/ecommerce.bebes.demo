/**
 * Application-wide constants.
 * Centralizes magic numbers and status values for consistency.
 */

/** Order status values stored in DB and used in UI */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatusValue = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Variant is considered low stock below this threshold (admin dashboard) */
export const LOW_STOCK_THRESHOLD = 5;

/** localStorage key for cart */
export const CART_STORAGE_KEY = 'baby_store_cart';

/** Locale para números y fechas (español Latinoamérica) */
export const LOCALE = 'es-419';
