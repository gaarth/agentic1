'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Settings } from "lucide-react"
import { SettingsDropdown } from "@/components/layout/settings-dropdown"

const navItems = [
    { label: "Services", href: "#services" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
]

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const settingsTriggerRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border"
                    : "bg-transparent"
                    }`}
            >
                <div className="max-w-[1200px] mx-auto px-10 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
                                <img
                                    src="/logo.jpg"
                                    alt="MACANE Logo"
                                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                                />
                                {/* Glow effect behind logo */}
                                <div className="absolute inset-0 bg-primary/20 blur-md -z-10" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                MACANE
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                                >
                                    {item.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full" />
                                </Link>
                            ))}
                        </nav>

                        {/* CTA Button */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-primary rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>

                            <div className="relative">
                                <button
                                    ref={settingsTriggerRef}
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className={cn(
                                        "p-2.5 transition-all rounded-full hover:bg-secondary/50",
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
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-foreground"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl pt-24 px-6"
                    >
                        <nav className="flex flex-col items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-medium text-foreground/80 hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className="h-px w-20 bg-border my-2" />
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-8 py-4 text-lg font-bold text-white bg-gradient-primary rounded-full shadow-xl shadow-primary/20"
                            >
                                Get Started
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

