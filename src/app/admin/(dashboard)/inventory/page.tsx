import { getSession } from "@/lib/auth/session";
import { listInventoryItems, listRecentWasteTransactions } from "@/lib/data/inventory";
import { formatKes, formatDateTime } from "@/lib/format";
import { round2 } from "@/lib/services/pricing";
import { WASTE_REASON_LABEL } from "@/lib/validation/waste";
import { PurchaseForm } from "./PurchaseForm";
import { AddIngredientForm } from "./AddIngredientForm";
import { WasteForm } from "./WasteForm";

export default async function AdminInventoryPage() {
  const session = await getSession();
  const [items, wasteTransactions] = await Promise.all([
    listInventoryItems(session!.businessId),
    listRecentWasteTransactions(session!.businessId, 30),
  ]);
  const totalWasteCost = round2(wasteTransactions.reduce((sum, t) => sum + t.estimated_cost, 0));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-900">Inventory</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No ingredients tracked yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const lowStock = Number(item.quantity_available) <= Number(item.reorder_level);
            return (
              <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-900">{item.name}</p>
                    <p className="text-sm text-stone-500">
                      {Number(item.quantity_available)} {item.unit} in stock
                    </p>
                  </div>
                  {lowStock ? (
                    <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                      Low stock
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-stone-400">
                  <span>Reorder at {Number(item.reorder_level)} {item.unit}</span>
                  <span>{formatKes(item.cost_per_unit)} / {item.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PurchaseForm items={items} />
      <WasteForm items={items} />

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Waste (last 30 days)</h2>
          <span className="font-bold text-stone-900">{formatKes(totalWasteCost)}</span>
        </div>
        {wasteTransactions.length === 0 ? (
          <p className="text-sm text-stone-500">No waste recorded — nice.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {wasteTransactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {Math.abs(Number(t.quantity))} {t.unit} · {t.item_name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {WASTE_REASON_LABEL[t.reason]}
                    {t.reference ? ` · ${t.reference}` : ""} · {formatDateTime(t.created_at)}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-stone-900">{formatKes(t.estimated_cost)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddIngredientForm />
    </div>
  );
}
