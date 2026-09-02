/**
 * Development seed data for Chilli's Diner — clearly fictional/demo data,
 * Kenyan context, KSh currency. No real payment credentials are used or
 * required (PAYMENT_PROVIDER=mock).
 *
 * Run with: npm run seed
 */
import { pool } from "../src/lib/db/client";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Reset (dev only) so the script is safely re-runnable.
    await client.query(
      `truncate table
         notifications, inventory_transactions, inventory_items, expenses, expense_categories,
         deliveries, delivery_drivers, payments, order_status_history, order_items, orders,
         addresses, customers, products, product_categories, admin_users, businesses
       cascade`,
    );

    const businessResult = await client.query(
      `insert into businesses (name, phone, currency) values ($1, $2, 'KES') returning id`,
      ["Chilli's Diner", "0712000000"],
    );
    const businessId = businessResult.rows[0].id;

    await client.query(
      `insert into admin_users (business_id, name, email, password_hash, role)
       values ($1, $2, $3, $4, 'owner')`,
      [businessId, "Chilli", "owner@chillisdiner.co.ke", hashPassword("ChilliAdmin123!")],
    );

    const categories = [
      { name: "Today's Specials", sort: 0 },
      { name: "Rice Dishes", sort: 1 },
      { name: "Ugali & Stews", sort: 2 },
      { name: "Drinks", sort: 3 },
    ];
    const categoryIds: Record<string, string> = {};
    for (const category of categories) {
      const result = await client.query(
        `insert into product_categories (business_id, name, sort_order) values ($1, $2, $3) returning id`,
        [businessId, category.name, category.sort],
      );
      categoryIds[category.name] = result.rows[0].id;
    }

    const products = [
      {
        name: "Pilau with Beef",
        description: "Fragrant spiced rice with tender beef, served with kachumbari.",
        category: "Today's Specials",
        sellingPrice: 350,
        costPrice: 140,
        qty: 15,
      },
      {
        name: "Chicken Biryani",
        description: "Slow-cooked chicken biryani with a boiled egg and dhania sauce.",
        category: "Today's Specials",
        sellingPrice: 450,
        costPrice: 180,
        qty: 10,
      },
      {
        name: "Plain Rice & Beef Stew",
        description: "White rice with a rich beef stew.",
        category: "Rice Dishes",
        sellingPrice: 300,
        costPrice: 120,
        qty: 20,
      },
      {
        name: "Coconut Rice & Fish",
        description: "Coastal-style coconut rice with fried tilapia.",
        category: "Rice Dishes",
        sellingPrice: 400,
        costPrice: 170,
        qty: 8,
      },
      {
        name: "Ugali & Sukuma Wiki",
        description: "Ugali with sautéed sukuma wiki and a side of beef fry.",
        category: "Ugali & Stews",
        sellingPrice: 250,
        costPrice: 90,
        qty: 25,
      },
      {
        name: "Ugali & Nyama Choma",
        description: "Ugali served with grilled goat meat.",
        category: "Ugali & Stews",
        sellingPrice: 380,
        costPrice: 160,
        qty: 12,
      },
      {
        name: "Passion Juice (500ml)",
        description: "Freshly made passion fruit juice.",
        category: "Drinks",
        sellingPrice: 100,
        costPrice: 35,
        qty: 30,
      },
      {
        name: "Mango Juice (500ml)",
        description: "Freshly made mango juice.",
        category: "Drinks",
        sellingPrice: 100,
        costPrice: 35,
        qty: 30,
      },
    ];

    const productIds: string[] = [];
    for (const product of products) {
      const result = await client.query(
        `insert into products
           (business_id, category_id, name, description, selling_price, cost_price, available_qty, is_active)
         values ($1, $2, $3, $4, $5, $6, $7, true) returning id`,
        [
          businessId,
          categoryIds[product.category],
          product.name,
          product.description,
          product.sellingPrice,
          product.costPrice,
          product.qty,
        ],
      );
      productIds.push(result.rows[0].id);
    }

    const customers = [
      { name: "Wanjiru Kamau", phone: "254712345001" },
      { name: "Otieno Odhiambo", phone: "254712345002" },
      { name: "Fatuma Hassan", phone: "254712345003" },
    ];
    const customerIds: string[] = [];
    for (const customer of customers) {
      const result = await client.query(
        `insert into customers (business_id, name, phone) values ($1, $2, $3) returning id`,
        [businessId, customer.name, customer.phone],
      );
      customerIds.push(result.rows[0].id);
    }

    const address1 = await client.query(
      `insert into addresses (customer_id, label, address_text, instructions) values ($1, 'Home', $2, $3) returning id`,
      [customerIds[0], "Kilimani, Argwings Kodhek Rd, Apt 4B", "Blue gate, call on arrival"],
    );

    // A completed, paid, delivered order from earlier today — feeds the dashboard's revenue figures.
    const order1 = await client.query(
      `insert into orders
         (business_id, order_number, customer_id, delivery_address_id, fulfillment_type,
          status, payment_status, subtotal, delivery_fee, discount, total)
       values ($1, 'CD-DEMO-0001', $2, $3, 'delivery', 'delivered', 'paid', 350, 150, 0, 500)
       returning id`,
      [businessId, customerIds[0], address1.rows[0].id],
    );
    await client.query(
      `insert into order_items (order_id, product_id, product_name_snapshot, unit_price_snapshot, cost_price_snapshot, quantity, line_total)
       values ($1, $2, 'Pilau with Beef', 350, 140, 1, 350)`,
      [order1.rows[0].id, productIds[0]],
    );
    await client.query(
      `insert into order_status_history (order_id, from_status, to_status, changed_by) values
         ($1, null, 'new', 'seed'), ($1, 'new', 'payment_confirmed', 'seed'),
         ($1, 'payment_confirmed', 'preparing', 'seed'), ($1, 'preparing', 'ready', 'seed'),
         ($1, 'ready', 'out_for_delivery', 'seed'), ($1, 'out_for_delivery', 'delivered', 'seed')`,
      [order1.rows[0].id],
    );
    await client.query(
      `insert into payments (order_id, provider, provider_reference, amount, status, confirmed_at)
       values ($1, 'mock', 'SEED-REF-0001', 500, 'confirmed', now())`,
      [order1.rows[0].id],
    );

    // A pending order awaiting payment — shows up in "New/Pending" on the dashboard.
    const order2 = await client.query(
      `insert into orders
         (business_id, order_number, customer_id, fulfillment_type,
          status, payment_status, subtotal, delivery_fee, discount, total)
       values ($1, 'CD-DEMO-0002', $2, 'pickup', 'new', 'unpaid', 250, 0, 0, 250)
       returning id`,
      [businessId, customerIds[1]],
    );
    await client.query(
      `insert into order_items (order_id, product_id, product_name_snapshot, unit_price_snapshot, cost_price_snapshot, quantity, line_total)
       values ($1, $2, 'Ugali & Sukuma Wiki', 250, 90, 1, 250)`,
      [order2.rows[0].id, productIds[4]],
    );
    await client.query(
      `insert into order_status_history (order_id, from_status, to_status, changed_by) values ($1, null, 'new', 'seed')`,
      [order2.rows[0].id],
    );

    const expenseCategories = ["Ingredients", "Packaging", "Gas", "Delivery"];
    const expenseCategoryIds: Record<string, string> = {};
    for (const name of expenseCategories) {
      const result = await client.query(
        `insert into expense_categories (business_id, name) values ($1, $2) returning id`,
        [businessId, name],
      );
      expenseCategoryIds[name] = result.rows[0].id;
    }
    await client.query(
      `insert into expenses (business_id, category_id, amount, expense_date, description, payment_method, created_by)
       values
         ($1, $2, 3500, current_date, 'Rice, beef and vegetables from Marikiti', 'cash', 'seed'),
         ($1, $3, 800, current_date, 'Takeaway containers', 'mpesa', 'seed'),
         ($1, $4, 1200, current_date - interval '1 day', 'Gas cylinder refill', 'mpesa', 'seed')`,
      [businessId, expenseCategoryIds["Ingredients"], expenseCategoryIds["Packaging"], expenseCategoryIds["Gas"]],
    );

    const inventoryItems = [
      { name: "Rice", unit: "kg", qty: 40, reorder: 10, cost: 150 },
      { name: "Chicken", unit: "kg", qty: 8, reorder: 10, cost: 450 },
      { name: "Beef", unit: "kg", qty: 15, reorder: 8, cost: 600 },
      { name: "Cooking Oil", unit: "litre", qty: 12, reorder: 5, cost: 300 },
      { name: "Packaging Boxes", unit: "piece", qty: 200, reorder: 50, cost: 10 },
    ];
    for (const item of inventoryItems) {
      await client.query(
        `insert into inventory_items (business_id, name, unit, quantity_available, reorder_level, cost_per_unit, supplier)
         values ($1, $2, $3, $4, $5, $6, 'Marikiti Market')`,
        [businessId, item.name, item.unit, item.qty, item.reorder, item.cost],
      );
    }

    await client.query("COMMIT");
    console.log("Seed complete.");
    console.log("Admin login: owner@chillisdiner.co.ke / ChilliAdmin123!");
    console.log(`Sample order tracking pages: /order/CD-DEMO-0001, /order/CD-DEMO-0002`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
