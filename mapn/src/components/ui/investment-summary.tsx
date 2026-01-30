'use client'

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    Shield, TrendingUp, Scale, Droplets,
    ChevronLeft, ChevronRight, Sparkles, Target,
    BadgeCheck, AlertTriangle
} from 'lucide-react';
import { UserSurveyResponse } from '@/lib/database.types';

interface AgentExplanation {
    risk: string;
    growth: string;
    compliance: string;
    liquidity: string;
}

interface InvestmentSummaryProps {
    agentReasoning: AgentExplanation;
    surveyResponse: UserSurveyResponse | null;
    targetComparison: {
        returnTarget: number;
        returnActual: number;
        returnMet: boolean;
        volatilityTarget: number;
        volatilityActual: number;
        volatilityMet: boolean;
        esgTarget: number;
        esgActual: number;
        esgMet: boolean;
    } | null;
    isVisible: boolean;
}

const AGENTS = [
    {
        id: 'risk',
        name: 'Risk Agent',
        title: 'Risk Assessment',
        icon: Shield,
        color: 'from-red-500 to-orange-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        description: 'Analyzed volatility and downside protection'
    },
    {
        id: 'growth',
        name: 'Growth Agent',
        title: 'Growth Optimization',
        icon: TrendingUp,
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Maximized return potential within constraints'
    },
    {
        id: 'compliance',
        name: 'Compliance Agent',
        title: 'ESG & Compliance',
        icon: Scale,
        color: 'from-purple-500 to-violet-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        description: 'Ensured ESG standards and sector compliance'
    },
    {
        id: 'liquidity',
        name: 'Liquidity Agent',
        title: 'Liquidity Analysis',
        icon: Droplets,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Verified tradability and exit options'
    }
];

// Generate personalized explanation based on survey
function getPersonalizedContext(
    agentId: string,
    survey: UserSurveyResponse | null,
    reasoning: string
): string {
    if (!survey) return reasoning || 'Optimizing portfolio allocation...';

    const contexts: Record<string, () => string> = {
        risk: () => {
            const tolerance = survey.riskTolerance;
            const comfort = survey.downsideComfort;

            let intro = '';
            if (tolerance === 'conservative') {
                intro = `Based on your conservative risk profile and ${comfort} tolerance for losses, I focused on minimizing volatility. `;
            } else if (tolerance === 'aggressive') {
                intro = `Your aggressive risk tolerance allows for higher volatility assets. `;
            } else {
                intro = `With your balanced approach to risk, I balanced stability with growth potential. `;
            }

            return intro + (reasoning || 'The portfolio is now within your specified volatility limits.');
        },

        growth: () => {
            const horizon = survey.investmentHorizon;
            const returnRange = survey.expectedReturnRange;

            let intro = '';
            if (horizon === 'long') {
                intro = `Your long-term horizon of 5+ years allows for more aggressive growth strategies. `;
            } else if (horizon === 'short') {
                intro = `Given your short-term horizon, I prioritized liquid, stable assets with modest growth. `;
            } else {
                intro = `With a medium-term outlook, I balanced growth opportunities with stability. `;
            }

            intro += `Targeting ${returnRange?.min || 10}%-${returnRange?.max || 15}% annual returns. `;
            return intro + (reasoning || '');
        },

        compliance: () => {
            const exclusions = survey.sectorExclusions || [];
            const taxSensitivity = survey.taxSensitivity;

            let intro = '';
            if (exclusions.length > 0) {
                intro = `I excluded ${exclusions.join(', ')} sectors as per your preferences. `;
            }
            if (taxSensitivity === 'high') {
                intro += `Given your high tax sensitivity, I prioritized tax-efficient investments. `;
            }

            return intro + (reasoning || 'All ESG and compliance requirements are met.');
        },

        liquidity: () => {
            const frequency = survey.rebalancingFrequency;
            const income = survey.incomeNeeds;

            let intro = '';
            if (income === 'regular') {
                intro = `Your need for regular income is reflected in dividend-paying allocations. `;
            }
            if (frequency === 'monthly') {
                intro += `With monthly rebalancing preference, I ensured high liquidity for all positions. `;
            }

            return intro + (reasoning || 'All positions have adequate liquidity for your needs.');
        }
    };

    return contexts[agentId]?.() || reasoning || 'Analysis complete.';
}

