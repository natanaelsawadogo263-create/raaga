/** Stockage navigateur du panier pour les visiteurs non connectés (compte client). */

export const GUEST_CART_STORAGE_KEY = "raaga_guest_cart_v1";
export const RAAGA_GUEST_CART_CHANGED = "raaga-guest-cart-changed";

export type GuestCartLine = {
  product_id: string;
  quantity: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function parseGuestCartJson(raw: string | null): GuestCartLine[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const out: GuestCartLine[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") {
        continue;
      }
      const product_id = String((row as GuestCartLine).product_id ?? "");
      const quantity = Number((row as GuestCartLine).quantity);
      if (product_id && Number.isFinite(quantity) && quantity > 0) {
        out.push({ product_id, quantity: Math.floor(quantity) });
      }
    }
    return out;
  } catch {
    return [];
  }
}

export function getGuestCartLines(): GuestCartLine[] {
  if (!isBrowser()) {
    return [];
  }
  return parseGuestCartJson(window.localStorage.getItem(GUEST_CART_STORAGE_KEY));
}

export function setGuestCartLines(lines: GuestCartLine[]): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(RAAGA_GUEST_CART_CHANGED));
}

export function clearGuestCart(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  window.dispatchEvent(new Event(RAAGA_GUEST_CART_CHANGED));
}

/** Additionne les quantités (affichage badge). */
export function guestCartItemCount(): number {
  return getGuestCartLines().reduce((sum, l) => sum + l.quantity, 0);
}

export function addGuestCartLine(productId: string, quantity: number): void {
  if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
    return;
  }
  const q = Math.floor(quantity);
  const lines = getGuestCartLines();
  const idx = lines.findIndex((l) => l.product_id === productId);
  if (idx >= 0) {
    lines[idx] = { product_id: productId, quantity: lines[idx].quantity + q };
  } else {
    lines.push({ product_id: productId, quantity: q });
  }
  setGuestCartLines(lines);
}
