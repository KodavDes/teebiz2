/**
 * Storefront catalog wired to Printful Catalog API variant IDs.
 *
 * Classic tee       → Bella + Canvas 3001 (product 71)
 * Heavyweight hoodie → Gildan 18500 (product 146)
 *
 * Shop color ids map to the closest Printful garment color:
 *   natural → Natural (3001) / Sand (18500)
 *   olive   → Olive (3001) / Military Green (18500)
 *   ink     → Black
 *   bone    → Soft Cream (3001) / White (18500)
 */

export type CatalogColor = {
  id: string;
  name: string;
  hex: string;
};

export type CatalogSize = {
  id: string;
  label: string;
};

export type CatalogVariant = {
  id: string;
  colorId: string;
  sizeId: string;
  /** Printful catalog variant id (color × size) */
  printfulVariantId: number;
  priceCents: number;
};

export type GarmentSilhouette = "tee" | "hoodie";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  printfulProductId: number;
  /** Preview silhouette — must match the Printful blank */
  silhouette: GarmentSilhouette;
  colors: CatalogColor[];
  sizes: CatalogSize[];
  variants: CatalogVariant[];
  /** Fixed print placement for v1 (no drag/resize) */
  printPlacement: {
    position: "front";
    widthInches: number;
  };
};

const SIZES: CatalogSize[] = [
  { id: "s", label: "S" },
  { id: "m", label: "M" },
  { id: "l", label: "L" },
  { id: "xl", label: "XL" },
  { id: "2xl", label: "2XL" },
];

const TEE_COLORS: CatalogColor[] = [
  { id: "olive", name: "Olive", hex: "#5b642f" },
  { id: "natural", name: "Natural", hex: "#fef1d1" },
  { id: "ink", name: "Ink", hex: "#0c0c0c" },
  { id: "bone", name: "Bone", hex: "#e7d4c0" },
];

/** Same palette as garments — used for studio print ink choices */
export const PRINT_COLORS: CatalogColor[] = TEE_COLORS;

type SizeVariantMap = Record<"s" | "m" | "l" | "xl" | "2xl", number>;

/**
 * Bella + Canvas 3001 (Printful product 71) — verified via Catalog API.
 * Keys are shop color ids; values are Printful variant ids by size.
 */
const BELLA_3001_VARIANTS: Record<string, SizeVariantMap> = {
  // Natural
  natural: { s: 14682, m: 14683, l: 14684, xl: 14685, "2xl": 14686 },
  // Olive
  olive: { s: 4121, m: 4122, l: 4123, xl: 4124, "2xl": 4125 },
  // Black (shop label: Ink)
  ink: { s: 4016, m: 4017, l: 4018, xl: 4019, "2xl": 4020 },
  // Soft Cream (shop label: Bone)
  bone: { s: 4151, m: 4152, l: 4153, xl: 4154, "2xl": 4155 },
};

/**
 * Gildan 18500 Unisex Heavy Blend Hoodie (Printful product 146).
 * Closest available colors for the same shop palette.
 */
const GILDAN_18500_VARIANTS: Record<string, SizeVariantMap> = {
  // Sand ≈ Natural
  natural: { s: 12997, m: 12998, l: 12999, xl: 13000, "2xl": 13001 },
  // Military Green ≈ Olive
  olive: { s: 12989, m: 12990, l: 12991, xl: 12992, "2xl": 12993 },
  // Black (shop label: Ink)
  ink: { s: 5530, m: 5531, l: 5532, xl: 5533, "2xl": 5534 },
  // White ≈ Bone
  bone: { s: 5522, m: 5523, l: 5524, xl: 5525, "2xl": 5526 },
};

function buildVariantsFromMap(
  variantMap: Record<string, SizeVariantMap>,
  priceCents: number,
): CatalogVariant[] {
  const variants: CatalogVariant[] = [];
  for (const color of TEE_COLORS) {
    const bySize = variantMap[color.id];
    if (!bySize) {
      throw new Error(`Missing Printful variants for color ${color.id}`);
    }
    for (const size of SIZES) {
      const printfulVariantId = bySize[size.id as keyof SizeVariantMap];
      if (!printfulVariantId) {
        throw new Error(
          `Missing Printful variant for ${color.id} / ${size.id}`,
        );
      }
      variants.push({
        id: `${color.id}-${size.id}`,
        colorId: color.id,
        sizeId: size.id,
        printfulVariantId,
        priceCents,
      });
    }
  }
  return variants;
}

export const DEMO_CATALOG: CatalogProduct[] = [
  {
    id: "classic-tee",
    name: "Classic Soft Tee",
    slug: "classic-tee",
    description:
      "Bella + Canvas 3001 midweight soft tee. Upload your mark — we lock placement and Printful prints on demand.",
    printfulProductId: 71,
    silhouette: "tee",
    colors: TEE_COLORS,
    sizes: SIZES,
    variants: buildVariantsFromMap(BELLA_3001_VARIANTS, 2800),
    printPlacement: { position: "front", widthInches: 10 },
  },
  {
    id: "heavy-hoodie",
    name: "Heavyweight Hoodie",
    slug: "heavy-hoodie",
    description:
      "Gildan 18500 heavy blend hoodie for cooler days. Same upload → checkout → print pipeline.",
    printfulProductId: 146,
    silhouette: "hoodie",
    colors: TEE_COLORS,
    sizes: SIZES,
    variants: buildVariantsFromMap(GILDAN_18500_VARIANTS, 3400),
    printPlacement: { position: "front", widthInches: 11 },
  },
];

export function getCatalog(): CatalogProduct[] {
  return DEMO_CATALOG;
}

export function getProductBySlug(slug: string): CatalogProduct | undefined {
  if (slug === "heavy-crew") {
    return getCatalog().find((p) => p.id === "heavy-hoodie");
  }
  return getCatalog().find((p) => p.slug === slug || p.id === slug);
}

export function getVariant(
  product: CatalogProduct,
  colorId: string,
  sizeId: string,
): CatalogVariant | undefined {
  return product.variants.find(
    (v) => v.colorId === colorId && v.sizeId === sizeId,
  );
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
