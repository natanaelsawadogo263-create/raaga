-- Raaga initial schema (MVP foundation)
-- Run with Supabase SQL editor or `supabase db push`.

create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'driver', 'admin', 'super_admin');
create type public.driver_review_status as enum ('pending', 'approved', 'rejected');
create type public.product_status as enum ('normal', 'promotion', 'nouveaute', 'best_seller', 'rupture');
create type public.shop_status as enum ('active', 'inactive', 'suspended', 'pending');
create type public.order_status as enum (
  'validated',
  'awaiting_driver',
  'accepted_by_driver',
  'picked_up',
  'in_delivery',
  'delivery_declared',
  'secret_validated',
  'confirmed_by_customer',
  'delivered',
  'problematic',
  'cancelled'
);
create type public.ticket_status as enum ('open', 'in_progress', 'waiting_user', 'resolved', 'closed');
create type public.notification_status as enum ('unread', 'read');
create type public.payment_method as enum ('cod', 'orange_money', 'moov_money');

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  first_name text not null,
  last_name text not null,
  phone text not null,
  city text not null,
  district text not null,
  sector text not null,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.driver_profiles (
  user_id uuid primary key references public.user_profiles(id) on delete cascade,
  review_status public.driver_review_status not null default 'pending',
  email_verified boolean not null default false,
  id_card_front_url text,
  id_card_back_url text,
  plate_photo_url text,
  face_photo_url text,
  is_available boolean not null default false,
  wallet_balance_cfa integer not null default 0,
  wallet_pending_cfa integer not null default 0,
  average_rating numeric(2,1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  can_manage_products boolean not null default false,
  can_manage_orders boolean not null default false,
  can_manage_drivers boolean not null default false,
  can_manage_shops boolean not null default false,
  can_manage_refunds boolean not null default false,
  can_manage_admins boolean not null default false,
  can_manage_maintenance boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  district text not null,
  sector text not null,
  address text not null,
  phone text not null,
  description text,
  manager_name text,
  status public.shop_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete restrict,
  name text not null,
  description text not null,
  category text not null,
  city text not null,
  price_cfa integer not null check (price_cfa >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  status public.product_status not null default 'normal',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent numeric(5,2),
  discount_fixed_cfa integer,
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (discount_percent is not null or discount_fixed_cfa is not null)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.user_profiles(id) on delete restrict,
  driver_id uuid references public.user_profiles(id) on delete set null,
  order_status public.order_status not null default 'validated',
  payment_method public.payment_method not null,
  delivery_fee_cfa integer not null default 1000 check (delivery_fee_cfa >= 0),
  subtotal_cfa integer not null check (subtotal_cfa >= 0),
  discount_cfa integer not null default 0 check (discount_cfa >= 0),
  total_cfa integer not null check (total_cfa >= 0),
  delivery_secret_code text not null,
  delivery_secret_validated boolean not null default false,
  estimated_delivery_min integer,
  estimated_delivery_max integer,
  city text not null,
  district text not null,
  sector text not null,
  delivery_address text not null,
  promo_code_id uuid references public.promo_codes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  shop_id uuid not null references public.shops(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cfa integer not null check (unit_price_cfa >= 0),
  total_price_cfa integer not null check (total_price_cfa >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.driver_wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.user_profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount_cfa integer not null,
  direction text not null check (direction in ('credit', 'debit')),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  title text not null,
  body text not null,
  status public.notification_status not null default 'unread',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  subject text not null,
  message text not null,
  status public.ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.user_profiles p
    where p.id = uid and p.role in ('admin', 'super_admin')
  );
$$;

drop trigger if exists trg_user_profiles_updated on public.user_profiles;
create trigger trg_user_profiles_updated before update on public.user_profiles
for each row execute function public.handle_updated_at();

drop trigger if exists trg_driver_profiles_updated on public.driver_profiles;
create trigger trg_driver_profiles_updated before update on public.driver_profiles
for each row execute function public.handle_updated_at();

drop trigger if exists trg_admin_permissions_updated on public.admin_permissions;
create trigger trg_admin_permissions_updated before update on public.admin_permissions
for each row execute function public.handle_updated_at();

drop trigger if exists trg_shops_updated on public.shops;
create trigger trg_shops_updated before update on public.shops
for each row execute function public.handle_updated_at();

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
for each row execute function public.handle_updated_at();

drop trigger if exists trg_carts_updated on public.carts;
create trigger trg_carts_updated before update on public.carts
for each row execute function public.handle_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
for each row execute function public.handle_updated_at();

drop trigger if exists trg_support_tickets_updated on public.support_tickets;
create trigger trg_support_tickets_updated before update on public.support_tickets
for each row execute function public.handle_updated_at();

alter table public.user_profiles enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.products enable row level security;
alter table public.favorites enable row level security;
alter table public.carts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;

create policy "profiles: self read"
on public.user_profiles
for select
using (id = auth.uid() or public.is_admin(auth.uid()));

create policy "profiles: self write"
on public.user_profiles
for update
using (id = auth.uid() or public.is_admin(auth.uid()))
with check (id = auth.uid() or public.is_admin(auth.uid()));

create policy "drivers: self read"
on public.driver_profiles
for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "drivers: self write"
on public.driver_profiles
for update
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "products: public read active"
on public.products
for select
using (is_active = true);

create policy "products: admin write"
on public.products
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "favorites: owner all"
on public.favorites
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "carts: owner all"
on public.carts
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "orders: customer and admin read"
on public.orders
for select
using (
  customer_id = auth.uid()
  or driver_id = auth.uid()
  or public.is_admin(auth.uid())
);

create policy "orders: customer create"
on public.orders
for insert
with check (customer_id = auth.uid());

create policy "orders: driver update accepted order"
on public.orders
for update
using (driver_id = auth.uid() or public.is_admin(auth.uid()))
with check (driver_id = auth.uid() or public.is_admin(auth.uid()));

create policy "order_items: participants read"
on public.order_items
for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.customer_id = auth.uid() or o.driver_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

create policy "notifications: owner read"
on public.notifications
for select
using (user_id = auth.uid());

create policy "notifications: owner update"
on public.notifications
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "tickets: owner and admin"
on public.support_tickets
for all
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));
