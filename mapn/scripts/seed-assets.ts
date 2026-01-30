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
    { user_id: 'seed_demo_user', quantity: 10, purchase_price: 150.00, purchase_date: new Date().toISOString(), symbol: 'AAPL', name: 'Apple Inc.', volatility: 22.5, expected_return: 12.8, esg_score: 85, liquidity_score: 100, sector: 'Technology' },
    { user_id: 'seed_demo_user', quantity: 5, purchase_price: 450.00, purchase_date: new Date().toISOString(), symbol: 'NVDA', name: 'NVIDIA Corporation', volatility: 45.2, expected_return: 28.5, esg_score: 72, liquidity_score: 98, sector: 'Technology' },
    { user_id: 'seed_demo_user', quantity: 15, purchase_price: 320.00, purchase_date: new Date().toISOString(), symbol: 'MSFT', name: 'Microsoft Corp.', volatility: 21.0, expected_return: 14.2, esg_score: 88, liquidity_score: 100, sector: 'Technology' },
    { user_id: 'seed_demo_user', quantity: 20, purchase_price: 280.00, purchase_date: new Date().toISOString(), symbol: 'META', name: 'Meta Platforms', volatility: 38.5, expected_return: 18.3, esg_score: 45, liquidity_score: 95, sector: 'Technology' },

    // Green Energy (high ESG, moderate returns)
    { user_id: 'seed_demo_user', quantity: 50, purchase_price: 120.00, purchase_date: new Date().toISOString(), symbol: 'ENPH', name: 'Enphase Energy', volatility: 52.3, expected_return: 22.1, esg_score: 95, liquidity_score: 75, sector: 'Clean Energy' },
    { user_id: 'seed_demo_user', quantity: 30, purchase_price: 60.00, purchase_date: new Date().toISOString(), symbol: 'NEE', name: 'NextEra Energy', volatility: 18.5, expected_return: 9.8, esg_score: 92, liquidity_score: 90, sector: 'Clean Energy' },
    { user_id: 'seed_demo_user', quantity: 25, purchase_price: 140.00, purchase_date: new Date().toISOString(), symbol: 'FSLR', name: 'First Solar Inc.', volatility: 42.0, expected_return: 16.5, esg_score: 94, liquidity_score: 70, sector: 'Clean Energy' },

    // Traditional Energy
    { user_id: 'seed_demo_user', quantity: 40, purchase_price: 105.00, purchase_date: new Date().toISOString(), symbol: 'XOM', name: 'Exxon Mobil', volatility: 25.0, expected_return: 15.8, esg_score: 28, liquidity_score: 100, sector: 'Energy' },

    // Bonds & Fixed Income
    { user_id: 'seed_demo_user', quantity: 100, purchase_price: 75.00, purchase_date: new Date().toISOString(), symbol: 'BND', name: 'Vanguard Total Bond', volatility: 4.5, expected_return: 3.2, esg_score: 70, liquidity_score: 100, sector: 'Fixed Income' },
    { user_id: 'seed_demo_user', quantity: 80, purchase_price: 92.00, purchase_date: new Date().toISOString(), symbol: 'TLT', name: 'iShares 20+ Year Treasury', volatility: 12.8, expected_return: 4.5, esg_score: 75, liquidity_score: 95, sector: 'Fixed Income' },

    // Healthcare
    { user_id: 'seed_demo_user', quantity: 30, purchase_price: 160.00, purchase_date: new Date().toISOString(), symbol: 'JNJ', name: 'Johnson & Johnson', volatility: 15.2, expected_return: 8.5, esg_score: 78, liquidity_score: 100, sector: 'Healthcare' },

    // Crypto
    { user_id: 'seed_demo_user', quantity: 2, purchase_price: 35000.00, purchase_date: new Date().toISOString(), symbol: 'BTCETF', name: 'Bitcoin ETF Proxy', volatility: 72.5, expected_return: 45.0, esg_score: 15, liquidity_score: 85, sector: 'Crypto' },

    // Real Estate
    { user_id: 'seed_demo_user', quantity: 15, purchase_price: 85.00, purchase_date: new Date().toISOString(), symbol: 'VNQ', name: 'Vanguard Real Estate ETF', volatility: 18.2, expected_return: 8.9, esg_score: 60, liquidity_score: 92, sector: 'Real Estate' },
];

async function seedAssets() {
    console.log('🌱 Seeding mock_assets table...');

    // Clear existing data
    const { error: deleteError } = await supabase
        .from('mock_assets')
        .delete()
        .eq('user_id', 'seed_demo_user'); // Only delete demo user data

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
        const sector = asset.sector || 'Unknown';
        acc[sector] = (acc[sector] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    Object.entries(bySector).forEach(([sector, count]) => {
        console.log(`   - ${sector}: ${count} assets`);
    });
}

seedAssets().catch(console.error);
