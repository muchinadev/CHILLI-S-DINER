"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { ADMIN_SETTABLE_STATUSES, InvalidTransitionError, updateOrderStatus, type OrderStatus } from "@/lib/data/orders";

export type UpdateOrderStatusState = { error: string | null; success: boolean };

export async function updateOrderStatusAction(
  _prevState: UpdateOrderStatusState,
  formData: FormData,
): Promise<UpdateOrderStatusState> {
  const session = await getSession();
  if (!session) {
    return { error: "You must be signed in.", success: false };
  }

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  if (!orderId || !(ADMIN_SETTABLE_STATUSES as string[]).includes(status)) {
    return { error: "Invalid status change.", success: false };
  }

  try {
    await updateOrderStatus(session.businessId, orderId, status, `admin:${session.email}`);
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return { error: error.message, success: false };
    }
    throw error;
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null, success: true };
}
