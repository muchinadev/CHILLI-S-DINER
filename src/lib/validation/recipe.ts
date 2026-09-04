import { z } from "zod";

export const recipeIngredientSchema = z.object({
  productId: z.string().uuid(),
  inventoryItemId: z.string().uuid(),
  quantityRequired: z.coerce.number().positive("Enter a quantity greater than zero."),
});
