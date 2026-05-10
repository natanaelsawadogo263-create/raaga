const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function validateImageFile(file: File): string | null {
  if (!file || file.size === 0) {
    return "Fichier vide.";
  }
  if (file.size > MAX_BYTES) {
    return "Image trop volumineuse (max 5 Mo).";
  }
  const type = file.type.toLowerCase();
  if (!ALLOWED.has(type)) {
    return "Format non pris en charge (JPEG, PNG, WebP, GIF).";
  }
  return null;
}

export function fileExtension(file: File): string {
  const fromType = file.type.split("/")[1];
  if (fromType === "jpeg") return "jpg";
  if (fromType && fromType.length <= 4) return fromType;
  const parts = file.name.split(".");
  const ext = parts.length > 1 ? parts.pop() : "";
  return ext && /^[a-z0-9]+$/i.test(ext) ? ext.toLowerCase() : "jpg";
}
