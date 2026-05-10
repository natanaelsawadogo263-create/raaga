/** Slug URL sûr à partir d’un libellé (sans accents, minuscules, tirets). */
export function slugifyLabel(input: string): string {
  const s = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.length > 0 ? s : "categorie";
}
