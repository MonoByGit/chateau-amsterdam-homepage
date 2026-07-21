import "./load-env";
import { getWineBySlug, updateWine } from "@/lib/db/wines";

// scripts/fix-wine-shopify-links.ts repointed these two wines to real Shopify
// products but left their descriptive content untouched — it was written for
// the old placeholder concepts ("Riesling x Moscatel blend", "piquette made
// from leftover skins"), which don't match what's actually being sold.
// Rewritten from the real Shopify product descriptions (Storefront API,
// checked 2026-07-20). Technical fields we don't have confirmed data for
// (farming method, exact vinification, ABV) are left blank rather than
// guessed — same principle as the bug this fixes.
const FIXES = [
  {
    slug: "riesling-moscatel",
    descriptionNl:
      "Een zoete Moscatel met een frisse citrusgeur en een heldere strogele kleur. De zoetheid krijgt tegenspel van een prettige, gebalanceerde zuurgraad, met iets meer alcohol dan je van een dessertwijn zou verwachten.\n\nGevinifieerd in onze hal in Amsterdam-Noord, net als de rest van de collectie.",
    descriptionEn:
      "A sweet Moscatel with a bright citrus aroma and a clear straw-yellow colour. The sweetness is balanced by a pleasant acidity, with a touch more alcohol than you'd expect from a dessert wine.\n\nVinified in our hall in Amsterdam-Noord, just like the rest of the collection.",
    grapes: "Moscatel",
    vintage: "2022",
    wineTypeNl: "Zoete witte wijn",
    wineTypeEn: "Sweet white wine",
    regionNl: "Druiven uit Spanje, gevinifieerd in Amsterdam-Noord",
    regionEn: "Grapes from Spain, vinified in Amsterdam-Noord",
    abv: null,
    farmingMethodNl: null,
    farmingMethodEn: null,
    vinificationNl: null,
    vinificationEn: null,
    foodPairingNl: "Geitenkaas, witte perzik, of een romig toetje.",
    foodPairingEn: "Goat cheese, white peach, or a creamy dessert.",
  },
  {
    slug: "piquette-d-amsterdam",
    descriptionNl:
      "Een volle, mousserende pét-nat van Trebbiano-druiven, ongefilterd en een onmisbaar aperitief. Zachte citrus- en sinaasappelbloesemgeur, met een subtiele zoutigheid en frisse zuren die om een volgend glas vragen.\n\nHet stijlvolle alternatief voor je vertrouwde cava of prosecco.",
    descriptionEn:
      "A full, sparkling pét-nat made from Trebbiano grapes, unfiltered and an easy aperitif favourite. Soft citrus and orange blossom aromas, with a subtle saltiness and refreshing acidity that keeps you coming back for more.\n\nThe stylish alternative to your usual cava or prosecco.",
    grapes: "Trebbiano",
    vintage: "2024",
    wineTypeNl: "Mousserende pét-nat",
    wineTypeEn: "Sparkling pét-nat",
    regionNl: "Druiven uit Italië, gevinifieerd in Amsterdam-Noord",
    regionEn: "Grapes from Italy, vinified in Amsterdam-Noord",
    abv: null,
    farmingMethodNl: null,
    farmingMethodEn: null,
    vinificationNl: null,
    vinificationEn: null,
    foodPairingNl: "Als aperitief, bij verse oesters, of gewoon zo.",
    foodPairingEn: "As an aperitif, with fresh oysters, or just on its own.",
  },
];

async function main() {
  for (const fix of FIXES) {
    const wine = await getWineBySlug(fix.slug);
    if (!wine) {
      console.log(`[fix-wine-descriptions] no wine found for slug "${fix.slug}", skipping`);
      continue;
    }
    const { slug, ...update } = fix;
    await updateWine(wine.id, update);
    console.log(`[fix-wine-descriptions] ${slug} -> description corrected`);
  }
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
