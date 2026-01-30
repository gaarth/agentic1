'use client'

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Info, TrendingUp, Shield, Leaf, Droplets, Target,
    AlertTriangle, CheckCircle2, PieChart, Building2,
    Globe, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { UserSurveyResponse } from '@/lib/database.types';

interface InvestmentInsightsProps {
    allocation: Record<string, number>;
    assets: Array<{
        symbol: string;
        expected_return: number;
        volatility: number;
        esg_score: number;
        sector?: string;
        name?: string;
    }>;
    surveyResponse: UserSurveyResponse | null;
    metrics: {
        yield: number;
        volatility: number;
        esg: number;
    } | null;
    targetMetrics: {
        returnTarget: number;
        volatilityTarget: number;
        esgTarget: number;
    };
    agentReasoning: {
        risk: string;
        growth: string;
        compliance: string;
        liquidity: string;
    };
}

interface TooltipData {
    title: string;
    content: string;
}

// Info Tooltip Component
function InfoTooltip({ data }: { data: TooltipData }) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => setIsVisible(true), 200);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    return (
        <div className="relative inline-block">
            <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="ml-1.5 text-muted-foreground/50 hover:text-primary transition-colors"
            >
                <Info className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-background rounded-xl border border-border shadow-xl shadow-black/20"
                    >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-background border-r border-b border-border rotate-45" />
                        <h4 className="font-semibold text-sm text-foreground mb-1">{data.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{data.content}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Generate personalized tooltip content
function getTooltipContent(
    metric: string,
    survey: UserSurveyResponse | null,
    metrics: { yield: number; volatility: number; esg: number } | null,
    target: { returnTarget: number; volatilityTarget: number; esgTarget: number }
): TooltipData {
    const tooltips: Record<string, TooltipData> = {
        yield: {
            title: "Expected Return (Yield)",
            content: survey
                ? `Based on your ${survey.riskTolerance} risk profile and ${survey.investmentHorizon}-term horizon, we targeted ${target.returnTarget}% annual returns. ${metrics && metrics.yield >= target.returnTarget ? 'Your portfolio exceeds this target!' : 'We balanced this against your risk constraints.'}`
                : "The weighted average annual return expected from your portfolio based on historical data and market projections."
        },
        volatility: {
            title: "Volatility (Risk Level)",
            content: survey
                ? `Given your ${survey.downsideComfort} comfort with market downturns and ${survey.riskTolerance} risk tolerance, we capped volatility at ${target.volatilityTarget}%. ${metrics && metrics.volatility <= target.volatilityTarget ? 'Your portfolio is within safe limits.' : 'Some trade-offs were made to optimize returns.'}`
                : "A measure of price fluctuation risk. Lower volatility means more stable but potentially lower returns; higher volatility means more risk but potential for higher gains."
        },
        esg: {
            title: "ESG Score",
            content: survey
                ? `Your portfolio's Environmental, Social, and Governance score reflects ethical investing standards. ${survey.sectorExclusions && survey.sectorExclusions.length > 0 ? `We excluded ${survey.sectorExclusions.join(', ')} as per your preferences.` : 'No sector exclusions were applied.'}`
                : "A composite score measuring the environmental impact, social responsibility, and governance practices of companies in your portfolio."
        },
        downside: {
            title: "Downside Risk",
            content: survey
                ? `Based on your ${survey.downsideComfort} tolerance for losses, we structured the portfolio to limit potential drawdowns. In adverse market conditions, your maximum expected loss is minimized through diversification.`
                : "The potential loss you could experience in unfavorable market conditions, typically measured as the maximum expected drawdown."
        },
        allocation: {
            title: "Asset Allocation",
            content: survey
                ? `Your allocation prioritizes ${survey.assetClasses?.join(', ') || 'diversified assets'} based on your preferences. ${survey.incomeNeeds === 'regular' ? 'Income-generating assets were prioritized.' : 'Growth-oriented allocation was applied.'}`
                : "The distribution of your capital across different asset classes and securities to optimize risk-adjusted returns."
        }
    };

    return tooltips[metric] || { title: metric, content: "Metric explanation not available." };
}

export function InvestmentInsights({
    allocation,
    assets,
    surveyResponse,
    metrics,
    targetMetrics,
    agentReasoning
}: InvestmentInsightsProps) {
    // Calculate sector distribution
    const sectorDistribution = Object.entries(allocation).reduce((acc, [symbol, weight]) => {
        const asset = assets.find(a => a.symbol === symbol);
        const sector = asset?.sector || 'Other';
        acc[sector] = (acc[sector] || 0) + weight;
        return acc;
    }, {} as Record<string, number>);

    // Get top holdings
    const topHoldings = Object.entries(allocation)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symbol, weight]) => {
            const asset = assets.find(a => a.symbol === symbol);
            return { symbol, weight, asset };
        });

    // Build personalized explanation
    const buildPersonalizedSummary = () => {
        if (!surveyResponse) return null;

        const riskDescriptor = {
            conservative: 'stability-focused',
            balanced: 'balanced',
            aggressive: 'growth-oriented'
        }[surveyResponse.riskTolerance] || 'balanced';

        const horizonDescriptor = {
            short: '1-2 year',
            medium: '3-5 year',
            long: '5+ year'
        }[surveyResponse.investmentHorizon] || 'medium-term';

        return (
            <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                    Based on your <span className="text-foreground font-medium">{riskDescriptor}</span> investment style
                    and <span className="text-foreground font-medium">{horizonDescriptor}</span> investment horizon,
                    our AI agents have constructed a portfolio targeting{' '}
                    <span className="text-primary font-medium">{surveyResponse.expectedReturnRange?.min || 10}-{surveyResponse.expectedReturnRange?.max || 15}% annual returns</span> while
                    maintaining volatility below <span className="text-foreground font-medium">{targetMetrics.volatilityTarget}%</span>.
                </p>

                {surveyResponse.assetClasses && surveyResponse.assetClasses.length > 0 && (
                    <p className="text-muted-foreground leading-relaxed">
                        Your preference for <span className="text-foreground font-medium">{surveyResponse.assetClasses.join(', ')}</span> was
                        incorporated into the asset selection process, with{' '}
                        {surveyResponse.incomeNeeds === 'regular'
                            ? 'an emphasis on dividend-yielding securities for regular income.'
                            : 'a focus on capital appreciation for long-term wealth building.'}
                    </p>
                )}

                {surveyResponse.sectorExclusions && surveyResponse.sectorExclusions.length > 0 && (
                    <p className="text-muted-foreground leading-relaxed">
                        <span className="text-red-400 font-medium">Excluded sectors:</span>{' '}
                        {surveyResponse.sectorExclusions.join(', ')} — as specified in your ethical preferences.
                    </p>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8"
        >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
                    <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Investment Insights & Summary</h2>
                    <p className="text-sm text-muted-foreground">
                        Personalized analysis of your optimized portfolio
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Personalized Summary */}
                <div className="glass-panel p-6 rounded-[24px]">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Why These Selections?
                    </h3>

                    {buildPersonalizedSummary()}

                    {/* Agent Decisions Summary */}
                    <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                            Agent Decisions
                        </h4>
                        <div className="space-y-3">
                            {agentReasoning.risk && (
                                <div className="flex items-start gap-3">
                                    <Shield className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-muted-foreground">{agentReasoning.risk.substring(0, 150)}...</p>
                                </div>
                            )}
                            {agentReasoning.growth && (
                                <div className="flex items-start gap-3">
                                    <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-muted-foreground">{agentReasoning.growth.substring(0, 150)}...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Metrics with Tooltips */}
                <div className="space-y-4">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Expected Return */}
                        <div className="glass-panel p-5 rounded-[20px]">
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-sm text-muted-foreground">Expected Return</span>
                                <InfoTooltip data={getTooltipContent('yield', surveyResponse, metrics, targetMetrics)} />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">{metrics?.yield.toFixed(1) || '--'}%</span>
                                {metrics && metrics.yield >= targetMetrics.returnTarget ? (
                                    <span className="text-green-500 text-xs flex items-center gap-0.5 mb-1">
                                        <ArrowUpRight className="w-3 h-3" /> Target met
                                    </span>
                                ) : (
                                    <span className="text-yellow-500 text-xs flex items-center gap-0.5 mb-1">
                                        <ArrowDownRight className="w-3 h-3" /> Optimized
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Volatility */}
                        <div className="glass-panel p-5 rounded-[20px]">
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-sm text-muted-foreground">Volatility</span>
                                <InfoTooltip data={getTooltipContent('volatility', surveyResponse, metrics, targetMetrics)} />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">{metrics?.volatility.toFixed(1) || '--'}%</span>
                                {metrics && metrics.volatility <= targetMetrics.volatilityTarget ? (
                                    <span className="text-green-500 text-xs flex items-center gap-0.5 mb-1">
                                        <CheckCircle2 className="w-3 h-3" /> Within limit
                                    </span>
                                ) : (
                                    <span className="text-yellow-500 text-xs flex items-center gap-0.5 mb-1">
                                        <AlertTriangle className="w-3 h-3" /> Elevated
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ESG Score */}
                        <div className="glass-panel p-5 rounded-[20px]">
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-sm text-muted-foreground">ESG Score</span>
                                <InfoTooltip data={getTooltipContent('esg', surveyResponse, metrics, targetMetrics)} />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">{metrics?.esg.toFixed(0) || '--'}</span>
                                <span className="text-xs text-muted-foreground mb-1">/ 100</span>
                            </div>
                            <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metrics?.esg || 0}%` }}
                                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Downside Risk */}
                        <div className="glass-panel p-5 rounded-[20px]">
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-sm text-muted-foreground">Downside Risk</span>
                                <InfoTooltip data={getTooltipContent('downside', surveyResponse, metrics, targetMetrics)} />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">
                                    {metrics ? (metrics.volatility * 1.5).toFixed(1) : '--'}%
                                </span>
                                <span className="text-xs text-muted-foreground mb-1">max drawdown</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Holdings */}
                    <div className="glass-panel p-5 rounded-[20px]">
                        <div className="flex items-center gap-1 mb-4">
                            <PieChart className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold">Top Holdings</span>
                            <InfoTooltip data={getTooltipContent('allocation', surveyResponse, metrics, targetMetrics)} />
                        </div>
                        <div className="space-y-3">
                            {topHoldings.map(({ symbol, weight, asset }) => (
                                <div key={symbol} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold">
                                            {symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{symbol}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {asset?.sector || 'Technology'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{weight.toFixed(1)}%</p>
                                        <p className="text-xs text-muted-foreground">
                                            {asset?.expected_return.toFixed(1)}% return
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sector Distribution */}
                    <div className="glass-panel p-5 rounded-[20px]">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold">Sector Distribution</span>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(sectorDistribution)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 4)
                                .map(([sector, weight]) => (
                                    <div key={sector} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-24 truncate">{sector}</span>
                                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${weight}%` }}
                                                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                                                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-xs font-medium w-12 text-right">{weight.toFixed(1)}%</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
