import { query } from "@/lib/db/client";

export type RecipeIngredientRow = {
  id: string;
  product_id: string;
  inventory_item_id: string;
  quantity_required: string;
  ingredient_name: string;
  unit: string;
  cost_per_unit: string;
};

export async function listRecipeIngredients(productId: string): Promise<RecipeIngredientRow[]> {
  const result = await query<RecipeIngredientRow>(
    `select ri.id, ri.product_id, ri.inventory_item_id, ri.quantity_required,
            i.name as ingredient_name, i.unit, i.cost_per_unit
     from recipe_ingredients ri
     join inventory_items i on i.id = ri.inventory_item_id
     where ri.product_id = $1
     order by i.name`,
    [productId],
  );
  return result.rows;
}

export function totalIngredientCost(lines: RecipeIngredientRow[]): number {
  return lines.reduce((sum, line) => sum + Number(line.quantity_required) * Number(line.cost_per_unit), 0);
}

export async function addRecipeIngredient(
  productId: string,
  inventoryItemId: string,
  quantityRequired: number,
): Promise<void> {
  await query(
    `insert into recipe_ingredients (product_id, inventory_item_id, quantity_required)
     values ($1, $2, $3)
     on conflict (product_id, inventory_item_id) do update set quantity_required = excluded.quantity_required`,
    [productId, inventoryItemId, quantityRequired],
  );
}

export async function removeRecipeIngredient(id: string): Promise<void> {
  await query(`delete from recipe_ingredients where id = $1`, [id]);
}
