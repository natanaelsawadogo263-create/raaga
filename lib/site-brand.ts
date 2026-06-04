/** Nom affiché de l'application (marque). */
export const APP_NAME = "fasoraaga";

export const APP_DEFAULT_TITLE = `${APP_NAME} | E-commerce et livraison locale`;

export const APP_DESCRIPTION = `${APP_NAME} est une plateforme e-commerce mobile-first adaptée au Burkina Faso pour commander, payer et suivre vos livraisons.`;

export function pageTitle(page: string): string {
  return `${page} | ${APP_NAME}`;
}

export function adminPageTitle(page: string): string {
  return `${page} | ${APP_NAME} Admin`;
}

export function driverPageTitle(page: string): string {
  return `${page} | ${APP_NAME} Livreur`;
}
