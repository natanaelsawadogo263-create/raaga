/** Code à 4 chiffres (1000–9999), communiqué au client et saisi par le livreur pour valider la remise. */
export function generateDeliverySecretCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Garde uniquement les chiffres pour comparer le code saisi au code stocké. */
export function digitsOnlyDeliveryCode(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function computeOrderTotal(subtotalCfa: number, deliveryFeeCfa = 1000, discountCfa = 0) {
  return Math.max(subtotalCfa + deliveryFeeCfa - discountCfa, 0);
}
