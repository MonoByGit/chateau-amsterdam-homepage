// One-time worksheet generator for Task 9 of
// docs/superpowers/plans/2026-07-21-shopify-wine-catalog-mirror.md.
// Prints, per existing hand-authored CMS wine, exactly which Shopify
// metafield to paste which text into — there's no Admin API write token
// configured, so this is a copy-paste worksheet, not an automated migration.
import "./load-env";
import { listWines } from "../lib/db/wines";

async function main() {
  const wines = await listWines({});
  for (const wine of wines) {
    console.log(`\n=== ${wine.name} (shopify handle: ${wine.shopifyHandle}) ===`);
    console.log(`Open: https://admin.shopify.com/store/chateau-amsterdam-winery/products?query=${encodeURIComponent(wine.shopifyHandle)}`);
    console.log(`custom.oneliner (NL):        ${wine.tagNl}`);
    console.log(`custom.oneliner (EN):        ${wine.tagEn} -- pick ONE language for oneliner, see note below`);
    console.log(`custom.wine_profile:         ${wine.descriptionNl ?? "(none)"}`);
    console.log(`specs.grape_variety:         ${wine.grapes ?? "(none)"}`);
    console.log(`specs.region_of_origin:      ${wine.regionNl ?? "(none)"}`);
    console.log(`custom.pairing:              ${wine.foodPairingNl ?? "(none)"}`);
    console.log(`Vintage/ABV/farming/vinification have no Shopify field yet: ${wine.vintage ?? "-"} / ${wine.abv ?? "-"} / ${wine.farmingMethodNl ?? "-"} / ${wine.vinificationNl ?? "-"}`);
  }
  console.log(
    "\nNote: Shopify metafields hold one value, not a NL/EN pair — languages come from Shopify's own translation layer " +
    "(Instellingen > Talen), which already has NL and EN published. Paste the NL text into the field, then use " +
    "Shopify's translate-and-adapt flow (or the 'Vertalen' entry point on the product) to add the EN text as that " +
    "field's translation, the same way product titles are already translated."
  );
}

main();
