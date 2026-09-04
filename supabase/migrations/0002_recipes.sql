-- Recipes / bill of materials: what ingredients (and how much of each) a
-- meal requires, so ingredient cost per portion can be calculated instead
-- of guessed at.

create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  inventory_item_id uuid not null references inventory_items(id) on delete restrict,
  quantity_required numeric(10, 3) not null check (quantity_required > 0),
  created_at timestamptz not null default now(),
  unique (product_id, inventory_item_id)
);

create index idx_recipe_ingredients_product on recipe_ingredients(product_id);
