import { z } from "zod";

export const expenseSchema = z.object({
  categoryId: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().positive("Enter an amount greater than zero."),
  expenseDate: z.string().min(1, "Pick a date."),
  description: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(["cash", "mpesa", "bank", "card", "other"]),
});
