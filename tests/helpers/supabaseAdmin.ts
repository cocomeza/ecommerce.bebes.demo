import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from './env';

/**
 * Supabase admin client for tests (service role).
 * IMPORTANT: never expose SERVICE_ROLE key to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = requireEnv('SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type TestProductSeed = {
  productId: string;
  variantId: string;
  name: string;
  category: string;
  retail_price: number;
  wholesale_price: number;
};

export async function seedProductWithVariant(): Promise<TestProductSeed> {
  const supabase = getSupabaseAdmin();
  const name = `E2E Producto ${Date.now()}`;
  const category = 'Bodysuits';

  const { data: product, error: pErr } = await supabase
    .from('products')
    .insert([
      {
        name,
        description: 'Producto de prueba (tests automatizados)',
        category,
        retail_price: 1000,
        wholesale_price: 700,
        images: ['https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg'],
      },
    ])
    .select('id,name,category,retail_price,wholesale_price')
    .single();

  if (pErr) throw pErr;

  const { data: variant, error: vErr } = await supabase
    .from('product_variants')
    .insert([
      {
        product_id: product.id,
        size: 'NB',
        color: 'Blanco',
        stock: 5,
      },
    ])
    .select('id')
    .single();

  if (vErr) throw vErr;

  return {
    productId: product.id,
    variantId: variant.id,
    name: product.name,
    category: product.category,
    retail_price: product.retail_price,
    wholesale_price: product.wholesale_price,
  };
}

export async function setVariantStock(variantId: string, stock: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('product_variants').update({ stock }).eq('id', variantId);
  if (error) throw error;
}

export async function getVariantStock(variantId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('id', variantId)
    .single();
  if (error) throw error;
  return data.stock as number;
}

export async function cleanupProduct(productId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  // product_variants and order_items cascade are DB-defined; delete product should remove variants.
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
}

