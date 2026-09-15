import Link from "next/link";
import { LabMark } from "@/components/SiteChrome";
import { ProductRow } from "@/components/ProductRow";
import { getCatalog } from "@/lib/catalog";

export default function HomePage() {
  const catalog = getCatalog();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-dashed border-[var(--olive)]/35">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="animate-rise font-mono text-[11px] tracking-[0.28em] text-[var(--olive)] uppercase">
              Blue Mound Lab
            </p>
            <h1 className="animate-rise-delay mt-4 font-[family-name:var(--font-display)] text-6xl leading-[0.92] tracking-wide text-[var(--ink)] uppercase sm:text-7xl lg:text-8xl">
              Blue Mound
              <br />
              Tee Co.
            </h1>
            <p className="animate-rise-delay-2 mt-6 max-w-md font-mono text-sm leading-relaxed text-[var(--ink)]/65 sm:text-base">
              Upload your mark. We lock the placement, take payment, and send a
              draft to Printful for on-demand print and ship.
            </p>
            <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
              <a
                href="#catalog"
                className="bg-[var(--olive)] px-5 py-3 font-[family-name:var(--font-display)] text-lg tracking-[0.14em] text-[var(--cream)] uppercase transition-opacity hover:opacity-90"
              >
                Shop garments
              </a>
              <Link
                href={`/product/${catalog[0]?.slug ?? "classic-tee"}`}
                className="border border-dashed border-[var(--olive)]/55 px-5 py-3 font-[family-name:var(--font-display)] text-lg tracking-[0.14em] text-[var(--ink)] uppercase transition-colors hover:border-[var(--olive)]"
              >
                Start with a tee
              </Link>
            </div>
          </div>

          <div className="animate-rise-delay relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
            <div className="absolute inset-6 border border-dashed border-[var(--olive)]/40" />
            <LabMark className="hero-mark h-44 w-44 text-[var(--olive)] sm:h-52 sm:w-52" />
          </div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.24em] text-[var(--olive)] uppercase">
            Catalog
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-wide text-[var(--ink)] uppercase sm:text-4xl">
            Garments
          </h2>
        </div>
        <div className="border-y border-dashed border-[var(--olive)]/40">
          {catalog.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
