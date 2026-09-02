export type PaymentInitiation = {
  orderId: string;
  amount: number;
  phone: string;
  reference: string;
};

export type PaymentInitiationResult = {
  providerReference: string;
  /**
   * "pending" means the customer must complete an out-of-band step (e.g. an
   * M-Pesa STK push prompt) before the provider confirms payment via
   * callback. The order's payment_status must never be set to "paid" from
   * this result alone.
   */
  status: "pending" | "failed";
  message: string;
};

export type PaymentCallback = {
  providerReference: string;
  status: "confirmed" | "failed";
  amount: number;
  rawPayload: Record<string, unknown>;
};

/**
 * Every payment integration (M-Pesa Daraja, a future card processor, ...)
 * implements this interface. Order/payment status is only ever written by
 * code that has gone through a PaymentProvider — never by a client request
 * claiming "I've paid".
 */
export interface PaymentProvider {
  initiate(payment: PaymentInitiation): Promise<PaymentInitiationResult>;
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  const providerName = process.env.PAYMENT_PROVIDER ?? "mock";
  if (providerName === "mock") {
    const { MockPaymentProvider } = await import("./mock-provider");
    return new MockPaymentProvider();
  }
  throw new Error(
    `Payment provider "${providerName}" is not implemented yet. Set PAYMENT_PROVIDER=mock for development.`,
  );
}
