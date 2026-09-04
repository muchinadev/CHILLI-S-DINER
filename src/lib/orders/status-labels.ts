import type { OrderStatus } from "@/lib/data/orders";

export const CUSTOMER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Order received",
  payment_pending: "Waiting for M-Pesa payment",
  payment_confirmed: "Payment confirmed",
  preparing: "Being prepared",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  failed: "Payment failed",
};

export const ADMIN_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  payment_pending: "Payment pending",
  payment_confirmed: "Payment confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  failed: "Failed",
};

export const TRACKING_STEPS: OrderStatus[] = [
  "new",
  "payment_confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export const TERMINAL_NEGATIVE_STATUSES: OrderStatus[] = ["cancelled", "refunded", "failed"];

export function statusBadgeClass(status: OrderStatus): string {
  if (TERMINAL_NEGATIVE_STATUSES.includes(status)) return "bg-red-100 text-red-700";
  if (status === "delivered") return "bg-green-100 text-green-700";
  if (status === "new" || status === "payment_pending") return "bg-amber-100 text-amber-700";
  return "bg-brand-100 text-brand-dark";
}
