import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRates, validateMinimum, SupportedCurrency, SUPPORTED_CURRENCIES } from '@/lib/currency-api';

export const revalidate = 3600; // ISR: revalidate every hour

export async function GET(req: NextRequest) {
    try {
        const rates = await getExchangeRates();

        return NextResponse.json({
            success: true,
            baseCurrency: 'INR',
            rates,
            supportedCurrencies: SUPPORTED_CURRENCIES,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Currency API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch exchange rates' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { amount, currency } = await req.json();

        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid amount' },
                { status: 400 }
            );
        }

        if (!SUPPORTED_CURRENCIES.find(c => c.code === currency)) {
            return NextResponse.json(
                { success: false, error: 'Unsupported currency' },
                { status: 400 }
            );
        }

        const validation = await validateMinimum(amount, currency as SupportedCurrency);

        return NextResponse.json({
            success: true,
            ...validation,
            currency
        });
    } catch (error) {
        console.error('Currency validation error:', error);
        return NextResponse.json(
            { success: false, error: 'Validation failed' },
            { status: 500 }
        );
    }
}
