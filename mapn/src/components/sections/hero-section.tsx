'use client'

import Link from "next/link"
import { motion } from "framer-motion"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1] as const
        }
    }
}

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20">
            {/* Background Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/2 left-1/2 w-[406px] h-[406px] rounded-full opacity-60 blur-[100px] animate-float"
                    style={{
                        background: 'linear-gradient(229deg, rgb(223, 122, 254) 13%, rgba(201, 110, 240, 0) 35%, rgba(164, 92, 219, 0) 64%, rgb(129, 74, 200) 88%)',
                        transform: 'translate(-50%, -50%)'
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full opacity-80 blur-[80px]"
                    style={{
                        background: 'linear-gradient(141deg, rgb(223, 122, 254) 13%, rgba(201, 110, 240, 0) 35%, rgba(164, 92, 219, 0) 64%, rgb(129, 74, 200) 88%)',
                        transform: 'translate(-50%, -50%)',
                        animationDelay: '3s'
                    }}
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-[900px] mx-auto text-center"
            >
                {/* Badge */}
                <motion.div variants={itemVariants} className="mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-gradient-primary animate-pulse" />
                        AI-Powered Automation
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-6"
                >
                    <span className="text-foreground">Automate Your</span>
                    <br />
                    <span className="text-gradient">Business with AI</span>
                </motion.h1>

                {/* Description */}
                <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto mb-10"
                >
                    Xtract leverages multi-agent AI systems to optimize your workflows,
                    reduce costs, and drive intelligent decision-making at scale.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/dashboard"
                        className="px-8 py-4 text-base font-medium text-primary-foreground bg-gradient-primary rounded-full hover:opacity-90 transition-opacity shadow-lg glow-primary"
                    >
                        Start Free Trial
                    </Link>
                    <Link
                        href="#features"
                        className="px-8 py-4 text-base font-medium text-foreground bg-secondary rounded-full hover:bg-secondary/80 transition-colors border border-border"
                    >
                        Learn More
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    )
}
