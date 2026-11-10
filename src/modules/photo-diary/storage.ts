import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);

const MAX_BYTES = 5 * 1024 * 1024;

export class PhotoStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoStorageError";
  }
}

export type StoredPhoto = {
  absolutePath: string;
  publicUrl: string;
  mimeType: string;
  base64: string;
  size: number;
};

function extensionForMime(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export async function storeFoodPhoto(file: File): Promise<StoredPhoto> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new PhotoStorageError(
      "Поддерживаются только изображения JPG, PNG или WEBP",
    );
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new PhotoStorageError("Размер фото должен быть до 5 МБ");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type === "image/jpg" ? "image/jpeg" : file.type;
  const fileName = `${Date.now()}-${randomUUID()}.${extensionForMime(mimeType)}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "food");

  await mkdir(uploadsDir, { recursive: true });

  const absolutePath = path.join(uploadsDir, fileName);
  await writeFile(absolutePath, bytes);

  return {
    absolutePath,
    publicUrl: `/uploads/food/${fileName}`,
    mimeType,
    base64: bytes.toString("base64"),
    size: bytes.byteLength,
  };
}
