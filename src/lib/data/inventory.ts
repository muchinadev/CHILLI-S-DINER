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

export type WasteReason =
  | "spoilage"
  | "overproduction"
  | "prep_waste"
  | "cancelled_order"
  | "failed_delivery"
  | "damaged"
  | "other";

export type RecordWasteInput = {
  itemId: string;
  quantity: number;
  reason: WasteReason;
  note: string;
  createdBy: string;
};

export async function recordWaste(input: RecordWasteInput): Promise<void> {
  await query(
    `update inventory_items set quantity_available = greatest(quantity_available - $2, 0) where id = $1`,
    [input.itemId, input.quantity],
  );
  await query(
    `insert into inventory_transactions (item_id, type, quantity, reference, reason, created_by)
     values ($1, 'waste', $2, $3, $4, $5)`,
    [input.itemId, -input.quantity, input.note || null, input.reason, input.createdBy],
  );
}

export type WasteTransaction = {
  id: string;
  item_id: string;
  quantity: string;
  reference: string | null;
  reason: WasteReason;
  created_at: string;
  item_name: string;
  unit: string;
  estimated_cost: number;
};

export async function listRecentWasteTransactions(businessId: string, days = 30): Promise<WasteTransaction[]> {
  const result = await query<Omit<WasteTransaction, "estimated_cost"> & { cost_per_unit: string }>(
    `select t.id, t.item_id, t.quantity, t.reference, t.reason, t.created_at,
            i.name as item_name, i.unit, i.cost_per_unit
     from inventory_transactions t
     join inventory_items i on i.id = t.item_id
     where i.business_id = $1 and t.type = 'waste' and t.created_at >= now() - ($2 || ' days')::interval
     order by t.created_at desc`,
    [businessId, days],
  );
  return result.rows.map((row) => ({
    ...row,
    estimated_cost: Math.abs(Number(row.quantity)) * Number(row.cost_per_unit),
  }));
}
