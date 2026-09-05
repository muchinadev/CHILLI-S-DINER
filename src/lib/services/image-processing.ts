import sharp from "sharp";

export class PhotoProcessingError extends Error {}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 82;

/**
 * Resizes and re-encodes an uploaded meal photo to a reasonably small JPEG
 * before it's stored — phone camera photos can be several MB and don't
 * need to be served at full resolution for a menu thumbnail.
 */
export async function processMealPhoto(file: File): Promise<{ data: Buffer; contentType: string }> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new PhotoProcessingError("That photo is too large. Please choose one under 8MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const data = await sharp(bytes)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    return { data, contentType: "image/jpeg" };
  } catch {
    throw new PhotoProcessingError(
      "Couldn't read that photo. Please try a JPG or PNG image (some iPhone photo formats aren't supported).",
    );
  }
}
