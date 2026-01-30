
"use client"

import * as React from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, User as UserIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileDropdownProps {
    isOpen: boolean
    onClose: () => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function ProfileDropdown({ isOpen, onClose, triggerRef }: ProfileDropdownProps) {
    const { user, signOut } = useAuth()
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose, triggerRef])

    if (!user) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-card border border-border shadow-2xl z-50 overflow-hidden glass-morphism"
                >
                    <div className="p-4 border-b border-border bg-secondary/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-10 w-10 border border-primary/20">
                                <AvatarImage src={user.user_metadata?.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {user.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || 'User'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-2">
                        <button
                            onClick={() => {
                                onClose()
                                // Navigate to profile if we had a page
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-all cursor-not-allowed opacity-50"
                        >
                            <UserIcon className="w-4 h-4" />
                            My Profile (Coming Soon)
                        </button>

                        <div className="h-px bg-border my-1" />

                        <button
                            onClick={() => {
                                signOut()
                                onClose()
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
