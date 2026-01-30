import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Run with: npx tsx scripts/test-negotiation.ts
import { NegotiationInputParams } from '@/lib/database.types';

async function runTest() {
    // Dynamic import to ensure process.env is populated before supabase client is initialized
    const { supabase } = await import('@/lib/supabase');
    const { NegotiationEngine } = await import('@/lib/negotiation-engine');

    console.log('--- MAPN Backend Verification Test ---');

    // 1. Fetch Assets
    console.log('Fetching assets...');
    const { data: assets, error } = await supabase.from('mock_assets').select('*');

    if (error || !assets || assets.length === 0) {
        console.error('Failed to fetch assets:', error);
        return;
    }
    console.log(`Loaded ${assets.length} assets.`);

    // 2. Initialize Engine
    const engine = new NegotiationEngine(assets);

    // 3. Define User Constraints
    const constraints: NegotiationInputParams = {
        capital: 100000,
        currency: 'INR',
        max_volatility: 12, // Conservative
        esg_minimum: 70,    // High Ethical Standard
        target_expected_return: 12,
        custom_constraints: "Avoid crypto"
    };
    console.log('Constraints:', constraints);

    // 4. Start Negotiation
    console.log('Starting negotiation session...');
    const negotiationId = await engine.startNegotiation(constraints);
    console.log(`Negotiation ID: ${negotiationId}`);

    // 5. Run Rounds
    let currentAllocation = engine.getInitialPortfolio();
    const roundsLog: any[] = [];

    for (let i = 1; i <= 3; i++) {
        console.log(`\n--- Round ${i} ---`);
        const result = await engine.runRound(negotiationId, currentAllocation, i, constraints, roundsLog);

        roundsLog.push(result);
        currentAllocation = result.proposed_allocation;

        // Print summary of bids
        console.log('Risk Agent:', result.agent_bids.risk.proposed_changes, result.agent_bids.risk.reasoning.substring(0, 50) + '...');
        console.log('Growth Agent:', result.agent_bids.growth.proposed_changes, result.agent_bids.growth.reasoning.substring(0, 50) + '...');
        console.log('Consensus:', result.consensus_reached);

        if (result.consensus_reached) {
            console.log('Consensus reached! Stopping early.');
            break;
        }
    }

    console.log('\n--- Final Allocation ---');
    console.log(currentAllocation);
    console.log('Test Complete.');
}

runTest().catch(console.error);
