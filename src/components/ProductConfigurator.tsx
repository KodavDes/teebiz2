"use client";

import { useMemo, useState, useTransition } from "react";
import { StudioMarkIcon } from "@/components/SiteChrome";
import { TeePreview } from "@/components/TeePreview";
import { formatPrice, type CatalogProduct } from "@/lib/catalog";
import {
  DESIGN_SCALE_DEFAULT,
  DESIGN_SCALE_MAX,
  DESIGN_SCALE_MIN,
  STUDIO_DESIGNS,
  clampDesignScale,
  defaultPrintColorId,
  studioDesignAbsoluteUrl,
  studioPrintColors,
  type StudioDesign,
} from "@/lib/designs";

type Props = {
  product: CatalogProduct;
};

export function ProductConfigurator({ product }: Props) {
  const [colorId, setColorId] = useState(product.colors[0]?.id ?? "");
  const [sizeId, setSizeId] = useState(
    product.sizes[2]?.id ?? product.sizes[0]?.id ?? "",
  );
  const [printColorId, setPrintColorId] = useState(
    defaultPrintColorId(product.colors[0]?.id ?? "natural"),
  );
  const [designScale, setDesignScale] = useState(DESIGN_SCALE_DEFAULT);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [studioDesignId, setStudioDesignId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const variant = useMemo(
    () =>
      product.variants.find(
        (v) => v.colorId === colorId && v.sizeId === sizeId,
      ),
    [product.variants, colorId, sizeId],
  );

  const selectedColor = product.colors.find((c) => c.id === colorId);
  const selectedStudio = STUDIO_DESIGNS.find((d) => d.id === studioDesignId);
  const printColors = studioPrintColors();
  const selectedPrint = printColors.find((c) => c.id === printColorId);
  const scaleFactor = designScale / 100;

  function applyStudioDesign(
    design: StudioDesign,
    nextPrintColorId: string,
    nextScale: number = designScale,
  ) {
    setError(null);
    setStudioDesignId(design.id);
    setUploadedUrl(null);
    setPrintColorId(nextPrintColorId);
    setDesignScale(clampDesignScale(nextScale));
    setDesignUrl(
      studioDesignAbsoluteUrl(
        design,
        window.location.origin,
        nextPrintColorId,
        nextScale,
      ),
    );
    const ink = printColors.find((c) => c.id === nextPrintColorId);
    setPreviewName(
      ink ? `${design.name} · ${ink.name}` : design.name,
    );
  }

  function selectStudioDesign(design: StudioDesign) {
    const ink = design.colorable
      ? printColorId || defaultPrintColorId(colorId)
      : printColorId;
    applyStudioDesign(design, ink, designScale);
  }

  function selectPrintColor(nextPrintColorId: string) {
    setPrintColorId(nextPrintColorId);
    if (selectedStudio?.colorable) {
      applyStudioDesign(selectedStudio, nextPrintColorId, designScale);
    }
  }

  function selectDesignScale(nextScale: number) {
    const clamped = clampDesignScale(nextScale);
    setDesignScale(clamped);
    if (selectedStudio) {
      applyStudioDesign(selectedStudio, printColorId, clamped);
    }
  }

  function selectGarmentColor(nextColorId: string) {
    setColorId(nextColorId);
    if (selectedStudio?.colorable) {
      const nextPrint = nextPrintColorIdSafe(nextColorId, printColorId);
      applyStudioDesign(selectedStudio, nextPrint, designScale);
    }
  }

  function nextPrintColorIdSafe(
    garmentId: string,
    currentPrintId: string,
  ): string {
    if (currentPrintId !== garmentId) return currentPrintId;
    return defaultPrintColorId(garmentId);
  }

  async function onFileChange(file: File | null) {
    setError(null);
    setDesignUrl(null);
    setUploadedUrl(null);
    setPreviewName(null);
    setStudioDesignId(null);
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      setUploadedUrl(data.url);
      setDesignUrl(data.url);
      setPreviewName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function checkout() {
    setError(null);
    if (!designUrl) {
      setError("Choose a studio mark or upload a design before checkout.");
      return;
    }
    if (!variant) {
      setError("Pick a valid color and size.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            colorId,
            sizeId,
            designUrl,
            quantity: 1,
          }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error || "Could not start checkout");
        }
        window.location.href = data.url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Checkout failed");
      }
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative min-h-[320px] overflow-hidden border border-dashed border-[var(--olive)]/50 bg-[var(--panel)]">
        <div className="relative flex h-full min-h-[320px] flex-col items-center justify-center gap-5 px-6 py-8 sm:px-8">
          <TeePreview
            garmentHex={selectedColor?.hex || "#E8E0D0"}
            printWidthInches={product.printPlacement.widthInches}
            silhouette={product.silhouette}
          >
            {selectedStudio ? (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ transform: `scale(${scaleFactor})` }}
              >
                <StudioMarkIcon
                  designId={selectedStudio.id}
                  className="h-full w-full"
                  color={selectedPrint?.hex || "var(--olive)"}
                />
              </div>
            ) : uploadedUrl || designUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={uploadedUrl || designUrl || undefined}
                alt="Uploaded design preview"
                className="h-full w-full object-contain"
                style={{ transform: `scale(${scaleFactor})` }}
              />
            ) : null}
          </TeePreview>
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ink)]/55 uppercase">
            Fixed front print · {product.printPlacement.widthInches}&quot; on ~
            20&quot; chest
            {selectedPrint ? ` · ${selectedPrint.name} ink` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <p className="font-mono text-[10px] tracking-[0.24em] text-[var(--olive)] uppercase">
            Configure
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-wide text-[var(--ink)] uppercase sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 font-mono text-sm leading-relaxed text-[var(--ink)]/65">
            {product.description}
          </p>
        </div>

        <fieldset>
          <legend className="font-mono text-[11px] tracking-[0.2em] text-[var(--ink)]/60 uppercase">
            Garment
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {product.colors.map((color) => {
              const active = color.id === colorId;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => selectGarmentColor(color.id)}
                  className={`flex items-center gap-2 border px-3 py-2 font-mono text-xs tracking-[0.14em] uppercase transition-colors ${
                    active
                      ? "border-[var(--olive)] bg-[var(--olive)] text-[var(--cream)]"
                      : "border-dashed border-[var(--olive)]/45 text-[var(--ink)] hover:border-[var(--olive)]"
                  }`}
                  aria-pressed={active}
                >
                  <span
                    className="inline-block h-3 w-3 border border-[var(--ink)]/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-mono text-[11px] tracking-[0.2em] text-[var(--ink)]/60 uppercase">
            Size
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const active = size.id === sizeId;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSizeId(size.id)}
                  className={`min-w-12 border px-3 py-2 font-mono text-xs tracking-[0.14em] uppercase transition-colors ${
                    active
                      ? "border-[var(--olive)] bg-[var(--olive)] text-[var(--cream)]"
                      : "border-dashed border-[var(--olive)]/45 text-[var(--ink)] hover:border-[var(--olive)]"
                  }`}
                  aria-pressed={active}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--ink)]/60 uppercase">
            Design
          </p>

          <fieldset className="mt-3">
            <legend className="sr-only">Studio marks</legend>
            <div className="flex flex-wrap gap-3">
              {STUDIO_DESIGNS.map((design) => {
                const active = studioDesignId === design.id;
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => selectStudioDesign(design)}
                    className={`flex min-w-[9.5rem] flex-col items-start gap-3 border px-3 py-3 text-left transition-colors ${
                      active
                        ? "border-[var(--olive)] bg-[var(--olive)] text-[var(--cream)]"
                        : "border-dashed border-[var(--olive)]/45 text-[var(--ink)] hover:border-[var(--olive)]"
                    }`}
                    aria-pressed={active}
                  >
                    <StudioMarkIcon
                      designId={design.id}
                      className="h-10 w-10"
                      color={
                        active
                          ? "var(--cream)"
                          : selectedPrint?.hex || "var(--olive)"
                      }
                    />
                    <span className="font-mono text-[11px] tracking-[0.16em] uppercase">
                      {design.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {selectedStudio?.colorable && (
            <fieldset className="mt-4">
              <legend className="font-mono text-[11px] tracking-[0.2em] text-[var(--ink)]/60 uppercase">
                Print color
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {printColors.map((color) => {
                  const active = color.id === printColorId;
                  const sameAsGarment = color.id === colorId;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => selectPrintColor(color.id)}
                      title={
                        sameAsGarment
                          ? "Same as garment — may be hard to see"
                          : color.name
                      }
                      className={`flex items-center gap-2 border px-3 py-2 font-mono text-xs tracking-[0.14em] uppercase transition-colors ${
                        active
                          ? "border-[var(--olive)] bg-[var(--olive)] text-[var(--cream)]"
                          : "border-dashed border-[var(--olive)]/45 text-[var(--ink)] hover:border-[var(--olive)]"
                      }`}
                      aria-pressed={active}
                    >
                      <span
                        className="inline-block h-3 w-3 border border-[var(--ink)]/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {(selectedStudio || uploadedUrl) && (
            <div className="mt-4">
              <div className="flex items-baseline justify-between gap-3">
                <label
                  htmlFor="design-scale"
                  className="font-mono text-[11px] tracking-[0.2em] text-[var(--ink)]/60 uppercase"
                >
                  Graphic size
                </label>
                <span className="font-mono text-[11px] tabular-nums text-[var(--olive)]">
                  {designScale}%
                </span>
              </div>
              <input
                id="design-scale"
                type="range"
                min={DESIGN_SCALE_MIN}
                max={DESIGN_SCALE_MAX}
                step={5}
                value={designScale}
                onChange={(e) => selectDesignScale(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--olive)]"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] tracking-[0.14em] text-[var(--ink)]/40 uppercase">
                <span>Min</span>
                <span>Max</span>
              </div>
              {uploadedUrl && !selectedStudio && (
                <p className="mt-2 font-mono text-[10px] leading-relaxed text-[var(--ink)]/45">
                  Preview only for uploads — custom files print at the size you
                  uploaded.
                </p>
              )}
            </div>
          )}

          <label className="mt-3 flex cursor-pointer flex-col items-start gap-2 border border-dashed border-[var(--olive)]/50 bg-[var(--panel)] px-4 py-5 transition-colors hover:border-[var(--olive)]">
            <span className="font-[family-name:var(--font-display)] text-lg tracking-wide text-[var(--ink)] uppercase">
              {uploading
                ? "Uploading…"
                : studioDesignId
                  ? "Or upload your own"
                  : previewName
                    ? previewName
                    : "Or drop / choose a file"}
            </span>
            <span className="font-mono text-[11px] text-[var(--ink)]/50">
              PNG, JPG, WEBP, GIF, or SVG · max 8 MB
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="sr-only"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
          {designUrl && (
            <p className="mt-2 truncate font-mono text-[10px] text-[var(--olive)]">
              {studioDesignId ? "Studio mark" : "Stored"} · {designUrl}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-[var(--olive)]/40 pt-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--ink)]/50 uppercase">
              Total
            </p>
            <p className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[var(--ink)]">
              {variant ? formatPrice(variant.priceCents) : "—"}
            </p>
          </div>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="bg-[var(--olive)] px-6 py-3 font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--cream)] uppercase disabled:cursor-not-allowed disabled:opacity-40"
          >
            Coming soon
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="border border-dashed border-red-800/40 bg-red-50 px-4 py-3 font-mono text-sm text-red-900"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
