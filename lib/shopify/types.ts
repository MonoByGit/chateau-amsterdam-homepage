// lib/shopify/types.ts
export type ShopifyLanguage = "EN" | "NL";

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyProductImage = {
  url: string;
  altText: string | null;
};

export type ShopifyProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoney;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  variants: ShopifyProductVariant[];
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  variantTitle: string | null;
  price: ShopifyMoney;
  image: { url: string; altText: string | null } | null;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: CartLine[];
};

export type CartActionResult = { ok: true; cart: Cart | null } | { ok: false; error: string };

export type ShopifyWineProduct = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  descriptionHtml: string;
  featuredImage: ShopifyProductImage | null;
  priceRange: { minVariantPrice: ShopifyMoney };
  metafields: ({ key: string; value: string } | null)[];
};
