'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { TrendingUp, Activity, Target, CheckCircle2, XCircle } from 'lucide-react';
import { EnhancedNegotiationRound } from '@/lib/negotiation-engine';

interface AllocationEvolutionChartProps {
    rounds: EnhancedNegotiationRound[];
    targetMetrics: {
        returnTarget: number;
        volatilityTarget: number;
        esgTarget: number;
    };
    isNegotiating: boolean;
}

const COLORS = {
    return: '#22c55e',      // Green
    volatility: '#ef4444',  // Red
    esg: '#8b5cf6',         // Purple
    target: '#fbbf24',      // Yellow
};

export function AllocationEvolutionChart({
    rounds,
    targetMetrics,
    isNegotiating
}: AllocationEvolutionChartProps) {
    const [selectedMetric, setSelectedMetric] = useState<'all' | 'return' | 'volatility' | 'esg'>('all');

    // Transform rounds data for the chart
    const chartData = rounds.map((round, index) => ({
        round: `Round ${round.round_number}`,
        roundNumber: round.round_number,
        expectedReturn: round.metrics?.expectedReturn || 0,
        volatility: round.metrics?.volatility || 0,
        esgScore: round.metrics?.esgScore || 0,
        returnTarget: targetMetrics.returnTarget,
        volatilityLimit: targetMetrics.volatilityTarget,
        esgMinimum: targetMetrics.esgTarget,
        consensus: round.consensus_reached,
    }));

    // Add initial state as Round 0
    if (chartData.length > 0) {
        chartData.unshift({
            round: 'Initial',
            roundNumber: 0,
            expectedReturn: chartData[0].expectedReturn * 0.8,  // Estimated initial
            volatility: targetMetrics.volatilityTarget + 5,    // Start above limit
            esgScore: targetMetrics.esgTarget - 10,            // Start below minimum
            returnTarget: targetMetrics.returnTarget,
            volatilityLimit: targetMetrics.volatilityTarget,
            esgMinimum: targetMetrics.esgTarget,
            consensus: false,
        });
    }

    const latestRound = rounds[rounds.length - 1];
    const comparison = latestRound?.targetComparison;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-background/95 backdrop-blur-sm p-4 rounded-xl border border-border shadow-xl"
                >
                    <p className="font-semibold text-foreground mb-2">{label}</p>
                    <div className="space-y-1">
                        {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center gap-2 text-sm">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-muted-foreground">{entry.name}:</span>
                                <span className="font-medium" style={{ color: entry.color }}>
                                    {entry.value.toFixed(2)}
                                    {entry.name.includes('Return') || entry.name.includes('Volatility') ? '%' : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            );
        }
        return null;
    };

    if (rounds.length === 0) {
        return (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                    <Activity className="w-12 h-12 mx-auto opacity-30" />
                    <p>Negotiation data will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Metric Selector */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Metrics Evolution
                </h3>
                <div className="flex gap-2">
                    {(['all', 'return', 'volatility', 'esg'] as const).map((metric) => (
                        <button
                            key={metric}
                            onClick={() => setSelectedMetric(metric)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedMetric === metric
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary/50 hover:bg-secondary text-muted-foreground'
                                }`}
                        >
                            {metric === 'all' ? 'All' : metric.charAt(0).toUpperCase() + metric.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="round"
                            tick={{ fill: '#888', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                            tick={{ fill: '#888', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span className="text-sm">{value}</span>}
                        />

                        {/* Target Reference Lines */}
                        {(selectedMetric === 'all' || selectedMetric === 'return') && (
                            <ReferenceLine
                                y={targetMetrics.returnTarget}
                                stroke={COLORS.target}
                                strokeDasharray="5 5"
                                label={{ value: 'Target Return', fill: COLORS.target, fontSize: 10 }}
                            />
                        )}
                        {(selectedMetric === 'all' || selectedMetric === 'volatility') && (
                            <ReferenceLine
                                y={targetMetrics.volatilityTarget}
                                stroke={COLORS.volatility}
                                strokeDasharray="5 5"
                                label={{ value: 'Max Vol', fill: COLORS.volatility, fontSize: 10 }}
                            />
                        )}

                        {/* Data Lines */}
                        {(selectedMetric === 'all' || selectedMetric === 'return') && (
                            <Line
                                type="monotone"
                                dataKey="expectedReturn"
                                name="Expected Return"
                                stroke={COLORS.return}
                                strokeWidth={2}
                                dot={{ fill: COLORS.return, strokeWidth: 2 }}
                                activeDot={{ r: 6, stroke: COLORS.return, strokeWidth: 2 }}
                            />
                        )}
                        {(selectedMetric === 'all' || selectedMetric === 'volatility') && (
                            <Line
                                type="monotone"
                                dataKey="volatility"
                                name="Volatility"
                                stroke={COLORS.volatility}
                                strokeWidth={2}
                                dot={{ fill: COLORS.volatility, strokeWidth: 2 }}
                                activeDot={{ r: 6, stroke: COLORS.volatility, strokeWidth: 2 }}
                            />
                        )}
                        {(selectedMetric === 'all' || selectedMetric === 'esg') && (
                            <Line
                                type="monotone"
                                dataKey="esgScore"
                                name="ESG Score"
                                stroke={COLORS.esg}
                                strokeWidth={2}
                                dot={{ fill: COLORS.esg, strokeWidth: 2 }}
                                activeDot={{ r: 6, stroke: COLORS.esg, strokeWidth: 2 }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Target Achievement Summary */}
            {comparison && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-4"
                >
                    <div className={`p-4 rounded-xl border ${comparison.returnMet
                            ? 'border-green-500/30 bg-green-500/10'
                            : 'border-red-500/30 bg-red-500/10'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Return</span>
                            {comparison.returnMet ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                            )}
                        </div>
                        <div className="text-lg font-bold">
                            {comparison.returnActual.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Target: {comparison.returnTarget}%
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${comparison.volatilityMet
                            ? 'border-green-500/30 bg-green-500/10'
                            : 'border-red-500/30 bg-red-500/10'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Volatility</span>
                            {comparison.volatilityMet ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                            )}
                        </div>
                        <div className="text-lg font-bold">
                            {comparison.volatilityActual.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Max: {comparison.volatilityTarget}%
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${comparison.esgMet
                            ? 'border-green-500/30 bg-green-500/10'
                            : 'border-red-500/30 bg-red-500/10'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">ESG Score</span>
                            {comparison.esgMet ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                            )}
                        </div>
                        <div className="text-lg font-bold">
                            {comparison.esgActual.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Min: {comparison.esgTarget}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Negotiation Progress Indicator */}
            {isNegotiating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20"
                >
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm text-primary">
                        Agents are negotiating... Round {rounds.length} in progress
                    </span>
                </motion.div>
            )}
        </div>
    );
}
