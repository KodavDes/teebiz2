import {
  getProductBySlug,
  getVariant,
  type CatalogProduct,
  type CatalogVariant,
} from "./catalog";
import { normalizePublicFileUrl } from "./files";

export type CheckoutSelection = {
  productId: string;
  colorId: string;
  sizeId: string;
  designUrl: string;
  quantity?: number;
};

export type PricedCheckout = {
  product: CatalogProduct;
  variant: CatalogVariant;
  quantity: number;
  unitAmountCents: number;
  designUrl: string;
};

export function priceCheckout(selection: CheckoutSelection): PricedCheckout {
  const product = getProductBySlug(selection.productId);
  if (!product) {
    throw new Error("Unknown product");
  }

  const variant = getVariant(product, selection.colorId, selection.sizeId);
  if (!variant) {
    throw new Error("Invalid color/size combination");
  }

  const designUrl = normalizePublicFileUrl(selection.designUrl);

  const quantity = Math.max(1, Math.min(20, selection.quantity ?? 1));

  return {
    product,
    variant,
    quantity,
    unitAmountCents: variant.priceCents,
    designUrl,
  };
}
