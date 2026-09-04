import { query } from "@/lib/db/client";

export type Product = {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  selling_price: string;
  cost_price: string;
  available_qty: number;
  is_active: boolean;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductCategory = {
  id: string;
  business_id: string;
  name: string;
  sort_order: number;
};

export async function listCategories(businessId: string): Promise<ProductCategory[]> {
  const result = await query<ProductCategory>(
    `select id, business_id, name, sort_order
     from product_categories where business_id = $1
     order by sort_order asc, name asc`,
    [businessId],
  );
  return result.rows;
}

/** Products visible to customers: active, in stock, and within their availability window. */
export async function listAvailableProducts(businessId: string): Promise<Product[]> {
  const result = await query<Product>(
    `select * from products
     where business_id = $1
       and is_active = true
       and available_qty > 0
       and (available_from is null or available_from <= current_date)
       and (available_until is null or available_until >= current_date)
     order by created_at asc`,
    [businessId],
  );
  return result.rows;
}

/** All products for the admin menu screen, active or not. */
export async function listAllProducts(businessId: string): Promise<Product[]> {
  const result = await query<Product>(
    `select * from products where business_id = $1 order by created_at desc`,
    [businessId],
  );
  return result.rows;
}

export async function getProductById(businessId: string, id: string): Promise<Product | null> {
  const result = await query<Product>(
    `select * from products where business_id = $1 and id = $2`,
    [businessId, id],
  );
  return result.rows[0] ?? null;
}

/** Fetches current prices for a set of product ids — the only source of truth for order totals. */
export async function getProductsByIds(businessId: string, ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const result = await query<Product>(
    `select * from products where business_id = $1 and id = any($2::uuid[])`,
    [businessId, ids],
  );
  return result.rows;
}

export type ProductInput = {
  name: string;
  description: string;
  imageUrl: string | null;
  categoryId: string | null;
  sellingPrice: number;
  costPrice: number;
  availableQty: number;
  isActive: boolean;
};

export async function createProduct(businessId: string, input: ProductInput): Promise<Product> {
  const result = await query<Product>(
    `insert into products
       (business_id, category_id, name, description, image_url, selling_price, cost_price, available_qty, is_active)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning *`,
    [
      businessId,
      input.categoryId,
      input.name,
      input.description,
      input.imageUrl,
      input.sellingPrice,
      input.costPrice,
      input.availableQty,
      input.isActive,
    ],
  );
  return result.rows[0];
}

export async function updateProduct(businessId: string, id: string, input: ProductInput): Promise<Product | null> {
  const result = await query<Product>(
    `update products set
       category_id = $3, name = $4, description = $5, image_url = $6,
       selling_price = $7, cost_price = $8, available_qty = $9, is_active = $10,
       updated_at = now()
     where business_id = $1 and id = $2
     returning *`,
    [
      businessId,
      id,
      input.categoryId,
      input.name,
      input.description,
      input.imageUrl,
      input.sellingPrice,
      input.costPrice,
      input.availableQty,
      input.isActive,
    ],
  );
  return result.rows[0] ?? null;
}

export async function setProductActive(businessId: string, id: string, isActive: boolean): Promise<void> {
  await query(
    `update products set is_active = $3, updated_at = now() where business_id = $1 and id = $2`,
    [businessId, id, isActive],
  );
}

export async function setProductCostPrice(businessId: string, id: string, costPrice: number): Promise<void> {
  await query(
    `update products set cost_price = $3, updated_at = now() where business_id = $1 and id = $2`,
    [businessId, id, costPrice],
  );
}

export async function deleteProduct(businessId: string, id: string): Promise<void> {
  await query(`delete from products where business_id = $1 and id = $2`, [businessId, id]);
}
