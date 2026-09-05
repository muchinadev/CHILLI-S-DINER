import { pool } from "@/lib/db/client";
import { getPaymentProvider, type PaymentCallback } from "@/lib/payments/provider";
import { createPayment, getPaymentByReference, markPaymentResolved, recordCashPayment } from "@/lib/data/payments";
import { getOrderById, setOrderPaymentStatus, updateOrderStatus, type Order } from "@/lib/data/orders";

export async function initiatePaymentForOrder(businessId: string, orderId: string, phone: string) {
  const order = await getOrderById(businessId, orderId);
  if (!order) throw new Error("Order not found");

  const provider = await getPaymentProvider();
  const result = await provider.initiate({
    orderId: order.id,
    amount: Number(order.total),
    phone,
    reference: order.order_number,
  });

  if (result.status === "failed") {
    return result;
  }

  await createPayment({
    orderId: order.id,
    provider: process.env.PAYMENT_PROVIDER ?? "mock",
    providerReference: result.providerReference,
    amount: Number(order.total),
  });

  await setOrderPaymentStatus(order.id, "pending");
  await updateOrderStatus(businessId, order.id, "payment_pending", "system:payment");

  return result;
}

export class OrderAlreadyPaidError extends Error {
  constructor() {
    super("This order is already marked as paid.");
    this.name = "OrderAlreadyPaidError";
  }
}

/**
 * Records a manually-collected cash payment (cash-on-pickup or -delivery)
 * against an order and confirms it, mirroring what handlePaymentCallback
 * does for M-Pesa — there's just no webhook to wait on.
 */
export async function confirmCashPayment(businessId: string, orderId: string, changedBy: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query<Order>(
      `select * from orders where business_id = $1 and id = $2 for update`,
      [businessId, orderId],
    );
    const order = orderResult.rows[0];
    if (!order) throw new Error("Order not found");
    if (order.payment_status === "paid") throw new OrderAlreadyPaidError();

    await recordCashPayment({ orderId: order.id, amount: Number(order.total) }, client);
    await setOrderPaymentStatus(order.id, "paid", client);

    if (order.status === "new" || order.status === "payment_pending") {
      await updateOrderStatus(order.business_id, order.id, "payment_confirmed", changedBy, client);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * The ONLY place that ever marks an order as paid. Called from a real
 * provider webhook in production, or by the mock provider's simulated
 * timer in dev — either way, payment confirmation always originates here,
 * never from a client request.
 */
export async function handlePaymentCallback(callback: PaymentCallback) {
  const payment = await getPaymentByReference(callback.providerReference);
  if (!payment) {
    console.error("Received payment callback for unknown reference", callback.providerReference);
    return;
  }

  // Idempotency: a duplicate/replayed callback for an already-resolved payment is a no-op.
  if (payment.status !== "pending") {
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const resolvedPayment = await markPaymentResolved(payment.id, callback.status, callback.rawPayload, client);

    const order = (await client.query(`select * from orders where id = $1 for update`, [payment.order_id])).rows[0];
    if (!order) throw new Error("Order not found for payment callback");

    if (callback.status === "confirmed") {
      await setOrderPaymentStatus(order.id, "paid", client);
      if (order.status === "payment_pending" || order.status === "new") {
        await updateOrderStatus(order.business_id, order.id, "payment_confirmed", "system:payment", client);
      }
    } else {
      await setOrderPaymentStatus(order.id, "failed", client);
      if (order.status === "payment_pending" || order.status === "new") {
        await updateOrderStatus(order.business_id, order.id, "failed", "system:payment", client);
      }
    }

    await client.query("COMMIT");
    return resolvedPayment;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
