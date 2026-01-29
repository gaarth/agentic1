'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, RefreshCw, Clock, Newspaper } from 'lucide-react';

interface NewsItem {
    id: number;
    category: string;
    datetime: number;
    headline: string;
    image: string;
    source: string;
    summary: string;
    url: string;
}

function timeAgo(timestamp: number): string {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export function NewsFeed() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<'general' | 'forex' | 'crypto'>('general');

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/news?category=${category}`);
            if (res.ok) {
                const data = await res.json();
                setNews(data);
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // Refresh every 5 minutes
        const interval = setInterval(fetchNews, 300000);
        return () => clearInterval(interval);
    }, [category]);

    const categories = [
        { value: 'general', label: 'General' },
        { value: 'forex', label: 'Forex' },
        { value: 'crypto', label: 'Crypto' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[20px] p-6 h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Market News</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-secondary/50 rounded-lg p-0.5">
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value as any)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${category === cat.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchNews}
                        disabled={loading}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-24 bg-secondary/30 rounded-xl animate-pulse" />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {news.map((item, index) => (
                            <motion.a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.03 }}
                                className="block bg-secondary/20 rounded-xl p-4 border border-border/30 hover:border-primary/30 hover:bg-secondary/30 transition-all group"
                            >
                                <div className="flex gap-4">
                                    {item.image && (
                                        <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                            {item.headline}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <span className="font-medium">{item.source}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {timeAgo(item.datetime)}
                                            </span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && news.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Newspaper className="w-12 h-12 mb-4 opacity-30" />
                        <p>No news available</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
