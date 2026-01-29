import { NextRequest, NextResponse } from 'next/server';
import { getEconomicCalendar } from '@/lib/market/finnhub';

// Cache calendar for 30 minutes
let cache: { data: any; timestamp: number; key: string } | null = null;
const CACHE_DURATION = 1800000; // 30 minutes

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Default: today to 7 days from now
        const today = new Date();
        const weekLater = new Date(today);
        weekLater.setDate(weekLater.getDate() + 7);

        const from = searchParams.get('from') || formatDate(today);
        const to = searchParams.get('to') || formatDate(weekLater);
        const cacheKey = `${from}-${to}`;

        // Check cache
        if (cache && cache.key === cacheKey && Date.now() - cache.timestamp < CACHE_DURATION) {
            return NextResponse.json(cache.data);
        }

        const events = await getEconomicCalendar(from, to);

        // Update cache
        cache = { data: events, timestamp: Date.now(), key: cacheKey };

        return NextResponse.json(events);
    } catch (error) {
        console.error('Calendar API error:', error);
        return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
    }
}
