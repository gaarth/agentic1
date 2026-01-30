'use client'

import { ReactNode } from "react"
import { motion } from "framer-motion"

import { DashboardHeader } from "@/components/layout/dashboard-header"

export function MainLayout({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-background min-h-screen font-sans selection:bg-primary/20"
        >
            <DashboardHeader />
            <main className="min-w-0 pt-16">
                <div className="p-4 md:p-6 lg:p-8 mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </motion.div>
    )
}
