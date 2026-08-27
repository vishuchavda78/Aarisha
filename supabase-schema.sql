create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price > 0),
  original_price numeric(10,2) check (original_price > 0),
  category text not null check (category in ('rings', 'necklaces', 'bracelets', 'earrings')),
  image_url text not null,
  description text,
  in_stock boolean not null default true,
  created_at timestamptz default now()
);

alter table products enable row level security;

-- The browser never connects to the products table directly. Public product reads are
-- deliberately enabled for future direct Supabase clients.
drop policy if exists "public product read" on products;
create policy "public product read" on products for select using (true);
