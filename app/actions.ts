"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cartHasHeavyProduct, computeCartDelivery } from "@/lib/heavy-product";
import { computeOrderTotal, digitsOnlyDeliveryCode, generateDeliverySecretCode } from "@/lib/order-utils";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient, tryGetSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeInternalPath(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) {
    return null;
  }
  if (t.includes("://")) {
    return null;
  }
  return t;
}

function getPublicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/\/+$/, "");
    return host.startsWith("http://") || host.startsWith("https://") ? host : `https://${host}`;
  }
  return "http://localhost:3000";
}

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/suivi");
  revalidatePath("/mes-commandes");
  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${orderId}`);
}

/** Mot de passe inscription : doit dépasser 6 caractères (minimum 7). */
function isSignupPasswordTooShort(password: string): boolean {
  return password.length <= 6;
}

export async function signUpCustomerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "");
  const lastName = String(formData.get("last_name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const city = String(formData.get("city") ?? "");
  const district = String(formData.get("district") ?? "");

  if (!email || !password || !firstName || !lastName || !phone || !city || !district) {
    redirect("/inscription-client?error=champs");
  }

  if (isSignupPasswordTooShort(password)) {
    redirect("/inscription-client?error=motdepasse");
  }

  /**
   * `sector` n'est plus collecté à l'inscription. Le trigger SQL
   * `handle_new_user` met automatiquement la valeur de fallback "N/A"
   * grâce au `coalesce` sur la metadata absente.
   */
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "customer",
        first_name: firstName,
        last_name: lastName,
        phone,
        city,
        district,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("password") && (msg.includes("short") || msg.includes("least") || msg.includes("6"))) {
      redirect("/inscription-client?error=motdepasse");
    }
    redirect(`/inscription-client?error=${encodeURIComponent("signup")}`);
  }

  redirect("/connexion?inscription=ok");
}

/** Limite par fichier (en octets) pour l'upload d'une photo livreur. */
const DRIVER_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Sélectionne une extension fichier sûre à partir du MIME type d'une image.
 * La liste est volontairement alignée sur `allowed_mime_types` du bucket
 * Supabase `media` (cf. migration `20260510_categories_and_media_bucket.sql`)
 * pour éviter qu'un format accepté côté serveur soit rejeté par Storage.
 * HEIC/HEIF (photos iPhone par défaut) ne sont pas supportés.
 */
function imageExtensionFor(file: File): string | null {
  const mime = file.type.toLowerCase();
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return null;
}

/** Vérifie qu'une entrée FormData est bien un fichier image valide pour le profil livreur. */
function ensureValidDriverImage(raw: FormDataEntryValue | null): { file: File; ext: string } | { error: "files" | "invalid_image" | "too_large" } {
  if (!(raw instanceof File) || raw.size === 0) {
    return { error: "files" };
  }
  const ext = imageExtensionFor(raw);
  if (!ext) {
    return { error: "invalid_image" };
  }
  if (raw.size > DRIVER_UPLOAD_MAX_BYTES) {
    return { error: "too_large" };
  }
  return { file: raw, ext };
}

export async function signUpDriverAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();

  if (!email || !password || !firstName || !lastName || !phone || !city || !district) {
    redirect("/inscription-livreur?error=champs");
  }

  if (isSignupPasswordTooShort(password)) {
    redirect("/inscription-livreur?error=motdepasse");
  }

  /** Validation des 3 photos obligatoires (avatar + CNIB recto/verso). */
  const avatarCheck = ensureValidDriverImage(formData.get("avatar"));
  const cniFrontCheck = ensureValidDriverImage(formData.get("cni_front"));
  const cniBackCheck = ensureValidDriverImage(formData.get("cni_back"));

  for (const c of [avatarCheck, cniFrontCheck, cniBackCheck] as const) {
    if ("error" in c) {
      redirect(`/inscription-livreur?error=${c.error}`);
    }
  }

  const avatar = avatarCheck as { file: File; ext: string };
  const cniFront = cniFrontCheck as { file: File; ext: string };
  const cniBack = cniBackCheck as { file: File; ext: string };

  /**
   * `sector` n'est plus demandé au livreur — le trigger SQL pose la valeur
   * de fallback "N/A" via `coalesce`.
   */
  const supabase = await getSupabaseServerClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "driver",
        first_name: firstName,
        last_name: lastName,
        phone,
        city,
        district,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      redirect("/inscription-livreur?error=email_exists");
    }
    redirect("/inscription-livreur?error=signup");
  }

  const userId: string | undefined = signUpData?.user?.id;
  if (!userId) {
    redirect("/inscription-livreur?error=signup");
  }
  /** À ce stade `userId` est garanti défini par le redirect ci-dessus. */
  const driverUserId: string = userId;

  /**
   * On essaie d'abord d'utiliser le client service-role pour les uploads et
   * les `update`. S'il n'est pas disponible (clé manquante), on bascule sur
   * la session du livreur qui vient d'être ouverte par `signUp` (cookies
   * posés). Les politiques RLS du bucket `media` doivent autoriser un user
   * authentifié à écrire dans `drivers/{user_id}/...`.
   */
  let admin: ReturnType<typeof getSupabaseAdminClient> | null = null;
  try {
    admin = getSupabaseAdminClient();
  } catch {
    admin = null;
  }
  const writer = admin ?? supabase;

  /**
   * Helper de rollback : si l'upload ou la mise à jour échoue, on essaie de
   * supprimer le compte Auth tout juste créé pour ne pas laisser un orphelin.
   * - Avec le client admin : `auth.admin.deleteUser` direct.
   * - Sans : on signe simplement out (l'admin pourra nettoyer manuellement,
   *   ou le livreur pourra retenter l'inscription après libération du mail).
   */
  async function rollback(): Promise<void> {
    if (admin) {
      await admin.auth.admin.deleteUser(driverUserId).catch(() => undefined);
      return;
    }
    await supabase.auth.signOut().catch(() => undefined);
  }

  const folder = `drivers/${driverUserId}`;
  const avatarPath = `${folder}/avatar.${avatar.ext}`;
  const cniFrontPath = `${folder}/cni-recto.${cniFront.ext}`;
  const cniBackPath = `${folder}/cni-verso.${cniBack.ext}`;

  async function upload(path: string, file: File) {
    return writer.storage.from("media").upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
  }

  const [a, f, b] = await Promise.all([
    upload(avatarPath, avatar.file),
    upload(cniFrontPath, cniFront.file),
    upload(cniBackPath, cniBack.file),
  ]);

  if (a.error || f.error || b.error) {
    /**
     * Trace l'erreur côté serveur pour aider au diagnostic — un échec de
     * Storage est typiquement dû à un bucket manquant ou à des politiques RLS
     * qui n'autorisent pas l'écriture dans `drivers/{userId}/...`.
     */
    console.error("[signUpDriverAction] upload failed", {
      avatar: a.error?.message,
      cniFront: f.error?.message,
      cniBack: b.error?.message,
    });
    await rollback();
    redirect("/inscription-livreur?error=upload");
  }

  const avatarUrl = writer.storage.from("media").getPublicUrl(avatarPath).data.publicUrl;
  const cniFrontUrl = writer.storage.from("media").getPublicUrl(cniFrontPath).data.publicUrl;
  const cniBackUrl = writer.storage.from("media").getPublicUrl(cniBackPath).data.publicUrl;

  /**
   * Le trigger `handle_new_user` a déjà créé `user_profiles` et `driver_profiles`,
   * il ne reste plus qu'à enregistrer les URLs.
   */
  const [profileUpd, driverUpd] = await Promise.all([
    writer.from("user_profiles").update({ avatar_url: avatarUrl }).eq("id", driverUserId),
    writer
      .from("driver_profiles")
      .update({ id_card_front_url: cniFrontUrl, id_card_back_url: cniBackUrl })
      .eq("user_id", driverUserId),
  ]);

  if (profileUpd.error || driverUpd.error) {
    console.error("[signUpDriverAction] profile update failed", {
      profile: profileUpd.error?.message,
      driver: driverUpd.error?.message,
    });
    await rollback();
    redirect("/inscription-livreur?error=upload");
  }

  redirect("/connexion?livreur=pending");
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    redirect("/connexion?configuration=supabase");
  }

  const next = safeInternalPath(formData.get("next"));
  const nextQs = next ? `&next=${encodeURIComponent(next)}` : "";

  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      redirect(`/connexion?error=invalid_credentials${nextQs}`);
    }
    redirect(`/connexion?error=auth${nextQs}`);
  }

  if (next) {
    redirect(next);
  }

  /** Aiguillage par rôle quand aucune destination explicite n'est fournie. */
  const userId = signInData?.user?.id;
  if (userId) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    const role = profile?.role;
    if (role === "driver") {
      redirect("/livreur");
    }
    if (role === "admin" || role === "super_admin") {
      redirect("/admin");
    }
  }

  redirect("/produits");
}

export async function requestPasswordResetAction(formData: FormData) {
  const raw = String(formData.get("email") ?? "");
  const email = raw.trim().toLowerCase();
  if (!email) {
    redirect("/mot-de-passe-oublie?error=champs");
  }

  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    redirect("/connexion?configuration=supabase");
  }

  const siteUrl = getPublicSiteUrl();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/mise-a-jour-mot-de-passe`,
  });

  redirect("/mot-de-passe-oublie?envoye=1");
}

