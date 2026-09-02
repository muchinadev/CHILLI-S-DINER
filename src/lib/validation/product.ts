import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a meal name."),
  description: z.string().trim().max(500).optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  sellingPrice: z.coerce.number().min(0, "Selling price must be zero or more."),
  costPrice: z.coerce.number().min(0, "Cost price must be zero or more."),
  availableQty: z.coerce.number().int().min(0, "Available quantity must be zero or more."),
  isActive: z.enum(["true", "false"]).default("true"),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;
