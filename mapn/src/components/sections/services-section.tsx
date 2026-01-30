'use client'

import { motion } from "framer-motion"
import { Workflow, LineChart, Bell, FileSearch } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"

const services = [
    {
        icon: Workflow,
        title: "Automated Rebalancing",
        description: "Intelligent agents automatically rebalance your portfolio to maintain your target asset allocation."
    },
    {
        icon: LineChart,
        title: "Portfolio Optimization",
        description: "Data-driven portfolio management powered by multi-agent consensus algorithms."
    },
    {
        icon: Bell,
        title: "Real-time Portfolio Monitoring",
        description: "Continuous monitoring of assets with instant alerts and automated risk mitigation."
    },
    {
        icon: FileSearch,
        title: "Intelligent Analysis",
        description: "Deep analysis of market trends, risks, and opportunities using advanced AI models."
    },
]

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1] as const
        }
    }
}

export function ServicesSection() {
    return (
        <section id="services" className="section-padding bg-muted/20">
            <div className="max-w-[1000px] mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">Services</span>
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-6">
                        What MACANE Offers
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                        Comprehensive multi-agent portfolio management solutions tailored to your investment goals.
                    </p>
                </motion.div>

                {/* Services List */}
                <div className="space-y-4">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            variants={itemVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-xl glass-panel relative overflow-hidden transition-colors group"
                        >
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative z-10 flex items-start gap-6 hover:border-primary/30">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <service.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                                    <p className="text-muted-foreground">{service.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
