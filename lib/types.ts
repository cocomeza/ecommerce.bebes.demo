import type { OrderStatusValue } from './constants';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  retail_price: number;
  wholesale_price: number;
  images: string[];
  /** Si es true, el producto aparece en "Productos Destacados" del Home. */
  is_featured?: boolean;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_phone: string;
  total_price: number;
  status: OrderStatusValue;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  product?: Product;
  variant?: ProductVariant;
}

/** Payload for creating an order (items without order_id) */
export interface CreateOrderItemInput {
  product_id: string;
  variant_id: string;
  quantity: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface StoreSettings {
  id?: string;
  whatsapp_number: string;
  low_stock_threshold: number;
  updated_at?: string;
}
