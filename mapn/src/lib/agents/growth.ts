import { BaseAgent } from './agent';
import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';
import { GROWTH_AGENT_PROMPT } from './prompts';

export class GrowthAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Growth Agent',
            role: 'Portfolio Manager',
            persona: GROWTH_AGENT_PROMPT,
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
        const context = JSON.stringify({
            current_allocation: currentAllocation,
            available_assets: assets.map(a => ({
                symbol: a.symbol,
                expected_return: a.expected_return,
                volatility: a.volatility,
                sector: a.sector
            })),
            round: roundNumber,
            constraints
        }, null, 2);

        const prompt = `
    Analyze the current portfolio to maximize returns.
    Identify available assets with high expected_return that are under-allocated.
    Proposed aggressive changes.
    
    Provide your bid in strict JSON format.
    `;

        return this.askLLM<AgentBid>(prompt, context);
    }
}
