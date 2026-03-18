-- RPC: crear pedido + descontar stock de forma atómica
-- Ejecutar en Supabase (SQL Editor).
--
-- Requisitos:
-- - Tablas: public.products, public.product_variants, public.orders, public.order_items
-- - Función con seguridad elevada (security definer) para poder descontar stock.
-- - (Opcional) Extensión pgcrypto si no está habilitada para gen_random_uuid().

-- Habilitar gen_random_uuid si fuese necesario
-- create extension if not exists pgcrypto;

create or replace function public.create_order_and_decrement_stock(
  p_customer_phone text,
  p_items jsonb
)
returns table (
  id uuid,
  order_number text,
  customer_phone text,
  total_price numeric,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_total_price numeric;
begin
  if p_customer_phone is null or btrim(p_customer_phone) = '' then
    raise exception 'Número de teléfono inválido';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido debe incluir al menos un producto';
  end if;

  -- Parsear items (product_id, variant_id, quantity)
  create temporary table tmp_items (
    product_id uuid not null,
    variant_id uuid not null,
    quantity integer not null
  ) on commit drop;

  insert into tmp_items(product_id, variant_id, quantity)
  select
    (elem->>'product_id')::uuid as product_id,
    (elem->>'variant_id')::uuid as variant_id,
    (elem->>'quantity')::integer as quantity
  from jsonb_array_elements(p_items) as elem;

  if exists (select 1 from tmp_items where quantity <= 0) then
    raise exception 'Cantidad inválida (debe ser mayor a 0)';
  end if;

  -- Bloquear variantes para evitar overselling concurrente
  perform 1
  from public.product_variants pv
  join tmp_items ti on ti.variant_id = pv.id
  for update;

  -- Validar stock
  if exists (
    select 1
    from tmp_items ti
    join public.product_variants pv on pv.id = ti.variant_id
    where pv.stock < ti.quantity
  ) then
    raise exception 'Stock insuficiente para al menos una variante';
  end if;

  -- Verificar que variant_id pertenece al product_id (integridad)
  if exists (
    select 1
    from tmp_items ti
    join public.product_variants pv on pv.id = ti.variant_id
    where pv.product_id <> ti.product_id
  ) then
    raise exception 'product_id no coincide con variant_id';
  end if;

  -- Generar order_number (único a nivel app)
  v_order_number := left(replace(gen_random_uuid()::text, '-', ''), 12);

  -- Calcular total_price según retail_price del producto
  select
    sum(ti.quantity * p.retail_price)
  into v_total_price
  from tmp_items ti
  join public.products p on p.id = ti.product_id;

  -- Crear order
  insert into public.orders(order_number, customer_phone, total_price, status)
  values (v_order_number, p_customer_phone, v_total_price, 'pending')
  returning id into v_order_id;

  -- Insertar order_items con precio calculado en backend
  insert into public.order_items(order_id, product_id, variant_id, quantity, price)
  select
    v_order_id,
    ti.product_id,
    ti.variant_id,
    ti.quantity,
    p.retail_price
  from tmp_items ti
  join public.products p on p.id = ti.product_id;

  -- Descontar stock
  update public.product_variants pv
  set stock = pv.stock - ti.quantity
  from tmp_items ti
  where pv.id = ti.variant_id;

  -- Devolver resultado
  return query
  select
    o.id,
    o.order_number,
    o.customer_phone,
    o.total_price,
    o.status,
    o.created_at
  from public.orders o
  where o.id = v_order_id;
end;
$$;

