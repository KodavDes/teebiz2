import { NextRequest, NextResponse } from "next/server";
import { priceCheckout, type CheckoutSelection } from "@/lib/pricing";
import { appBaseUrl, getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment.",
        },
        { status: 503 },
      );
    }

    const body = (await req.json()) as CheckoutSelection;
    const priced = priceCheckout(body);
    const stripe = getStripe();
    const base = appBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      // Apple Pay / Google Pay appear automatically for eligible browsers
      // once the domain is verified in Stripe (HTTPS required).
      line_items: [
        {
          quantity: priced.quantity,
          price_data: {
            currency: "usd",
            unit_amount: priced.unitAmountCents,
            product_data: {
              name: `${priced.product.name} — ${priced.variant.colorId.toUpperCase()} / ${priced.variant.sizeId.toUpperCase()}`,
              description: "Custom print · Blue Mound Tee Co.",
              images: [priced.designUrl],
            },
          },
        },
      ],
      success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/product/${priced.product.slug}?canceled=1`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      phone_number_collection: { enabled: true },
      metadata: {
        productId: priced.product.id,
        colorId: priced.variant.colorId,
        sizeId: priced.variant.sizeId,
        printfulVariantId: String(priced.variant.printfulVariantId),
        designUrl: priced.designUrl,
        quantity: String(priced.quantity),
        unitAmountCents: String(priced.unitAmountCents),
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("checkout create-session failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 400 },
    );
  }
}
