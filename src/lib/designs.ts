import { PRINT_COLORS, type CatalogColor } from "./catalog";

export type StudioDesign = {
  id: string;
  name: string;
  /** Filename stem under /public/designs (e.g. lab-mark, logomark) */
  filePrefix: string;
  /**
   * Path template under /public. Use `{color}` for ink variants
   * (e.g. `/designs/lab-mark-{color}.svg`). Used as a static fallback.
   */
  pathTemplate: string;
  /** When true, shopper picks a print color from PRINT_COLORS */
  colorable?: boolean;
};

export const DESIGN_SCALE_MIN = 50;
export const DESIGN_SCALE_MAX = 100;
export const DESIGN_SCALE_DEFAULT = 85;

/** House designs customers can print without uploading a file */
export const STUDIO_DESIGNS: StudioDesign[] = [
  {
    id: "lab-mark",
    name: "Lab Mark",
    filePrefix: "lab-mark",
    pathTemplate: "/designs/lab-mark-{color}.svg",
    colorable: true,
  },
  {
    id: "logomark",
    name: "Logomark",
    filePrefix: "logomark",
    pathTemplate: "/designs/logomark-{color}.svg",
    colorable: true,
  },
];

export function studioPrintColors(): CatalogColor[] {
  return PRINT_COLORS;
}

export function clampDesignScale(value: number): number {
  if (!Number.isFinite(value)) return DESIGN_SCALE_DEFAULT;
  return Math.min(
    DESIGN_SCALE_MAX,
    Math.max(DESIGN_SCALE_MIN, Math.round(value)),
  );
}

export function studioDesignPath(
  design: StudioDesign,
  printColorId?: string,
): string {
  if (design.colorable) {
    const color =
      PRINT_COLORS.find((c) => c.id === printColorId)?.id ||
      PRINT_COLORS[0]?.id ||
      "olive";
    return design.pathTemplate.replace("{color}", color);
  }
  return design.pathTemplate;
}

/**
 * Absolute URL for checkout / Printful. Studio marks use pre-rendered PNGs
 * (Printful rejects SVG) with scale baked into the filename.
 */
export function studioDesignAbsoluteUrl(
  design: StudioDesign,
  origin?: string,
  printColorId?: string,
  scalePercent: number = DESIGN_SCALE_DEFAULT,
): string {
  const base = (
    origin ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const color =
    PRINT_COLORS.find((c) => c.id === printColorId)?.id ||
    PRINT_COLORS[0]?.id ||
    "olive";
  const scale = clampDesignScale(Math.round(scalePercent / 5) * 5);

  return `${base}/designs/${design.filePrefix}-${color}-s${scale}.png`;
}

/** Sensible default ink given a garment color */
export function defaultPrintColorId(garmentColorId: string): string {
  if (garmentColorId === "ink") return "bone";
  if (garmentColorId === "olive") return "bone";
  return "ink";
}
