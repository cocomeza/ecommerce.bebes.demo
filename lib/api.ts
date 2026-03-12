import { supabase } from './supabase';
import { Product, ProductVariant, Order, OrderItem, Supplier } from './types';

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId);

  if (error) throw error;
  return data || [];
}

export async function getAllVariants(): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createProductVariant(
  variant: Omit<ProductVariant, 'id'>
): Promise<ProductVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .insert([variant])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProductVariant(
  id: string,
  updates: Partial<ProductVariant>
): Promise<ProductVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Fetches orders with their items (for admin list/detail) */
export async function getOrdersWithItems(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (*)
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Order[];
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplier])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
