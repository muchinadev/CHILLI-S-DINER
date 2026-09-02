import { getSession } from "@/lib/auth/session";
import { listCategories } from "@/lib/data/products";
import { createProductAction } from "@/lib/services/admin-menu-service";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await getSession();
  const categories = await listCategories(session!.businessId);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-900">Add meal</h1>
      <ProductForm action={createProductAction} categories={categories} submitLabel="Add meal" />
    </div>
  );
}
