# Blue Mound Tee Co. — build & deploy spec (teebiz2)

Give this whole file to Cursor's agent as context before you start. It's a
rebuild of an earlier attempt (`teebiz`, now abandoned) — the goal, the
architecture, and the brand system carry over; what changed is the
deploy target (Hostinger, not Vercel) and a couple of things that were
never actually verified last time.

## What this is

A Next.js storefront where a customer uploads their own design, picks a
garment/color/size, pays with card or Apple Pay via Stripe Checkout, and
the order goes to Printful for on-demand printing and shipping. No
inventory held, nothing fulfilled until it's paid for.

```
Customer uploads design  ->  /api/upload                stores file, returns a public URL
Customer checks out      ->  /api/checkout/create-session
                                                          re-prices server-side, creates a
                                                          Stripe Checkout Session (cards +
                                                          Apple Pay), redirects to Stripe
Stripe payment succeeds  ->  /api/webhooks/stripe        verifies signature, creates the
                                                          fulfillment order with Printful
                                                          (as a draft — confirm manually
                                                          until the pipeline is trusted)
Printful prints & ships  ->  outside this app — confirm draft orders in the
                              Printful dashboard, or flip `confirm: true` later
```

Catalog data is a placeholder to start — enough to click through the whole
flow before a real Printful account is wired in. Don't treat the
product/variant IDs as real until they're verified against Printful's live
catalog.

## What's different from the first attempt (read this before assuming anything)

1. **Deploy target is Hostinger, not Vercel.** The old build used Vercel
   Blob for uploaded-design storage because it assumed a Vercel deploy —
   that's wrong here. Hostinger's Business plan has a dedicated Node.js
   GitHub-deploy integration (separate from their generic static/PHP Git
   feature, which doesn't run a build step and won't work for this). Use
   the Hostinger MCP tools already connected in this Cursor session
   (hostinger-hosting, hostinger-vps, etc.) to check what the actual plan
   supports — specifically **whether the Node app's filesystem is
   persistent/writable at runtime** — before picking a storage approach.
   If it isn't persistent (likely, most managed Node hosting resets on
   redeploy), don't reinvent this: use an S3-compatible object store
   (Cloudflare R2 is cheap and simple) or whatever object storage Hostinger
   itself offers, gated behind an env var exactly like the old
   `BLOB_READ_WRITE_TOKEN` pattern — local disk for dev, object storage in
   prod.

2. **No repo exists yet.** Create one on GitHub (Dave's account has none
   for this project) before connecting Hostinger's Node.js GitHub
   integration to it — the integration needs a repo to point at.

3. **Last time, the build was never actually verified** — `npm install`
   was never run and there was no real dev/build cycle, because the agent
   writing it didn't have working local network access. That's not a
   constraint here: actually run `npm install`, `npm run build`, and
   `npm run dev`, click through the full flow (upload → checkout → webhook
   → Printful draft order) before wiring live keys or deploying. Don't
   hand back a "should work" build — verify it.

## Brand system (Blue Mound Lab)

- Palette: warm olive + off-white
- Typography: IBM Plex Mono + Barlow Condensed
- Visual language: flat line-art graphics, badge-inspired marks,
  dashed-line details
- Keep this consistent across header, product cards, badges, footer —
  this is Dave's studio identity, not a placeholder style.

## Setup checklist

1. **Scaffold**: Next.js (App Router), TypeScript, Tailwind. Same
   dependency shape as before is fine: `stripe`, plus whatever storage SDK
   the Hostinger-capability decision above lands on (drop `@vercel/blob`).
2. **GitHub**: create a new repo, push the initial scaffold.
3. **Printful**: create account/store at printful.com → Settings → API →
   personal access token → `PRINTFUL_API_KEY`. Catalog wiring is a known
   placeholder — implement `getCatalog()` against Printful's real Catalog/
   Store Products API once a product line is chosen; demo catalog until
   then.
4. **Stripe**: keys from the Stripe Dashboard → `STRIPE_SECRET_KEY`. Local
   webhook testing via the Stripe CLI (`stripe listen --forward-to
   localhost:3000/api/webhooks/stripe`). In production, add a webhook
   endpoint in the Dashboard pointed at the real domain, subscribed to
   `checkout.session.completed`, using *that* endpoint's signing secret.
   Apple Pay won't show as a payment option until the domain is verified
   in Stripe (Settings → Payment methods → Apple Pay) — requires HTTPS, so
   this only works once actually deployed.
5. **Design upload storage**: local disk for dev; resolve prod storage per
   item 1 above once the Hostinger plan's filesystem behavior is known.
6. **Deploy**: use Hostinger's Node.js GitHub-deploy integration
   (hPanel → the Node.js app section, not the generic "Advanced → Git"
   feature) to connect the new repo. Use the Hostinger MCP tools in this
   session to do as much of this as they support directly rather than
   hand-clicking through hPanel.

## Deliberately out of scope for v1

- Drag/resize/rotate design positioning — fixed placement/size per product
  is fine.
- Persistent order storage / a database — cart round-trips through Stripe
  Checkout Session metadata.
- Order status/tracking UI — Printful's own shipping emails cover this for
  now.
- Multiple live Printful catalog products — one demo catalog is enough to
  start.
