import { z } from "zod";

export const wasteReasonValues = [
  "spoilage",
  "overproduction",
  "prep_waste",
  "cancelled_order",
  "failed_delivery",
  "damaged",
  "other",
] as const;

export const wasteSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.coerce.number().positive("Enter a quantity greater than zero."),
  reason: z.enum(wasteReasonValues),
  note: z.string().trim().max(300).optional(),
});

export const WASTE_REASON_LABEL: Record<(typeof wasteReasonValues)[number], string> = {
  spoilage: "Spoilage",
  overproduction: "Overproduction",
  prep_waste: "Prep waste",
  cancelled_order: "Cancelled order",
  failed_delivery: "Failed delivery",
  damaged: "Damaged",
  other: "Other",
};
