'use client'

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion"
import { MoreHorizontal, ArrowUpRight, ArrowDownRight, Play, Loader2, RefreshCw } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Types derived from backend
interface Asset {
    symbol: string;
    name: string;
    expected_return: number;
    volatility: number;
    esg_score: number;
    liquidity_score: number;
}

interface RoundLog {
    round_number: number;
    agent_bids: Record<string, any>;
    proposed_allocation: Record<string, number>;
    consensus_reached: boolean;
}

export function DashboardView() {
    // State
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [assets, setAssets] = useState<Asset[]>([]);
    const [allocation, setAllocation] = useState<Record<string, number>>({});
    const [logs, setLogs] = useState<RoundLog[]>([]);
    const [messages, setMessages] = useState<string[]>([]);
    const [negotiationId, setNegotiationId] = useState<string | null>(null);

    // Metrics Calculation
    const metrics = useMemo(() => {
        if (Object.keys(allocation).length === 0 || assets.length === 0) return null;

        let totalWeight = 0;
        let weightedReturn = 0;
        let weightedVol = 0;
        let weightedESG = 0;

        Object.entries(allocation).forEach(([symbol, weight]) => {
            const asset = assets.find(a => a.symbol === symbol);
            if (asset) {
                weightedReturn += asset.expected_return * weight;
                weightedVol += asset.volatility * weight; // Simplified vol calc (ignoring covariance)
                weightedESG += asset.esg_score * weight;
                totalWeight += weight;
            }
        });

        // Normalize if needed, though weights should sum to 100
        const factor = totalWeight > 0 ? 100 / totalWeight : 1;

        return {
            yield: (weightedReturn * factor) / 100, // as percentage
            volatility: (weightedVol * factor) / 100,
            esg: (weightedESG * factor) / 100
        };

    }, [allocation, assets]);

    const startNegotiation = async () => {
        setStatus('running');
        setLogs([]);
        setMessages([]);
        setAllocation({}); // Reset or keep previous? Resetting visually better.

        try {
            const res = await fetch('/api/negotiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    capital: 100000,
                    max_volatility: 12,
                    esg_minimum: 70
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
                buffer = lines.pop() || ''; // Keep partial line

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const event = JSON.parse(line);
                        handleEvent(event);
                    } catch (e) {
                        console.error("Parse error", e);
                    }
                }
            }
            setStatus('completed');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const handleEvent = (event: any) => {
        switch (event.type) {
            case 'init':
                setNegotiationId(event.negotiationId);
                setAssets(event.assets || []);
                setAllocation(event.initialAllocation);
                setMessages(prev => [...prev, "Negotiation initialized."]);
                break;
            case 'status':
                setMessages(prev => [...prev, event.message]);
                break;
            case 'round':
                setLogs(prev => [...prev, event.data]);
                setAllocation(event.data.proposed_allocation); // Update live chart
                break;
            case 'done':
                setAllocation(event.finalAllocation);
                setMessages(prev => [...prev, "Negotiation complete."]);
                break;
            case 'error':
                setStatus('error');
                setMessages(prev => [...prev, `Error: ${event.message}`]);
                break;
        }
    };

    // Chart Data Preparation
    const chartData = useMemo(() => {
        return Object.entries(allocation)
            .map(([symbol, weight]) => ({ name: symbol, weight }))
            .sort((a, b) => b.weight - a.weight) // Sort by weight desc
            .filter(i => i.weight > 0); // Hide zero positions
    }, [allocation]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-7xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Portfolio Negotiation</h1>
                    <p className="text-sm text-muted-foreground">
                        {status === 'idle' ? 'Ready to initialize agents.' :
                            status === 'running' ? 'Agents are negotiating...' :
                                'Negotiation session complete.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={startNegotiation}
                        disabled={status === 'running'}
                        className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-[12px] text-sm font-medium hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'running' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                            status === 'completed' ? <RefreshCw className="w-4 h-4 mr-2" /> :
                                <Play className="w-4 h-4 mr-2" />}
                        {status === 'running' ? 'Negotiating...' : 'Start Session'}
                    </button>
                </div>
            </div>

            {/* Main Visuals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                {/* Chart */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-[24px] relative flex flex-col">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Live Allocation</h2>
                    <div className="flex-1 w-full min-h-0">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                    <YAxis hide domain={[0, 40]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                                        cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }}
                                    />
                                    <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.3 + (entry.weight / 20)})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground/30 text-sm">
                                Press Start to Initialize Portfolio
                            </div>
                        )}
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-col gap-6">
                    <MetricCard
                        label="Exp. Return (Yield)"
                        value={metrics ? `${metrics.yield.toFixed(1)}%` : '--'}
                        sub="Weighted Avg"
                        positive={true}
                    />
                    <MetricCard
                        label="Volatility (Risk)"
                        value={metrics ? `${metrics.volatility.toFixed(1)}%` : '--'}
                        sub="Target < 12%"
                        positive={metrics ? metrics.volatility < 12 : true}
                        invertColor
                    />
                    <MetricCard
                        label="ESG Score"
                        value={metrics ? metrics.esg.toFixed(0) : '--'}
                        sub="Target > 70"
                        positive={true}
                    />
                </div>
            </div>

            {/* Logs / Stream */}
            <div className="glass-panel rounded-[24px] p-6 min-h-[300px]">
                <h3 className="text-lg font-medium mb-4">Negotiation Feed</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence mode='popLayout'>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={`msg-${i}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-3 py-1"
                            >
                                {msg}
                            </motion.div>
                        ))}
                        {logs.map((round) => (
                            <motion.div
                                key={`round-${round.round_number}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-secondary/30 rounded-xl p-4 border border-border/50"
                            >
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-primary">Round {round.round_number}</span>
                                    <span className="text-xs text-muted-foreground uppercase">{round.consensus_reached ? 'Consensus Reached' : 'Debate Ongoing'}</span>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(round.agent_bids).map(([agent, bid]: [string, any]) => (
                                        <div key={agent} className="text-xs flex gap-2">
                                            <span className="font-medium w-20 uppercase shrink-0 text-muted-foreground">{agent}</span>
                                            <span className="opacity-80">{bid.reasoning?.substring(0, 120)}...</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {status === 'idle' && (
                        <div className="text-center py-10 text-muted-foreground/40 text-sm">
                            Waiting for session start...
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function MetricCard({ label, value, sub, positive, invertColor }: any) {
    const isPositive = invertColor ? !positive : positive;
    const colorClass = isPositive ? 'text-primary' : 'text-destructive';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-[20px] flex-1 flex flex-col justify-center"
        >
            <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{value}</span>
                <span className={`text-xs ${colorClass} bg-secondary px-1.5 py-0.5 rounded-md`}>
                    {sub}
                </span>
            </div>
        </motion.div>
    )
}
