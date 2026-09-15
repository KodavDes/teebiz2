import { PRINT_COLORS } from "@/lib/catalog";
import { clampDesignScale, STUDIO_DESIGNS } from "@/lib/designs";

export const runtime = "nodejs";

/**
 * Serves / redirects to a pre-rendered PNG (Printful rejects SVG).
 * Prefer direct /designs/{prefix}-{color}-s{scale}.png URLs in checkout.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "lab-mark";
  const colorId = searchParams.get("color") || "olive";
  const scale = clampDesignScale(Number(searchParams.get("scale") || "100"));

  const design = STUDIO_DESIGNS.find((d) => d.id === id);
  if (!design) {
    return Response.json({ error: "Unknown studio design" }, { status: 404 });
  }

  const color =
    PRINT_COLORS.find((c) => c.id === colorId)?.id ||
    PRINT_COLORS[0]?.id ||
    "olive";
  const snapped = clampDesignScale(Math.round(scale / 5) * 5);
  const path = `/designs/${design.filePrefix}-${color}-s${snapped}.png`;

  return Response.redirect(new URL(path, req.url), 302);
}
