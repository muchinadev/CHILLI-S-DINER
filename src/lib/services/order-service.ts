"use server";

import { redirect } from "next/navigation";
import { checkoutSchema } from "@/lib/validation/checkout";
import { getDefaultBusinessId } from "@/lib/data/business";
import { getProductsByIds } from "@/lib/data/products";
import { priceCart, PricingError } from "@/lib/services/pricing";
import { findOrCreateCustomer, createAddress } from "@/lib/data/customers";
import { createOrder } from "@/lib/data/orders";
import { initiatePaymentForOrder } from "@/lib/services/payment-service";

const FLAT_DELIVERY_FEE = 150;

export type CheckoutState = { error: string | null };

export async function checkoutAction(_prevState: CheckoutState, formData: FormData): Promise<CheckoutState> {
  let cartLines: unknown;
  try {
    cartLines = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    return { error: "Your cart looks invalid. Please try again." };
  }

  const parsed = checkoutSchema.safeParse({
    cart: cartLines,
    name: formData.get("name"),
    phone: formData.get("phone"),
    fulfillmentType: formData.get("fulfillmentType"),
    addressText: formData.get("addressText") || undefined,
    instructions: formData.get("instructions") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const businessId = await getDefaultBusinessId();
  const productIds = parsed.data.cart.map((line) => line.productId);
  const products = await getProductsByIds(businessId, productIds);

  let priced;
  try {
    priced = priceCart(parsed.data.cart, products, {
      deliveryFee: parsed.data.fulfillmentType === "delivery" ? FLAT_DELIVERY_FEE : 0,
    });
  } catch (error) {
    if (error instanceof PricingError) {
      return { error: error.message };
    }
    throw error;
  }

  const customer = await findOrCreateCustomer(businessId, {
    name: parsed.data.name,
    phone: parsed.data.phone,
  });

  let deliveryAddressId: string | null = null;
  if (parsed.data.fulfillmentType === "delivery" && parsed.data.addressText) {
    const address = await createAddress(customer.id, {
      addressText: parsed.data.addressText,
      instructions: parsed.data.instructions ?? null,
    });
    deliveryAddressId = address.id;
  }

  const order = await createOrder({
    businessId,
    customerId: customer.id,
    deliveryAddressId,
    fulfillmentType: parsed.data.fulfillmentType,
    notes: parsed.data.notes ?? null,
    priced,
    changedBy: `customer:${customer.phone}`,
  });

  await initiatePaymentForOrder(businessId, order.id, customer.phone);

  redirect(`/order/${order.order_number}`);
}
