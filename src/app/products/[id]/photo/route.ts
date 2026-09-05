import { NextResponse } from "next/server";
import { getProductPhotoData } from "@/lib/data/products";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await getProductPhotoData(id);
  if (!photo) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.contentType,
      // Safe to cache forever — the URL includes a version query param
      // that changes whenever the photo is replaced.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
