'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface StockQuote {
    symbol: string;
    currentPrice: number;
    change: number;
    percentChange: number;
    high: number;
    low: number;
}

export function MarketTicker() {
    const [quotes, setQuotes] = useState<StockQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchQuotes = async () => {
        try {
            const res = await fetch('/api/market');
            if (res.ok) {
                const data = await res.json();
                setQuotes(data);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
        // Refresh every 30 seconds
        const interval = setInterval(fetchQuotes, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="glass-panel rounded-[20px] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Market Overview</h3>
                    <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-secondary/30 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[20px] p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Market Overview</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {lastUpdate && (
                        <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                    )}
                    <button
                        onClick={fetchQuotes}
                        className="p-1 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {quotes.map((quote, index) => (
                        <motion.div
                            key={quote.symbol}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-secondary/30 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">{quote.symbol}</span>
                                {quote.change >= 0 ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                            <div className="text-xl font-bold mb-1">
                                ${quote.currentPrice.toFixed(2)}
                            </div>
                            <div className={`text-xs font-medium ${quote.change >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.percentChange.toFixed(2)}%)
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {quotes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No market data available
                </div>
            )}
        </motion.div>
    );
}

export function StockWatchlist() {
    const [quotes, setQuotes] = useState<StockQuote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const res = await fetch('/api/market?symbols=AAPL,MSFT,GOOGL,AMZN,NVDA,META,TSLA,AMD');
                if (res.ok) {
                    const data = await res.json();
                    setQuotes(data);
                }
            } catch (error) {
                console.error('Failed to fetch watchlist:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
        const interval = setInterval(fetchQuotes, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="glass-panel rounded-[20px] p-6">
                <h3 className="text-lg font-semibold mb-4">Watchlist</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-secondary/30 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-[20px] p-6"
        >
            <h3 className="text-lg font-semibold mb-4">Watchlist</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-muted-foreground text-xs uppercase border-b border-border/50">
                            <th className="text-left py-2 font-medium">Symbol</th>
                            <th className="text-right py-2 font-medium">Price</th>
                            <th className="text-right py-2 font-medium">Change</th>
                            <th className="text-right py-2 font-medium hidden md:table-cell">High</th>
                            <th className="text-right py-2 font-medium hidden md:table-cell">Low</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {quotes.map((quote, index) => (
                                <motion.tr
                                    key={quote.symbol}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                                >
                                    <td className="py-3 font-medium">{quote.symbol}</td>
                                    <td className="py-3 text-right font-mono">${quote.currentPrice.toFixed(2)}</td>
                                    <td className={`py-3 text-right font-medium ${quote.change >= 0 ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {quote.change >= 0 ? '+' : ''}{quote.percentChange.toFixed(2)}%
                                    </td>
                                    <td className="py-3 text-right text-muted-foreground hidden md:table-cell">
                                        ${quote.high.toFixed(2)}
                                    </td>
                                    <td className="py-3 text-right text-muted-foreground hidden md:table-cell">
                                        ${quote.low.toFixed(2)}
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {quotes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No watchlist data available
                </div>
            )}
        </motion.div>
    );
}
