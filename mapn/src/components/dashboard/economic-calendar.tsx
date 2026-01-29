'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, RefreshCw, Globe, TrendingUp, AlertTriangle } from 'lucide-react';

interface EconomicEvent {
    actual: number | null;
    country: string;
    estimate: number | null;
    event: string;
    impact: 'low' | 'medium' | 'high';
    prev: number | null;
    time: string;
    unit: string;
}

const impactColors = {
    low: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-500 border-red-500/30'
};

const impactBadgeColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
};

const countryFlags: Record<string, string> = {
    'US': '🇺🇸',
    'EU': '🇪🇺',
    'UK': '🇬🇧',
    'JP': '🇯🇵',
    'CN': '🇨🇳',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'NZ': '🇳🇿',
    'CH': '🇨🇭',
    'DE': '🇩🇪',
    'FR': '🇫🇷',
};

export function EconomicCalendar() {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'high'>('all');

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/calendar');
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Failed to fetch calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        // Refresh every 30 minutes
        const interval = setInterval(fetchEvents, 1800000);
        return () => clearInterval(interval);
    }, []);

    const filteredEvents = filter === 'high'
        ? events.filter(e => e.impact === 'high')
        : events;

    // Group events by date
    const groupedEvents = filteredEvents.reduce((acc, event) => {
        const date = event.time.split(' ')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
    }, {} as Record<string, EconomicEvent[]>);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[20px] p-6 h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Economic Calendar</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-secondary/50 rounded-lg p-0.5">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === 'all'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('high')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${filter === 'high'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <AlertTriangle className="w-3 h-3" />
                            High Impact
                        </button>
                    </div>
                    <button
                        onClick={fetchEvents}
                        disabled={loading}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-secondary/30 rounded-xl animate-pulse" />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {Object.entries(groupedEvents).map(([date, dayEvents], dateIndex) => (
                            <motion.div
                                key={date}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: dateIndex * 0.05 }}
                            >
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-background/80 backdrop-blur-sm py-1">
                                    {new Date(date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="space-y-2">
                                    {dayEvents.map((event, index) => (
                                        <motion.div
                                            key={`${event.event}-${index}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className={`bg-secondary/20 rounded-xl p-4 border ${impactColors[event.impact]} transition-all hover:scale-[1.01]`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg">
                                                        {countryFlags[event.country] || '🌍'}
                                                    </span>
                                                    <span className="text-[10px] font-medium mt-1">
                                                        {event.country}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full ${impactBadgeColors[event.impact]}`} />
                                                        <span className="font-medium text-sm line-clamp-1">
                                                            {event.event}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span>{event.time.split(' ')[1] || 'All Day'}</span>
                                                        {event.estimate !== null && (
                                                            <span>Forecast: {event.estimate}{event.unit}</span>
                                                        )}
                                                        {event.prev !== null && (
                                                            <span>Previous: {event.prev}{event.unit}</span>
                                                        )}
                                                        {event.actual !== null && (
                                                            <span className="font-medium text-primary">
                                                                Actual: {event.actual}{event.unit}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && filteredEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Calendar className="w-12 h-12 mb-4 opacity-30" />
                        <p>No economic events this week</p>
                    </div>
                )}
            </div>

            {/* Impact Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Low</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>High</span>
                </div>
            </div>
        </motion.div>
    );
}
