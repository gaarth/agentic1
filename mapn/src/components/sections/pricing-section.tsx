"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/components/providers/currency-provider"

const tiers = [
    {
        name: "Starter",
        price: "0",
        description: "Perfect for exploring the power of AI portfolio management.",
        features: [
            "Basic Portfolio Analysis",
            "1 Connected Account",
            "Daily Market Summaries",
            "Standard Support",
            "Community Access",
        ],
        cta: "Start Free",
        href: "/dashboard",
        popular: false,
    },
    {
        name: "Pro",
        price: "49",
        description: "Advanced features for serious investors and traders.",
        features: [
            "Real-time Risk Analysis",
            "Unlimited Connected Accounts",
            "Smart Rebalancing",
            "Priority Support",
            "Advanced Growth Strategies",
            "Compliance Monitoring",
        ],
        cta: "Get Started",
        href: "/dashboard",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "Tailored solutions for institutions and high-net-worth individuals.",
        features: [
            "Dedicated Supervisor Agent",
            "Custom Strategy Implementation",
            "API Access",
            "24/7 Phone Support",
            "Institutional Reporting",
            "Private Server Options",
        ],
        cta: "Contact Sales",
        href: "mailto:sales@macane.ai",
        popular: false,
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

export function PricingSection() {
    const { formatPrice } = useCurrency()

    return (
        <section id="pricing" className="section-padding">
            <div className="max-w-[1200px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">Pricing</span>
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-6">
                        Choose Your Plan
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                        Transparent pricing for every stage of your investment journey.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {tiers.map((tier) => (
                        <motion.div
                            key={tier.name}
                            variants={itemVariants}
                            className={cn(
                                "relative rounded-3xl p-8 flex flex-col h-full glass-panel overflow-hidden",
                                tier.popular ? "border-primary/50 shadow-lg shadow-primary/10" : ""
                            )}
                        >
                            {tier.popular && (
                                <GlowingEffect
                                    spread={40}
                                    glow={true}
                                    disabled={false}
                                    proximity={64}
                                    inactiveZone={0.01}
                                    borderWidth={3}
                                />
                            )}

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        {tier.price !== "Custom" ? (
                                            <>
                                                <span className="text-4xl font-bold tracking-tight">
                                                    {formatPrice(tier.price).replace(/\.00$/, '')}
                                                </span>
                                                <span className="text-muted-foreground">/mo</span>
                                            </>
                                        ) : (
                                            <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                                        {tier.description}
                                    </p>
                                </div>

                                <div className="flex-1 mb-8">
                                    <ul className="space-y-3">
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                                                <Check className="w-5 h-5 text-primary shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    href={tier.href}
                                    className={cn(
                                        "w-full text-center py-3 rounded-full font-medium transition-all duration-300",
                                        tier.popular
                                            ? "bg-gradient-primary text-white hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
                                            : "bg-secondary text-foreground hover:bg-secondary/80"
                                    )}
                                >
                                    {tier.cta}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
