-- Chilli's Diner — demo/seed data, safe to paste into the Supabase SQL
-- Editor (or run via psql). Re-runnable: it wipes existing demo data first.
-- Kenyan context, KSh currency, clearly fictional — no real payment
-- credentials are used or required (the app defaults to PAYMENT_PROVIDER=mock).
--
-- Admin login created below: owner@chillisdiner.co.ke / ChilliAdmin123!

begin;

truncate table
  notifications, inventory_transactions, inventory_items, expenses, expense_categories,
  deliveries, delivery_drivers, payments, order_status_history, order_items, orders,
  addresses, customers, products, product_categories, admin_users, businesses
cascade;

with biz as (
  insert into businesses (name, phone, currency) values ('Chilli''s Diner', '0712000000', 'KES')
  returning id
)
insert into admin_users (business_id, name, email, password_hash, role)
select id, 'Chilli', 'owner@chillisdiner.co.ke',
  'bad0107c401f222d2a9f5bcc2a9fa64e:2a2482e8f7c4e924530afcc52843c9cfb6f34031cc3f334d2b2252fd8f236295796bdedcd794c3a47d4fc22f4116d0de7a6274144ea873712d2cfdb85351e5d5',
  'owner'
from biz;

-- Everything below looks up the one seeded business by name, so it stays a
-- single statement block without needing to thread CTE ids through by hand.
do $$
declare
  v_business_id uuid;
  v_cat_specials uuid;
  v_cat_rice uuid;
  v_cat_ugali uuid;
  v_cat_drinks uuid;
  v_product_pilau uuid;
  v_product_ugali_sukuma uuid;
  v_customer1 uuid;
  v_customer2 uuid;
  v_address1 uuid;
  v_order1 uuid;
  v_order2 uuid;
  v_cat_ingredients uuid;
  v_cat_packaging uuid;
  v_cat_gas uuid;
