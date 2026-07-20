import "./load-env";
import { getWineBySlug, updateWine } from "@/lib/db/wines";

// "Riesling × Moscatel" and "Piquette d'Amsterdam" were placeholder wines
// invented before the Shopify catalog existed — no product with those
// names has ever existed in the shop, so they always fell back to a
// generic stock photo. Swapped in for two real products that are actually
// in the current webshop; the slug (URL) stays put on purpose, see
// lib/db/wines.ts's "does not change the slug when the wine is later
// renamed" behavior.
const FIXES = [
  {
    slug: "riesling-moscatel",
    name: "Sweet Moscatel",
    shopifyHandle: "moscatel-es-22",
    tagNl: "de zoete verleiding",
    tagEn: "the sweet one",
    metaNl: "Wit · Zoet, Moscatel ES",
    metaEn: "White · Sweet, Moscatel ES",
  },
  {
    slug: "piquette-d-amsterdam",
    name: "Pétillant Naturel",
    shopifyHandle: "trebbiano-pet-nat-24",
    tagNl: "natuurlijke mousse",
    tagEn: "naturally sparkling",
    metaNl: "Sprankel · Pét-Nat, Trebbiano IT",
    metaEn: "Sparkling · Pét-Nat, Trebbiano IT",
  },
];

async function main() {
  for (const fix of FIXES) {
    const wine = await getWineBySlug(fix.slug);
    if (!wine) {
      console.log(`[fix-wine-shopify-links] no wine found for slug "${fix.slug}", skipping`);
      continue;
    }
    await updateWine(wine.id, {
      name: fix.name,
      shopifyHandle: fix.shopifyHandle,
      tagNl: fix.tagNl,
      tagEn: fix.tagEn,
      metaNl: fix.metaNl,
      metaEn: fix.metaEn,
    });
    console.log(`[fix-wine-shopify-links] ${fix.slug} -> ${fix.shopifyHandle} (${fix.name})`);
  }
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
