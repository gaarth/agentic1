'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Newspaper, Bot, Play, Loader2, RefreshCw, Activity, CheckCircle2, Settings } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { MarketTicker, StockWatchlist } from '@/components/dashboard/market-data';
import { NewsTicker } from '@/components/dashboard/news-ticker';
import { NewsFeed } from '@/components/dashboard/news-feed';

import { SurveyModal } from '@/components/ui/survey-modal';
import { CapitalInput } from '@/components/ui/capital-input';
import { AllocationEvolutionChart } from '@/components/ui/allocation-evolution-chart';
import { InvestmentSummary } from '@/components/ui/investment-summary';
import { AgentLoadingModal } from '@/components/ui/agent-loading-modal';
import { InvestmentInsights } from '@/components/ui/investment-insights';
import { QuantitativeProjections } from '@/components/ui/quantitative-projections';
import { UserSurveyResponse } from '@/lib/database.types';
import { SupportedCurrency } from '@/lib/currency-api';
import { EnhancedNegotiationRound } from '@/lib/negotiation-engine';

// Types derived from backend
interface Asset {
    symbol: string;
    expected_return: number;
    volatility: number;
    esg_score: number;
    sector?: string;
    name?: string;
}

type TabType = 'negotiation' | 'markets' | 'news';

const tabs = [
    { id: 'negotiation' as TabType, label: 'Negotiation', icon: Bot },
    { id: 'markets' as TabType, label: 'Markets', icon: TrendingUp },
    { id: 'news' as TabType, label: 'News', icon: Newspaper },
];

const THINKING_PHRASES = [
    "Risk Agent analyzing portfolio variance...",
    "Growth Agent identifying high-yield opportunities...",
    "Compliance Agent verifying ESG mandates...",
    "Liquidity Agent assessing market depth...",
    "Supervisor Agent synthesizing strategy...",
    "Optimizing Sharpe ratio...",
    "Projecting future cash flows...",
    "Stress testing portfolio resilience...",
    "Rebalancing sector weights...",
    "Calculating beta coefficients...",
    "Evaluating macroeconomic indicators...",
    "Checking regulatory compliance..."
];

