import { getSession } from "@/lib/auth/session";
import { listPromotions } from "@/lib/data/promotions";
import { formatKes } from "@/lib/format";
import { PromotionForm } from "./PromotionForm";
import { ToggleActiveButton } from "./ToggleActiveButton";

export default async function AdminPromotionsPage() {
  const session = await getSession();
  const promotions = await listPromotions(session!.businessId);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-900">Promotions</h1>

      <PromotionForm />

      {promotions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No promo codes yet.
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => {
            const expired = promo.expires_at ? new Date(promo.expires_at) < new Date() : false;
            const discountLabel =
              promo.discount_type === "percent"
                ? `${Number(promo.discount_value)}% off`
                : `${formatKes(promo.discount_value)} off`;
            return (
              <div key={promo.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono font-semibold text-stone-900">{promo.code}</p>
                    <p className="text-sm text-stone-500">{discountLabel}</p>
                  </div>
                  <ToggleActiveButton promotionId={promo.id} isActive={promo.is_active} />
                </div>
                {promo.description ? <p className="mt-1 text-sm text-stone-600">{promo.description}</p> : null}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
                  <span>
                    Used {promo.uses_count}
                    {promo.max_uses ? ` / ${promo.max_uses}` : ""} time{promo.uses_count === 1 ? "" : "s"}
                  </span>
                  {promo.expires_at ? (
                    <span className={expired ? "text-red-600" : ""}>
                      {expired ? "Expired" : "Expires"} {new Date(promo.expires_at).toLocaleDateString("en-KE")}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
