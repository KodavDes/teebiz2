# Blue Mound Tee Co. (teebiz2)

Next.js storefront: upload a design → Stripe Checkout (card / Apple Pay) → Printful draft order.

See [SPEC.md](./SPEC.md) for architecture and out-of-scope notes.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local Stripe webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Put the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.

### Design storage

- **Dev:** local disk under `uploads/` (served at `/api/files/...`).
- **Prod:** set `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (and usually `S3_ENDPOINT` + `S3_PUBLIC_URL` for Cloudflare R2). Hostinger Node disks are typically not durable across deploys.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve build (binds to `PORT` when set) |

## Deploy notes (Hostinger)

Use Hostinger’s **Node.js** GitHub / archive deploy (not the generic static Git feature). Set env vars in hPanel before first traffic: `STRIPE_*`, `PRINTFUL_API_KEY`, `NEXT_PUBLIC_BASE_URL`, and S3 vars for uploads. Apple Pay needs the production domain verified in Stripe.
