import { supabase } from '@/lib/supabase';
import { NegotiationInputParams, MockAsset, NegotiationRound, AgentBid } from '@/lib/database.types';
import { RiskAgent } from './agents/risk';
import { GrowthAgent } from './agents/growth';
import { ComplianceAgent } from './agents/compliance';
import { LiquidityAgent } from './agents/liquidity';
import { SupervisorAgent, SupervisorSynthesisResult } from './agents/supervisor';

export interface EnhancedNegotiationRound extends NegotiationRound {
    agentReasoning: {
        risk: string;
        growth: string;
        compliance: string;
        liquidity: string;
    };
    metrics: {
        expectedReturn: number;
        volatility: number;
        esgScore: number;
    };
    targetComparison: {
        returnTarget: number;
        returnActual: number;
        returnMet: boolean;
        volatilityTarget: number;
        volatilityActual: number;
        volatilityMet: boolean;
        esgTarget: number;
        esgActual: number;
        esgMet: boolean;
    };
}

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

        return neg.id;
    }

    async runRound(
        negotiationId: string,
        currentAllocation: Record<string, number>,
        roundNumber: number,
        constraints: NegotiationInputParams,
        previousRounds: NegotiationRound[]
    ): Promise<EnhancedNegotiationRound> {

        // Conservative Delay for API Rate Limits
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
        const result: SupervisorSynthesisResult = await this.supervisor.synthesize(
            currentAllocation,
            this.assets,
            bids,
            constraints,
            roundNumber
        );

        // 3. Construct Enhanced Round Object
        const round: EnhancedNegotiationRound = {
            round_number: roundNumber,
            agent_bids: {
                risk: riskBid,
                growth: growthBid,
                compliance: complianceBid,
                liquidity: liquidityBid
            },
            proposed_allocation: result.allocation,
            consensus_reached: result.consensus,
            agentReasoning: result.agentReasoning,
            metrics: result.metrics,
            targetComparison: result.targetComparison
        };

        // 4. Persist Round
        const { error } = await supabase
            .from('negotiations')
            .update({
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

