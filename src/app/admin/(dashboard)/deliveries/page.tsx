import { getSession } from "@/lib/auth/session";
import { listDeliveries } from "@/lib/data/deliveries";
import { DeliveryCard } from "./DeliveryCard";

export default async function AdminDeliveriesPage() {
  const session = await getSession();
  const deliveries = await listDeliveries(session!.businessId);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-900">Deliveries</h1>

      {deliveries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No deliveries yet — they&apos;ll show up here as delivery orders come in.
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))}
        </div>
      )}
    </div>
  );
}
