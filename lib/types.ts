import type { OrderStatusValue } from './constants';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  retail_price: number;
  wholesale_price: number;
  images: string[];
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
export interface OrderItemInput {
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}
