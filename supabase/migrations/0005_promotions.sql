create table promotions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  code text not null,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  max_uses int,
  uses_count int not null default 0,
  is_active boolean not null default true,
  expires_at date,
  created_at timestamptz not null default now(),
  unique (business_id, code)
);

create index idx_promotions_business on promotions(business_id);
