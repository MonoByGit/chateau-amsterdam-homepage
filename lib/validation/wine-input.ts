export type WineFormInput = {
  name: string;
  metaNl: string;
  metaEn: string;
  tagNl: string;
  tagEn: string;
  imageId: string | null;
  shopifyHandle: string;
  isActive: boolean;
};

export function validateWineInput(input: WineFormInput): string | null {
  if (!input.name.trim()) {
    return "Naam is verplicht.";
  }
  if (!input.shopifyHandle.trim()) {
    return "Shopify handle is verplicht.";
  }
  return null;
}
