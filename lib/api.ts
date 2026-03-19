import { supabase } from './supabase';
import { Product, ProductVariant, Order, OrderItem, Supplier, StoreSettings } from './types';

/** Si la columna is_featured no existe en DB, Supabase puede devolver distintos códigos/mensajes. */
function looksLikeMissingColumn(err: unknown, column: string): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  const code = String(e?.code ?? '').toLowerCase();
  const message = String(e?.message ?? e?.details ?? '').toLowerCase();
  const col = column.toLowerCase();
  return (
    code === '42703' ||
    code === 'pgrst301' ||
    message.includes(col) ||
    message.includes('column') ||
    message.includes('does not exist')
  );
}

export async function getProducts(options?: { featuredOnly?: boolean }): Promise<Product[]> {
  const baseQuery = () =>
    supabase.from('products').select('*').order('created_at', { ascending: false });

  if (options?.featuredOnly) {
    const { data, error } = await baseQuery().eq('is_featured', true);
    if (error && looksLikeMissingColumn(error, 'is_featured')) {
      const fallback = await baseQuery();
      if (fallback.error) throw fallback.error;
      return fallback.data || [];
    }
    if (error) throw error;
    return data || [];
  }

  const { data, error } = await baseQuery();
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

/** Campos que no deben enviarse al insert/update si la columna no existe aún. */
const FEATURED_KEY = 'is_featured';

function withoutFeatured<T extends Record<string, unknown>>(obj: T): Omit<T, 'is_featured'> {
  const { [FEATURED_KEY]: _, ...rest } = obj;
  return rest;
}

/** Actualiza solo is_featured. Si la columna no existe (migración no aplicada), no hace nada. */
export async function setProductFeatured(productId: string, value: boolean): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_featured: value })
    .eq('id', productId);
  if (error) {
    // Columna inexistente o otro error: no romper la app, solo no persistir destacado.
    return;
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const payload = withoutFeatured(product as Record<string, unknown>);
  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  const created = data as Product;
  if (product.is_featured) {
    await setProductFeatured(created.id, true);
  }
  return created;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const payload = withoutFeatured(updates as Record<string, unknown>);
  if (Object.keys(payload).length > 0) {
    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) throw error;
  }
  if (typeof updates.is_featured === 'boolean') {
    await setProductFeatured(id, updates.is_featured);
  }
  const product = await getProductById(id);
  if (!product) throw new Error('Producto no encontrado');
  return product;
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

export async function deleteProductVariant(id: string): Promise<void> {
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id);

  if (error) throw error;
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
      order_items (
        id,
        order_id,
        product_id,
        variant_id,
        quantity,
        price,
        product:products ( name ),
        variant:product_variants ( size, color )
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  const raw = (data || []) as Array<any>;
  return raw.map((o) => ({
    ...o,
    items: Array.isArray(o.order_items) ? o.order_items : o.items,
  })) as Order[];
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

export async function getStoreSettings(): Promise<Pick<StoreSettings, 'whatsapp_number' | 'low_stock_threshold'>> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('whatsapp_number, low_stock_threshold, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return {
    whatsapp_number: data?.whatsapp_number ?? '',
    low_stock_threshold: data?.low_stock_threshold ?? 5,
  };
}

export async function upsertStoreSettings(
  updates: Pick<StoreSettings, 'whatsapp_number' | 'low_stock_threshold'>
): Promise<Pick<StoreSettings, 'whatsapp_number' | 'low_stock_threshold'>> {
  const current = await getStoreSettings().catch(() => null);

  // No row yet: insert one
  if (!current) {
    const { data, error } = await supabase
      .from('store_settings')
      .insert([
        {
          whatsapp_number: updates.whatsapp_number,
          low_stock_threshold: updates.low_stock_threshold,
        },
      ])
      .select('whatsapp_number, low_stock_threshold')
      .single();

    if (error) throw error;
    return data;
  }

  // Update: for singleton-like table, update the latest row
  const { data, error } = await supabase
    .from('store_settings')
    .update({
      whatsapp_number: updates.whatsapp_number,
      low_stock_threshold: updates.low_stock_threshold,
    })
    .order('updated_at', { ascending: false })
    .limit(1)
    .select('whatsapp_number, low_stock_threshold')
    .maybeSingle();

  if (error) throw error;
  return data ?? updates;
}
