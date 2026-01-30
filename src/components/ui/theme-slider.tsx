"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"

export function ThemeSlider() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex h-8 w-16 cursor-pointer items-center rounded-full bg-secondary p-1">
                <div className="h-6 w-6 rounded-full bg-primary shadow-sm" />
            </div>
        )
    }

    const isDark = theme === "dark" || (theme === undefined && true) // Default strict dark

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    return (
        <div
            className="relative flex h-8 w-16 cursor-pointer items-center rounded-full bg-secondary p-1 transition-colors duration-300 hover:bg-muted border border-border"
            onClick={toggleTheme}
            role="switch"
            aria-checked={!isDark}
            aria-label="Toggle theme"
        >
            <motion.div
                className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                animate={{ x: isDark ? 0 : 32 }}
            >
                <motion.div
                    initial={false}
                    animate={{ rotate: isDark ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                >
                    {isDark ? (
                        <Moon className="h-3.5 w-3.5 text-primary-foreground" />
                    ) : (
                        <Sun className="h-3.5 w-3.5 text-primary-foreground" />
                    )}
                </motion.div>
            </motion.div>

            {/* Background Icons/Guides */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-0">
                <Moon className={`h-3 w-3 ${isDark ? 'opacity-0' : 'opacity-50 text-muted-foreground'}`} />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-0">
                <Sun className={`h-3 w-3 ${!isDark ? 'opacity-0' : 'opacity-50 text-muted-foreground'}`} />
            </div>
        </div>
    )
}
