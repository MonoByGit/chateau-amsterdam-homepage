export type WineFormInput = {
  name: string;
  metaNl: string;
  metaEn: string;
  tagNl: string;
  tagEn: string;
  imageId: string | null;
  shopifyHandle: string;
  isActive: boolean;
  showOnHomepage: boolean;
  descriptionNl: string;
  descriptionEn: string;
  grapes: string;
  vintage: string;
  wineTypeNl: string;
  wineTypeEn: string;
  regionNl: string;
  regionEn: string;
  farmingMethodNl: string;
  farmingMethodEn: string;
  vinificationNl: string;
  vinificationEn: string;
  abv: string;
  foodPairingNl: string;
  foodPairingEn: string;
};

export function validateWineInput(input: WineFormInput): string | null {
  if (!input.name.trim()) {
    return "Naam is verplicht.";
  }
  if (!input.shopifyHandle.trim()) {
    return "Shopify handle is verplicht.";
  }
  if (input.abv.trim() && Number.isNaN(Number(input.abv))) {
    return "Alcoholpercentage moet een getal zijn.";
  }
  return null;
}
