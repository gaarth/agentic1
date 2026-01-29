// Finnhub API Client
// Free tier: 60 API calls per minute
// Docs: https://finnhub.io/docs/api

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY!;
const BASE_URL = 'https://finnhub.io/api/v1';

export interface StockQuote {
    symbol: string;
    currentPrice: number;
    change: number;
    percentChange: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
    timestamp: number;
}

export interface MarketNews {
    id: number;
    category: string;
    datetime: number;
    headline: string;
    image: string;
    source: string;
    summary: string;
    url: string;
}

export interface EconomicEvent {
    actual: number | null;
    country: string;
    estimate: number | null;
    event: string;
    impact: 'low' | 'medium' | 'high';
    prev: number | null;
    time: string;
    unit: string;
}

/**
 * Get real-time stock quote
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
        const response = await fetch(
            `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );

        if (!response.ok) {
            console.error(`Finnhub quote error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Finnhub returns { c, d, dp, h, l, o, pc, t } for quote
        return {
            symbol,
            currentPrice: data.c || 0,
            change: data.d || 0,
            percentChange: data.dp || 0,
            high: data.h || 0,
            low: data.l || 0,
            open: data.o || 0,
            previousClose: data.pc || 0,
            timestamp: data.t || Date.now() / 1000
        };
    } catch (error) {
        console.error('Failed to fetch quote:', error);
        return null;
    }
}

/**
 * Get multiple stock quotes
 */
export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes = await Promise.all(
        symbols.map(symbol => getStockQuote(symbol))
    );
    return quotes.filter((q): q is StockQuote => q !== null);
}

/**
 * Get market news
 */
export async function getMarketNews(category: 'general' | 'forex' | 'crypto' | 'merger' = 'general'): Promise<MarketNews[]> {
    try {
        const response = await fetch(
            `${BASE_URL}/news?category=${category}&token=${FINNHUB_API_KEY}`
        );

        if (!response.ok) {
            console.error(`Finnhub news error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data.slice(0, 20); // Limit to 20 articles
    } catch (error) {
        console.error('Failed to fetch news:', error);
        return [];
    }
}

/**
 * Get economic calendar events
 */
export async function getEconomicCalendar(from: string, to: string): Promise<EconomicEvent[]> {
    try {
        const response = await fetch(
            `${BASE_URL}/calendar/economic?from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
        );

        if (!response.ok) {
            console.error(`Finnhub calendar error: ${response.status}`);
            return [];
        }

        const data = await response.json();

        // Map impact levels from Finnhub format
        const events = (data.economicCalendar || []).map((event: any) => ({
            actual: event.actual,
            country: event.country,
            estimate: event.estimate,
            event: event.event,
            impact: mapImpact(event.impact),
            prev: event.prev,
            time: event.time,
            unit: event.unit || ''
        }));

        return events.slice(0, 50); // Limit to 50 events
    } catch (error) {
        console.error('Failed to fetch calendar:', error);
        return [];
    }
}

function mapImpact(impact: number): 'low' | 'medium' | 'high' {
    if (impact >= 3) return 'high';
    if (impact >= 2) return 'medium';
    return 'low';
}

/**
 * Get company news by symbol
 */
export async function getCompanyNews(symbol: string, from: string, to: string): Promise<MarketNews[]> {
    try {
        const response = await fetch(
            `${BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
        );

        if (!response.ok) {
            console.error(`Finnhub company news error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data.slice(0, 10);
    } catch (error) {
        console.error('Failed to fetch company news:', error);
        return [];
    }
}
