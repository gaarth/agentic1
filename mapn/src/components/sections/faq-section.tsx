'use client'

import { motion } from "framer-motion"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "How does the multi-agent system work?",
        answer: "Our system uses four specialized AI agents (Risk, Growth, Compliance, and Liquidity) that analyze data from their unique perspectives. A supervisor agent then synthesizes their recommendations to reach an optimal consensus."
    },
    {
        question: "What kind of data does Xtract analyze?",
        answer: "Xtract can analyze portfolio data, market trends, risk metrics, compliance requirements, and liquidity indicators. The system is designed to work with your existing data sources."
    },
    {
        question: "How long does it take to see results?",
        answer: "The negotiation process typically completes within seconds, delivering real-time recommendations. You'll start seeing actionable insights immediately after connecting your data."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade encryption and security practices. Your data is processed in isolated environments and never shared with third parties."
    },
    {
        question: "Can I customize the agent priorities?",
        answer: "Yes, you can set custom constraints and priorities for each agent. For example, you might prioritize risk management over growth, or set specific compliance thresholds."
    },
]

export function FAQSection() {
    return (
        <section id="faq" className="section-padding">
            <div className="max-w-[700px] mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">FAQ</span>
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-6">
                        Frequently Asked Questions
                    </h2>
                </motion.div>

                {/* FAQ Accordion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Accordion type="single" collapsible className="space-y-3">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="glass-panel rounded-xl px-6 border-0"
                            >
                                <AccordionTrigger className="text-left hover:no-underline py-5">
                                    <span className="font-medium">{faq.question}</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground pb-5">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    )
}
