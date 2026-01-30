
'use client'

import { useState, useRef } from "react"
import Link from "next/link"
import { Settings, User as UserIcon } from "lucide-react"
import { SettingsDropdown } from "@/components/layout/settings-dropdown"
import { ProfileDropdown } from "@/components/layout/profile-dropdown"
import { useAuth } from "@/components/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    const settingsTriggerRef = useRef<HTMLButtonElement>(null)
    const profileTriggerRef = useRef<HTMLButtonElement>(null)

    const { user } = useAuth()

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="px-4 md:px-6 lg:px-8 py-3 mx-auto max-w-7xl flex items-center justify-between">
                {/* Logo / Home Link */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <img
                            src="/logo.jpg"
                            alt="MACANE Logo"
                            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                        />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground/90">
                        MACANE
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-secondary/50 text-[10px] font-medium text-muted-foreground border border-white/5 ml-2">
                        DASHBOARD
                    </span>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Settings Dropdown */}
                    <div className="relative">
                        <button
                            ref={settingsTriggerRef}
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={cn(
                                "p-2 transition-all rounded-full hover:bg-secondary/50",
                                isSettingsOpen ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-label="Settings"
                        >
                            <Settings size={20} className={isSettingsOpen ? "animate-spin-slow" : ""} />
                        </button>

                        <SettingsDropdown
                            isOpen={isSettingsOpen}
                            onClose={() => setIsSettingsOpen(false)}
                            triggerRef={settingsTriggerRef}
                        />
                    </div>

                    <div className="h-6 w-px bg-border/50 hidden sm:block" />

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            ref={profileTriggerRef}
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={cn(
                                "flex items-center gap-2 p-1 pl-2 pr-1 rounded-full transition-all border border-transparent hover:border-border/50 hover:bg-secondary/30",
                                isProfileOpen ? "bg-secondary/50 border-border/50" : ""
                            )}
                        >
                            <span className="hidden sm:block text-sm font-medium text-foreground/80 max-w-[100px] truncate">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                            </span>
                            <Avatar className="h-8 w-8 border border-white/10">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-xs text-primary font-bold">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </button>

                        <ProfileDropdown
                            isOpen={isProfileOpen}
                            onClose={() => setIsProfileOpen(false)}
                            triggerRef={profileTriggerRef}
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}