export function InvestmentSummary({
    agentReasoning,
    surveyResponse,
    targetComparison,
    isVisible
}: InvestmentSummaryProps) {
    const [currentAgent, setCurrentAgent] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: '-100px' });

    const nextAgent = () => {
        setCurrentAgent(prev => (prev + 1) % AGENTS.length);
    };

    const prevAgent = () => {
        setCurrentAgent(prev => (prev - 1 + AGENTS.length) % AGENTS.length);
    };

    const currentAgentData = AGENTS[currentAgent];
    const AgentIcon = currentAgentData.icon;
    const reasoning = agentReasoning[currentAgentData.id as keyof AgentExplanation] || '';
    const personalizedReasoning = getPersonalizedContext(currentAgentData.id, surveyResponse, reasoning);

    // Auto-advance every 8 seconds
    useEffect(() => {
        if (!isVisible) return;
        const timer = setInterval(nextAgent, 8000);
        return () => clearInterval(timer);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="mt-12"
        >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Personalized Investment Summary</h2>
                    <p className="text-sm text-muted-foreground">
                        How our AI agents optimized your portfolio
                    </p>
                </div>
            </div>

            {/* Target Achievement Banner */}
            {targetComparison && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`p-4 rounded-2xl border mb-6 ${targetComparison.returnMet && targetComparison.volatilityMet && targetComparison.esgMet
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-yellow-500/10 border-yellow-500/30'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {targetComparison.returnMet && targetComparison.volatilityMet && targetComparison.esgMet ? (
                            <>
                                <BadgeCheck className="w-6 h-6 text-green-500" />
                                <div>
                                    <p className="font-semibold text-green-400">All Targets Met</p>
                                    <p className="text-sm text-muted-foreground">
                                        Your portfolio meets all specified constraints
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                                <div>
                                    <p className="font-semibold text-yellow-400">
                                        Some Targets Adjusted
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Constraints were balanced to achieve optimal allocation
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Agent Slider */}
            <div className="relative">
                {/* Navigation Arrows */}
                <button
                    onClick={prevAgent}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-secondary/80 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={nextAgent}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-secondary/80 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Agent Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentAgent}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className={`p-8 rounded-3xl border ${currentAgentData.borderColor} ${currentAgentData.bgColor}`}
                    >
                        <div className="flex items-start gap-6">
                            {/* Agent Icon */}
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentAgentData.color} shadow-lg shrink-0`}>
                                <AgentIcon className="w-8 h-8 text-white" />
                            </div>

                            {/* Agent Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold">{currentAgentData.name}</h3>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                        {currentAgentData.title}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {currentAgentData.description}
                                </p>

                                {/* Agent's Personalized Reasoning */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-4 rounded-xl bg-background/50 border border-border"
                                >
                                    <div className="flex items-start gap-3">
                                        <Target className="w-4 h-4 mt-1 text-primary shrink-0" />
                                        <p className="text-sm leading-relaxed">
                                            {personalizedReasoning}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Survey Context Tags */}
                                {surveyResponse && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex flex-wrap gap-2 mt-4"
                                    >
                                        {currentAgentData.id === 'risk' && (
                                            <>
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">
                                                    {surveyResponse.riskTolerance} risk
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">
                                                    {surveyResponse.downsideComfort} downside comfort
                                                </span>
                                            </>
                                        )}
                                        {currentAgentData.id === 'growth' && (
                                            <>
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">
                                                    {surveyResponse.investmentHorizon} term
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">
                                                    {surveyResponse.expectedReturnRange?.min}-{surveyResponse.expectedReturnRange?.max}% target
                                                </span>
                                            </>
                                        )}
                                        {currentAgentData.id === 'compliance' && (
                                            <>
                                                {surveyResponse.sectorExclusions?.map(s => (
                                                    <span key={s} className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                                                        ❌ {s}
                                                    </span>
                                                ))}
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">
                                                    {surveyResponse.taxSensitivity} tax sensitivity
                                                </span>
                                            </>
                                        )}
                                        {currentAgentData.id === 'liquidity' && (
                                            <>
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">
                                                    {surveyResponse.rebalancingFrequency} rebalancing
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">
                                                    {surveyResponse.incomeNeeds} income
                                                </span>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Agent Dots Indicator */}
                <div className="flex justify-center gap-2 mt-6">
                    {AGENTS.map((agent, idx) => (
                        <button
                            key={agent.id}
                            onClick={() => setCurrentAgent(idx)}
                            className={`transition-all duration-300 rounded-full ${idx === currentAgent
                                    ? 'w-8 h-2 bg-primary'
                                    : 'w-2 h-2 bg-secondary hover:bg-muted-foreground/50'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
