'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Settings } from "lucide-react"
import { ThemeSlider } from "@/components/ui/theme-slider"

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
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-[30px] h-[30px] rounded-lg bg-gradient-primary flex items-center justify-center">
                                <span className="text-white font-bold text-sm">X</span>
                            </div>
                            <span className="text-xl font-semibold text-foreground">MACANE</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* CTA Button */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-gradient-primary rounded-full hover:opacity-90 transition-opacity"
                            >
                                Get Started
                            </Link>

                            <div className="relative">
                                <button
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50"
                                    aria-label="Settings"
                                >
                                    <Settings size={20} />
                                </button>

                                <AnimatePresence>
                                    {isSettingsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-card border border-border p-4 shadow-xl z-50 glass-morphism"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-foreground">Settings</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                    Mode
                                                </span>
                                                <ThemeSlider />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                        className="fixed inset-0 z-40 bg-background pt-20"
                    >
                        <nav className="flex flex-col items-center gap-6 p-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-4 px-8 py-3 text-base font-medium text-primary-foreground bg-gradient-primary rounded-full"
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
