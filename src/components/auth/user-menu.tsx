'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export function UserMenu() {
    const { user, signOut, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/50">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user.email}</span>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-2"
            >
                <LogOut className="size-4" />
                Sign Out
            </Button>
        </div>
    )
}
