'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      // Default to /dashboard, but allow 'next' param if present
      const next = searchParams.get('next') ?? '/dashboard'
      
      const supabase = createClient()

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
          // Use window.location.origin to handle the redirect dynamically
          // This ensures a full page load which is often safer for auth state synchronization
          window.location.href = `${window.location.origin}${next}`
        } else {
          console.error('Auth error:', error)
          // On error, redirect to login or error page
          router.push('/login?error=auth_code_error')
        }
      } else {
         // Check if session already exists (e.g. implicit flow or already logged in)
         const { data: { session }, error } = await supabase.auth.getSession()
         
         if (session) {
             window.location.href = `${window.location.origin}${next}`
         } else {
             // If no code and no session, redirect to login
             router.push('/login')
         }
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="mb-4 text-xl font-semibold">Authenticating...</h2>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  )
}
