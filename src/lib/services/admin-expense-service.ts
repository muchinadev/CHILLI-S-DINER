"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { expenseSchema } from "@/lib/validation/expense";
import { createExpense } from "@/lib/data/expenses";

export type ExpenseFormState = { error: string | null };

export async function createExpenseAction(
  _prevState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const parsed = expenseSchema.safeParse({
    categoryId: formData.get("categoryId") || "",
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
    description: formData.get("description") || undefined,
    paymentMethod: formData.get("paymentMethod"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createExpense({
    businessId: session.businessId,
    categoryId: parsed.data.categoryId || null,
    amount: parsed.data.amount,
    expenseDate: parsed.data.expenseDate,
    description: parsed.data.description ?? "",
    paymentMethod: parsed.data.paymentMethod,
    createdBy: `admin:${session.email}`,
  });

  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
  return { error: null };
}
