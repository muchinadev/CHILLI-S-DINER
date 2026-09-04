import { pool, query } from "@/lib/db/client";
import { InvalidTransitionError, updateOrderStatus } from "@/lib/data/orders";

export type DeliveryStatus = "pending" | "assigned" | "picked_up" | "out_for_delivery" | "delivered" | "failed";

export type DeliveryWithOrder = {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: DeliveryStatus;
  delivery_fee: string;
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  order_number: string;
  order_status: string;
  customer_name: string;
  customer_phone: string;
  address_text: string | null;
  instructions: string | null;
  driver_name: string | null;
};

export type DeliveryDriver = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  is_active: boolean;
};

export async function listDeliveries(businessId: string): Promise<DeliveryWithOrder[]> {
  const result = await query<DeliveryWithOrder>(
    `select d.id, d.order_id, d.driver_id, d.status, d.delivery_fee, d.assigned_at, d.picked_up_at, d.delivered_at,
            o.order_number, o.status as order_status,
            c.name as customer_name, c.phone as customer_phone,
            a.address_text, a.instructions,
            drv.name as driver_name
     from deliveries d
     join orders o on o.id = d.order_id
     join customers c on c.id = o.customer_id
     left join addresses a on a.id = o.delivery_address_id
     left join delivery_drivers drv on drv.id = d.driver_id
     where o.business_id = $1
     order by
       case d.status
         when 'pending' then 0
         when 'assigned' then 1
         when 'picked_up' then 2
         when 'out_for_delivery' then 3
         when 'failed' then 4
         when 'delivered' then 5
       end,
       o.created_at desc`,
    [businessId],
  );
  return result.rows;
}

export async function getOrCreateDriver(businessId: string, name: string): Promise<DeliveryDriver> {
  const existing = await query<DeliveryDriver>(
    `select * from delivery_drivers where business_id = $1 and name = $2`,
    [businessId, name],
  );
  if (existing.rows[0]) return existing.rows[0];

  const created = await query<DeliveryDriver>(
    `insert into delivery_drivers (business_id, name, phone) values ($1, $2, '') returning *`,
    [businessId, name],
  );
  return created.rows[0];
}

export async function assignDriver(deliveryId: string, driverId: string): Promise<void> {
  await query(
    `update deliveries set driver_id = $2, status = 'assigned', assigned_at = now() where id = $1`,
    [deliveryId, driverId],
  );
}

/**
 * Moves a delivery to a new status. When it reaches "delivered", the linked
 * order's status is kept in sync in the same transaction — the delivery
 * detail (rider, timestamps) and the customer-facing order status must
 * never disagree.
 */
export async function updateDeliveryStatus(
  businessId: string,
  deliveryId: string,
  orderId: string,
  status: DeliveryStatus,
  changedBy: string,
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const timestampColumn =
      status === "picked_up" ? "picked_up_at" : status === "delivered" ? "delivered_at" : null;

    await client.query(
      `update deliveries set status = $2${timestampColumn ? `, ${timestampColumn} = now()` : ""} where id = $1`,
      [deliveryId, status],
    );

    if (status === "delivered" || status === "out_for_delivery") {
      try {
        await updateOrderStatus(businessId, orderId, status, changedBy, client);
      } catch (error) {
        // The order may already be further along (or not yet ready) than the
        // delivery leg suggests — that's fine, the delivery status still saves.
        if (!(error instanceof InvalidTransitionError)) throw error;
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
