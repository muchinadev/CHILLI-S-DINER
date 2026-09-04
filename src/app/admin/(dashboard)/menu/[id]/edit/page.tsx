import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getProductById, listCategories } from "@/lib/data/products";
import { updateProductAction } from "@/lib/services/admin-menu-service";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProductButton } from "./DeleteProductButton";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const [product, categories] = await Promise.all([
    getProductById(session!.businessId, id),
    listCategories(session!.businessId),
  ]);
  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, product.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-900">Edit meal</h1>
      <ProductForm
        action={boundAction}
        categories={categories}
        submitLabel="Save changes"
        defaultValues={{
          name: product.name,
          description: product.description ?? "",
          categoryId: product.category_id,
          sellingPrice: product.selling_price,
          costPrice: product.cost_price,
          availableQty: product.available_qty,
          isActive: product.is_active,
          imageUrl: product.image_url ?? "",
        }}
      />
      <Link
        href={`/admin/menu/${product.id}/recipe`}
        className="block rounded-2xl border border-dashed border-stone-300 bg-white p-4 text-center text-sm font-semibold text-brand"
      >
        🧾 Recipe &amp; food cost
      </Link>
      <DeleteProductButton productId={product.id} />
    </div>
  );
}
