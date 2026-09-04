"use client";

import { useActionState } from "react";
import type { ProductFormState } from "@/lib/services/admin-menu-service";
import type { ProductCategory } from "@/lib/data/products";

const initialState: ProductFormState = { error: null };

export function ProductForm({
  action,
  categories,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: ProductCategory[];
  defaultValues?: {
    name: string;
    description: string;
    categoryId: string | null;
    sellingPrice: string;
    costPrice: string;
    availableQty: number;
    isActive: boolean;
    imageUrl: string;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700">
          Meal name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={defaultValues?.description}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-stone-700">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={defaultValues?.categoryId ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="sellingPrice" className="block text-sm font-medium text-stone-700">
            Selling price (KSh)
          </label>
          <input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={defaultValues?.sellingPrice}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="costPrice" className="block text-sm font-medium text-stone-700">
            Cost price (KSh)
          </label>
          <input
            id="costPrice"
            name="costPrice"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={defaultValues?.costPrice}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div>
        <label htmlFor="availableQty" className="block text-sm font-medium text-stone-700">
          Available quantity today
        </label>
        <input
          id="availableQty"
          name="availableQty"
          type="number"
          min="0"
          step="1"
          required
          defaultValue={defaultValues?.availableQty}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-stone-700">
          Photo URL (optional)
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://..."
          defaultValue={defaultValues?.imageUrl}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <input
          type="checkbox"
          name="isActive"
          value="true"
          defaultChecked={defaultValues?.isActive ?? true}
          className="h-4 w-4 rounded border-stone-300"
        />
        Active (visible to customers)
      </label>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
