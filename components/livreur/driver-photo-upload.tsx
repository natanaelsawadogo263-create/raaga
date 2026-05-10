"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { CreditCard, ImagePlus, RotateCcw, UploadCloud, UserCircle2, X } from "lucide-react";

type Variant = "avatar" | "id-front" | "id-back";

type Props = {
  /** Identifiant du `<input type="file">` */
  id: string;
  /** Nom du champ envoyé dans FormData (lu côté server action). */
  name: string;
  label: string;
  hint?: string;
  variant?: Variant;
  /** Taille max acceptée côté client (Mo). */
  maxSizeMb?: number;
  required?: boolean;
};

const ACCEPTED_MIME = "image/jpeg,image/png,image/webp";

const variantConfig: Record<
  Variant,
  {
    placeholderIcon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
    aspect: string;
    rounded: string;
  }
> = {
  avatar: {
    placeholderIcon: UserCircle2,
    aspect: "aspect-square",
    rounded: "rounded-3xl",
  },
  "id-front": {
    placeholderIcon: CreditCard,
    aspect: "aspect-[1.6/1]",
    rounded: "rounded-2xl",
  },
  "id-back": {
    placeholderIcon: CreditCard,
    aspect: "aspect-[1.6/1]",
    rounded: "rounded-2xl",
  },
};

export function DriverPhotoUpload({
  id,
  name,
  label,
  hint,
  variant = "avatar",
  maxSizeMb = 5,
  required = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const cfg = variantConfig[variant];
  const PlaceholderIcon = cfg.placeholderIcon;

  function handleFiles(file: File | null | undefined) {
    if (!file) {
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type.toLowerCase())) {
      setError("Format non supporté. Utilisez JPG, PNG ou WebP (HEIC iPhone non accepté).");
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > maxSizeMb) {
      setError(`Image trop lourde — limite ${maxSizeMb} Mo.`);
      return;
    }
    setError(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  }

  function clear() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-center justify-between gap-2 text-xs font-bold text-foreground">
        <span>
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </span>
        {preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-[#FF7A00] hover:bg-orange-50"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2.25} aria-hidden />
            Changer
          </button>
        ) : null}
      </label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`group relative flex w-full ${cfg.aspect} ${cfg.rounded} overflow-hidden border-2 border-dashed transition ${
          preview
            ? "border-emerald-300 bg-emerald-50/40"
            : error
              ? "border-rose-300 bg-rose-50/40"
              : "border-slate-300 bg-slate-50 hover:border-[#FF7A00] hover:bg-orange-50/40"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/30`}
        aria-describedby={hint ? `${id}-hint` : undefined}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt=""
              fill
              sizes="(min-width:640px) 280px, 100vw"
              className="object-cover"
              unoptimized
            />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-[11px] font-bold text-white">
              <span className="truncate">{fileName ?? "Photo prête"}</span>
              <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                ✓ Sélectionnée
              </span>
            </span>
            <span
              role="button"
              tabIndex={0}
              aria-label="Retirer la photo"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  clear();
                }
              }}
              className="absolute right-2 top-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-md transition hover:bg-rose-50 hover:text-rose-700"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            </span>
          </>
        ) : (
          <span className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#FF7A00] shadow-sm ring-1 ring-orange-200 transition group-hover:scale-105">
              {variant === "avatar" ? (
                <PlaceholderIcon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              ) : (
                <ImagePlus className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              )}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-800">
              <UploadCloud className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} aria-hidden />
              Cliquer pour téléverser
            </span>
            <span className="text-[10.5px] font-medium text-slate-500">
              JPG, PNG ou WebP — max {maxSizeMb} Mo
            </span>
          </span>
        )}
      </button>

      {hint ? (
        <p id={`${id}-hint`} className="text-[11px] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-[11px] font-bold text-rose-600">{error}</p>
      ) : null}

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={ACCEPTED_MIME}
        required={required}
        onChange={(e) => handleFiles(e.target.files?.[0])}
        className="sr-only"
      />
    </div>
  );
}
