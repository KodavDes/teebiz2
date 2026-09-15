import { notFound } from "next/navigation";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { getProductBySlug } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ canceled?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return { title: product.name };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { canceled } = await searchParams;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {canceled === "1" && (
        <p className="mb-8 border border-dashed border-[var(--olive)]/50 bg-[var(--panel)] px-4 py-3 font-mono text-sm text-[var(--ink)]/70">
          Checkout canceled — your configuration is still here. Upload again if
          needed, then retry.
        </p>
      )}
      <ProductConfigurator product={product} />
    </div>
  );
}
