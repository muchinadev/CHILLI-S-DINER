import { SiteHeader } from "@/components/customer/SiteHeader";
import { CheckoutForm } from "./CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-6">
        <h1 className="mb-4 text-xl font-bold text-stone-900">Checkout</h1>
        <CheckoutForm />
      </main>
    </div>
  );
}
