-- ==============================================================================
-- AARISHA — SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Shared catalogue database schema used by Aarisha storefront and AarishaAdmin.
-- See /supabase_production.sql at the workspace root for the master production script.

create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price is null or original_price >= 0),
  category text not null check (
    category in (
      'rings',
      'necklaces',
      'neckpieces',
      'necklace',
      'bracelets',
      'earrings'
    )
  ),
  image_url text not null,
  description text,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

-- Performance Indexes
create index if not exists idx_products_category on products (category);
create index if not exists idx_products_created_at on products (created_at desc);
create index if not exists idx_products_in_stock on products (in_stock);

-- Row Level Security
alter table products enable row level security;

-- Public Product Read
drop policy if exists "Allow public read access" on products;
drop policy if exists "public product read" on products;
create policy "Allow public read access" on products for select using (true);

-- Service Role Full Access
drop policy if exists "Allow service role full access" on products;
create policy "Allow service role full access" on products
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
