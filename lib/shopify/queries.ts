// lib/shopify/queries.ts
// Shopify Storefront API GraphQL documents. Written and typed against Shopify's
// public, documented Storefront schema — no store-specific token is needed to
// author or type-check these, only to actually execute them (see client.ts).

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { url altText }
            product { title }
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            price { amount currencyCode }
          }
        }
      }
    }
  }
`;

export const PRODUCT_IMAGE_BY_HANDLE_QUERY = `
  query ProductImageByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      featuredImage { url altText }
    }
  }
`;

// Shared field selection for both wine queries below — every field the
// wine-catalog mapper (lib/wines/catalog.ts) needs to build a card or a
// detail page. $identifiers is WINE_METAFIELD_IDENTIFIERS
// (lib/shopify/wine-fields.ts), passed as a variable so the field list
// lives in exactly one place.
const WINE_PRODUCT_FIELDS = `
  id
  handle
  title
  productType
  descriptionHtml
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  metafields(identifiers: $identifiers) { key value }
`;

export const WINE_COLLECTION_QUERY = `
  query WineCollection($handle: String!, $language: LanguageCode, $identifiers: [HasMetafieldsIdentifier!]!)
  @inContext(language: $language) {
    collectionByHandle(handle: $handle) {
      products(first: 100, sortKey: COLLECTION_DEFAULT) {
        edges {
          node {
            ${WINE_PRODUCT_FIELDS}
          }
        }
      }
    }
  }
`;

export const WINE_BY_HANDLE_QUERY = `
  query WineByHandle($handle: String!, $language: LanguageCode, $identifiers: [HasMetafieldsIdentifier!]!)
  @inContext(language: $language) {
    productByHandle(handle: $handle) {
      ${WINE_PRODUCT_FIELDS}
    }
  }
`;

export const CART_QUERY = `
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FIELDS}
    }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;
