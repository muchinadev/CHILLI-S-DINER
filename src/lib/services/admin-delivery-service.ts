"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { assignDriver, getOrCreateDriver, updateDeliveryStatus, type DeliveryStatus } from "@/lib/data/deliveries";

export type DeliveryFormState = { error: string | null };

const VALID_STATUSES: DeliveryStatus[] = ["assigned", "picked_up", "out_for_delivery", "delivered", "failed"];

export async function assignDriverAction(
  _prevState: DeliveryFormState,
  formData: FormData,
): Promise<DeliveryFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const deliveryId = String(formData.get("deliveryId") ?? "");
  const driverName = String(formData.get("driverName") ?? "").trim();

  if (!deliveryId || driverName.length < 2) {
    return { error: "Enter a rider name." };
  }

  const driver = await getOrCreateDriver(session.businessId, driverName);
  await assignDriver(deliveryId, driver.id);

  revalidatePath("/admin/deliveries");
  return { error: null };
}

export async function updateDeliveryStatusAction(
  _prevState: DeliveryFormState,
  formData: FormData,
): Promise<DeliveryFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const deliveryId = String(formData.get("deliveryId") ?? "");
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as DeliveryStatus;

  if (!deliveryId || !orderId || !VALID_STATUSES.includes(status)) {
    return { error: "Invalid status change." };
  }

  await updateDeliveryStatus(session.businessId, deliveryId, orderId, status, `admin:${session.email}`);

  revalidatePath("/admin/deliveries");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null };
}
