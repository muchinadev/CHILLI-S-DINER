import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { listAllProducts } from "@/lib/data/products";
import { formatKes } from "@/lib/format";
import { productImageUrl } from "@/lib/products/image";
import { PlateDoodle } from "@/components/customer/doodles";
import { ToggleActiveButton } from "./ToggleActiveButton";

export default async function AdminMenuPage() {
  const session = await getSession();
  const products = await listAllProducts(session!.businessId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">Menu</h1>
        <Link
          href="/admin/menu/new"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + Add meal
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No meals yet. Add your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    {productImageUrl(product) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productImageUrl(product)!}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-brand/25">
                        <PlateDoodle className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Link href={`/admin/menu/${product.id}/edit`} className="font-semibold text-stone-900">
                      {product.name}
                    </Link>
                    <p className="text-sm text-stone-500">
                      {formatKes(product.selling_price)} · cost {formatKes(product.cost_price)}
                    </p>
                    <p className="text-sm text-stone-500">
                      {product.available_qty} available {product.is_active ? "" : "· inactive"}
                    </p>
                  </div>
                </div>
                <ToggleActiveButton productId={product.id} isActive={product.is_active} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
