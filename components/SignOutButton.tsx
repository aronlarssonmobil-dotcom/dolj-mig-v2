'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (compact) {
    return (
      <button
        onClick={handleSignOut}
        className="text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]"
      >
        Logga ut
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full text-left text-xs text-white/40 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.06] flex items-center gap-2"
    >
      <span>↩</span>
      Logga ut
    </button>
  )
}
