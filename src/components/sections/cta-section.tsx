'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function CTASection() {
    return (
        <section className="section-padding">
            <div className="max-w-[750px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="relative p-12 md:p-20 rounded-3xl overflow-hidden text-center"
                    style={{
                        background: 'linear-gradient(149deg, rgba(129, 74, 200, 0.4) 0%, rgba(13, 13, 13, 0.8) 29%, rgba(13, 13, 13, 0.8) 74%, rgba(129, 74, 200, 0.4) 100%)'
                    }}
                >
                    {/* Content */}
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
                            Ready to Transform
                            <br />
                            Your Portfolio?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-[500px] mx-auto mb-10">
                            Start managing your wealth with AI-powered intelligence today.
                            No credit card required.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-primary-foreground bg-gradient-primary rounded-full hover:opacity-90 transition-opacity shadow-lg glow-primary"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
