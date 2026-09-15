import Link from "next/link";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-20 sm:px-8">
      <p className="font-mono text-[11px] tracking-[0.24em] text-[var(--olive)] uppercase">
        Order received
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide text-[var(--ink)] uppercase">
        Thanks — we&apos;re on it.
      </h1>
      <p className="font-mono text-sm leading-relaxed text-[var(--ink)]/65">
        Payment cleared. A Printful draft order is created from the Stripe
        webhook (confirm drafts in the Printful dashboard until the pipeline is
        trusted). Shipping updates come from Printful.
      </p>
      {sessionId && (
        <p className="font-mono text-[11px] break-all text-[var(--ink)]/45">
          Session · {sessionId}
        </p>
      )}
      <Link
        href="/"
        className="mt-4 w-fit bg-[var(--olive)] px-5 py-3 font-[family-name:var(--font-display)] text-lg tracking-[0.14em] text-[var(--cream)] uppercase"
      >
        Back to shop
      </Link>
    </div>
  );
}
