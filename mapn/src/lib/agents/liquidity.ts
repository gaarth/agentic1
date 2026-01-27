import { BaseAgent } from './agent';
import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';
import { LIQUIDITY_AGENT_PROMPT } from './prompts';

export class LiquidityAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Liquidity Agent',
            role: 'Head of Trading',
            persona: LIQUIDITY_AGENT_PROMPT,
            llmProvider: 'nemotron'
        });
    }

    async evaluate(
        currentAllocation: Record<string, number>,
        assets: MockAsset[],
        constraints: NegotiationInputParams,
        roundNumber: number,
        previousRounds: NegotiationRound[]
    ): Promise<AgentBid> {
        // Check if any asset is essentially illiquid
        const context = JSON.stringify({
            current_allocation: currentAllocation,
            available_assets: assets.map(a => ({
                symbol: a.symbol,
                liquidity_score: a.liquidity_score,
                sector: a.sector
            })),
            round: roundNumber
        }, null, 2);

        const prompt = `
    Analyze the portfolio for execution risks.
    Identify assets with low liquidity scores that are being heavily allocated.
    
    Provide your bid in strict JSON format.
    `;

        return this.askLLM<AgentBid>(prompt, context);
    }
}
