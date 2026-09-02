import { query } from "@/lib/db/client";

export type Business = {
  id: string;
  name: string;
  phone: string | null;
  currency: string;
};

let cachedBusinessId: string | null = null;

/**
 * MVP is single-tenant: there is exactly one business row. Every
 * business-owned query still filters by business_id so adding real
 * multi-tenancy later only means removing this shortcut, not the filters.
 */
export async function getDefaultBusiness(): Promise<Business> {
  const result = await query<Business>(
    `select id, name, phone, currency from businesses order by created_at asc limit 1`,
  );
  const business = result.rows[0];
  if (!business) {
    throw new Error("No business configured. Run the seed script first.");
  }
  cachedBusinessId = business.id;
  return business;
}

export async function getDefaultBusinessId(): Promise<string> {
  if (cachedBusinessId) return cachedBusinessId;
  const business = await getDefaultBusiness();
  return business.id;
}
