import { getDefaultBusiness } from "@/lib/data/business";
import { listAvailableProducts, listCategories } from "@/lib/data/products";
import { StorefrontShell } from "@/components/customer/StorefrontShell";
import { ProductCard } from "@/components/customer/ProductCard";

// Menu availability and stock change in real time as orders come in — never
// serve a stale, build-time-prerendered snapshot of the menu.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const business = await getDefaultBusiness();
  const [products, categories] = await Promise.all([
    listAvailableProducts(business.id),
    listCategories(business.id),
  ]);

  const categoriesById = new Map(categories.map((category) => [category.id, category.name]));
  const grouped = new Map<string, typeof products>();
  for (const product of products) {
    const key = product.category_id ? categoriesById.get(product.category_id) ?? "Other" : "Other";
    grouped.set(key, [...(grouped.get(key) ?? []), product]);
  }

  return (
    <StorefrontShell>
      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-6">
        <section className="mb-6 rounded-2xl bg-brand p-6 text-white">
          <p className="text-sm font-medium tracking-wide text-brand-100 uppercase">Good food. Every day.</p>
          <h1 className="mt-1 text-3xl font-semibold [font-family:var(--font-display)]">
            Home-cooked meals, delivered today
          </h1>
          <p className="mt-2 text-sm text-brand-100">Order in minutes. Pay easily with M-Pesa.</p>
        </section>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
            No meals are available right now. Please check back soon.
          </div>
        ) : (
          Array.from(grouped.entries()).map(([categoryName, items]) => (
            <section key={categoryName} className="mb-8">
              <h2 className="mb-3 text-xl font-semibold text-brand [font-family:var(--font-display)]">
                {categoryName}
              </h2>
              <div className="flex flex-col gap-3">
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      imageUrl: product.image_url,
                      price: Number(product.selling_price),
                      availableQty: product.available_qty,
                    }}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </StorefrontShell>
  );
}
