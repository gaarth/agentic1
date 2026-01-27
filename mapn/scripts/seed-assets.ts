/**
 * Seed script for MAPN mock_assets table
 * Run with: npx tsx scripts/seed-assets.ts
 * 
 * This script populates the mock_assets table with diverse portfolio assets
 * to enable meaningful agent conflicts during negotiations.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const mockAssets = [
    // Tech stocks (high growth, varying ESG)
    { symbol: 'AAPL', name: 'Apple Inc.', volatility: 22.5, expected_return: 12.8, esg_score: 85, liquidity_score: 100, sector: 'Technology' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', volatility: 45.2, expected_return: 28.5, esg_score: 72, liquidity_score: 98, sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', volatility: 21.0, expected_return: 14.2, esg_score: 88, liquidity_score: 100, sector: 'Technology' },
    { symbol: 'META', name: 'Meta Platforms', volatility: 38.5, expected_return: 18.3, esg_score: 45, liquidity_score: 95, sector: 'Technology' },

    // Green Energy (high ESG, moderate returns)
    { symbol: 'ENPH', name: 'Enphase Energy', volatility: 52.3, expected_return: 22.1, esg_score: 95, liquidity_score: 75, sector: 'Clean Energy' },
    { symbol: 'NEE', name: 'NextEra Energy', volatility: 18.5, expected_return: 9.8, esg_score: 92, liquidity_score: 90, sector: 'Clean Energy' },
    { symbol: 'FSLR', name: 'First Solar Inc.', volatility: 42.0, expected_return: 16.5, esg_score: 94, liquidity_score: 70, sector: 'Clean Energy' },

    // Traditional Energy (low ESG, high returns)
    { symbol: 'XOM', name: 'Exxon Mobil', volatility: 25.0, expected_return: 15.8, esg_score: 28, liquidity_score: 100, sector: 'Energy' },
    { symbol: 'CVX', name: 'Chevron Corp.', volatility: 23.8, expected_return: 14.2, esg_score: 32, liquidity_score: 98, sector: 'Energy' },

    // Bonds & Fixed Income (low volatility, stable)
    { symbol: 'BND', name: 'Vanguard Total Bond', volatility: 4.5, expected_return: 3.2, esg_score: 70, liquidity_score: 100, sector: 'Fixed Income' },
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury', volatility: 12.8, expected_return: 4.5, esg_score: 75, liquidity_score: 95, sector: 'Fixed Income' },
    { symbol: 'LQD', name: 'iShares Investment Grade', volatility: 8.2, expected_return: 4.8, esg_score: 68, liquidity_score: 92, sector: 'Fixed Income' },

    // Healthcare (defensive, moderate ESG)
    { symbol: 'JNJ', name: 'Johnson & Johnson', volatility: 15.2, expected_return: 8.5, esg_score: 78, liquidity_score: 100, sector: 'Healthcare' },
    { symbol: 'UNH', name: 'UnitedHealth Group', volatility: 20.5, expected_return: 12.3, esg_score: 65, liquidity_score: 95, sector: 'Healthcare' },

    // Crypto/Volatile Assets (high risk/reward, low ESG)
    { symbol: 'BTCETF', name: 'Bitcoin ETF Proxy', volatility: 72.5, expected_return: 45.0, esg_score: 15, liquidity_score: 85, sector: 'Crypto' },
    { symbol: 'ETHETF', name: 'Ethereum ETF Proxy', volatility: 68.0, expected_return: 38.5, esg_score: 22, liquidity_score: 80, sector: 'Crypto' },

    // Consumer Staples (defensive, stable)
    { symbol: 'PG', name: 'Procter & Gamble', volatility: 12.5, expected_return: 7.8, esg_score: 82, liquidity_score: 100, sector: 'Consumer Staples' },
    { symbol: 'KO', name: 'Coca-Cola Company', volatility: 11.8, expected_return: 6.5, esg_score: 75, liquidity_score: 100, sector: 'Consumer Staples' },

    // Emerging Markets (higher volatility)
    { symbol: 'EEM', name: 'iShares Emerging Markets', volatility: 25.5, expected_return: 11.2, esg_score: 55, liquidity_score: 88, sector: 'Emerging Markets' },

    // Real Estate
    { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', volatility: 18.2, expected_return: 8.9, esg_score: 60, liquidity_score: 92, sector: 'Real Estate' },
];

async function seedAssets() {
    console.log('🌱 Seeding mock_assets table...');

    // Clear existing data
    const { error: deleteError } = await supabase
        .from('mock_assets')
        .delete()
        .neq('symbol', ''); // Delete all rows

    if (deleteError) {
        console.error('❌ Error clearing existing data:', deleteError);
        return;
    }

    // Insert new data
    const { data, error } = await supabase
        .from('mock_assets')
        .insert(mockAssets)
        .select();

    if (error) {
        console.error('❌ Error seeding assets:', error);
        return;
    }

    console.log(`✅ Successfully seeded ${data.length} assets:`);

    // Group by sector for summary
    const bySector = data.reduce((acc, asset) => {
        acc[asset.sector] = (acc[asset.sector] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    Object.entries(bySector).forEach(([sector, count]) => {
        console.log(`   - ${sector}: ${count} assets`);
    });
}

seedAssets().catch(console.error);
