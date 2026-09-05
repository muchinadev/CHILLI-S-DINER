import type { Product } from "@/lib/data/products";

/**
 * An uploaded photo (served from our own DB via the /products/[id]/photo
 * route) always wins over a pasted URL — the URL field is just a fallback
 * for admins who already have an image hosted elsewhere.
 */
export function productImageUrl(product: Pick<Product, "id" | "image_url" | "image_content_type" | "updated_at">) {
  if (product.image_content_type) {
    return `/products/${product.id}/photo?v=${encodeURIComponent(product.updated_at)}`;
  }
  return product.image_url;
}
