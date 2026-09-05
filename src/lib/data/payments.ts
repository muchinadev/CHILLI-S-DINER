import { PoolClient } from "pg";
import { pool, query } from "@/lib/db/client";

export type PaymentRow = {
  id: string;
  order_id: string;
  provider: string;
  provider_reference: string | null;
  amount: string;
  status: "pending" | "confirmed" | "failed" | "refunded";
  raw_callback: Record<string, unknown> | null;
  created_at: string;
  confirmed_at: string | null;
};

export async function createPayment(
  input: { orderId: string; provider: string; providerReference: string; amount: number },
  client?: PoolClient,
): Promise<PaymentRow> {
  const runner = client ?? pool;
  const result = await runner.query<PaymentRow>(
    `insert into payments (order_id, provider, provider_reference, amount, status)
     values ($1, $2, $3, $4, 'pending') returning *`,
    [input.orderId, input.provider, input.providerReference, input.amount],
  );
  return result.rows[0];
}

export async function getPaymentByReference(providerReference: string): Promise<PaymentRow | null> {
  const result = await query<PaymentRow>(`select * from payments where provider_reference = $1`, [
    providerReference,
  ]);
  return result.rows[0] ?? null;
}

export async function getLatestPaymentForOrder(orderId: string): Promise<PaymentRow | null> {
  const result = await query<PaymentRow>(
    `select * from payments where order_id = $1 order by created_at desc limit 1`,
    [orderId],
  );
  return result.rows[0] ?? null;
}

/** Records a cash payment as immediately confirmed — there's no callback to wait on. */
export async function recordCashPayment(
  input: { orderId: string; amount: number },
  client?: PoolClient,
): Promise<PaymentRow> {
  const runner = client ?? pool;
  const result = await runner.query<PaymentRow>(
    `insert into payments (order_id, provider, provider_reference, amount, status, confirmed_at)
     values ($1, 'cash', null, $2, 'confirmed', now()) returning *`,
    [input.orderId, input.amount],
  );
  return result.rows[0];
}

export async function markPaymentResolved(
  paymentId: string,
  status: "confirmed" | "failed",
  rawCallback: Record<string, unknown>,
  client?: PoolClient,
): Promise<PaymentRow> {
  const runner = client ?? pool;
  const result = await runner.query<PaymentRow>(
    `update payments set status = $2, raw_callback = $3, confirmed_at = case when $2 = 'confirmed' then now() else confirmed_at end
     where id = $1 returning *`,
    [paymentId, status, JSON.stringify(rawCallback)],
  );
  return result.rows[0];
}
