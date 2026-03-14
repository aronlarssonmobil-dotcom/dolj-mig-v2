import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, getTierFromPriceId, getMaxPersonsForTier } from '@/lib/stripe'
import Stripe from 'stripe'

// Must use raw body for Stripe signature verification
export const dynamic = 'force-dynamic'

async function getServiceSupabase() {
  const { createServerClient } = await import('@supabase/ssr')
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, sig)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await getServiceSupabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId = session.metadata?.userId
      if (!userId) break

      const subscriptionId = session.subscription as string
      const customerId = session.customer as string

      // Get subscription details
      const { stripe } = await import('@/lib/stripe')
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id
      const tier = getTierFromPriceId(priceId)
      const maxPersons = tier ? getMaxPersonsForTier(tier) : 1

      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_tier: tier,
          max_persons: maxPersons,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      console.log(`Subscription activated for user ${userId}, tier: ${tier}`)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId

      // Find profile by stripe_subscription_id if no userId in metadata
      let profileId = userId
      if (!profileId) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()
        profileId = data?.id
      }

      if (!profileId) break

      const priceId = subscription.items.data[0]?.price.id
      const tier = getTierFromPriceId(priceId)
      const maxPersons = tier ? getMaxPersonsForTier(tier) : 1

      const statusMap: Record<string, string> = {
        active: 'active',
        canceled: 'canceled',
        past_due: 'past_due',
        unpaid: 'past_due',
        incomplete: 'inactive',
        incomplete_expired: 'inactive',
        trialing: 'active',
        paused: 'inactive',
      }

      await supabase
        .from('profiles')
        .update({
          subscription_status: statusMap[subscription.status] || 'inactive',
          subscription_tier: tier,
          max_persons: maxPersons,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_tier: null,
            max_persons: 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null }
      const subId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : (invoice.subscription as { id: string } | null)?.id

      if (subId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subId)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
