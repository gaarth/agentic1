'use client'

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, PieChart, Percent } from 'lucide-react';

interface QuantitativeProjectionsProps {
    metrics: {
        yield: number;
        volatility: number;
        esg: number;
    } | null;
    allocation: Record<string, number>;
    capital: number;
}

interface ProjectionSlide {
    id: string;
    title: string;
    icon: typeof TrendingUp;
    color: string;
    getValue: (data: QuantitativeProjectionsProps) => { main: string; sub: string; detail: string };
}

const PROJECTION_SLIDES: ProjectionSlide[] = [
    {
        id: 'expected-return',
        title: 'Expected Annual Return',
        icon: TrendingUp,
        color: 'from-green-500 to-emerald-400',
        getValue: ({ metrics, capital }) => ({
            main: metrics ? `₹${((capital * metrics.yield) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '--',
            sub: metrics ? `${metrics.yield.toFixed(2)}% p.a.` : '--',
            detail: 'Projected annual earnings based on weighted expected returns'
        })
    },
    {
        id: 'upside-potential',
        title: 'Upside Potential (Bull Case)',
        icon: TrendingUp,
        color: 'from-blue-500 to-cyan-400',
        getValue: ({ metrics, capital }) => {
            const upside = metrics ? metrics.yield * 1.5 : 0;
            return {
                main: metrics ? `₹${((capital * upside) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '--',
                sub: metrics ? `${upside.toFixed(2)}% p.a.` : '--',
                detail: 'Potential earnings in favorable market conditions (+50% scenario)'
            };
        }
    },
    {
        id: 'downside-risk',
        title: 'Downside Risk (Bear Case)',
        icon: TrendingDown,
        color: 'from-red-500 to-orange-400',
        getValue: ({ metrics, capital }) => {
            const downside = metrics ? -metrics.volatility * 1.5 : 0;
            return {
                main: metrics ? `₹${((capital * downside) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '--',
                sub: metrics ? `${downside.toFixed(2)}%` : '--',
                detail: 'Potential loss in adverse market conditions (max drawdown)'
            };
        }
    },
    {
        id: 'volatility-range',
        title: 'Volatility Range',
        icon: Activity,
        color: 'from-purple-500 to-violet-400',
        getValue: ({ metrics }) => {
            const low = metrics ? (metrics.volatility * 0.7).toFixed(1) : '--';
            const high = metrics ? (metrics.volatility * 1.3).toFixed(1) : '--';
            return {
                main: metrics ? `${low}% - ${high}%` : '--',
                sub: `Avg: ${metrics?.volatility.toFixed(1) || '--'}%`,
                detail: 'Expected range of portfolio value fluctuation'
            };
        }
    },
    {
        id: 'asset-count',
        title: 'Portfolio Diversification',
        icon: PieChart,
        color: 'from-amber-500 to-yellow-400',
        getValue: ({ allocation }) => {
            const assetCount = Object.keys(allocation).length;
            const topWeight = Math.max(...Object.values(allocation), 0);
            return {
                main: `${assetCount} Assets`,
                sub: `Max weight: ${topWeight.toFixed(1)}%`,
                detail: 'Number of unique holdings and concentration level'
            };
        }
    },
    {
        id: 'sharpe-ratio',
        title: 'Risk-Adjusted Return',
        icon: Percent,
        color: 'from-teal-500 to-green-400',
        getValue: ({ metrics }) => {
            // Simplified Sharpe calculation (return / volatility)
            const sharpe = metrics && metrics.volatility > 0
                ? (metrics.yield - 5) / metrics.volatility // Assuming 5% risk-free rate
                : 0;
            return {
                main: metrics ? sharpe.toFixed(2) : '--',
                sub: 'Sharpe Ratio',
                detail: 'Risk-adjusted return efficiency (higher is better, >1 is good)'
            };
        }
    }
];

export function QuantitativeProjections({ metrics, allocation, capital }: QuantitativeProjectionsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);

    const slideWidth = 320;
    const gap = 16;
    const totalSlides = PROJECTION_SLIDES.length;

    const goTo = (index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
        setCurrentIndex(clampedIndex);
        animate(x, -clampedIndex * (slideWidth + gap), {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        });
    };

    const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
        setIsDragging(false);
        const threshold = 50;
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
            if (velocity > 0 || offset > threshold) {
                goTo(currentIndex - 1);
            } else {
                goTo(currentIndex + 1);
            }
        } else {
            goTo(currentIndex);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
                        <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Quantitative Projections</h3>
                        <p className="text-xs text-muted-foreground">Swipe or use arrows to explore</p>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => goTo(currentIndex - 1)}
                        disabled={currentIndex === 0}
                        className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => goTo(currentIndex + 1)}
                        disabled={currentIndex === totalSlides - 1}
                        className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Slider Container */}
            <div
                ref={containerRef}
                className="overflow-hidden cursor-grab active:cursor-grabbing"
            >
                <motion.div
                    className="flex gap-4"
                    style={{ x }}
                    drag="x"
                    dragConstraints={{
                        left: -(totalSlides - 1) * (slideWidth + gap),
                        right: 0
                    }}
                    dragElastic={0.1}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                >
                    {PROJECTION_SLIDES.map((slide, index) => {
                        const SlideIcon = slide.icon;
                        const values = slide.getValue({ metrics, allocation, capital });

                        return (
                            <motion.div
                                key={slide.id}
                                className="shrink-0"
                                style={{ width: slideWidth }}
                                animate={{
                                    scale: currentIndex === index ? 1 : 0.95,
                                    opacity: currentIndex === index ? 1 : 0.7,
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={`glass-panel p-6 rounded-[20px] h-full border ${currentIndex === index ? 'border-primary/30' : 'border-transparent'
                                    }`}>
                                    {/* Slide Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${slide.color}`}>
                                            <SlideIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {slide.title}
                                        </span>
                                    </div>

                                    {/* Main Value */}
                                    <div className="mb-2">
                                        <motion.p
                                            className="text-3xl font-bold tracking-tight"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            {values.main}
                                        </motion.p>
                                        <p className="text-sm text-primary font-medium mt-1">
                                            {values.sub}
                                        </p>
                                    </div>

                                    {/* Detail */}
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {values.detail}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-4">
                {PROJECTION_SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goTo(index)}
                        className={`transition-all duration-300 rounded-full ${currentIndex === index
                                ? 'w-6 h-2 bg-primary'
                                : 'w-2 h-2 bg-secondary hover:bg-muted-foreground/50'
                            }`}
                    />
                ))}
            </div>
        </motion.div>
    );
}
