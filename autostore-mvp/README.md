# AutoStore AI — MVP

AI-assisted e-commerce automation: manage stores, products, and orders, generate marketing
content with Gemini, take subscription payments with Stripe, and get shipping-deadline reminders
by email via Resend.

## Setup

1. **Install dependencies** (already done if you're reading this from the scaffolded project):
   ```bash
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In the SQL editor, run `supabase/schema.sql` once.
   - (Optional) After registering a user in the app, edit and run `supabase/seed.sql` to add demo
     data.
   - Create a storage bucket named `product-images` — the schema script already does this and
     sets public-read policies, but double check it exists under Storage in the dashboard.

3. **Environment variables** — copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page (server-only, used by the Stripe webhook and cron
     job to bypass RLS).
   - `GEMINI_API_KEY` — [Google AI Studio](https://aistudio.google.com/apikey).
   - `RESEND_API_KEY` — [resend.com](https://resend.com) API keys page. `RESEND_FROM_EMAIL` can
     stay as `onboarding@resend.dev` until you verify your own sending domain.
   - `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe Dashboard → Developers →
     API keys (use test-mode keys).
   - `STRIPE_STARTER_PRICE_ID` / `STRIPE_GROWTH_PRICE_ID` / `STRIPE_SCALE_PRICE_ID` — create three
     recurring Prices in Stripe (test mode) and paste their IDs here.
   - `STRIPE_WEBHOOK_SECRET` — see below.
   - `CRON_SECRET` — any random string; protects the deadline-reminder endpoint.

4. **Stripe webhook (local dev)** — forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```
   Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET`.

5. **Run it**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Notes

- The Gemini integration falls back to pre-written templates (`lib/ai/fallback-templates.ts`) if
  the API errors or rate-limits, so content generation always returns something.
- `app/api/cron/check-deadlines` is meant to run hourly via Vercel Cron (`vercel.json`). Locally
  you can hit it manually: `curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/check-deadlines`.
- Deploying to Vercel and wiring up the production Stripe webhook are separate steps — see the
  root `autostore-ai-plan/` docs for the original planning notes this build is based on.
