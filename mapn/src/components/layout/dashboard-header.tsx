'use client'

import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import { useState, useRef } from "react"
import { SettingsDropdown } from "@/components/layout/settings-dropdown"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const settingsTriggerRef = useRef<HTMLButtonElement>(null)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    <div className="h-4 w-px bg-border mx-2" />
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-white/10">
                            <img
                                src="/logo.jpg"
                                alt="MACANE Logo"
                                className="w-full h-full object-cover opacity-90"
                            />
                        </div>
                        <span className="font-semibold tracking-tight">Dashboard</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            ref={settingsTriggerRef}
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border border-transparent",
                                isSettingsOpen ? "bg-secondary text-foreground border-border" : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">Profile</span>
                        </button>

                        <SettingsDropdown
                            isOpen={isSettingsOpen}
                            onClose={() => setIsSettingsOpen(false)}
                            triggerRef={settingsTriggerRef}
                            defaultSection="account"
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}
