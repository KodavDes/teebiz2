import Link from "next/link";
import { formatPrice, type CatalogProduct } from "@/lib/catalog";

export function ProductRow({ product }: { product: CatalogProduct }) {
  const from = Math.min(...product.variants.map((v) => v.priceCents));

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group grid gap-4 border-t border-dashed border-[var(--olive)]/40 py-8 transition-colors first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-end"
    >
      <div>
        <p className="font-mono text-[10px] tracking-[0.24em] text-[var(--olive)] uppercase">
          Garment
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-wide text-[var(--ink)] uppercase transition-colors group-hover:text-[var(--olive)] sm:text-4xl">
          {product.name}
        </h3>
        <p className="mt-3 max-w-xl font-mono text-sm leading-relaxed text-[var(--ink)]/65">
          {product.description}
        </p>
      </div>
      <div className="flex items-baseline gap-4 sm:flex-col sm:items-end sm:gap-1">
        <span className="font-mono text-xs tracking-[0.18em] text-[var(--ink)]/50 uppercase">
          From
        </span>
        <span className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[var(--ink)]">
          {formatPrice(from)}
        </span>
        <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--olive)] uppercase underline-offset-4 group-hover:underline">
          Configure →
        </span>
      </div>
    </Link>
  );
}
