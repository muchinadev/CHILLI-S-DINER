import { z } from "zod";

export const cartLineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(50),
});

export const checkoutSchema = z.object({
  cart: z.array(cartLineSchema).min(1, "Your cart is empty."),
  name: z.string().trim().min(2, "Enter your name."),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+254|254)?7\d{8}$/, "Enter a valid Kenyan phone number, e.g. 0712345678."),
  fulfillmentType: z.enum(["delivery", "pickup"]),
  addressText: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  promoCode: z.string().trim().max(20).optional(),
}).superRefine((data, ctx) => {
  if (data.fulfillmentType === "delivery" && !data.addressText) {
    ctx.addIssue({
      code: "custom",
      path: ["addressText"],
      message: "Enter a delivery address.",
    });
  }
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