export async function signOutAction() {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    redirect("/");
  }
  await supabase.auth.signOut();
  redirect("/");
}

export async function addToFavoritesAction(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "");
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  if (!productId) {
    throw new Error("Produit invalide.");
  }

  const { error } = await supabase.from("favorites").upsert({
    user_id: userId,
    product_id: productId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/produits");
  revalidatePath("/panier");
}

/** Fusionne le panier invité (localStorage) dans `carts` après connexion client. */
export async function mergeGuestCartToDbAction(lines: { product_id: string; quantity: number }[]) {
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    throw new Error("Non connecte.");
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", userId).maybeSingle();
  if (profile?.role !== "customer") {
    return;
  }

  const mergedQty = new Map<string, number>();
  for (const line of lines) {
    if (!UUID_RE.test(line.product_id) || !Number.isFinite(line.quantity) || line.quantity <= 0) {
      continue;
    }
    const q = Math.min(Math.floor(line.quantity), 999);
    mergedQty.set(line.product_id, (mergedQty.get(line.product_id) ?? 0) + q);
  }

  const ids = [...mergedQty.keys()];
  if (!ids.length) {
    return;
  }

  const { data: existing } = await supabase
    .from("carts")
    .select("product_id, quantity")
    .eq("user_id", userId)
    .in("product_id", ids);

  const existingMap = new Map((existing ?? []).map((r) => [r.product_id, r.quantity]));

  const upserts = ids.map((product_id) => ({
    user_id: userId,
    product_id,
    quantity: (existingMap.get(product_id) ?? 0) + (mergedQty.get(product_id) ?? 0),
  }));

  const { error } = await supabase.from("carts").upsert(upserts, { onConflict: "user_id,product_id" });
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/panier");
  revalidatePath("/produits");
}

export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Donnees panier invalides.");
  }

  const { data: existingRow, error: selectError } = await supabase
    .from("carts")
    .select("quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  const nextQuantity = (existingRow?.quantity ?? 0) + quantity;

  const { error } = await supabase.from("carts").upsert(
    {
      user_id: userId,
      product_id: productId,
      quantity: nextQuantity,
    },
    { onConflict: "user_id,product_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/produits");
  revalidatePath(`/produits/${productId}`);
  revalidatePath("/panier");
}

export async function createOrderFromCartAction(formData: FormData) {
  const paymentMethod = "cod" as const;
  const city = String(formData.get("city") ?? "");
  const district = String(formData.get("district") ?? "");
  const sector = String(formData.get("sector") ?? "");
  const deliveryAddress = String(formData.get("delivery_address") ?? "");

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  const { data: cartRows, error: cartError } = await supabase
    .from("carts")
    .select("product_id, quantity")
    .eq("user_id", userId);

  if (cartError) {
    throw new Error(cartError.message);
  }

  const cartItems = cartRows ?? [];
  if (!cartItems.length) {
    throw new Error("Panier vide.");
  }

  const productIds = cartItems.map((row) => row.product_id);
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, name, price_cfa, shop_id, is_heavy")
    .in("id", productIds);

  if (productsError) {
    throw new Error(productsError.message);
  }

  const productMap = new Map((productsData ?? []).map((product) => [product.id, product]));
  const subtotal = cartItems.reduce((sum, row) => {
    const product = productMap.get(row.product_id);
    if (!product) {
      return sum;
    }
    return sum + row.quantity * product.price_cfa;
  }, 0);

  const hasHeavyItems = cartHasHeavyProduct(productsData ?? []);
  const delivery = computeCartDelivery(hasHeavyItems, cartItems.length);
  const total = computeOrderTotal(subtotal, delivery.deliveryFeeCfa, 0);

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: userId,
      payment_method: paymentMethod,
      subtotal_cfa: subtotal,
      total_cfa: total,
      delivery_fee_cfa: delivery.deliveryFeeCfa,
      discount_cfa: 0,
      has_heavy_items: hasHeavyItems,
      delivery_secret_code: generateDeliverySecretCode(),
      city,
      district,
      sector,
      delivery_address: deliveryAddress,
      order_status: hasHeavyItems ? "validated" : "awaiting_driver",
    })
    .select("id")
    .single();

  if (orderError || !orderData) {
    throw new Error(orderError?.message ?? "Creation de commande impossible.");
  }

  const itemRows = cartItems
    .map((row) => {
      const product = productMap.get(row.product_id);
      if (!product) {
        return null;
      }

      return {
        order_id: orderData.id,
        product_id: row.product_id,
        product_name: product.name,
        shop_id: product.shop_id,
        quantity: row.quantity,
        unit_price_cfa: product.price_cfa,
        total_price_cfa: row.quantity * product.price_cfa,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (!itemRows.length) {
    throw new Error("Aucun article valide dans le panier.");
  }

  const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const { error: clearError } = await supabase.from("carts").delete().eq("user_id", userId);
  if (clearError) {
    throw new Error(clearError.message);
  }

  revalidatePath("/produits");
  revalidatePath("/panier");
  revalidateOrderPaths(orderData.id);
  redirect("/suivi");
}

export async function updateCartItemQuantityAction(formData: FormData) {
  const cartId = String(formData.get("cart_id") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  if (!cartId || !Number.isFinite(quantity)) {
    throw new Error("Mise a jour panier invalide.");
  }

  if (quantity <= 0) {
    const { error } = await supabase.from("carts").delete().eq("id", cartId).eq("user_id", userId);
    if (error) {
      throw new Error(error.message);
    }
    revalidatePath("/panier");
    return;
  }

  const { error } = await supabase
    .from("carts")
    .update({ quantity })
    .eq("id", cartId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/panier");
}

export async function removeFromCartAction(formData: FormData) {
  const cartId = String(formData.get("cart_id") ?? "");
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  if (!cartId) {
    throw new Error("Element panier invalide.");
  }

  const { error } = await supabase.from("carts").delete().eq("id", cartId).eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/panier");
}

export async function updateDriverAvailabilityAction(formData: FormData) {
  const isAvailable = String(formData.get("is_available") ?? "false") === "true";
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  const { error } = await supabase
    .from("driver_profiles")
    .update({ is_available: isAvailable })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/livreur");
  revalidatePath("/livreur/taches");
}

export async function acceptDeliveryTaskAction(formData: FormData) {
  const orderId = String(formData.get("order_id") ?? "");
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  if (!orderId) {
    throw new Error("Commande invalide.");
  }

  const { data: driverProfile, error: driverError } = await supabase
    .from("driver_profiles")
    .select("review_status, is_available")
    .eq("user_id", userId)
    .single();

  if (driverError || !driverProfile) {
    throw new Error("Profil livreur introuvable.");
  }
  if (driverProfile.review_status !== "approved") {
    throw new Error("Votre compte livreur n'est pas encore approuve.");
  }
  if (!driverProfile.is_available) {
    throw new Error("Vous devez etre disponible pour accepter une livraison.");
  }

  /**
   * Une fois le code secret validé (status = secret_validated), la course est considérée
   * terminée côté livreur et bascule en historique. Il peut donc accepter une nouvelle
   * tâche immédiatement, même si le client n'a pas encore confirmé la réception.
   */
  const { data: activeOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("driver_id", userId)
    .in("order_status", ["accepted_by_driver", "picked_up", "in_delivery", "delivery_declared"])
    .limit(1);

  if ((activeOrder ?? []).length > 0) {
    throw new Error("Vous avez deja une tache en cours.");
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      driver_id: userId,
      order_status: "accepted_by_driver",
      estimated_delivery_min: 30,
      estimated_delivery_max: 60,
    })
    .eq("id", orderId)
    .eq("order_status", "awaiting_driver")
    .is("driver_id", null)
    .select("id")
    .single();

  if (updateError || !updatedOrder) {
    throw new Error("Cette tache a deja ete acceptee par un autre livreur.");
  }

  revalidatePath("/livreur");
  revalidatePath("/livreur/taches");
  revalidatePath("/livreur/en-cours");
  revalidateOrderPaths(orderId);
  redirect("/livreur/en-cours");
}

export async function markPickedUpAction(formData: FormData) {
  await updateDriverOrderStatus(formData, "accepted_by_driver", "picked_up");
}

export async function markInDeliveryAction(formData: FormData) {
  await updateDriverOrderStatus(formData, "picked_up", "in_delivery");
}

export async function declareDeliveryAction(formData: FormData) {
  await updateDriverOrderStatus(formData, "in_delivery", "delivery_declared");
}

export async function validateDeliverySecretAction(formData: FormData) {
  const orderId = String(formData.get("order_id") ?? "");
  const secretCode = String(formData.get("secret_code") ?? "");
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  const entered = digitsOnlyDeliveryCode(secretCode);
  if (!orderId || !entered) {
    redirect("/livreur/en-cours?code=missing");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, delivery_secret_code, order_status")
    .eq("id", orderId)
    .eq("driver_id", userId)
    .single();

  if (orderError || !order) {
    redirect("/livreur/en-cours?code=not_found");
  }

  if (order.order_status !== "delivery_declared") {
    redirect("/livreur/en-cours?code=wrong_step");
  }

  const stored = digitsOnlyDeliveryCode(order.delivery_secret_code);
  if (entered !== stored) {
    redirect("/livreur/en-cours?code=invalid");
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ order_status: "secret_validated", delivery_secret_validated: true })
    .eq("id", orderId)
    .eq("driver_id", userId);

  if (updateError) {
    redirect(`/livreur/en-cours?code=server_error`);
  }

  revalidatePath("/livreur");
  revalidatePath("/livreur/taches");
  revalidatePath("/livreur/en-cours");
  revalidatePath("/livreur/historique");
  revalidateOrderPaths(orderId);
  redirect("/livreur?ok=delivery_validated");
}

export async function confirmOrderReceivedAction(formData: FormData) {
  const orderId = String(formData.get("order_id") ?? "");
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  if (!orderId) {
    throw new Error("Commande invalide.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ order_status: "delivered" })
    .eq("id", orderId)
    .eq("customer_id", userId)
    .in("order_status", ["secret_validated", "delivery_declared"]);

  if (error) {
    throw new Error(error.message);
  }

  revalidateOrderPaths(orderId);
  revalidatePath("/livreur/en-cours");
}

export async function reportOrderIssueAction(formData: FormData) {
  const orderId = String(formData.get("order_id") ?? "");
  const customerMessage = String(formData.get("message") ?? "");
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  if (!orderId) {
    throw new Error("Commande invalide.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_status")
    .eq("id", orderId)
    .eq("customer_id", userId)
    .single();

  if (orderError || !order) {
    throw new Error("Commande introuvable.");
  }

  if (!["secret_validated", "delivery_declared", "in_delivery"].includes(order.order_status)) {
    throw new Error("Cette commande ne peut pas etre signalee comme problematique a cette etape.");
  }

  const { error: statusError } = await supabase
    .from("orders")
    .update({ order_status: "problematic" })
    .eq("id", orderId)
    .eq("customer_id", userId);

  if (statusError) {
    throw new Error(statusError.message);
  }

  const ticketMessage =
    customerMessage.trim() || "Le client signale un probleme de reception apres la phase de livraison.";

  const { error: ticketError } = await supabase.from("support_tickets").insert({
    user_id: userId,
    order_id: orderId,
    subject: "Probleme de livraison signale par le client",
    message: ticketMessage,
    status: "open",
  });

  if (ticketError) {
    throw new Error(ticketError.message);
  }

  revalidateOrderPaths(orderId);
}

async function updateDriverOrderStatus(
  formData: FormData,
  expectedStatus: "accepted_by_driver" | "picked_up" | "in_delivery",
  nextStatus: "picked_up" | "in_delivery" | "delivery_declared",
) {
  const orderId = String(formData.get("order_id") ?? "");
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    redirect("/connexion");
  }

  if (!orderId) {
    throw new Error("Commande invalide.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ order_status: nextStatus })
    .eq("id", orderId)
    .eq("driver_id", userId)
    .eq("order_status", expectedStatus);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/livreur/en-cours");
  revalidateOrderPaths(orderId);
}
