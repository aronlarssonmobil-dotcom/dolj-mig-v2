# Dölj Mig — Deploy Guide
> Allt gratis tills du börjar tjäna pengar. Tar ~15 minuter.

---

## Kostnadsbild
| Tjänst | Kostnad |
|--------|---------|
| Vercel | **Gratis** |
| Supabase | **Gratis** (500 MB) |
| Google CSE | **Gratis** (100 sök/dag) |
| Resend | **Gratis** (3 000 mail/mån) |
| Stripe | **Gratis** — tar bara % när du får betalt (1.4% + 0.25€/transaktion) |
| dolj-mig.se | ~100 kr/år — enda riktiga kostnaden |

---

## Steg 1 — Supabase (5 min)

1. Gå till [supabase.com](https://supabase.com) → **Start your project** → logga in med GitHub
2. Klicka **New project** → välj namn `dolj-mig`, välj region `eu-central-1` (Frankfurt)
3. Vänta ~2 min tills projektet är klart
4. Gå till **Project Settings → API**:
   - Kopiera **Project URL** → det är din `NEXT_PUBLIC_SUPABASE_URL`
   - Kopiera **anon public** → det är din `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Kopiera **service_role** (klicka "Reveal") → det är din `SUPABASE_SERVICE_ROLE_KEY`
5. Gå till **SQL Editor** → klistra in hela innehållet från `supabase/migrations/001_initial.sql` → klicka **Run**

---

## Steg 2 — Resend (2 min)

1. Gå till [resend.com](https://resend.com) → logga in med GitHub
2. **API Keys** → **Create API Key** → kopiera nyckeln → det är din `RESEND_API_KEY`
3. Notera: du behöver en riktig domän för att skicka mail (dolj-mig.se). Köp domänen först (Steg 5).

---

## Steg 3 — Google Custom Search (3 min)

1. Gå till [console.cloud.google.com](https://console.cloud.google.com)
2. Skapa nytt projekt → **APIs & Services → Enable APIs** → sök "Custom Search API" → Enable
3. **Credentials → Create Credentials → API Key** → kopiera → det är din `GOOGLE_API_KEY`
4. Gå till [programmablesearchengine.google.com](https://programmablesearchengine.google.com) → **New search engine**
   - Search the entire web: **ON**
   - Kopiera **Search engine ID** → det är din `GOOGLE_CSE_ID`

---

## Steg 4 — Stripe (3 min)

> Ingen månadsavgift. Du betalar ingenting förrän du har betalande kunder.

1. Gå till [dashboard.stripe.com](https://dashboard.stripe.com) → registrera konto
2. **Developers → API Keys** → kopiera **Publishable key** och **Secret key**
3. Gå till **Products → Add product** och skapa 3 planer:
   - **Basic** — 49 kr/mån (1 person)
   - **Full** — 99 kr/mån (3 personer)
   - **Family** — 149 kr/mån (5 personer)
4. Kopiera varje plans **Price ID** (börjar med `price_...`)

---

## Steg 5 — Köp domänen

Köp **dolj-mig.se** på [loopia.se](https://loopia.se) eller [one.com](https://one.com) (~100 kr/år).

---

## Steg 6 — Vercel Deploy (2 min)

1. Gå till [vercel.com](https://vercel.com) → **Add New Project → Import Git Repository**
2. Välj `aronlarssonmobil-dotcom/dolj-mig-v2`
3. Under **Environment Variables**, lägg till alla variabler nedan:

```
NEXT_PUBLIC_SUPABASE_URL=           # från Steg 1
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # från Steg 1
SUPABASE_SERVICE_ROLE_KEY=          # från Steg 1

STRIPE_SECRET_KEY=                  # från Steg 4
STRIPE_WEBHOOK_SECRET=              # genereras efter deploy (se nedan)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # från Steg 4
STRIPE_PRICE_BASIC=                 # från Steg 4
STRIPE_PRICE_FULL=                  # från Steg 4
STRIPE_PRICE_FAMILY=                # från Steg 4

RESEND_API_KEY=                     # från Steg 2
EMAIL_FROM=noreply@dolj-mig.se

GOOGLE_API_KEY=                     # från Steg 3
GOOGLE_CSE_ID=                      # från Steg 3

CRON_SECRET=f1e675e5226d23c45b56f9a5a75897e445703b314435a5bfa942b7a2fdc21465
NEXT_PUBLIC_APP_URL=https://dolj-mig.se
```

4. Klicka **Deploy** → vänta ~2 min

---

## Steg 7 — Stripe Webhook (efter deploy)

1. I Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://dolj-mig.se/api/stripe/webhook`
3. Events: välj `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Kopiera **Signing secret** → lägg till som `STRIPE_WEBHOOK_SECRET` i Vercel → redeploy

---

## Steg 8 — Peka domänen till Vercel

1. I Vercel → ditt projekt → **Settings → Domains** → lägg till `dolj-mig.se`
2. Följ Vercels instruktioner för att uppdatera DNS hos din domänregistrar

---

## Klart ✅

Din SaaS är live. Dela reklamlödet (`doljmig/flyer.html`) och börja ta betalningar.
