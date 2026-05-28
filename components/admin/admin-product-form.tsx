import Image from "next/image";
import Link from "next/link";
import {
  addProductImageAction,
  addProductImageFilesAction,
  createProductAction,
  updateProductAction,
} from "@/app/admin/actions/products";
import { AdminProductDeleteForm } from "@/components/admin/admin-product-delete-form";
import { AdminProductImageRowActions } from "@/components/admin/admin-product-image-row-actions";
import type { AdminCategoryOption, AdminShopOption } from "@/lib/admin/data";
import { MAX_PRODUCT_IMAGES } from "@/lib/admin/product-images";
import type { Database } from "@/lib/supabase/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];

const STATUSES: Product["status"][] = ["normal", "promotion", "nouveaute", "best_seller", "rupture"];

const STATUS_LABELS: Record<Product["status"], string> = {
  normal: "Normal",
  promotion: "Promotion",
  nouveaute: "Nouveauté",
  best_seller: "Best-seller",
  rupture: "Rupture",
};

function fieldClass() {
  return "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20";
}

function labelClass() {
  return "block text-xs font-bold text-slate-700";
}

function variantOptionsToTextarea(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }
  const rows: string[] = [];
  for (const [key, rawValues] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(rawValues)) {
      continue;
    }
    const values = rawValues
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);
    if (!key.trim() || !values.length) {
      continue;
    }
    rows.push(`${key.trim()}: ${values.join(", ")}`);
  }
  return rows.join("\n");
}

