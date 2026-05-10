export function parseAdminFlash(searchParams: Record<string, string | string[] | undefined>): {
  ok?: string;
  error?: string;
} {
  const okKey = typeof searchParams.ok === "string" ? searchParams.ok : undefined;
  const errRaw = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const ERR_MAP: Record<string, string> = {
    champs: "Vérifiez les champs obligatoires.",
    nombres: "Montants ou quantités invalides.",
    id: "Identifiant invalide.",
    image: "URL d’image invalide.",
    adresse: "Adresse de livraison incomplète.",
    article: "Article ou commande invalide.",
    ligne: "Ligne de commande introuvable.",
    produit: "Produit introuvable.",
    confirm: "La confirmation a été annulée. La commande n'a pas été supprimée.",
    order_already_gone:
      "Cette commande n'existe plus (déjà supprimée par un autre admin, ou identifiant invalide).",
    refus: "Action refusée (ex. catégorie système « Autres »).",
    motdepasse: "Le mot de passe doit contenir au moins 8 caractères.",
    motdepasse_match: "Les mots de passe ne correspondent pas.",
    boutique_produits: "Impossible de supprimer : des produits sont encore rattachés à cette boutique.",
    service_auth:
      "Clé serveur Supabase manquante (SUPABASE_SERVICE_ROLE_KEY). Création ou suppression de compte impossible depuis l’admin.",
    email: "Adresse e-mail invalide.",
    creation: "La création du compte a échoué.",
    client_commandes: "Impossible de supprimer : ce client a des commandes.",
    driver_courses_actives:
      "Impossible de supprimer : ce livreur a des courses en cours. Faites-les terminer ou réassigner d'abord.",
  };

  let error: string | undefined;
  if (errRaw) {
    if (ERR_MAP[errRaw]) {
      error = ERR_MAP[errRaw];
    } else {
      try {
        error = decodeURIComponent(errRaw);
      } catch {
        error = errRaw;
      }
    }
  }

  const OK_MAP: Record<string, string> = {
    created: "Produit créé.",
    updated: "Produit enregistré.",
    desactive: "Produit désactivé (il a déjà été commandé).",
    supprime: "Produit supprimé.",
    image: "Image ajoutée.",
    image_del: "Image retirée.",
    image_primary: "Image principale mise à jour.",
    maj: "Commande mise à jour.",
    article: "Article ajouté à la commande.",
    ligne: "Ligne mise à jour.",
    ligne_suppr: "Ligne retirée de la commande.",
    supprimee: "Commande supprimée définitivement.",
    cat_created: "Catégorie créée.",
    cat_updated: "Catégorie enregistrée.",
    cat_supprime: "Catégorie supprimée.",
    boutique_supprime: "Boutique supprimée.",
    client_created: "Client créé.",
    client_updated: "Client enregistré.",
    client_deleted: "Client supprimé.",
    driver_approved: "Livreur approuvé.",
    driver_rejected: "Livreur refusé / suspendu.",
    driver_reset: "Livreur remis en attente de validation.",
    driver_disponibilite: "Disponibilité du livreur mise à jour.",
    driver_desactive: "Compte livreur désactivé.",
    driver_reactive: "Compte livreur réactivé.",
  };

  /**
   * Codes inconnus : on retourne `undefined` plutôt que d'afficher la clé brute
   * (sinon on voit des messages techniques type `driver_deleted_soft` côté UI).
   */
  return {
    ok: okKey && OK_MAP[okKey] ? OK_MAP[okKey] : undefined,
    error,
  };
}
