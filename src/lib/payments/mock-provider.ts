import type { PaymentCallback, PaymentInitiation, PaymentInitiationResult, PaymentProvider } from "./provider";

/**
 * Simulates an M-Pesa STK Push: initiation always returns "pending"
 * (matching real provider behaviour — the customer still has to approve a
 * prompt), then a callback arrives a few seconds later on its own, exactly
 * like a real Daraja webhook would. A phone number ending in "0" simulates a
 * declined/failed payment so the failure path is exercisable in dev.
 *
 * Swap PAYMENT_PROVIDER=mpesa (once Daraja credentials exist) for a
 * provider that calls the real STK Push API and receives real callbacks at
 * an HTTP endpoint instead of this in-process timer.
 */
export class MockPaymentProvider implements PaymentProvider {
  async initiate(payment: PaymentInitiation): Promise<PaymentInitiationResult> {
    const providerReference = `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const willFail = payment.phone.endsWith("0");

    scheduleCallback(async () => {
      const { handlePaymentCallback } = await import("@/lib/services/payment-service");
      const callback: PaymentCallback = {
        providerReference,
        status: willFail ? "failed" : "confirmed",
        amount: payment.amount,
        rawPayload: {
          mock: true,
          orderId: payment.orderId,
          reference: payment.reference,
          simulatedAt: new Date().toISOString(),
        },
      };
      await handlePaymentCallback(callback);
    });

    return {
      providerReference,
      status: "pending",
      message: "STK push sent. Enter your M-Pesa PIN on your phone to complete payment.",
    };
  }
}

function scheduleCallback(fn: () => Promise<void>) {
  setTimeout(() => {
    fn().catch((error) => {
      console.error("Mock payment callback failed", error);
    });
  }, 3000);
}
