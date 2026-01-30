'use client'

import { motion } from "framer-motion"

const logos = [
    { name: "Vercel", width: 97 },
    { name: "Stripe", width: 129 },
    { name: "Notion", width: 103 },
    { name: "Linear", width: 129 },
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
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1] as const
        }
    }
}

export function LogosBar() {
    return (
        <section className="py-12 border-y border-border bg-muted/30">
            <div className="max-w-[700px] mx-auto px-6">
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-sm text-muted-foreground mb-8"
                >
                    Trusted by leading companies worldwide
                </motion.p>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
                >
                    {logos.map((logo) => (
                        <motion.div
                            key={logo.name}
                            variants={itemVariants}
                            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                            <span className="text-lg font-semibold tracking-tight">{logo.name}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
