'use client'

import Link from "next/link"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import NeuralBackground from "@/components/ui/flow-field-background"
import { useEffect, useRef, useState } from "react"

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

// Magnetic button component
function MagneticButton({ href, children, className, variant = "primary" }: {
    href: string
    children: React.ReactNode
    className?: string
    variant?: "primary" | "secondary"
}) {
    const ref = useRef<HTMLAnchorElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseX = useSpring(x, { stiffness: 300, damping: 20 })
    const mouseY = useSpring(y, { stiffness: 300, damping: 20 })

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        x.set((e.clientX - centerX) * 0.2)
        y.set((e.clientY - centerY) * 0.2)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    const baseClasses = variant === "primary"
        ? "px-8 py-4 text-base font-medium text-primary-foreground bg-gradient-primary rounded-full shadow-lg hover-glow relative overflow-hidden"
        : "px-8 py-4 text-base font-medium text-foreground glass-morphism rounded-full hover-scale relative overflow-hidden"

    return (
        <motion.div style={{ x: mouseX, y: mouseY }}>
            <Link
                ref={ref}
                href={href}
                className={`${baseClasses} ${className || ''}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {variant === "primary" && (
                    <div className="absolute inset-0 animate-shimmer opacity-0 hover:opacity-100 transition-opacity" />
                )}
                <span className="relative z-10">{children}</span>
            </Link>
        </motion.div>
    )
}

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20">
            {/* Neural Flow Field Background */}
            <div className="absolute inset-0 z-0">
                <NeuralBackground
                    color="#c96ef0" // Purple/pink from the gradient theme
                    trailOpacity={0.1}
                    particleCount={600}
                    speed={0.8}
                />
            </div>

            {/* Background Gradient Orbs - Enhanced */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Main rotating gradient orb */}
                <div
                    className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-5 blur-[160px] animate-rotate-gradient"
                    style={{
                        background: 'linear-gradient(229deg, rgb(223, 122, 254) 13%, rgba(201, 110, 240, 0.3) 35%, rgba(164, 92, 219, 0.2) 64%, rgb(129, 74, 200) 88%)',
                        transform: 'translate(-50%, -50%)'
                    }}
                />

                {/* Secondary pulsing orb */}
                <div
                    className="absolute top-1/2 left-1/2 w-[350px] h-[350px] rounded-full opacity-40 dark:opacity-7 blur-[140px] animate-smooth-pulse"
                    style={{
                        background: 'linear-gradient(141deg, rgb(223, 122, 254) 13%, rgba(201, 110, 240, 0.4) 35%, rgba(164, 92, 219, 0.3) 64%, rgb(129, 74, 200) 88%)',
                        transform: 'translate(-50%, -50%)',
                        animationDelay: '2s'
                    }}
                />

                {/* Accent gradient orb with shift */}
                <div
                    className="absolute top-1/2 left-1/2 w-[250px] h-[250px] rounded-full opacity-30 dark:opacity-4 blur-[120px] animate-float"
                    style={{
                        background: 'radial-gradient(circle, rgba(223, 122, 254, 0.6) 0%, rgba(129, 74, 200, 0.4) 70%, transparent 100%)',
                        transform: 'translate(-50%, -50%)',
                        animationDelay: '4s'
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
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism text-sm font-medium text-muted-foreground cursor-interactive">
                        <span className="w-2 h-2 rounded-full bg-gradient-primary animate-smooth-pulse" />
                        Multi-Agent Portfolio Manager
                    </span>
                </motion.div>

                {/* Headline with depth layers */}
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-6"
                >
                    <span className="text-foreground depth-layer-3">Smart Portfolio</span>
                    <br />
                    <span className="text-gradient depth-layer-2 inline-block animate-gradient-shift" style={{
                        background: 'linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end), var(--primary-gradient-start))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Management with MACANE
                    </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto mb-10 depth-layer-1"
                >
                    MACANE leverages multi-agent AI systems to optimize your portfolio,
                    reduce risks, and drive intelligent investment decisions at scale.
                </motion.p>

                {/* CTA Buttons with magnetic effect */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <MagneticButton href="/dashboard" variant="primary">
                        Start Free Trial
                    </MagneticButton>
                    <MagneticButton href="#features" variant="secondary">
                        Learn More
                    </MagneticButton>
                </motion.div>
            </motion.div>
        </section>
    )
}
