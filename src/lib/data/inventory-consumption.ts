import type { Pool, PoolClient } from "pg";

type QueryRunner = Pool | PoolClient;

type RequiredIngredient = {
  inventory_item_id: string;
  quantity: string;
  quantity_required: string;
};

async function aggregateRequiredIngredients(
  runner: QueryRunner,
  orderId: string,
): Promise<Map<string, number>> {
  const result = await runner.query<RequiredIngredient>(
    `select ri.inventory_item_id, oi.quantity, ri.quantity_required
     from order_items oi
     join recipe_ingredients ri on ri.product_id = oi.product_id
     where oi.order_id = $1`,
    [orderId],
  );

  const totals = new Map<string, number>();
  for (const row of result.rows) {
    const required = Number(row.quantity) * Number(row.quantity_required);
    totals.set(row.inventory_item_id, (totals.get(row.inventory_item_id) ?? 0) + required);
  }
  return totals;
}

/**
 * Deducts each recipe ingredient's required quantity from inventory for
 * every line item on the order that has a recipe defined (items without
 * one are silently skipped — there's nothing to deduct). Stock is clamped
 * at zero rather than going negative, for a readable inventory screen.
 */
export async function deductIngredientsForOrder(
  runner: QueryRunner,
  orderId: string,
  orderNumber: string,
  changedBy: string,
): Promise<void> {
  const totals = await aggregateRequiredIngredients(runner, orderId);

  for (const [inventoryItemId, quantity] of totals) {
    await runner.query(
      `update inventory_items set quantity_available = greatest(quantity_available - $2, 0) where id = $1`,
      [inventoryItemId, quantity],
    );
    await runner.query(
      `insert into inventory_transactions (item_id, type, quantity, reference, created_by)
       values ($1, 'usage', $2, $3, $4)`,
      [inventoryItemId, -quantity, `Order ${orderNumber}`, changedBy],
    );
  }
}

/** The inverse of deductIngredientsForOrder — used when a confirmed order is cancelled. */
export async function restoreIngredientsForOrder(
  runner: QueryRunner,
  orderId: string,
  orderNumber: string,
  changedBy: string,
): Promise<void> {
  const totals = await aggregateRequiredIngredients(runner, orderId);

  for (const [inventoryItemId, quantity] of totals) {
    await runner.query(`update inventory_items set quantity_available = quantity_available + $2 where id = $1`, [
      inventoryItemId,
      quantity,
    ]);
    await runner.query(
      `insert into inventory_transactions (item_id, type, quantity, reference, created_by)
       values ($1, 'adjustment', $2, $3, $4)`,
      [inventoryItemId, quantity, `Order ${orderNumber} cancelled - stock restored`, changedBy],
    );
  }
}
