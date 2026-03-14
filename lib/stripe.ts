import Stripe from 'stripe'
import { SubscriptionTier } from '@/types'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  }
  return _stripe
}

// Convenience alias
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string]
  },
})

export const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Grundskydd',
    tier: 'basic' as SubscriptionTier,
    price: 99,
    maxPersons: 1,
    priceId: process.env.STRIPE_PRICE_BASIC!,
    features: [
      'Sök på 7 svenska sajter',
      'Automatisk GDPR-borttagning',
      'Månatlig bevakningsscan',
      '1 skyddad person',
      'E-postnotiser',
    ],
  },
  {
    id: 'full',
    name: 'Fullständigt Skydd',
    tier: 'full' as SubscriptionTier,
    price: 149,
    maxPersons: 1,
    priceId: process.env.STRIPE_PRICE_FULL!,
    popular: true,
    features: [
      'Allt i Grundskydd',
      'PDF-skyddsrapport varje månad',
      'Prioriterad borttagning',
      'Detaljerad aktivitetslogg',
      '1 skyddad person',
      'Prioriterad support',
    ],
  },
  {
    id: 'family',
    name: 'Familjeskydd',
    tier: 'family' as SubscriptionTier,
    price: 249,
    maxPersons: 4,
    priceId: process.env.STRIPE_PRICE_FAMILY!,
    features: [
      'Allt i Fullständigt Skydd',
      'Upp till 4 skyddade personer',
      'Gemensam familjerapport',
      'Prioriterad borttagning för alla',
      'Dedikerad support',
    ],
  },
]

export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  email,
  successUrl,
  cancelUrl,
}: {
  customerId?: string | null
  priceId: string
  userId: string
  email: string
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    locale: 'sv',
  }

  if (customerId) {
    params.customer = customerId
  } else {
    params.customer_email = email
  }

  return stripe.checkout.sessions.create(params)
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function getOrCreateCustomer(email: string, name: string | null): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) {
    return existing.data[0].id
  }
  const customer = await stripe.customers.create({ email, name: name || undefined })
  return customer.id
}

export function constructWebhookEvent(payload: string | Buffer, sig: string): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  if (priceId === process.env.STRIPE_PRICE_BASIC) return 'basic'
  if (priceId === process.env.STRIPE_PRICE_FULL) return 'full'
  if (priceId === process.env.STRIPE_PRICE_FAMILY) return 'family'
  return null
}

export function getMaxPersonsForTier(tier: SubscriptionTier): number {
  const plan = PRICING_PLANS.find((p) => p.tier === tier)
  return plan?.maxPersons ?? 1
}
