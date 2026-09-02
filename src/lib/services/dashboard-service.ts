import { query } from "@/lib/db/client";
import { round2 } from "@/lib/services/pricing";

export type TodayOverview = {
  totalOrders: number;
  pending: number;
  preparing: number;
  ready: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
  revenue: number;
  estimatedCosts: number;
  estimatedProfit: number;
  averageOrderValue: number;
};

const COMPLETED_STATUSES = ["payment_confirmed", "preparing", "ready", "out_for_delivery", "delivered"];

/**
 * "Revenue" and "estimated costs/profit" here are same-day operational
 * estimates from order data, not audited accounting figures — labelled as
 * such in the UI.
 */
export async function getTodayOverview(businessId: string): Promise<TodayOverview> {
  const statusCounts = await query<{ status: string; count: string }>(
    `select status, count(*)::text as count
     from orders
     where business_id = $1 and created_at::date = current_date
     group by status`,
    [businessId],
  );

  const counts: Record<string, number> = {};
  let totalOrders = 0;
  for (const row of statusCounts.rows) {
    counts[row.status] = Number(row.count);
    totalOrders += Number(row.count);
  }

  const revenueRow = await query<{ revenue: string | null; cost: string | null; order_count: string }>(
    `select
       coalesce(sum(o.total), 0)::text as revenue,
       coalesce(sum(oi.cost_line), 0)::text as cost,
       count(distinct o.id)::text as order_count
     from orders o
     left join (
       select order_id, sum(cost_price_snapshot * quantity) as cost_line
       from order_items group by order_id
     ) oi on oi.order_id = o.id
     where o.business_id = $1
       and o.created_at::date = current_date
       and o.status = any($2::text[])`,
    [businessId, COMPLETED_STATUSES],
  );

  const revenue = round2(Number(revenueRow.rows[0]?.revenue ?? 0));
  const estimatedCosts = round2(Number(revenueRow.rows[0]?.cost ?? 0));
  const completedOrderCount = Number(revenueRow.rows[0]?.order_count ?? 0);

  return {
    totalOrders,
    pending: (counts["new"] ?? 0) + (counts["payment_pending"] ?? 0),
    preparing: counts["preparing"] ?? 0,
    ready: counts["ready"] ?? 0,
    outForDelivery: counts["out_for_delivery"] ?? 0,
    delivered: counts["delivered"] ?? 0,
    cancelled: (counts["cancelled"] ?? 0) + (counts["failed"] ?? 0),
    revenue,
    estimatedCosts,
    estimatedProfit: round2(revenue - estimatedCosts),
    averageOrderValue: completedOrderCount > 0 ? round2(revenue / completedOrderCount) : 0,
  };
}
