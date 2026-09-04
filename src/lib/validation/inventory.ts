import { z } from "zod";

export const inventoryItemSchema = z.object({
  name: z.string().trim().min(2, "Enter an ingredient name."),
  unit: z.string().trim().min(1, "Enter a unit, e.g. kg, litre, piece."),
  quantityAvailable: z.coerce.number().min(0, "Quantity must be zero or more."),
  reorderLevel: z.coerce.number().min(0, "Reorder level must be zero or more."),
  costPerUnit: z.coerce.number().min(0, "Cost per unit must be zero or more."),
  supplier: z.string().trim().max(200).optional(),
});

export const purchaseSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.coerce.number().positive("Enter a quantity greater than zero."),
  totalCost: z.coerce.number().positive("Enter the total amount paid."),
});
