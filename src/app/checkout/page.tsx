import { StorefrontShell } from "@/components/customer/StorefrontShell";
import { CheckoutForm } from "./CheckoutForm";

export default function CheckoutPage() {
  return (
    <StorefrontShell>
      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-6">
        <h1 className="mb-4 text-xl font-bold text-stone-900">Checkout</h1>
        <CheckoutForm />
      </main>
    </StorefrontShell>
  );
}
