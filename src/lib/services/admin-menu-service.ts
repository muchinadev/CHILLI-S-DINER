"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation/product";
import { createProduct, deleteProduct, setProductActive, setProductPhoto, updateProduct } from "@/lib/data/products";
import { processMealPhoto, PhotoProcessingError } from "@/lib/services/image-processing";

export type ProductFormState = { error: string | null };

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    categoryId: formData.get("categoryId") || "",
    sellingPrice: formData.get("sellingPrice"),
    costPrice: formData.get("costPrice"),
    availableQty: formData.get("availableQty"),
    isActive: formData.get("isActive") === "true" ? "true" : "false",
    imageUrl: formData.get("imageUrl") || "",
  });
}

/** The file input is empty (no photo picked) vs. an actual upload — anything else isn't worth trying to process. */
function getUploadedPhoto(formData: FormData): File | null {
  const photo = formData.get("photo");
  return photo instanceof File && photo.size > 0 ? photo : null;
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const photoFile = getUploadedPhoto(formData);
  let photo: { data: Buffer; contentType: string } | null = null;
  if (photoFile) {
    try {
      photo = await processMealPhoto(photoFile);
    } catch (error) {
      if (error instanceof PhotoProcessingError) return { error: error.message };
      throw error;
    }
  }

  const product = await createProduct(session.businessId, {
    name: parsed.data.name,
    description: parsed.data.description ?? "",
    imageUrl: parsed.data.imageUrl || null,
    categoryId: parsed.data.categoryId || null,
    sellingPrice: parsed.data.sellingPrice,
    costPrice: parsed.data.costPrice,
    availableQty: parsed.data.availableQty,
    isActive: parsed.data.isActive === "true",
  });

  if (photo) {
    await setProductPhoto(session.businessId, product.id, photo);
  }

  revalidatePath("/admin/menu");
  revalidatePath("/");
  redirect(`/admin/menu/${product.id}/edit`);
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const photoFile = getUploadedPhoto(formData);
  let photo: { data: Buffer; contentType: string } | null = null;
  if (photoFile) {
    try {
      photo = await processMealPhoto(photoFile);
    } catch (error) {
      if (error instanceof PhotoProcessingError) return { error: error.message };
      throw error;
    }
  }

  const product = await updateProduct(session.businessId, productId, {
    name: parsed.data.name,
    description: parsed.data.description ?? "",
    imageUrl: parsed.data.imageUrl || null,
    categoryId: parsed.data.categoryId || null,
    sellingPrice: parsed.data.sellingPrice,
    costPrice: parsed.data.costPrice,
    availableQty: parsed.data.availableQty,
    isActive: parsed.data.isActive === "true",
  });

  if (!product) return { error: "Meal not found." };

  const removePhoto = formData.get("removePhoto") === "true";
  if (photo) {
    await setProductPhoto(session.businessId, productId, photo);
  } else if (removePhoto) {
    await setProductPhoto(session.businessId, productId, null);
  }

  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { error: null };
}

export async function toggleProductActiveAction(productId: string, isActive: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await setProductActive(session.businessId, productId, isActive);
  revalidatePath("/admin/menu");
  revalidatePath("/");
}

export async function deleteProductAction(productId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await deleteProduct(session.businessId, productId);
  revalidatePath("/admin/menu");
  revalidatePath("/");
}
