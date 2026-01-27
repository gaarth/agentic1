import { supabase } from '@/lib/supabase';
import { NegotiationInputParams, MockAsset, NegotiationRound, AgentBid } from '@/lib/database.types';
import { RiskAgent } from './agents/risk';
import { GrowthAgent } from './agents/growth';
import { ComplianceAgent } from './agents/compliance';
import { LiquidityAgent } from './agents/liquidity';
import { SupervisorAgent } from './agents/supervisor';

export class NegotiationEngine {
    private assets: MockAsset[] = [];
    private riskAgent = new RiskAgent();
    private growthAgent = new GrowthAgent();
    private complianceAgent = new ComplianceAgent();
    private liquidityAgent = new LiquidityAgent();
    private supervisor = new SupervisorAgent();

    constructor(assets: MockAsset[]) {
        this.assets = assets;
    }

    /*
     * Initialize a random or equal-weight portfolio
     */
    getInitialPortfolio(): Record<string, number> {
        const count = this.assets.length;
        const weight = Math.floor(100 / count);
        const remainder = 100 - (weight * count);

        const portfolio: Record<string, number> = {};
        this.assets.forEach((a, i) => {
            portfolio[a.symbol] = weight + (i < remainder ? 1 : 0);
        });
        return portfolio;
    }

    async startNegotiation(constraints: NegotiationInputParams) {
        // 1. Create Negotiation Record in DB
        const { data: neg, error } = await supabase
            .from('negotiations')
            .insert({
                input_params: constraints as any,
                rounds_log: [],
                final_allocation: {},
            })
            .select()
            .single();

        if (error || !neg) throw new Error('Failed to create negotiation record');

        // 2. Run the Loop (in background or awaited? Plan implies streaming, so maybe we yield results?)
        // For the MVP, we might run it and update the DB step-by-step.

        return neg.id;
    }

    async runRound(
        negotiationId: string,
        currentAllocation: Record<string, number>,
        roundNumber: number,
        constraints: NegotiationInputParams,
        previousRounds: NegotiationRound[]
    ): Promise<NegotiationRound> {

        // Conservative Delay for API Rate Limits (per user request)
        if (roundNumber > 1) {
            const delay = 4000; // 4 seconds delay between rounds
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // 1. Broadcast to all agents parallelly
        const [riskBid, growthBid, complianceBid, liquidityBid] = await Promise.all([
            this.riskAgent.evaluate(currentAllocation, this.assets, constraints, roundNumber, previousRounds),
            this.growthAgent.evaluate(currentAllocation, this.assets, constraints, roundNumber, previousRounds),
            this.complianceAgent.evaluate(currentAllocation, this.assets, constraints, roundNumber, previousRounds),
            this.liquidityAgent.evaluate(currentAllocation, this.assets, constraints, roundNumber, previousRounds)
        ]);

        const bids: Record<string, AgentBid> = {
            risk: riskBid,
            growth: growthBid,
            compliance: complianceBid,
            liquidity: liquidityBid
        };

        // 2. Supervisor Synthesis
        const result = await this.supervisor.synthesize(
            currentAllocation,
            this.assets,
            bids,
            constraints,
            roundNumber
        );

        // 3. Construct Round Object
        const round: NegotiationRound = {
            round_number: roundNumber,
            agent_bids: {
                risk: riskBid,
                growth: growthBid,
                compliance: complianceBid,
                liquidity: liquidityBid
            },
            proposed_allocation: result.allocation,
            consensus_reached: result.consensus
        };

        // 4. Persist Round
        // (Optimization: In prod, use an RPC for atomic append, but for MVP we overwrite the array)

        // NOTE: We need to recreate the update logic since 'rounds_log' is an array.
        // Standard update:
        const { error } = await supabase
            .from('negotiations')
            .update({
                // accepted loose typing here for demo speed, ideally strictly typed
                // @ts-ignore 
                rounds_log: [...previousRounds, round] as any,
                final_allocation: result.consensus ? result.allocation as any : undefined,
                explanation: result.consensus ? result.explanation : undefined
            })
            .eq('id', negotiationId);

        if (error) console.error("Error saving round:", error);

        return round;
    }
}
