-- Optional: run this in Supabase SQL Editor to ensure tables and constraints exist.
-- Adjust types (uuid vs text) to match your Supabase project.

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  retail_price numeric not null check (retail_price >= 0),
  wholesale_price numeric not null check (wholesale_price >= 0),
  images text[] default '{}',
  created_at timestamptz default now()
);

-- Product variants (stock per size/color)
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz default now(),
  unique(product_id, size, color)
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_phone text not null,
  total_price numeric not null check (total_price >= 0),
  status text not null default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  created_at timestamptz default now()
);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  quantity integer not null check (quantity > 0),
  price numeric not null check (price >= 0)
);

-- Suppliers
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  notes text
);

-- Enable RLS if you use it (optional)
-- alter table public.products enable row level security;
-- alter table public.product_variants enable row level security;
-- alter table public.orders enable row level security;
-- alter table public.order_items enable row level security;
-- alter table public.suppliers enable row level security;
