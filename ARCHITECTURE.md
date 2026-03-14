# Dölj Mig — Arkitektur & Buildplan

## Stack
- **Frontend + API**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Databas + Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Betalning**: Stripe (webhooks, subscriptions)
- **E-post**: Resend (GDPR-krav + månadsrapport-notiser)
- **Scanning**: Google Custom Search API (CSE)
- **PDF**: @react-pdf/renderer
- **Deploy**: Vercel (Next.js) + Supabase cloud
- **Cron**: Vercel Cron Jobs (vercel.json)

## Prisplaner
| Plan | Pris | Pers | Funktioner |
|------|------|------|-----------|
| Grundskydd | 99 kr/mån | 1 | Scan + borttagning + bevakning |
| Fullständigt | 149 kr/mån | 1 | + PDF-rapport + prioriterad borttagning |
| Familj | 249 kr/mån | 4 | Allt + 4 skyddade personer |

## DB-schema (Supabase)

```sql
-- PROFILES (extend Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive', -- inactive | active | canceled | past_due
  subscription_tier TEXT, -- basic | full | family
  max_persons INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROTECTED_PERSONS (persons being monitored)
CREATE TABLE protected_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  pnr TEXT, -- personnummer (YYMMDDXXXX)
  address TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCANS (each scan run)
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES protected_persons(id) ON DELETE CASCADE,
  triggered_by TEXT DEFAULT 'manual', -- manual | cron
  status TEXT DEFAULT 'pending', -- pending | running | completed | failed
  google_query TEXT,
  raw_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- SCAN_RESULTS (per-site results from a scan)
CREATE TABLE scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  site TEXT NOT NULL, -- ratsit.se | mrkoll.se | merinfo.se | hitta.se | eniro.se | birthday.se | upplysning.se
  found BOOLEAN DEFAULT false,
  profile_url TEXT,
  title TEXT,
  snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAKEDOWN_REQUESTS (GDPR borttagningskrav)
CREATE TABLE takedown_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_result_id UUID NOT NULL REFERENCES scan_results(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES protected_persons(id),
  site TEXT NOT NULL,
  contact_email TEXT, -- e-post till sajten
  status TEXT DEFAULT 'pending', -- pending | sent | confirmed | rejected | failed
  sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MONTHLY_REPORTS
CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_month TEXT NOT NULL, -- YYYY-MM
  pdf_url TEXT,
  scan_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, report_month)
);
```

## Filstruktur

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    dashboard/page.tsx
    scan/page.tsx
    scan/[id]/page.tsx
    reports/page.tsx
    settings/page.tsx
  (marketing)/
    page.tsx              ← Landing page
    pricing/page.tsx
  api/
    auth/callback/route.ts
    scan/route.ts          ← POST: starta scan, GET: hämta results
    scan/[id]/route.ts
    takedown/route.ts      ← POST: skicka GDPR-krav
    stripe/checkout/route.ts
    stripe/webhook/route.ts
    stripe/portal/route.ts
    cron/monthly/route.ts  ← Vercel cron: körs 1:a varje månad
    cron/report/route.ts   ← Vercel cron: generera PDF-rapport
components/
  ui/                      ← shadcn/ui components
  ScanResults.tsx
  TakedownStatus.tsx
  ReportCard.tsx
  PricingTable.tsx
lib/
  supabase/
    client.ts              ← browser client
    server.ts              ← server component client
    middleware.ts
  stripe.ts
  resend.ts
  google-cse.ts            ← scan + matching logic
  gdpr-emails.ts           ← GDPR email templates per sajt
  pdf-report.tsx           ← React PDF component
types/
  index.ts
supabase/
  migrations/
    001_initial_schema.sql
vercel.json                ← cron config
```

## API Routes

| Method | Path | Beskrivning |
|--------|------|-------------|
| POST | /api/scan | Starta ny scan (auth krävs) |
| GET | /api/scan/:id | Hämta scan-resultat |
| POST | /api/takedown | Skicka GDPR-krav för funna profiler |
| POST | /api/stripe/checkout | Skapa Stripe checkout session |
| POST | /api/stripe/webhook | Ta emot Stripe-händelser |
| GET | /api/stripe/portal | Kundportal-länk |
| POST | /api/cron/monthly | Kör månadsscan på alla aktiva kunder (cron) |
| POST | /api/cron/report | Generera PDF-rapporter (cron) |

## Cron-schema (vercel.json)

```json
{
  "crons": [
    { "path": "/api/cron/monthly", "schedule": "0 3 1 * *" },
    { "path": "/api/cron/report", "schedule": "0 6 2 * *" }
  ]
}
```

## Env-variabler (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_BASIC=    # 99 kr/mån
STRIPE_PRICE_FULL=     # 149 kr/mån
STRIPE_PRICE_FAMILY=   # 249 kr/mån

RESEND_API_KEY=
EMAIL_FROM=noreply@dolj-mig.se

GOOGLE_API_KEY=
GOOGLE_CSE_ID=

CRON_SECRET=           # hemlig token för att skydda cron-routes
NEXT_PUBLIC_APP_URL=https://dolj-mig.se
```

## GDPR-kontakt e-poster per sajt

| Sajt | E-post |
|------|--------|
| ratsit.se | kundservice@ratsit.se |
| mrkoll.se | gdpr@mrkoll.se |
| merinfo.se | gdpr@merinfo.se |
| hitta.se | dataskydd@hitta.se |
| eniro.se | privacy@eniro.se |
| birthday.se | gdpr@birthday.se |
| upplysning.se | gdpr@upplysning.se |

## Buildspår (parallella)

### Spår A — Foundation (DB + Auth + Routing)
- Supabase migrationer (schema ovan)
- Middleware för auth-skydd
- Login/register sidor
- Dashboard-layout
- Env-setup

### Spår B — Scanning Engine (Google CSE + API)
- lib/google-cse.ts (query-builder + result-matcher)
- /api/scan route (starta scan, spara i DB)
- /api/scan/[id] route (hämta resultat)
- ScanResults.tsx komponent

### Spår C — Frontend/UI (Landing + Dashboard)
- Landing page med hero, features, pricing
- Dashboard med lista på skyddade personer + senaste scan
- Scan-sida (formulär + live-resultat)
- Reports-sida

### Spår D — Business Logic (Stripe + Email + Cron)
- Stripe checkout + webhook + portal
- Resend GDPR-emails (lib/gdpr-emails.ts)
- Månads-cron (kör scans på alla aktiva)
- PDF-rapport (React PDF)