export function AdminProductForm({
  shops,
  categories,
  product,
  images,
  mode,
  flash,
}: {
  shops: AdminShopOption[];
  categories: AdminCategoryOption[];
  product?: Product;
  images?: ProductImage[];
  mode: "create" | "edit";
  flash?: { ok?: string; error?: string };
}) {
  const isEdit = mode === "edit" && product;

  return (
    <div className="space-y-6">
      {flash?.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{flash.error}</div>
      ) : null}
      {flash?.ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.ok}</div>
      ) : null}

      {shops.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          Aucune boutique disponible. Créez une boutique d’abord.
        </div>
      ) : null}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aucune catégorie.{" "}
          <Link href="/admin/categories/nouveau" className="font-bold underline">
            Créer une catégorie
          </Link>
        </div>
      ) : null}

      <form action={isEdit ? updateProductAction : createProductAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        {isEdit ? <input type="hidden" name="id" value={product.id} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="shop_id">
              Boutique
            </label>
            <select
              id="shop_id"
              name="shop_id"
              required
              className={fieldClass()}
              defaultValue={product?.shop_id ?? ""}
            >
              <option value="">— Choisir —</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="name">
              Nom
            </label>
            <input id="name" name="name" required className={fieldClass()} defaultValue={product?.name ?? ""} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className={fieldClass()}
              defaultValue={product?.description ?? ""}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="variant_options">
              Options du produit (taille, couleur, etc.) - optionnel
            </label>
            <textarea
              id="variant_options"
              name="variant_options"
              rows={3}
              className={fieldClass()}
              placeholder={`Taille: S, M, L\nCouleur: Noir, Rouge`}
              defaultValue={variantOptionsToTextarea(product?.variant_options)}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Une option par ligne au format <span className="font-mono">Nom: valeur1, valeur2</span>.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="category_id">
              Catégorie
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              className={fieldClass()}
              defaultValue={product?.category_id ?? ""}
            >
              <option value="">— Choisir —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {!c.is_active ? " (inactive)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass()} htmlFor="price_cfa">
              Prix (FCFA)
            </label>
            <input
              id="price_cfa"
              name="price_cfa"
              type="number"
              min={0}
              required
              className={fieldClass()}
              defaultValue={product?.price_cfa ?? 0}
            />
          </div>

          <div>
            <label className={labelClass()} htmlFor="compare_at_price_cfa">
              Prix avant promo (FCFA), optionnel
            </label>
            <input
              id="compare_at_price_cfa"
              name="compare_at_price_cfa"
              type="number"
              min={0}
              className={fieldClass()}
              placeholder="Ex. ancien prix barré"
              defaultValue={
                product != null && product.compare_at_price_cfa != null
                  ? String(product.compare_at_price_cfa)
                  : ""
              }
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Visible barré sur le site si supérieur au prix actuel et statut « Promotion ».
            </p>
          </div>

          <div>
            <label className={labelClass()} htmlFor="stock_quantity">
              Stock
            </label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min={0}
              required
              className={fieldClass()}
              defaultValue={product?.stock_quantity ?? 0}
            />
          </div>

          <div>
            <label className={labelClass()} htmlFor="low_stock_threshold">
              Seuil stock faible
            </label>
            <input
              id="low_stock_threshold"
              name="low_stock_threshold"
              type="number"
              min={0}
              required
              className={fieldClass()}
              defaultValue={product?.low_stock_threshold ?? 5}
            />
          </div>

          <div>
            <label className={labelClass()} htmlFor="status">
              Statut affichage
            </label>
            <select id="status" name="status" className={fieldClass()} defaultValue={product?.status ?? "normal"}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 pb-1 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={product?.is_active ?? true}
                className="h-4 w-4 rounded border-slate-300 text-[#FF7A00] focus:ring-[#FF7A00]"
              />
              Produit actif (visible catalogue)
            </label>
            <label className="flex cursor-pointer items-start gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                name="is_heavy"
                defaultChecked={product?.is_heavy === true}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#FF7A00] focus:ring-[#FF7A00]"
              />
              <span>
                Produit poids lourd
                <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                  Livraison spéciale ou retrait — discussion avec le client après commande. Ce n’est pas une catégorie.
                </span>
              </span>
            </label>
          </div>
        </div>

        {!isEdit ? (
          <div className="mt-4 space-y-4">
            <p className="text-xs font-semibold text-slate-600">
              Jusqu’à {MAX_PRODUCT_IMAGES} photos au total (fichiers + URL). La première devient l’image principale du catalogue.
            </p>
            <div>
              <label className={labelClass()} htmlFor="product_images_files">
                Photos du produit (fichiers, plusieurs sélection possibles)
              </label>
              <input
                id="product_images_files"
                name="product_images_files"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#FF7A00]"
              />
            </div>
            <div>
              <label className={labelClass()} htmlFor="image_urls">
                Images par URL (une par ligne, optionnel, max {MAX_PRODUCT_IMAGES} au total avec les fichiers)
              </label>
              <textarea
                id="image_urls"
                name="image_urls"
                rows={3}
                placeholder="https://…"
                className={fieldClass()}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#e66e00]"
          >
            {isEdit ? "Enregistrer" : "Créer le produit"}
          </button>
          <Link
            href="/admin/produits"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>

      {isEdit && product && images ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900">Photos</h2>
            <p className="text-xs font-semibold text-slate-500">
              {images.length} / {MAX_PRODUCT_IMAGES}
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Toutes les photos s’affichent sur la fiche produit du site (galerie). Une image est marquée « principale » pour les listes et le panier.
          </p>
          <ul className="mt-4 space-y-3">
            {images.map((img) => (
              <li
                key={img.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <Image
                      src={img.image_url}
                      alt=""
                      width={80}
                      height={80}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-mono text-slate-600">{img.image_url}</p>
                    {img.is_primary ? (
                      <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#FF7A00]">
                        Principale (catalogue / vignettes)
                      </span>
                    ) : null}
                  </div>
                </div>
                <AdminProductImageRowActions
                  imageId={img.id}
                  productId={product.id}
                  isPrimary={img.is_primary}
                />
              </li>
            ))}
          </ul>

          {images.length >= MAX_PRODUCT_IMAGES ? (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-600">
              Limite de {MAX_PRODUCT_IMAGES} photos atteinte. Retirez une image pour en ajouter d’autres.
            </p>
          ) : (
            <>
              <form action={addProductImageAction} className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
                <input type="hidden" name="product_id" value={product.id} />
                <div className="min-w-0 flex-1">
                  <label className={labelClass()} htmlFor="image_url">
                    Nouvelle URL
                  </label>
                  <input id="image_url" name="image_url" className={fieldClass()} placeholder="https://…" />
                </div>
                <label className="flex shrink-0 items-center gap-2 pb-2 text-xs font-semibold text-slate-700">
                  <input type="checkbox" name="is_primary" className="h-4 w-4 rounded border-slate-300" />
                  Principale
                </label>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Ajouter
                </button>
              </form>

              <form action={addProductImageFilesAction} className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                <input type="hidden" name="product_id" value={product.id} />
                <label className={labelClass()} htmlFor="product_more_files">
                  Ajouter des fichiers (jusqu’à {MAX_PRODUCT_IMAGES - images.length} nouvelle
                  {MAX_PRODUCT_IMAGES - images.length > 1 ? "s" : ""}, limite {MAX_PRODUCT_IMAGES} photos au total)
                </label>
                <input
                  id="product_more_files"
                  name="files"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  required
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#FF7A00]"
                />
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                  <input type="checkbox" name="set_primary" className="h-4 w-4 rounded border-slate-300" />
                  Définir la première image importée comme principale
                </label>
                <button
                  type="submit"
                  className="w-fit rounded-xl bg-[#FF7A00] px-4 py-2 text-sm font-bold text-white hover:bg-[#e66e00]"
                >
                  Envoyer les fichiers
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}

      {isEdit && product ? (
        <AdminProductDeleteForm productId={product.id} productName={product.name} />
      ) : null}
    </div>
  );
}
