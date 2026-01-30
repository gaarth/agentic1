'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Shield, Zap, BarChart3, Globe, LucideIcon } from 'lucide-react'

interface Feature {
    title: string;
    description: string;
    icon: LucideIcon;
}

const features: Feature[] = [
    {
        title: "Real-time Analytics",
        description: "Monitor your portfolio performance with millisecond precision.",
        icon: BarChart3,
    },
    {
        title: "AI-Powered Insights",
        description: "Get actionable trading signals from our advanced ML models.",
        icon: Zap,
    },
    {
        title: "Global Markets",
        description: "Access assets from over 50 exchanges worldwide.",
        icon: Globe,
    },
    {
        title: "Bank-Grade Security",
        description: "Your assets are protected by state-of-the-art encryption.",
        icon: Shield,
    },
]

export function FeaturesSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <section ref={containerRef} className="py-24 relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <motion.div
                    style={{ opacity }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Advanced Features
                    </h2>
                    <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                        Everything you need to master the markets.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <ParallaxCard key={index} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function ParallaxCard({ feature, index }: { feature: Feature, index: number }) {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // Parallax effect: Items move at different speeds
    // Even items move slightly faster/more distance than odd items to create depth
    const yRange = index % 2 === 0 ? [100, -100] : [50, -50];
    const y = useTransform(scrollYProgress, [0, 1], yRange)

    return (
        <motion.div
            ref={ref}
            style={{ y }}
            className="flex flex-col items-center text-center p-6 bg-background/50 backdrop-blur-sm border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
        >
            <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
        </motion.div>
    )
}
