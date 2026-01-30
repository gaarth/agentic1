import { NextRequest, NextResponse } from 'next/server';
import { getMarketNews } from '@/lib/market/finnhub';

// Cache news for 5 minutes
let cache: { data: any; timestamp: number; category: string } | null = null;
const CACHE_DURATION = 300000; // 5 minutes

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = (searchParams.get('category') || 'general') as 'general' | 'forex' | 'crypto' | 'merger';

        // Check cache
        if (cache && cache.category === category && Date.now() - cache.timestamp < CACHE_DURATION) {
            return NextResponse.json(cache.data);
        }

        const news = await getMarketNews(category);

        // Update cache
        cache = { data: news, timestamp: Date.now(), category };

        return NextResponse.json(news);
    } catch (error) {
        console.error('News API error:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
