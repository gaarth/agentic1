'use client'

import { motion } from "framer-motion"
import { ShieldCheck, TrendingUp, Scale, Droplets } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"

// Features based on existing agent system
const features = [
    {
        icon: ShieldCheck,
        title: "Risk Assessment",
        description: "AI-powered risk analysis that evaluates portfolio exposure and volatility in real-time.",
        gradient: "from-red-500/20 to-orange-500/20"
    },
    {
        icon: TrendingUp,
        title: "Growth Optimization",
        description: "Intelligent growth strategies that identify high-potential opportunities and maximize returns.",
        gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
        icon: Scale,
        title: "Compliance Monitoring",
        description: "Automated regulatory compliance checks ensuring adherence to industry standards.",
        gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
        icon: Droplets,
        title: "Liquidity Management",
        description: "Smart liquidity analysis that ensures optimal cash flow and asset accessibility.",
        gradient: "from-purple-500/20 to-pink-500/20"
    },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1] as const
        }
    }
}

export function FeaturesSection() {
    return (
        <section id="features" className="section-padding">
            <div className="max-w-[1000px] mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">Features</span>
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-6">
                        Multi-Agent AI System
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                        Four specialized AI agents work together to analyze, optimize, and manage your investment portfolio with unprecedented precision.
                    </p>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={itemVariants}
                            className="group p-8 rounded-2xl glass-panel relative overflow-hidden transition-all duration-300"
                        >
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7 text-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
