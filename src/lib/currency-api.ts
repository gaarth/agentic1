// Real-time currency exchange API service
// Using Exchange Rate API (free tier)

export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'SGD' | 'AED';

export const SUPPORTED_CURRENCIES: { code: SupportedCurrency; name: string; symbol: string }[] = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
];

// Minimum capital requirement in INR
export const MINIMUM_CAPITAL_INR = 10000;

// Fallback static rates (as of Jan 2026)
const FALLBACK_RATES: Record<string, number> = {
    INR: 1,
    USD: 83.5,
    EUR: 91.2,
    GBP: 106.5,
    JPY: 0.55,
    AUD: 54.3,
    CAD: 59.8,
    CHF: 95.2,
    SGD: 62.5,
    AED: 22.7,
};

interface ExchangeRateCache {
    rates: Record<string, number>;
    timestamp: number;
}

let rateCache: ExchangeRateCache | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetches live exchange rates from Exchange Rate API
 * Returns rates relative to INR (how many INR per 1 unit of foreign currency)
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
    // Check cache first
    if (rateCache && Date.now() - rateCache.timestamp < CACHE_DURATION_MS) {
        return rateCache.rates;
    }

    try {
        // Fetch rates with INR as base
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR', {
            next: { revalidate: 3600 } // Cache for 1 hour in Next.js
        });

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();

        // Convert rates: API gives INR -> X, we need X -> INR
        const ratesInINR: Record<string, number> = { INR: 1 };

        for (const currency of SUPPORTED_CURRENCIES) {
            if (currency.code === 'INR') continue;
            const rateFromINR = data.rates[currency.code];
            if (rateFromINR) {
                // If 1 INR = 0.012 USD, then 1 USD = 1/0.012 = 83.33 INR
                ratesInINR[currency.code] = 1 / rateFromINR;
            } else {
                ratesInINR[currency.code] = FALLBACK_RATES[currency.code];
            }
        }

        // Update cache
        rateCache = {
            rates: ratesInINR,
            timestamp: Date.now()
        };

        return ratesInINR;
    } catch (error) {
        console.warn('Exchange rate API failed, using fallback rates:', error);
        return FALLBACK_RATES;
    }
}

/**
 * Converts an amount from any supported currency to INR
 */
export async function convertToINR(amount: number, currency: SupportedCurrency): Promise<number> {
    if (currency === 'INR') return amount;

    const rates = await getExchangeRates();
    const rate = rates[currency] || FALLBACK_RATES[currency];
    return amount * rate;
}

/**
 * Validates if the amount meets the minimum capital requirement
 * Returns the amount in INR and whether it's valid
 */
export async function validateMinimum(
    amount: number,
    currency: SupportedCurrency
): Promise<{ amountInINR: number; isValid: boolean; minimumInCurrency: number }> {
    const rates = await getExchangeRates();
    const rate = rates[currency] || FALLBACK_RATES[currency];

    const amountInINR = amount * rate;
    const minimumInCurrency = MINIMUM_CAPITAL_INR / rate;

    return {
        amountInINR,
        isValid: amountInINR >= MINIMUM_CAPITAL_INR,
        minimumInCurrency: Math.ceil(minimumInCurrency)
    };
}

/**
 * Gets the minimum capital in a specific currency
 */
export async function getMinimumInCurrency(currency: SupportedCurrency): Promise<number> {
    if (currency === 'INR') return MINIMUM_CAPITAL_INR;

    const rates = await getExchangeRates();
    const rate = rates[currency] || FALLBACK_RATES[currency];
    return Math.ceil(MINIMUM_CAPITAL_INR / rate);
}
