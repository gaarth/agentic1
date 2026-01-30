'use client'

import { motion } from "framer-motion"
import { Bot, Zap, Brain, Network } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1] as const
        }
    }
}

export function BentoGrid() {
    return (
        <section className="section-padding">
            <div className="max-w-[1000px] mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">How It Works</span>
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-6">
                        Multi-Agent Portfolio Intelligence
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                        Depending on your goals, our multi-agent system collaborates to construct and maintain optimal portfolios.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {/* Large Card - Agent Collaboration */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-2 p-8 rounded-2xl glass-panel overflow-hidden relative group"
                    >
                        <GlowingEffect
                            spread={40}
                            glow={true}
                            disabled={false}
                            proximity={64}
                            inactiveZone={0.01}
                            borderWidth={3}
                        />
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                            <div className="flex-1">
                                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                                    <Network className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-3">Agent Collaboration</h3>
                                <p className="text-muted-foreground leading-relaxed max-w-md">
                                    Four specialized agents work in parallel, each contributing their expertise to reach consensus on optimal investment decisions.
                                </p>
                            </div>
                            <div className="flex-shrink-0 w-full md:w-[300px] h-[150px] rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                                <div className="flex items-center gap-3">
                                    {[Bot, Brain, Zap, Bot].map((Icon, i) => (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded-full bg-gradient-primary/20 border border-primary/30 flex items-center justify-center"
                                            style={{ animationDelay: `${i * 0.2}s` }}
                                        >
                                            <Icon className="w-5 h-5 text-primary" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card - Real-time Processing */}
                    <motion.div
                        variants={itemVariants}
                        className="p-8 rounded-2xl glass-panel relative overflow-hidden"
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
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Real-time Processing</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Agents evaluate and respond within milliseconds, enabling rapid iteration and decision-making.
                            </p>
                        </div>
                    </motion.div>

                    {/* Card - Consensus Engine */}
                    <motion.div
                        variants={itemVariants}
                        className="p-8 rounded-2xl glass-panel relative overflow-hidden"
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
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Consensus Engine</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                A supervisor agent synthesizes input from all agents to produce balanced, well-reasoned outcomes.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
