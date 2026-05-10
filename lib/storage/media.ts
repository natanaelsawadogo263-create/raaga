export const MEDIA_BUCKET = "media";

export function getMediaPublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  const path = storagePath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/** Extrait le chemin dans le bucket à partir de l’URL publique Supabase. */
export function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  try {
    return decodeURIComponent(publicUrl.slice(i + marker.length).split("?")[0] ?? "");
  } catch {
    return publicUrl.slice(i + marker.length).split("?")[0] ?? null;
  }
}
