import { MEDIA_BUCKET, getMediaPublicUrl, storagePathFromPublicUrl } from "@/lib/storage/media";

/** URL utilisable par le navigateur (catalogue, livreur, panier). */
export function resolveProductImageUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) {
    return null;
  }
  const url = raw.trim();
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  if (url.includes(marker)) {
    const path = storagePathFromPublicUrl(
      url.startsWith("http") ? url : `https://local.invalid${url.startsWith("/") ? url : `/${url}`}`,
    );
    if (path) {
      return getMediaPublicUrl(path);
    }
  }
  return getMediaPublicUrl(url.replace(/^\/+/, ""));
}
