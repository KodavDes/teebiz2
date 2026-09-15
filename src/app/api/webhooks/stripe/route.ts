import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { normalizePublicFileUrl } from "@/lib/files";
import { getStripe } from "@/lib/stripe";
import { createPrintfulDraftOrder } from "@/lib/printful";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Use bracket access so Next cannot inline a missing build-time env as undefined.
  const stripeSecret = process.env["STRIPE_SECRET_KEY"];
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await fulfillCheckoutSession(session);
    } catch (err) {
      console.error("fulfillment failed", err);
      // Return 500 so Stripe retries
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Fulfillment failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {};
  const printfulVariantId = Number(meta.printfulVariantId);
  const quantity = Number(meta.quantity || "1");

  if (!meta.designUrl || !Number.isFinite(printfulVariantId)) {
    throw new Error("Checkout session missing fulfillment metadata");
  }

  // Re-normalize in case an older session stored a localhost / relative URL.
  const designUrl = normalizePublicFileUrl(meta.designUrl);

  const shipping = session.collected_information?.shipping_details;
  const address = shipping?.address || session.customer_details?.address;

  if (!address?.line1 || !address.city || !address.country || !address.postal_code) {
    throw new Error("Missing shipping address on checkout session");
  }

  const name =
    shipping?.name || session.customer_details?.name || "Customer";

  await createPrintfulDraftOrder({
    externalId: session.id,
    confirm: false,
    recipient: {
      name,
      address1: address.line1,
      address2: address.line2 || undefined,
      city: address.city,
      state_code: address.state || undefined,
      country_code: address.country,
      zip: address.postal_code,
      phone: session.customer_details?.phone || undefined,
      email: session.customer_details?.email || undefined,
    },
    items: [
      {
        variant_id: printfulVariantId,
        quantity: Number.isFinite(quantity) ? quantity : 1,
        files: [
          {
            type: "default",
            url: designUrl,
          },
        ],
      },
    ],
  });
}
