import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20 sm:px-8">
      <p className="font-mono text-[11px] tracking-[0.24em] text-[var(--olive)] uppercase">
        404
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-wide uppercase">
        Nothing printed here
      </h1>
      <Link
        href="/"
        className="mt-8 inline-block border border-dashed border-[var(--olive)]/55 px-4 py-2 font-mono text-xs tracking-[0.16em] uppercase"
      >
        ← Shop
      </Link>
    </div>
  );
}
