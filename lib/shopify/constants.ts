// lib/shopify/constants.ts
// Split out from client.ts (which holds shopifyFetch and reads
// SHOPIFY_STOREFRONT_TOKEN) so client components can reference this error
// string without pulling the token-handling fetch wrapper into the browser
// bundle — cso flagged the prior single-file setup as a client/server
// boundary smell, even though Next's env inlining meant the token itself
// never actually reached the browser.
export const SHOPIFY_NOT_CONFIGURED_ERROR = "shopify_not_configured";
