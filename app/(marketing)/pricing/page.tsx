import { redirect } from 'next/navigation'

// Redirect pricing page to the landing page pricing section
export default function PricingPage() {
  redirect('/#priser')
}
