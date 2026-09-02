-- Chilli's Diner platform — initial schema
-- Plain Postgres SQL (works against local Postgres now, and against a real
-- Supabase Postgres instance later — Supabase IS Postgres). RLS policies are
-- intentionally deferred until the app moves onto real Supabase Auth; for now
-- the Next.js server is the only writer and enforces authorization itself.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Core tenancy (single business today, ready for multi-tenant later)
-- ---------------------------------------------------------------------------
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  currency text not null default 'KES',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table admin_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Menu
-- ---------------------------------------------------------------------------
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  category_id uuid references product_categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  selling_price numeric(10, 2) not null check (selling_price >= 0),
  cost_price numeric(10, 2) not null default 0 check (cost_price >= 0),
  available_qty int not null default 0 check (available_qty >= 0),
  is_active boolean not null default true,
  available_from date,
  available_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_business_active on products(business_id, is_active);

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
create table customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  label text,
  address_text text not null,
  lat numeric(9, 6),
  lng numeric(9, 6),
  instructions text,
  created_at timestamptz not null default now()
);

create index idx_addresses_customer on addresses(customer_id);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  order_number text not null unique,
  customer_id uuid not null references customers(id) on delete restrict,
  delivery_address_id uuid references addresses(id) on delete set null,
  fulfillment_type text not null default 'delivery' check (fulfillment_type in ('delivery', 'pickup')),
  status text not null default 'new' check (status in (
    'new', 'payment_pending', 'payment_confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'failed'
  )),
  payment_status text not null default 'unpaid' check (payment_status in (
    'unpaid', 'pending', 'paid', 'failed', 'refunded'
  )),
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_business_status on orders(business_id, status);
create index idx_orders_business_created on orders(business_id, created_at);
create index idx_orders_customer on orders(customer_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  unit_price_snapshot numeric(10, 2) not null,
  cost_price_snapshot numeric(10, 2) not null default 0,
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null
);

create index idx_order_items_order on order_items(order_id);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by text not null,
  changed_at timestamptz not null default now()
);

create index idx_order_status_history_order on order_status_history(order_id);

-- ---------------------------------------------------------------------------
-- Payments — the ONLY writer of orders.payment_status is the payment service.
-- ---------------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null default 'mock' check (provider in ('mock', 'mpesa')),
  provider_reference text,
  amount numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  raw_callback jsonb,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index idx_payments_order on payments(order_id);

-- ---------------------------------------------------------------------------
-- Delivery
-- ---------------------------------------------------------------------------
create table delivery_drivers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  is_active boolean not null default true
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade unique,
  driver_id uuid references delivery_drivers(id) on delete set null,
  status text not null default 'pending' check (status in (
    'pending', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed'
  )),
  delivery_fee numeric(10, 2) not null default 0,
  estimated_time timestamptz,
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Expenses
-- ---------------------------------------------------------------------------
create table expense_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  category_id uuid references expense_categories(id) on delete set null,
  amount numeric(10, 2) not null check (amount >= 0),
  expense_date date not null default current_date,
  description text,
  payment_method text,
  receipt_url text,
  created_by text,
  created_at timestamptz not null default now()
);

create index idx_expenses_business_date on expenses(business_id, expense_date);

-- ---------------------------------------------------------------------------
-- Inventory
-- ---------------------------------------------------------------------------
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  unit text not null,
  quantity_available numeric(10, 2) not null default 0,
  reorder_level numeric(10, 2) not null default 0,
  cost_per_unit numeric(10, 2) not null default 0,
  supplier text,
  last_purchase_date date,
  created_at timestamptz not null default now()
);

create table inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  type text not null check (type in ('purchase', 'usage', 'adjustment')),
  quantity numeric(10, 2) not null,
  reference text,
  created_by text,
  created_at timestamptz not null default now()
);

create index idx_inventory_transactions_item on inventory_transactions(item_id);

-- ---------------------------------------------------------------------------
-- Notifications (architecture placeholder — channels mocked until wired up)
-- ---------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  recipient_type text not null check (recipient_type in ('customer', 'admin')),
  channel text not null check (channel in ('sms', 'whatsapp', 'email', 'in_app')),
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now()
);
