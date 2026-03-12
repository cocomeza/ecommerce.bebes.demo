import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Cliente de Supabase. En Vercel, configurar NEXT_PUBLIC_SUPABASE_URL y
 * NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno del proyecto.
 * Si faltan en build, el build no falla; las llamadas a la API fallarán en runtime.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
