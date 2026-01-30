
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

type AuthContextType = {
    session: Session | null
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)
                setUser(session?.user ?? null)
            } catch (error) {
                console.error('Error fetching session:', error)
            } finally {
                setLoading(false)
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                (_event, session) => {
                    setSession(session)
                    setUser(session?.user ?? null)
                    setLoading(false)

                    if (_event === 'SIGNED_OUT') {
                        setUser(null)
                        setSession(null)
                        router.push('/login')
                    }
                }
            )

            return () => {
                subscription.unsubscribe()
            }
        }

        initializeAuth()
    }, [router, supabase])

    const signOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
