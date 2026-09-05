import type { Pool, PoolClient } from "pg";
import { createNotification } from "@/lib/data/notifications";
import { formatKes } from "@/lib/format";

type QueryRunner = Pool | PoolClient;

export type CustomerOrderEvent =
  | "received"
  | "payment_confirmed"
  | "payment_failed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const CUSTOMER_MESSAGE: Record<CustomerOrderEvent, (orderNumber: string) => string> = {
  received: (n) => `Hi! Your order ${n} has been received. We'll confirm once payment goes through.`,
  payment_confirmed: (n) => `Payment confirmed for order ${n}. We're getting started on your food!`,
  payment_failed: (n) => `Payment for order ${n} was unsuccessful. Please place a new order to try again.`,
  preparing: (n) => `Your order ${n} is being prepared.`,
  ready: (n) => `Your order ${n} is ready!`,
  out_for_delivery: (n) => `Your order ${n} is out for delivery.`,
  delivered: (n) => `Your order ${n} has been delivered. Enjoy your meal!`,
  cancelled: (n) => `Your order ${n} has been cancelled.`,
};

export async function notifyCustomerOrderEvent(
  businessId: string,
  phone: string,
  orderNumber: string,
  event: CustomerOrderEvent,
  client?: QueryRunner,
): Promise<void> {
  await createNotification(
    {
      businessId,
      recipientType: "customer",
      channel: "whatsapp",
      template: `order_${event}`,
      message: CUSTOMER_MESSAGE[event](orderNumber),
      phone,
    },
    client,
  );
}

export type AdminOrderEvent = "new_order" | "payment_received" | "payment_failed";

export async function notifyAdminOrderEvent(
  businessId: string,
  orderNumber: string,
  customerName: string,
  total: number,
  event: AdminOrderEvent,
  client?: QueryRunner,
): Promise<void> {
  const message =
    event === "new_order"
      ? `New order ${orderNumber} from ${customerName} — ${formatKes(total)}`
      : event === "payment_received"
        ? `Payment received for ${orderNumber} — ${formatKes(total)}`
        : `Payment failed for order ${orderNumber} (${customerName})`;

  await createNotification(
    {
      businessId,
      recipientType: "admin",
      channel: "in_app",
      template: `admin_${event}`,
      message,
    },
    client,
  );
}
