-- Migration: add "featured" flag to products for Home

alter table public.products
add column if not exists is_featured boolean not null default false;

-- Optional index to speed up featured listing
create index if not exists products_is_featured_idx on public.products (is_featured);

