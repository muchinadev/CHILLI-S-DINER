"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { recipeIngredientSchema } from "@/lib/validation/recipe";
import {
  addRecipeIngredient,
  listRecipeIngredients,
  removeRecipeIngredient,
  totalIngredientCost,
} from "@/lib/data/recipes";
import { setProductCostPrice } from "@/lib/data/products";

export type RecipeFormState = { error: string | null };

export async function addRecipeIngredientAction(
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const parsed = recipeIngredientSchema.safeParse({
    productId: formData.get("productId"),
    inventoryItemId: formData.get("inventoryItemId"),
    quantityRequired: formData.get("quantityRequired"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await addRecipeIngredient(parsed.data.productId, parsed.data.inventoryItemId, parsed.data.quantityRequired);

  revalidatePath(`/admin/menu/${parsed.data.productId}/recipe`);
  return { error: null };
}

export async function removeRecipeIngredientAction(id: string, productId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await removeRecipeIngredient(id);
  revalidatePath(`/admin/menu/${productId}/recipe`);
}

/**
 * Overwrites the meal's cost_price with the recipe's computed ingredient
 * cost. cost_price stays a plain, manually-editable field everywhere else
 * (order pricing, the menu edit form) — this is just a one-tap way to fill
 * it in accurately instead of guessing.
 */
export async function applyRecipeCostAction(productId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const lines = await listRecipeIngredients(productId);
  const cost = totalIngredientCost(lines);
  await setProductCostPrice(session.businessId, productId, Math.round(cost * 100) / 100);

  revalidatePath(`/admin/menu/${productId}/recipe`);
  revalidatePath(`/admin/menu/${productId}/edit`);
  revalidatePath("/admin/menu");
  revalidatePath("/admin");
}