begin
  select id into v_business_id from businesses where name = 'Chilli''s Diner';

  insert into product_categories (business_id, name, sort_order) values
    (v_business_id, 'Today''s Specials', 0),
    (v_business_id, 'Rice Dishes', 1),
    (v_business_id, 'Ugali & Stews', 2),
    (v_business_id, 'Drinks', 3);

  select id into v_cat_specials from product_categories where business_id = v_business_id and name = 'Today''s Specials';
  select id into v_cat_rice from product_categories where business_id = v_business_id and name = 'Rice Dishes';
  select id into v_cat_ugali from product_categories where business_id = v_business_id and name = 'Ugali & Stews';
  select id into v_cat_drinks from product_categories where business_id = v_business_id and name = 'Drinks';

  insert into products (business_id, category_id, name, description, selling_price, cost_price, available_qty, is_active) values
    (v_business_id, v_cat_specials, 'Pilau with Beef', 'Fragrant spiced rice with tender beef, served with kachumbari.', 350, 140, 15, true),
    (v_business_id, v_cat_specials, 'Chicken Biryani', 'Slow-cooked chicken biryani with a boiled egg and dhania sauce.', 450, 180, 10, true),
    (v_business_id, v_cat_rice, 'Plain Rice & Beef Stew', 'White rice with a rich beef stew.', 300, 120, 20, true),
    (v_business_id, v_cat_rice, 'Coconut Rice & Fish', 'Coastal-style coconut rice with fried tilapia.', 400, 170, 8, true),
    (v_business_id, v_cat_ugali, 'Ugali & Sukuma Wiki', 'Ugali with sauteed sukuma wiki and a side of beef fry.', 250, 90, 25, true),
    (v_business_id, v_cat_ugali, 'Ugali & Nyama Choma', 'Ugali served with grilled goat meat.', 380, 160, 12, true),
    (v_business_id, v_cat_drinks, 'Passion Juice (500ml)', 'Freshly made passion fruit juice.', 100, 35, 30, true),
    (v_business_id, v_cat_drinks, 'Mango Juice (500ml)', 'Freshly made mango juice.', 100, 35, 30, true);

  select id into v_product_pilau from products where business_id = v_business_id and name = 'Pilau with Beef';
  select id into v_product_ugali_sukuma from products where business_id = v_business_id and name = 'Ugali & Sukuma Wiki';

  insert into customers (business_id, name, phone) values
    (v_business_id, 'Wanjiru Kamau', '254712345001'),
    (v_business_id, 'Otieno Odhiambo', '254712345002'),
    (v_business_id, 'Fatuma Hassan', '254712345003');

  select id into v_customer1 from customers where business_id = v_business_id and phone = '254712345001';
  select id into v_customer2 from customers where business_id = v_business_id and phone = '254712345002';

  insert into addresses (customer_id, label, address_text, instructions)
  values (v_customer1, 'Home', 'Kilimani, Argwings Kodhek Rd, Apt 4B', 'Blue gate, call on arrival')
  returning id into v_address1;

  -- A completed, paid, delivered order from earlier today — feeds the dashboard's revenue figures.
  insert into orders (business_id, order_number, customer_id, delivery_address_id, fulfillment_type, status, payment_status, subtotal, delivery_fee, discount, total)
  values (v_business_id, 'CD-DEMO-0001', v_customer1, v_address1, 'delivery', 'delivered', 'paid', 350, 150, 0, 500)
  returning id into v_order1;

  insert into order_items (order_id, product_id, product_name_snapshot, unit_price_snapshot, cost_price_snapshot, quantity, line_total)
  values (v_order1, v_product_pilau, 'Pilau with Beef', 350, 140, 1, 350);

  insert into order_status_history (order_id, from_status, to_status, changed_by) values
    (v_order1, null, 'new', 'seed'), (v_order1, 'new', 'payment_confirmed', 'seed'),
    (v_order1, 'payment_confirmed', 'preparing', 'seed'), (v_order1, 'preparing', 'ready', 'seed'),
    (v_order1, 'ready', 'out_for_delivery', 'seed'), (v_order1, 'out_for_delivery', 'delivered', 'seed');

  insert into payments (order_id, provider, provider_reference, amount, status, confirmed_at)
  values (v_order1, 'mock', 'SEED-REF-0001', 500, 'confirmed', now());

  -- A pending order awaiting payment — shows up in "New/Pending" on the dashboard.
  insert into orders (business_id, order_number, customer_id, fulfillment_type, status, payment_status, subtotal, delivery_fee, discount, total)
  values (v_business_id, 'CD-DEMO-0002', v_customer2, 'pickup', 'new', 'unpaid', 250, 0, 0, 250)
  returning id into v_order2;

  insert into order_items (order_id, product_id, product_name_snapshot, unit_price_snapshot, cost_price_snapshot, quantity, line_total)
  values (v_order2, v_product_ugali_sukuma, 'Ugali & Sukuma Wiki', 250, 90, 1, 250);

  insert into order_status_history (order_id, from_status, to_status, changed_by)
  values (v_order2, null, 'new', 'seed');

  insert into expense_categories (business_id, name) values
    (v_business_id, 'Ingredients'), (v_business_id, 'Packaging'), (v_business_id, 'Gas'), (v_business_id, 'Delivery');

  select id into v_cat_ingredients from expense_categories where business_id = v_business_id and name = 'Ingredients';
  select id into v_cat_packaging from expense_categories where business_id = v_business_id and name = 'Packaging';
  select id into v_cat_gas from expense_categories where business_id = v_business_id and name = 'Gas';

  insert into expenses (business_id, category_id, amount, expense_date, description, payment_method, created_by) values
    (v_business_id, v_cat_ingredients, 3500, current_date, 'Rice, beef and vegetables from Marikiti', 'cash', 'seed'),
    (v_business_id, v_cat_packaging, 800, current_date, 'Takeaway containers', 'mpesa', 'seed'),
    (v_business_id, v_cat_gas, 1200, current_date - 1, 'Gas cylinder refill', 'mpesa', 'seed');

  insert into inventory_items (business_id, name, unit, quantity_available, reorder_level, cost_per_unit, supplier) values
    (v_business_id, 'Rice', 'kg', 40, 10, 150, 'Marikiti Market'),
    (v_business_id, 'Chicken', 'kg', 8, 10, 450, 'Marikiti Market'),
    (v_business_id, 'Beef', 'kg', 15, 8, 600, 'Marikiti Market'),
    (v_business_id, 'Cooking Oil', 'litre', 12, 5, 300, 'Marikiti Market'),
    (v_business_id, 'Packaging Boxes', 'piece', 200, 50, 10, 'Marikiti Market');
end $$;

commit;
