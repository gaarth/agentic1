import { NextRequest, NextResponse } from 'next/server';
import { getMultipleQuotes } from '@/lib/market/finnhub';

// Cache quotes for 15 seconds to reduce API calls
let cache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 15000;

const DEFAULT_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'];

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const symbolsParam = searchParams.get('symbols');
        const symbols = symbolsParam ? symbolsParam.split(',') : DEFAULT_SYMBOLS;

        // Check cache
        if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
            return NextResponse.json(cache.data);
        }

        const quotes = await getMultipleQuotes(symbols);

        // Update cache
        cache = { data: quotes, timestamp: Date.now() };

        return NextResponse.json(quotes);
    } catch (error) {
        console.error('Market API error:', error);
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }
}
