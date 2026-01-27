'use client'

import { motion } from "framer-motion"
import { MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react"

// Animation variants based on spec
// Ease: cubic-bezier(0.4, 0, 0.2, 1)
const EASE_STANDARD = [0.4, 0, 0.2, 1] as const;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
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
            ease: EASE_STANDARD
        }
    }
}

export function DashboardView() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
                    <p className="text-sm text-muted-foreground">Welcome back to your trading desk.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-[12px] text-sm font-medium hover:bg-secondary/80 transition-all">
                        Reports
                    </button>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-[12px] text-sm font-medium hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                        Add Funds
                    </button>
                </div>
            </motion.div>

            {/* Main Chart Card */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-[24px] h-[360px] flex flex-col relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Balance</h2>
                        <div className="flex items-baseline gap-3 mt-1">
                            <span className="text-4xl font-bold text-foreground text-shadow-sm">$124,592.00</span>
                            <span className="flex items-center text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                +2.4%
                            </span>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex bg-muted/50 p-1 rounded-[14px]">
                        {['1D', '1W', '1M', '1Y', 'ALL'].map((tab, i) => (
                            <button key={tab} className={`px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all ${i === 2 ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Graph Placeholder - imitating a smooth curve */}
                <div className="flex-1 w-full bg-gradient-to-t from-primary/5 to-transparent rounded-xl border border-primary/10 flex items-end p-0 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 text-sm">
                        Interactive Chart Area
                    </div>
                    <div className="w-full h-full relative">
                        {/* Decorative SVG Curve */}
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                                    <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            <path d="M0,150 C100,120 200,180 300,90 C400,30 500,60 600,20 C700,-10 800,40 800,40" fill="none" stroke="url(#gradientStroke)" strokeWidth="3" filter="url(#glow)" className="drop-shadow-lg" />
                        </svg>
                    </div>
                </div>
            </motion.div>

            {/* Secondary Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Yield', value: '+$12,294', trend: '+8.2%', positive: true },
                    { label: 'Daily P&L', value: '-$245.00', trend: '-0.8%', positive: false },
                    { label: 'Win Rate', value: '68.4%', trend: 'High', positive: true }
                ].map((metric, i) => (
                    <motion.div variants={itemVariants} key={metric.label} className="glass-panel p-6 rounded-[20px] hover:scale-[1.02] hover:brightness-105 transition-all duration-300 cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-2xl font-semibold">{metric.value}</p>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${metric.positive ? 'text-primary bg-primary/10' : 'text-destructive bg-destructive/10'}`}>
                                {metric.positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {metric.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Table of Activity */}
            <motion.div variants={itemVariants} className="glass-panel rounded-[24px] p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">Recent Activity</h3>
                    <button className="text-sm text-primary hover:text-primary/80 font-medium">View All</button>
                </div>
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-muted-foreground border-b border-border/50">
                            <th className="pb-4 pl-4 font-medium">Asset</th>
                            <th className="pb-4 font-medium">Type</th>
                            <th className="pb-4 font-medium">Amount</th>
                            <th className="pb-4 font-medium sm:table-cell hidden">Date</th>
                            <th className="pb-4 font-medium text-right pr-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {[1, 2, 3, 4, 5].map((item, i) => (
                            <tr key={item} className="group hover:bg-white/5 transition-colors cursor-pointer">
                                <td className="py-4 pl-4 font-medium group-hover:text-primary transition-colors flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-xs">₿</div>
                                    BTC/USD
                                </td>
                                <td className="py-4 text-muted-foreground">Buy Limit</td>
                                <td className="py-4">0.45 BTC</td>
                                <td className="py-4 text-muted-foreground sm:table-cell hidden">Just now</td>
                                <td className="py-4 text-right pr-4">
                                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">Filled</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

        </motion.div>
    )
}
