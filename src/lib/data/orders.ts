import { PoolClient } from "pg";
import { pool, query } from "@/lib/db/client";
import type { PricedOrder } from "@/lib/services/pricing";

export type OrderStatus =
  | "new"
  | "payment_pending"
  | "payment_confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "failed";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export type Order = {
  id: string;
  business_id: string;
  order_number: string;
  customer_id: string;
  delivery_address_id: string | null;
  fulfillment_type: "delivery" | "pickup";
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: string;
  delivery_fee: string;
  discount: string;
  total: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot: string;
  cost_price_snapshot: string;
  quantity: number;
  line_total: string;
};

export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `CD-${datePart}-${randomPart}`;
}

export type CreateOrderInput = {
  businessId: string;
  customerId: string;
  deliveryAddressId: string | null;
  fulfillmentType: "delivery" | "pickup";
  notes: string | null;
  priced: PricedOrder;
  changedBy: string;
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderNumber = generateOrderNumber();
    const orderResult = await client.query<Order>(
      `insert into orders
         (business_id, order_number, customer_id, delivery_address_id, fulfillment_type,
          status, payment_status, subtotal, delivery_fee, discount, total, notes)
       values ($1, $2, $3, $4, $5, 'new', 'unpaid', $6, $7, $8, $9, $10)
       returning *`,
      [
        input.businessId,
        orderNumber,
        input.customerId,
        input.deliveryAddressId,
        input.fulfillmentType,
        input.priced.subtotal,
        input.priced.deliveryFee,
        input.priced.discount,
        input.priced.total,
        input.notes,
      ],
    );
    const order = orderResult.rows[0];

    for (const line of input.priced.lines) {
      await client.query(
        `insert into order_items
           (order_id, product_id, product_name_snapshot, unit_price_snapshot, cost_price_snapshot, quantity, line_total)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, line.productId, line.name, line.unitPrice, line.costPrice, line.quantity, line.lineTotal],
      );
      await client.query(
        `update products set available_qty = available_qty - $2 where id = $1 and available_qty >= $2`,
        [line.productId, line.quantity],
      );
    }

    await client.query(
      `insert into order_status_history (order_id, from_status, to_status, changed_by)
       values ($1, null, 'new', $2)`,
      [order.id, input.changedBy],
    );

    await client.query("COMMIT");
    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrderById(businessId: string, id: string): Promise<Order | null> {
  const result = await query<Order>(`select * from orders where business_id = $1 and id = $2`, [businessId, id]);
  return result.rows[0] ?? null;
}

export async function getOrderWithCustomerById(
  businessId: string,
  id: string,
): Promise<OrderWithCustomer | null> {
  const result = await query<OrderWithCustomer>(
    `select o.*, c.name as customer_name, c.phone as customer_phone
     from orders o join customers c on c.id = o.customer_id
     where o.business_id = $1 and o.id = $2`,
    [businessId, id],
  );
  return result.rows[0] ?? null;
}

export async function getOrderByNumber(businessId: string, orderNumber: string): Promise<Order | null> {
  const result = await query<Order>(
    `select * from orders where business_id = $1 and order_number = $2`,
    [businessId, orderNumber],
  );
  return result.rows[0] ?? null;
}

export async function getOrderItems(orderId: string): Promise<OrderItemRow[]> {
  const result = await query<OrderItemRow>(`select * from order_items where order_id = $1`, [orderId]);
  return result.rows;
}

export type OrderWithCustomer = Order & { customer_name: string; customer_phone: string };

export async function listOrders(
  businessId: string,
  filters: { status?: OrderStatus; limit?: number } = {},
): Promise<OrderWithCustomer[]> {
  const conditions = ["o.business_id = $1"];
  const params: unknown[] = [businessId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`o.status = $${params.length}`);
  }

  const limit = filters.limit ?? 100;
  params.push(limit);

  const result = await query<OrderWithCustomer>(
    `select o.*, c.name as customer_name, c.phone as customer_phone
     from orders o join customers c on c.id = o.customer_id
     where ${conditions.join(" and ")}
     order by o.created_at desc limit $${params.length}`,
    params,
  );
  return result.rows;
}

export async function listOrdersSince(businessId: string, since: Date): Promise<Order[]> {
  const result = await query<Order>(
    `select * from orders where business_id = $1 and created_at >= $2 order by created_at desc`,
    [businessId, since.toISOString()],
  );
  return result.rows;
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ["payment_pending", "payment_confirmed", "preparing", "cancelled", "failed"],
  payment_pending: ["payment_confirmed", "failed", "cancelled"],
  payment_confirmed: ["preparing", "cancelled", "refunded"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "delivered", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
  failed: ["new", "payment_pending"],
};

export class InvalidTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Cannot move an order from "${from}" to "${to}".`);
    this.name = "InvalidTransitionError";
  }
}

export function assertValidTransition(from: OrderStatus, to: OrderStatus) {
  if (from === to) return;
  if (!VALID_TRANSITIONS[from]?.includes(to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export const ADMIN_SETTABLE_STATUSES: OrderStatus[] = [
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

/** Statuses an admin may move this order to next, from the admin order-detail screen. */
export function getAdminNextStatusOptions(current: OrderStatus): OrderStatus[] {
  return (VALID_TRANSITIONS[current] ?? []).filter((status) => ADMIN_SETTABLE_STATUSES.includes(status));
}

export async function updateOrderStatus(
  businessId: string,
  orderId: string,
  toStatus: OrderStatus,
  changedBy: string,
  client?: PoolClient,
): Promise<Order> {
  const runner = client ?? pool;
  const current = await runner.query<Order>(
    `select * from orders where business_id = $1 and id = $2 for update`,
    [businessId, orderId],
  );
  const order = current.rows[0];
  if (!order) throw new Error("Order not found");

  assertValidTransition(order.status, toStatus);

  const updated = await runner.query<Order>(
    `update orders set status = $3, updated_at = now() where business_id = $1 and id = $2 returning *`,
    [businessId, orderId, toStatus],
  );

  await runner.query(
    `insert into order_status_history (order_id, from_status, to_status, changed_by) values ($1, $2, $3, $4)`,
    [orderId, order.status, toStatus, changedBy],
  );

  return updated.rows[0];
}

export async function setOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  client?: PoolClient,
): Promise<void> {
  const runner = client ?? pool;
  await runner.query(`update orders set payment_status = $2, updated_at = now() where id = $1`, [
    orderId,
    paymentStatus,
  ]);
}

export type OrderStatusHistoryRow = {
  id: string;
  order_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string;
  changed_at: string;
};

export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryRow[]> {
  const result = await query<OrderStatusHistoryRow>(
    `select * from order_status_history where order_id = $1 order by changed_at asc`,
    [orderId],
  );
  return result.rows;
}