export function DashboardView() {
    const [activeTab, setActiveTab] = useState<TabType>('negotiation');
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [assets, setAssets] = useState<Asset[]>([]);
    const [allocation, setAllocation] = useState<Record<string, number>>({});
    const [negotiationId, setNegotiationId] = useState<string | null>(null);

    // New: Survey & Capital State
    const [showSurveyModal, setShowSurveyModal] = useState(false);
    const [showAgentLoading, setShowAgentLoading] = useState(false);
    const [capital, setCapital] = useState(100000);
    const [currency, setCurrency] = useState<SupportedCurrency>('INR');
    const [surveyResponse, setSurveyResponse] = useState<UserSurveyResponse | null>(null);
    const [pendingSurvey, setPendingSurvey] = useState<UserSurveyResponse | null>(null);

    // New: Enhanced Round Tracking
    const [negotiationRounds, setNegotiationRounds] = useState<EnhancedNegotiationRound[]>([]);
    const [agentReasoning, setAgentReasoning] = useState<{
        risk: string;
        growth: string;
        compliance: string;
        liquidity: string;
    }>({ risk: '', growth: '', compliance: '', liquidity: '' });
    const [targetMetrics, setTargetMetrics] = useState({
        returnTarget: 12,
        volatilityTarget: 15,
        esgTarget: 50
    });
    const [targetComparison, setTargetComparison] = useState<any>(null);

    // Thinking Animation State
    const [thinkingMessage, setThinkingMessage] = useState("");
    const usedPhrases = useRef<Set<string>>(new Set());

    // Metrics Calculation
    const metrics = useMemo(() => {
        if (Object.keys(allocation).length === 0 || assets.length === 0) return null;
        let totalWeight = 0, wRet = 0, wVol = 0, wESG = 0;
        Object.entries(allocation).forEach(([symbol, weight]) => {
            const asset = assets.find(a => a.symbol === symbol);
            if (asset) {
                wRet += asset.expected_return * weight;
                wVol += asset.volatility * weight;
                wESG += asset.esg_score * weight;
                totalWeight += weight;
            }
        });
        const f = totalWeight > 0 ? 100 / totalWeight : 1;
        return { yield: (wRet * f) / 100, volatility: (wVol * f) / 100, esg: (wESG * f) / 100 };
    }, [allocation, assets]);

    // Handle survey submission - shows loading modal
    const handleSurveySubmit = (survey: UserSurveyResponse) => {
        setSurveyResponse(survey);
        setPendingSurvey(survey);
        setShowSurveyModal(false);
        setShowAgentLoading(true); // Show agent loading modal
    };

    // Called when loading modal completes - starts actual negotiation
    const handleLoadingComplete = () => {
        setShowAgentLoading(false);
        if (pendingSurvey) {
            startNegotiation(pendingSurvey);
            setPendingSurvey(null);
        }
    };

    // Initiate negotiation flow
    const initiateNegotiation = () => {
        // Show survey modal first
        setShowSurveyModal(true);
    };

    const startNegotiation = async (survey: UserSurveyResponse | null = surveyResponse) => {
        setStatus('running');
        setAllocation({});
        setNegotiationRounds([]);
        setAgentReasoning({ risk: '', growth: '', compliance: '', liquidity: '' });
        setThinkingMessage("Initializing Agents...");
        usedPhrases.current.clear();

        try {
            const res = await fetch('/api/negotiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    capital,
                    currency,
                    surveyResponse: survey
                })
            });

            if (!res.body) throw new Error("No stream");
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.trim()) handleEvent(JSON.parse(line));
                }
            }
            setStatus('completed');
            setThinkingMessage("Negotiation Complete.");
        } catch (err) {
            console.error(err);
            setStatus('error');
            setThinkingMessage("Error in connection.");
        }
    };

    const handleEvent = (event: any) => {
        switch (event.type) {
            case 'init':
                setNegotiationId(event.negotiationId);
                setAssets(event.assets || []);
                setAllocation(event.initialAllocation);
                if (event.constraints) {
                    setTargetMetrics({
                        returnTarget: event.constraints.target_expected_return || 12,
                        volatilityTarget: event.constraints.max_volatility || 15,
                        esgTarget: event.constraints.esg_minimum || 50
                    });
                }
                break;
            case 'round':
                setAllocation(event.data.proposed_allocation);
                setNegotiationRounds(prev => [...prev, event.data]);
                if (event.agentReasoning) {
                    setAgentReasoning(event.agentReasoning);
                }
                if (event.targetComparison) {
                    setTargetComparison(event.targetComparison);
                }
                break;
            case 'done':
                setAllocation(event.finalAllocation);
                if (event.agentReasoning) {
                    setAgentReasoning(event.agentReasoning);
                }
                if (event.targetComparison) {
                    setTargetComparison(event.targetComparison);
                }
                break;
            case 'error':
                setStatus('error');
                break;
        }
    };

    // Thinking Message Cycler
    useEffect(() => {
        if (status !== 'running') return;

        const cycleMessage = () => {
            const available = THINKING_PHRASES.filter(p => !usedPhrases.current.has(p));
            if (available.length === 0) {
                usedPhrases.current.clear();
                return;
            }
            const next = available[Math.floor(Math.random() * available.length)];
            usedPhrases.current.add(next);
            setThinkingMessage(next);
        };

        cycleMessage();
        const interval = setInterval(cycleMessage, 2500);
        return () => clearInterval(interval);
    }, [status]);

    const chartData = useMemo(() => {
        return Object.entries(allocation)
            .map(([symbol, weight]) => ({ name: symbol, weight }))
            .sort((a, b) => b.weight - a.weight)
            .filter(i => i.weight > 0);
    }, [allocation]);

    return (
        <div className="space-y-6">
            {/* Survey Modal */}
            <SurveyModal
                isOpen={showSurveyModal}
                onClose={() => setShowSurveyModal(false)}
                onSubmit={handleSurveySubmit}
            />

            {/* Agent Loading Modal */}
            <AgentLoadingModal
                isOpen={showAgentLoading}
                onComplete={handleLoadingComplete}
            />

            {/* Top Sliders Section */}
            <div className="space-y-4">
                <MarketTicker />
                <NewsTicker />
            </div>

            {/* Main Dashboard Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-6 px-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">MACANE Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Autonomous Multi-Agent Portfolio Manager</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* Tab Navigation */}
                        <div className="flex items-center bg-secondary/50 rounded-xl p-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === tab.id
                                        ? 'text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-primary rounded-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <tab.icon className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'negotiation' && (
                        <motion.div
                            key="negotiation"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6 px-4"
                        >
                            {/* Capital Input Section - Only show before negotiation starts */}
                            {status === 'idle' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-panel p-6 rounded-[24px] flex flex-col md:flex-row items-stretch md:items-end gap-6"
                                >
                                    <CapitalInput
                                        value={capital}
                                        currency={currency}
                                        onChange={(val, curr) => {
                                            setCapital(val);
                                            setCurrency(curr);
                                        }}
                                        disabled={false}
                                    />
                                    <div className="flex items-center pb-[26px]">
                                        <button
                                            onClick={initiateNegotiation}
                                            disabled={capital <= 0}
                                            className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-[52px]"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Configure & Start
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Chart Area */}
                                <div className="lg:col-span-2 glass-panel p-8 rounded-[24px] min-h-[650px] flex flex-col relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-primary" />
                                            Live Allocation
                                        </h2>
                                        {status !== 'idle' && (
                                            <button
                                                onClick={() => {
                                                    setStatus('idle');
                                                    setAllocation({});
                                                    setNegotiationRounds([]);
                                                }}
                                                className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex-1 w-full relative z-10">
                                        {negotiationRounds.length > 0 ? (
                                            // Show evolution chart when we have round data
                                            <AllocationEvolutionChart
                                                rounds={negotiationRounds}
                                                targetMetrics={targetMetrics}
                                                isNegotiating={status === 'running'}
                                            />
                                        ) : chartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                                    <YAxis hide domain={[0, 45]} />
                                                    <Tooltip
                                                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                                                        contentStyle={{
                                                            backgroundColor: 'hsl(var(--background))',
                                                            borderRadius: '12px',
                                                            border: '1px solid hsl(var(--border))',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Bar dataKey="weight" radius={[6, 6, 0, 0]} animationDuration={1000}>
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill="#e5e5e5" />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40">
                                                <Bot className="w-16 h-16 mb-4 opacity-20" />
                                                <p>Configure your preferences to generate portfolio</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thinking Overlay Status */}
                                    <div className="mt-6 h-12 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            {status === 'running' && (
                                                <motion.div
                                                    key={thinkingMessage}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="text-lg font-medium text-primary flex items-center gap-3 bg-secondary/30 px-6 py-2 rounded-full border border-primary/10"
                                                >
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {thinkingMessage}
                                                </motion.div>
                                            )}
                                            {status === 'completed' && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="text-lg font-medium text-green-500 flex items-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Optimization Complete
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Metrics Side */}
                                <div className="flex flex-col gap-6">
                                    <MetricCard
                                        label="Exp. Return (Yield)"
                                        value={metrics ? `${metrics.yield.toFixed(1)}%` : '--'}
                                        sub={`Target ≥ ${targetMetrics.returnTarget}%`}
                                        positive={metrics ? metrics.yield >= targetMetrics.returnTarget : true}
                                    />
                                    <MetricCard
                                        label="Volatility (Risk)"
                                        value={metrics ? `${metrics.volatility.toFixed(1)}%` : '--'}
                                        sub={`Max ${targetMetrics.volatilityTarget}%`}
                                        positive={metrics ? metrics.volatility <= targetMetrics.volatilityTarget : true}
                                        invertColor
                                    />
                                    <MetricCard
                                        label="ESG Score"
                                        value={metrics ? metrics.esg.toFixed(0) : '--'}
                                        sub={`Min ${targetMetrics.esgTarget}`}
                                        positive={metrics ? metrics.esg >= targetMetrics.esgTarget : true}
                                    />
                                </div>
                            </div>

                            {/* Investment Insights & Summary - Always renders after negotiation completes */}
                            {status === 'completed' && (
                                <div className="px-4">
                                    {/* Investment Insights with personalized summary and tooltips */}
                                    <InvestmentInsights
                                        allocation={allocation}
                                        assets={assets}
                                        surveyResponse={surveyResponse}
                                        metrics={metrics}
                                        targetMetrics={targetMetrics}
                                        agentReasoning={agentReasoning}
                                    />

                                    {/* Quantitative Projections Slider */}
                                    <QuantitativeProjections
                                        metrics={metrics}
                                        allocation={allocation}
                                        capital={capital}
                                    />

                                    {/* Legacy Investment Summary - Agent Slider */}
                                    <InvestmentSummary
                                        agentReasoning={agentReasoning}
                                        surveyResponse={surveyResponse}
                                        targetComparison={targetComparison}
                                        isVisible={true}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'markets' && (
                        <motion.div key="markets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4">
                            <StockWatchlist />
                        </motion.div>
                    )}

                    {activeTab === 'news' && (
                        <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[700px] px-4">
                            <NewsFeed />
                        </motion.div>
                    )}


                </AnimatePresence>
            </motion.div>
        </div>
    )
}

function MetricCard({ label, value, sub, positive, invertColor }: any) {
    const isPositive = invertColor ? !positive : positive;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-[24px] flex-1 flex flex-col justify-center relative overflow-hidden group hover:border-primary/20 transition-colors"
        >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-12 h-12" />
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-wide">{label}</p>
            <div className="flex flex-col gap-1">
                <span className="text-4xl font-bold tracking-tight">{value}</span>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-muted-foreground">{sub}</span>
                </div>
            </div>
        </motion.div>
    )
}
