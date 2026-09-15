import Link from "next/link";

export function LabMark({
  className = "",
  color,
}: {
  className?: string;
  /** Optional ink override; falls back to currentColor */
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="1.75"
      style={color ? { color } : undefined}
    >
      <circle cx="32" cy="32" r="28" strokeDasharray="3 3" />
      <path d="M16 40 L32 18 L48 40 Z" />
      <path d="M22 40 L32 26 L42 40" />
      <line x1="20" y1="44" x2="44" y2="44" />
      <circle
        cx="32"
        cy="36"
        r="2.5"
        fill={color || "currentColor"}
        stroke="none"
      />
    </svg>
  );
}

/** Print-ready logomark from logomark.svg */
export function LogoMark({
  className = "",
  color,
}: {
  className?: string;
  color?: string;
}) {
  const ink = color || "currentColor";
  return (
    <svg
      viewBox="0 0 591.7 543.99"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke={ink}
      strokeMiterlimit={10}
      style={color ? { color: ink } : undefined}
    >
      <path
        d="M582.7,248.14c0,158.42-128.43,286.85-286.85,286.85S9,406.56,9,248.14C9,147.35,60.98,58.71,139.59,7.54"
        strokeWidth={18}
      />
      <polygon
        points="133.5 325.49 298.02 108.08 458.2 325.49 133.5 325.49"
        strokeWidth={20}
      />
      <polygon
        points="195.45 325.49 297.19 191.04 396.25 325.49 195.45 325.49"
        strokeWidth={16}
      />
      <circle cx="295.85" cy="284.62" r="24.34" fill={ink} stroke="none" />
      <line
        x1="195.45"
        y1="377.45"
        x2="396.25"
        y2="377.45"
        strokeWidth={18}
      />
    </svg>
  );
}

/** Preview helper for studio design buttons / tee mockup */
export function StudioMarkIcon({
  designId,
  className = "",
  color,
}: {
  designId: string;
  className?: string;
  color?: string;
}) {
  if (designId === "logomark") {
    return <LogoMark className={className} color={color} />;
  }
  return <LabMark className={className} color={color} />;
}

export function SiteHeader() {
  return (
    <header className="border-b border-dashed border-[var(--olive)]/35">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 text-[var(--ink)]"
        >
          <LabMark className="h-9 w-9 text-[var(--olive)] transition-transform duration-500 group-hover:rotate-6" />
          <div className="leading-none">
            <p className="font-[family-name:var(--font-display)] text-xl tracking-wide uppercase sm:text-2xl">
              Blue Mound Tee Co.
            </p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-[var(--olive)] uppercase">
              Blue Mound Lab
            </p>
          </div>
        </Link>
        <nav className="font-mono text-xs tracking-[0.18em] uppercase">
          <a
            href="#catalog"
            className="text-[var(--ink)]/70 transition-colors hover:text-[var(--olive)]"
          >
            Catalog
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-dashed border-[var(--olive)]/35">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3 text-[var(--olive)]">
          <LabMark className="h-7 w-7" />
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase">
            Printed on demand · No stock held
          </p>
        </div>
        <p className="font-mono text-[11px] tracking-wide text-[var(--ink)]/55">
          © {new Date().getFullYear()} Blue Mound Lab
        </p>
      </div>
    </footer>
  );
}
