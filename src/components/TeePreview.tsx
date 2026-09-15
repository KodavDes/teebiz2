"use client";

import type { ReactNode } from "react";
import type { GarmentSilhouette } from "@/lib/catalog";

/** Approx adult chest width used to scale the print area */
const CHEST_INCHES = 20;

type SilhouetteLayout = {
  viewW: number;
  viewH: number;
  chestLeft: number;
  chestWidth: number;
  printTop: number;
  bodyPath: string;
  accents: Array<{
    d: string;
    dashed?: boolean;
  }>;
};

/** Matches public/mockups/teeshape.svg */
const TEE: SilhouetteLayout = {
  viewW: 725.66,
  viewH: 609.94,
  chestLeft: 175,
  chestWidth: 376,
  printTop: 145,
  bodyPath:
    "M362.44,22.55c-48.35.88-90.17-21.54-90.17-21.54L1,81.05c4.66,115,35.89,141.09,35.89,141.09h123.63l1.45,374.32s242.09,27.72,400.32.56l-1.78-375.48,122.35-1.39s23.37,9.51,41.68-137.58L449.47,1s-38.33,20.66-87.02,21.55Z",
  accents: [
    { d: "M276.01,6.83s.67,1.06,1.96,2.89" },
    { d: "M282,15.21c20.6,26.89,91.1,103.15,160.87-4.81", dashed: true },
    { d: "M444.7,7.53c.61-.98,1.23-1.97,1.84-2.98" },
  ],
};

/**
 * Matches public/mockups/hoodie_shape.svg (studio art from hoodie_shape.svg).
 * Outer polygon is the fillable body; remaining strokes are detail accents.
 */
const HOODIE: SilhouetteLayout = {
  viewW: 464.94,
  viewH: 620.18,
  // Torso between side seams (~90–385)
  chestLeft: 105,
  chestWidth: 255,
  // Below hood / drawstring area
  printTop: 165,
  bodyPath:
    "M287.57,615.17 L353.64,606.82 L416.19,619.18 L432.69,571.59 L446.82,556.24 L463.94,417.24 L452.12,328.68 L440.06,202.57 L418.34,123.17 L341.19,75.11 L343.48,37.63 L329.51,3.58 L233.75,1 L135.43,3.58 L121.46,37.63 L123.75,75.11 L46.6,123.17 L24.88,202.57 L12.82,328.68 L1,417.24 L18.12,556.24 L32.25,571.59 L48.75,619.18 L111.3,606.82 L177.37,615.17 L234.01,615.17 L287.57,615.17 Z",
  accents: [
    { d: "M149.25,10.17s57.41,20.22,85,88.5c0,0,24.66-60.6,83.57-87.81" },
    {
      d: "M203.25,92.57c-4.87-1.69-9.39-3.68-12.69-5.98-12.59-8.76-56.24-11.85-56.24-11.85",
    },
    {
      d: "M256.98,94.9c-11.59,3.2-22.73,4.79-22.73,4.79h-.72s-10.76-1.54-22.12-4.63",
    },
    {
      d: "M333.47,74.74s-43.65,3.09-56.24,11.85c-2.97,2.07-6.94,3.89-11.27,5.47",
    },
    {
      d: "M36.24,570.09s49.52-5.21,53.98-23.29c0,0,143.8,24.8,286.14.14,1.09-.19,2-.81,2.92-1.24,0,0,8.43,17.86,48.13,24.38",
    },
    { d: "M92.32,555.66 L102.13,603.19" },
    { d: "M376.99,555.66 L366.23,604.6" },
    {
      d: "M90.22,546.8 L68.75,522.85 L79.49,402.51 L74.38,322.56 L85.75,253.17 L88.22,185.17",
    },
    {
      d: "M383.75,545.7 L403.5,515.7 L389.17,408.43 L393.63,322.56 L383.05,253.5 L381.55,243.71 L385.25,188.42",
    },
    { d: "M387.2,248.15 L417.37,144.69" },
    { d: "M82.64,247.51 L50.46,137.7" },
    {
      d: "M210.23,73.1 L203.75,83.05 L202.25,148.36 L211.41,148.36 L211.7,90.74 L215.77,77.09",
    },
    {
      d: "M251.41,76.09 L255.82,87.46 L256.98,148.36 L265.96,148.36 L264.38,84.57 L258.41,74.47",
    },
    // Kangaroo / front pouch pocket
    {
      d: "M344.7,516.34l6.03-3.72,8.49-52.54s-27.48-21.7-42.52-110.91h-168.46c-15.04,89.21-42.52,110.91-42.52,110.91l8.49,52.54,6.03,3.72,112.85,4.58,111.61-4.58Z",
    },
  ],
};

const LAYOUTS: Record<GarmentSilhouette, SilhouetteLayout> = {
  tee: TEE,
  hoodie: HOODIE,
};

const DEFAULT_OUTLINE = "#606060";
const INK_OUTLINE = "#0c0c0c";
/** Olive fill (#5b642f) sits too close to the default gray stroke — use ink outline instead. */
const OLIVE_FILL = "#5b642f";

type Props = {
  garmentHex: string;
  printWidthInches: number;
  silhouette?: GarmentSilhouette;
  children?: ReactNode;
  emptyLabel?: string;
};

function outlineForGarment(garmentHex: string): string {
  if (garmentHex.toLowerCase() === OLIVE_FILL) return INK_OUTLINE;
  return DEFAULT_OUTLINE;
}

/**
 * Garment mockup — tee (teeshape.svg) or hoodie (hoodie_shape.svg).
 * Print frame sized as printWidth / ~20" chest on the upper front.
 */
export function TeePreview({
  garmentHex,
  printWidthInches,
  silhouette = "tee",
  children,
  emptyLabel = "Design preview",
}: Props) {
  const layout = LAYOUTS[silhouette];
  const outline = outlineForGarment(garmentHex);
  const printW = Math.min(
    layout.chestWidth * 0.9,
    (printWidthInches / CHEST_INCHES) * layout.chestWidth,
  );
  const printH = printW;
  const printX = layout.chestLeft + (layout.chestWidth - printW) / 2;
  const printY = layout.printTop;

  const leftPct = (printX / layout.viewW) * 100;
  const topPct = (printY / layout.viewH) * 100;
  const widthPct = (printW / layout.viewW) * 100;
  const heightPct = (printH / layout.viewH) * 100;

  return (
    <div
      className="relative mx-auto w-full max-w-[28rem]"
      style={{ aspectRatio: `${layout.viewW} / ${layout.viewH}` }}
    >
      <svg
        viewBox={`0 0 ${layout.viewW} ${layout.viewH}`}
        className="h-full w-full"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={layout.bodyPath}
          fill={garmentHex}
          stroke={outline}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {layout.accents.map((accent) => (
          <path
            key={accent.d}
            d={accent.d}
            fill="none"
            stroke={outline}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={accent.dashed ? "6.81 6.81" : undefined}
          />
        ))}
      </svg>

      <div
        className="absolute flex items-center justify-center border border-dashed border-[var(--ink)]/35 bg-transparent"
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
      >
        {children ? (
          <div className="flex h-full w-full items-center justify-center p-[8%]">
            {children}
          </div>
        ) : (
          <span className="px-2 text-center font-mono text-[9px] tracking-[0.16em] text-[var(--ink)]/40 uppercase sm:text-[10px]">
            {emptyLabel}
          </span>
        )}
      </div>
    </div>
  );
}
