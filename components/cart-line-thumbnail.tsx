import Image from "next/image";
import { Package } from "lucide-react";

type CartLineThumbnailProps = {
  imageUrl: string | null;
  alt: string;
  className?: string;
};

export function CartLineThumbnail({ imageUrl, alt, className }: CartLineThumbnailProps) {
  const wrap = className ?? "h-14 w-14 shrink-0 rounded-xl ring-1 ring-orange-100/60";
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-slate-50 to-orange-50/90 shadow-inner ${wrap}`}>
        <Image src={imageUrl} alt={alt} fill className="object-cover" sizes="56px" />
      </div>
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 text-brand shadow-inner ${wrap}`}
    >
      <Package className="h-7 w-7" strokeWidth={1.5} aria-hidden />
    </span>
  );
}
