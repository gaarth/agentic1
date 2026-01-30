'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

interface NewsItem {
    id: number;
    headline: string;
    url: string;
    source: string;
}

export function NewsTicker() {
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/news?category=general');
                if (res.ok) {
                    const data = await res.json();
                    setNews(data.slice(0, 10)); // Top 10 headlines
                }
            } catch (error) {
                console.error('Failed to fetch news ticker:', error);
            }
        };
        fetchNews();
    }, []);

    if (news.length === 0) return null;

    return (
        <div className="w-full bg-secondary/20 border-y border-border/30 overflow-hidden py-2 flex items-center relative">
            {/* Label with solid background and gradient fade */}
            <div className="absolute left-0 z-10 flex items-center h-full">
                <div className="pl-4 pr-3 py-1 bg-background text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Newspaper className="w-3 h-3" />
                    Latest
                </div>
                {/* Gradient fade to hide text sliding under */}
                <div className="w-8 h-full bg-gradient-to-r from-background to-transparent" />
            </div>

            <motion.div
                className="flex gap-8 items-center whitespace-nowrap pl-32"
                animate={{ x: [0, -1000] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 30,
                }}
            >
                {[...news, ...news].map((item, i) => (
                    <a
                        key={`${item.id}-${i}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
                    >
                        <span className="font-medium">{item.source}:</span>
                        <span>{item.headline}</span>
                        <span className="mx-2 text-muted-foreground/30">•</span>
                    </a>
                ))}
            </motion.div>
        </div>
    );
}
