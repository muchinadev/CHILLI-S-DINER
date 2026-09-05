"use client";

import { useActionState, useState, type ChangeEvent } from "react";
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
    photoPreviewUrl: string | null;
    hasUploadedPhoto: boolean;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [preview, setPreview] = useState<string | null>(defaultValues?.photoPreviewUrl ?? null);
  const [removePhoto, setRemovePhoto] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  }

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
        <label htmlFor="photo" className="block text-sm font-medium text-stone-700">
          Photo of the meal (optional)
        </label>

        {preview || defaultValues?.hasUploadedPhoto ? (
          <div className="mt-2 flex items-center gap-3">
            {preview && !removePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Meal preview" className="h-20 w-20 rounded-xl object-cover" />
            ) : null}
            {defaultValues?.hasUploadedPhoto ? (
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  name="removePhoto"
                  value="true"
                  checked={removePhoto}
                  onChange={(e) => {
                    setRemovePhoto(e.target.checked);
                    if (e.target.checked) setPreview(null);
                    else setPreview(defaultValues?.photoPreviewUrl ?? null);
                  }}
                  className="h-4 w-4 rounded border-stone-300"
                />
                Remove photo
              </label>
            ) : null}
          </div>
        ) : null}

        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="mt-2 block w-full text-sm text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <p className="mt-1 text-xs text-stone-400">JPG or PNG, up to 8MB. Take a photo or choose one from your gallery.</p>

        <label htmlFor="imageUrl" className="mt-3 block text-sm font-medium text-stone-700">
          Or paste a photo URL instead
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://..."
          defaultValue={defaultValues?.imageUrl}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <p className="mt-1 text-xs text-stone-400">Only used if you don&apos;t upload a photo above.</p>
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
