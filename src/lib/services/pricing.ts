import type { Product } from "@/lib/data/products";

export type CartLine = {
  productId: string;
  quantity: number;
};

export type PricedLine = {
  productId: string;
  name: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  lineTotal: number;
};

export type PricedOrder = {
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

/**
 * Server-side source of truth for order totals. Never trusts client-submitted
 * prices or totals — looks up each product's current price/availability and
 * recomputes everything from scratch.
 */
export function priceCart(
  cartLines: CartLine[],
  products: Product[],
  options: { deliveryFee?: number; discount?: number } = {},
): PricedOrder {
  if (cartLines.length === 0) {
    throw new PricingError("Cart is empty.");
  }

  const productsById = new Map(products.map((product) => [product.id, product]));

  const lines: PricedLine[] = cartLines.map((line) => {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new PricingError("Quantity must be a positive whole number.");
    }

    const product = productsById.get(line.productId);
    if (!product) {
      throw new PricingError("One of the items in your cart is no longer available.");
    }
    if (!product.is_active) {
      throw new PricingError(`${product.name} is no longer available.`);
    }
    if (product.available_qty < line.quantity) {
      throw new PricingError(`Only ${product.available_qty} of ${product.name} left in stock.`);
    }

    const unitPrice = Number(product.selling_price);
    const costPrice = Number(product.cost_price);
    const lineTotal = round2(unitPrice * line.quantity);

    return {
      productId: product.id,
      name: product.name,
      unitPrice,
      costPrice,
      quantity: line.quantity,
      lineTotal,
    };
  });

  const subtotal = round2(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const deliveryFee = round2(options.deliveryFee ?? 0);
  const discount = round2(options.discount ?? 0);
  const total = round2(subtotal + deliveryFee - discount);

  if (total < 0) {
    throw new PricingError("Order total cannot be negative.");
  }

  return { lines, subtotal, deliveryFee, discount, total };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
