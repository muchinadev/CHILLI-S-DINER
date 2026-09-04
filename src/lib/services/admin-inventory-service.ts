"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { inventoryItemSchema, purchaseSchema } from "@/lib/validation/inventory";
import { createInventoryItem, recordPurchase } from "@/lib/data/inventory";
import { createExpense, getOrCreateExpenseCategory } from "@/lib/data/expenses";

export type InventoryFormState = { error: string | null };

export async function createInventoryItemAction(
  _prevState: InventoryFormState,
  formData: FormData,
): Promise<InventoryFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const parsed = inventoryItemSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    quantityAvailable: formData.get("quantityAvailable"),
    reorderLevel: formData.get("reorderLevel"),
    costPerUnit: formData.get("costPerUnit"),
    supplier: formData.get("supplier") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createInventoryItem({
    businessId: session.businessId,
    name: parsed.data.name,
    unit: parsed.data.unit,
    quantityAvailable: parsed.data.quantityAvailable,
    reorderLevel: parsed.data.reorderLevel,
    costPerUnit: parsed.data.costPerUnit,
    supplier: parsed.data.supplier ?? "",
  });

  revalidatePath("/admin/inventory");
  return { error: null };
}

/**
 * Recording a purchase does two things at once, matching how the owner
 * actually thinks about it: stock goes up, and money went out.
 */
export async function recordPurchaseAction(
  _prevState: InventoryFormState,
  formData: FormData,
): Promise<InventoryFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const parsed = purchaseSchema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
    totalCost: formData.get("totalCost"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const item = await recordPurchase({
    itemId: parsed.data.itemId,
    quantity: parsed.data.quantity,
    totalCost: parsed.data.totalCost,
    createdBy: `admin:${session.email}`,
  });

  const ingredientsCategory = await getOrCreateExpenseCategory(session.businessId, "Ingredients");
  await createExpense({
    businessId: session.businessId,
    categoryId: ingredientsCategory.id,
    amount: parsed.data.totalCost,
    expenseDate: new Date().toISOString().slice(0, 10),
    description: `Purchased ${parsed.data.quantity} ${item.unit} of ${item.name}`,
    paymentMethod: "cash",
    createdBy: `admin:${session.email}`,
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
  return { error: null };
}
