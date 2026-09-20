export type PrintfulRecipient = {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip: string;
  phone?: string;
  email?: string;
};

export type PrintfulOrderItem = {
  variant_id: number;
  quantity: number;
  files: Array<{
    type: string;
    url: string;
  }>;
};

export type CreatePrintfulDraftOrderInput = {
  externalId: string;
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  /** Keep false until the fulfillment pipeline is trusted */
  confirm?: boolean;
};

type PrintfulResponse = {
  code: number;
  result?: unknown;
  error?: { message?: string; reason?: string };
};

/**
 * Printful allows ≤32 chars: digits, Latin letters, dashes, underscores.
 * Stripe Checkout Session ids are longer — keep a unique suffix.
 */
export function toPrintfulExternalId(sessionId: string): string {
  const cleaned = sessionId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (cleaned.length <= 32) return cleaned || "order";
  return cleaned.slice(-32);
}

export async function findPrintfulOrderByExternalId(
  externalId: string,
): Promise<unknown | null> {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) {
    throw new Error("PRINTFUL_API_KEY is not set");
  }

  const res = await fetch(
    `https://api.printful.com/orders/@${toPrintfulExternalId(externalId)}`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );

  if (res.status === 404) return null;

  const data = (await res.json()) as PrintfulResponse;
  if (!res.ok) {
    const message =
      data.error?.message || data.error?.reason || `Printful HTTP ${res.status}`;
    throw new Error(message);
  }

  return data.result ?? null;
}

export async function createPrintfulDraftOrder(
  input: CreatePrintfulDraftOrderInput,
): Promise<unknown> {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) {
    throw new Error("PRINTFUL_API_KEY is not set");
  }

  const existing = await findPrintfulOrderByExternalId(input.externalId);
  if (existing) return existing;

  const body = {
    external_id: toPrintfulExternalId(input.externalId),
    recipient: input.recipient,
    items: input.items,
    confirm: input.confirm ?? false,
  };

  const res = await fetch("https://api.printful.com/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as PrintfulResponse;
  if (!res.ok) {
    const message =
      data.error?.message || data.error?.reason || `Printful HTTP ${res.status}`;
    throw new Error(message);
  }

  return data.result;
}
