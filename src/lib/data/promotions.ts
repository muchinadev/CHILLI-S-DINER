import { query } from "@/lib/db/client";

export type DiscountType = "percent" | "fixed";

export type Promotion = {
  id: string;
  business_id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: string;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

export async function listPromotions(businessId: string): Promise<Promotion[]> {
  const result = await query<Promotion>(
    `select * from promotions where business_id = $1 order by created_at desc`,
    [businessId],
  );
  return result.rows;
}

export type CreatePromotionInput = {
  businessId: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number | null;
  expiresAt: string | null;
};

export async function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
  const result = await query<Promotion>(
    `insert into promotions (business_id, code, description, discount_type, discount_value, max_uses, expires_at)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      input.businessId,
      input.code.trim().toUpperCase(),
      input.description || null,
      input.discountType,
      input.discountValue,
      input.maxUses,
      input.expiresAt,
    ],
  );
  return result.rows[0];
}

export async function setPromotionActive(businessId: string, id: string, isActive: boolean): Promise<void> {
  await query(`update promotions set is_active = $3 where business_id = $1 and id = $2`, [
    businessId,
    id,
    isActive,
  ]);
}

/** Looks up a usable promo code: active, not expired, and under its usage cap if it has one. */
export async function findValidPromoByCode(businessId: string, code: string): Promise<Promotion | null> {
  const result = await query<Promotion>(
    `select * from promotions
     where business_id = $1
       and code = $2
       and is_active = true
       and (expires_at is null or expires_at >= current_date)
       and (max_uses is null or uses_count < max_uses)`,
    [businessId, code.trim().toUpperCase()],
  );
  return result.rows[0] ?? null;
}

export async function incrementPromotionUsage(id: string): Promise<void> {
  await query(`update promotions set uses_count = uses_count + 1 where id = $1`, [id]);
}

export function computeDiscount(promotion: Promotion, subtotal: number): number {
  const raw =
    promotion.discount_type === "percent"
      ? subtotal * (Number(promotion.discount_value) / 100)
      : Number(promotion.discount_value);
  return Math.min(Math.round(raw * 100) / 100, subtotal);
}
