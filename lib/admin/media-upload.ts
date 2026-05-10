import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { fileExtension, validateImageFile } from "@/lib/admin/image-file";
import { MEDIA_BUCKET, storagePathFromPublicUrl } from "@/lib/storage/media";

export async function uploadImageToMediaFolder(
  supabase: SupabaseClient<Database>,
  folderPath: string,
  file: File,
  filename?: string,
): Promise<{ publicUrl: string } | { error: string }> {
  const v = validateImageFile(file);
  if (v) return { error: v };

  const ext = fileExtension(file);
  const name = filename ?? `file-${Date.now()}.${ext}`;
  const path = `${folderPath.replace(/\/$/, "")}/${name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}

export async function removeMediaObjectIfInBucket(
  supabase: SupabaseClient<Database>,
  publicUrl: string | null,
): Promise<void> {
  if (!publicUrl) return;
  const path = storagePathFromPublicUrl(publicUrl);
  if (!path) return;
  await supabase.storage.from(MEDIA_BUCKET).remove([path]);
}
