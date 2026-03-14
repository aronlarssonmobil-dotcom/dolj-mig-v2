export type SubscriptionStatus = 'inactive' | 'active' | 'canceled' | 'past_due'
export type SubscriptionTier = 'basic' | 'full' | 'family'
export type ScanTrigger = 'manual' | 'cron'
export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed'
export type TakedownStatus = 'pending' | 'sent' | 'confirmed' | 'rejected' | 'failed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus
  subscription_tier: SubscriptionTier | null
  max_persons: number
  created_at: string
  updated_at: string
}

export interface ProtectedPerson {
  id: string
  profile_id: string
  full_name: string
  pnr: string | null
  address: string | null
  city: string | null
  is_active: boolean
  created_at: string
}

export interface Scan {
  id: string
  person_id: string
  triggered_by: ScanTrigger
  status: ScanStatus
  google_query: string | null
  raw_results: Record<string, unknown> | null
  created_at: string
  completed_at: string | null
}

export interface ScanResult {
  id: string
  scan_id: string
  site: SupportedSite
  found: boolean
  profile_url: string | null
  title: string | null
  snippet: string | null
  created_at: string
}

export interface TakedownRequest {
  id: string
  scan_result_id: string
  person_id: string
  site: SupportedSite
  contact_email: string | null
  status: TakedownStatus
  sent_at: string | null
  confirmed_at: string | null
  created_at: string
}

export interface MonthlyReport {
  id: string
  profile_id: string
  report_month: string
  pdf_url: string | null
  scan_summary: Record<string, unknown> | null
  created_at: string
}

export type SupportedSite =
  | 'ratsit.se'
  | 'mrkoll.se'
  | 'merinfo.se'
  | 'hitta.se'
  | 'eniro.se'
  | 'birthday.se'
  | 'upplysning.se'

export const SUPPORTED_SITES: SupportedSite[] = [
  'ratsit.se',
  'mrkoll.se',
  'merinfo.se',
  'hitta.se',
  'eniro.se',
  'birthday.se',
  'upplysning.se',
]

export const SITE_GDPR_EMAILS: Record<SupportedSite, string> = {
  'ratsit.se': 'kundservice@ratsit.se',
  'mrkoll.se': 'gdpr@mrkoll.se',
  'merinfo.se': 'gdpr@merinfo.se',
  'hitta.se': 'dataskydd@hitta.se',
  'eniro.se': 'privacy@eniro.se',
  'birthday.se': 'gdpr@birthday.se',
  'upplysning.se': 'gdpr@upplysning.se',
}

export const SITE_DISPLAY_NAMES: Record<SupportedSite, string> = {
  'ratsit.se': 'Ratsit',
  'mrkoll.se': 'MrKoll',
  'merinfo.se': 'Merinfo',
  'hitta.se': 'Hitta.se',
  'eniro.se': 'Eniro',
  'birthday.se': 'Birthday.se',
  'upplysning.se': 'Upplysning.se',
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  tier: SubscriptionTier
  maxPersons: number
  features: string[]
  priceId: string
  popular?: boolean
}

export interface ScanWithResults extends Scan {
  results: ScanResult[]
  person: ProtectedPerson
}

export interface DashboardStats {
  totalPersons: number
  totalScans: number
  totalFound: number
  totalTakedowns: number
  activeTakedowns: number
}
