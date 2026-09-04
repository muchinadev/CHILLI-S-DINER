import { z } from "zod";

export const promotionSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters.")
      .max(20, "Code must be 20 characters or fewer.")
      .regex(/^[A-Za-z0-9]+$/, "Use letters and numbers only, no spaces."),
    description: z.string().trim().max(200).optional(),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z.coerce.number().positive("Enter a discount greater than zero."),
    maxUses: z.coerce.number().int().positive().optional().or(z.literal("")),
    expiresAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "percent" && data.discountValue > 100) {
      ctx.addIssue({ code: "custom", path: ["discountValue"], message: "A percentage discount can't exceed 100." });
    }
  });
