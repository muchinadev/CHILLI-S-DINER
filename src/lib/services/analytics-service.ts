import { query } from "@/lib/db/client";
import { round2 } from "@/lib/services/pricing";

const COMPLETED_STATUSES = ["payment_confirmed", "preparing", "ready", "out_for_delivery", "delivered"];

export type DailyBreakdown = {
  date: string;
  revenue: number;
  orders: number;
};

export type TopMeal = {
  name: string;
  portions: number;
  revenue: number;
};

export type RangeAnalytics = {
  days: number;
  revenue: number;
  estimatedCosts: number;
  estimatedProfit: number;
  orderCount: number;
  averageOrderValue: number;
  dailyBreakdown: DailyBreakdown[];
  topMeals: TopMeal[];
};

/**
 * Aggregates business performance over a rolling window ending today
 * (e.g. the last 7 or 30 days), rather than a calendar week/month — avoids
 * timezone edge cases and always shows a full, comparable period.
 */
export async function getAnalyticsForRange(businessId: string, days: number): Promise<RangeAnalytics> {
  const totalsRow = await query<{ revenue: string | null; cost: string | null; order_count: string }>(
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
       and o.created_at >= now() - ($2 || ' days')::interval
       and o.status = any($3::text[])`,
    [businessId, days, COMPLETED_STATUSES],
  );

  const revenue = round2(Number(totalsRow.rows[0]?.revenue ?? 0));
  const estimatedCosts = round2(Number(totalsRow.rows[0]?.cost ?? 0));
  const orderCount = Number(totalsRow.rows[0]?.order_count ?? 0);

  const dailyRows = await query<{ day: string; revenue: string; orders: string }>(
    `select o.created_at::date::text as day,
            coalesce(sum(o.total), 0)::text as revenue,
            count(*)::text as orders
     from orders o
     where o.business_id = $1
       and o.created_at >= now() - ($2 || ' days')::interval
       and o.status = any($3::text[])
     group by o.created_at::date
     order by o.created_at::date`,
    [businessId, days, COMPLETED_STATUSES],
  );
  const revenueByDay = new Map(dailyRows.rows.map((row) => [row.day, { revenue: Number(row.revenue), orders: Number(row.orders) }]));

  const dailyBreakdown: DailyBreakdown[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const entry = revenueByDay.get(key);
    dailyBreakdown.push({ date: key, revenue: entry?.revenue ?? 0, orders: entry?.orders ?? 0 });
  }

  const topMealsRows = await query<{ name: string; portions: string; revenue: string }>(
    `select oi.product_name_snapshot as name,
            sum(oi.quantity)::text as portions,
            sum(oi.line_total)::text as revenue
     from order_items oi
     join orders o on o.id = oi.order_id
     where o.business_id = $1
       and o.created_at >= now() - ($2 || ' days')::interval
       and o.status = any($3::text[])
     group by oi.product_name_snapshot
     order by sum(oi.line_total) desc
     limit 5`,
    [businessId, days, COMPLETED_STATUSES],
  );

  return {
    days,
    revenue,
    estimatedCosts,
    estimatedProfit: round2(revenue - estimatedCosts),
    orderCount,
    averageOrderValue: orderCount > 0 ? round2(revenue / orderCount) : 0,
    dailyBreakdown,
    topMeals: topMealsRows.rows.map((row) => ({
      name: row.name,
      portions: Number(row.portions),
      revenue: round2(Number(row.revenue)),
    })),
  };
}
