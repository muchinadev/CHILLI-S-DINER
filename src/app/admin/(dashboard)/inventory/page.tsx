import { getSession } from "@/lib/auth/session";
import { listInventoryItems } from "@/lib/data/inventory";
import { formatKes } from "@/lib/format";
import { PurchaseForm } from "./PurchaseForm";
import { AddIngredientForm } from "./AddIngredientForm";

export default async function AdminInventoryPage() {
  const session = await getSession();
  const items = await listInventoryItems(session!.businessId);

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
      <AddIngredientForm />
    </div>
  );
}
