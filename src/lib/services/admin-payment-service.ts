"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { confirmCashPayment, OrderAlreadyPaidError } from "@/lib/services/payment-service";

export type ConfirmCashPaymentState = { error: string | null; success: boolean };

export async function confirmCashPaymentAction(
  _prevState: ConfirmCashPaymentState,
  formData: FormData,
): Promise<ConfirmCashPaymentState> {
  const session = await getSession();
  if (!session) {
    return { error: "You must be signed in.", success: false };
  }

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) {
    return { error: "Invalid order.", success: false };
  }

  try {
    await confirmCashPayment(session.businessId, orderId, `admin:${session.email}`);
  } catch (error) {
    if (error instanceof OrderAlreadyPaidError) {
      return { error: error.message, success: false };
    }
    throw error;
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/reconciliation");
  return { error: null, success: true };
}
