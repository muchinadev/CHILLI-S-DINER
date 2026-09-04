import { pool, query } from "@/lib/db/client";

export type InventoryItem = {
  id: string;
  business_id: string;
  name: string;
  unit: string;
  quantity_available: string;
  reorder_level: string;
  cost_per_unit: string;
  supplier: string | null;
  last_purchase_date: string | null;
  created_at: string;
};

export async function listInventoryItems(businessId: string): Promise<InventoryItem[]> {
  const result = await query<InventoryItem>(
    `select * from inventory_items where business_id = $1 order by name`,
    [businessId],
  );
  return result.rows;
}

export async function listLowStockItems(businessId: string): Promise<InventoryItem[]> {
  const result = await query<InventoryItem>(
    `select * from inventory_items
     where business_id = $1 and quantity_available <= reorder_level
     order by name`,
    [businessId],
  );
  return result.rows;
}

export type CreateInventoryItemInput = {
  businessId: string;
  name: string;
  unit: string;
  quantityAvailable: number;
  reorderLevel: number;
  costPerUnit: number;
  supplier: string;
};

export async function createInventoryItem(input: CreateInventoryItemInput): Promise<InventoryItem> {
  const result = await query<InventoryItem>(
    `insert into inventory_items (business_id, name, unit, quantity_available, reorder_level, cost_per_unit, supplier, last_purchase_date)
     values ($1, $2, $3, $4, $5, $6, $7, current_date)
     returning *`,
    [
      input.businessId,
      input.name,
      input.unit,
      input.quantityAvailable,
      input.reorderLevel,
      input.costPerUnit,
      input.supplier || null,
    ],
  );
  return result.rows[0];
}

export type RecordPurchaseInput = {
  itemId: string;
  quantity: number;
  totalCost: number;
  createdBy: string;
};

/**
 * Records an ingredient purchase: increases stock, updates the running
 * cost-per-unit, and logs the transaction — all in one place so a purchase
 * is never entered without moving inventory (and vice versa).
 */
export async function recordPurchase(input: RecordPurchaseInput): Promise<InventoryItem> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const costPerUnit = input.quantity > 0 ? input.totalCost / input.quantity : 0;

    const updated = await client.query<InventoryItem>(
      `update inventory_items
       set quantity_available = quantity_available + $2,
           cost_per_unit = $3,
           last_purchase_date = current_date
       where id = $1
       returning *`,
      [input.itemId, input.quantity, costPerUnit],
    );

    await client.query(
      `insert into inventory_transactions (item_id, type, quantity, reference, created_by)
       values ($1, 'purchase', $2, $3, $4)`,
      [input.itemId, input.quantity, `Purchase: ${formatQuantity(input.quantity)} for ${input.totalCost}`, input.createdBy],
    );

    await client.query("COMMIT");
    return updated.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function formatQuantity(quantity: number): string {
  return String(quantity);
}
