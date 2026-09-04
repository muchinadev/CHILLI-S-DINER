"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { promotionSchema } from "@/lib/validation/promotion";
import { createPromotion, setPromotionActive } from "@/lib/data/promotions";

export type PromotionFormState = { error: string | null };

export async function createPromotionAction(
  _prevState: PromotionFormState,
  formData: FormData,
): Promise<PromotionFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const parsed = promotionSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description") || undefined,
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    maxUses: formData.get("maxUses") || "",
    expiresAt: formData.get("expiresAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  try {
    await createPromotion({
      businessId: session.businessId,
      code: parsed.data.code,
      description: parsed.data.description ?? "",
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      maxUses: parsed.data.maxUses === "" || parsed.data.maxUses === undefined ? null : parsed.data.maxUses,
      expiresAt: parsed.data.expiresAt || null,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return { error: "That code is already in use." };
    }
    throw error;
  }

  revalidatePath("/admin/promotions");
  return { error: null };
}

export async function togglePromotionActiveAction(promotionId: string, isActive: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await setPromotionActive(session.businessId, promotionId, isActive);
  revalidatePath("/admin/promotions");
}
