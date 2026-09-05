import { query } from "@/lib/db/client";
import { round2 } from "@/lib/services/pricing";

export type PaymentMethodTotal = {
  provider: string;
  amount: number;
  count: number;
};

export type OutstandingOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string;
};

export type DailyReconciliation = {
  date: string;
  expectedTotal: number;
  confirmedTotal: number;
  variance: number;
  byMethod: PaymentMethodTotal[];
  outstandingOrders: OutstandingOrder[];
};

/**
 * "Expected" is every non-cancelled order placed that calendar day; "confirmed"
 * is what payments actually settled that day (mock M-Pesa auto-confirms,
 * cash is confirmed manually) — so any gap surfaces as outstanding orders
 * the admin still needs to collect on or chase up.
 */
export async function getDailyReconciliation(businessId: string, date: string): Promise<DailyReconciliation> {
  const expectedResult = await query<{ total: string }>(
    `select total from orders
     where business_id = $1 and created_at::date = $2::date and status <> 'cancelled'`,
    [businessId, date],
  );
  const expectedTotal = round2(expectedResult.rows.reduce((sum, row) => sum + Number(row.total), 0));

  const methodResult = await query<{ provider: string; amount: string; count: string }>(
    `select p.provider, sum(p.amount)::text as amount, count(*)::text as count
     from payments p
     join orders o on o.id = p.order_id
     where o.business_id = $1 and p.status = 'confirmed' and p.confirmed_at::date = $2::date
     group by p.provider
     order by p.provider`,
    [businessId, date],
  );
  const byMethod: PaymentMethodTotal[] = methodResult.rows.map((row) => ({
    provider: row.provider,
    amount: round2(Number(row.amount)),
    count: Number(row.count),
  }));
  const confirmedTotal = round2(byMethod.reduce((sum, method) => sum + method.amount, 0));

  const outstandingResult = await query<OutstandingOrder>(
    `select o.id, o.order_number, c.name as customer_name, o.total, o.status, o.payment_status
     from orders o
     join customers c on c.id = o.customer_id
     where o.business_id = $1 and o.created_at::date = $2::date
       and o.payment_status <> 'paid' and o.status not in ('cancelled', 'failed')
     order by o.created_at desc`,
    [businessId, date],
  );

  return {
    date,
    expectedTotal,
    confirmedTotal,
    variance: round2(expectedTotal - confirmedTotal),
    byMethod,
    outstandingOrders: outstandingResult.rows.map((row) => ({ ...row, total: Number(row.total) })),
  };
}
