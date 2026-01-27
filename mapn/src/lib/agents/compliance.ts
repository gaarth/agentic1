import { BaseAgent } from './agent';
import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';
import { COMPLIANCE_AGENT_PROMPT } from './prompts';

export class ComplianceAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Compliance Agent',
            role: 'Compliance Officer',
            persona: COMPLIANCE_AGENT_PROMPT,
            llmProvider: 'nemotron' // Strict checking
        });
    }

    async evaluate(
        currentAllocation: Record<string, number>,
        assets: MockAsset[],
        constraints: NegotiationInputParams,
        roundNumber: number,
        previousRounds: NegotiationRound[]
    ): Promise<AgentBid> {
        const portfolioStats = this.calculateStats(currentAllocation, assets);

        const context = JSON.stringify({
            current_allocation: currentAllocation,
            portfolio_stats: portfolioStats,
            constraints: {
                esg_minimum: constraints.esg_minimum
            },
            available_assets: assets.map(a => ({
                symbol: a.symbol,
                esg_score: a.esg_score,
                sector: a.sector
            })),
            round: roundNumber
        }, null, 2);

        const prompt = `
    Analyze the current portfolio for ESG compliance.
    Current Weighted ESG Score: ${portfolioStats.esgScore.toFixed(2)}
    Required ESG Score: ${constraints.esg_minimum}
    
    If strict compliance is failed, use VETO.
    Provide your bid in strict JSON format.
    `;

        return this.askLLM<AgentBid>(prompt, context);
    }

    private calculateStats(allocation: Record<string, number>, assets: MockAsset[]) {
        let esgScore = 0;

        Object.entries(allocation).forEach(([symbol, weight]) => {
            const asset = assets.find(a => a.symbol === symbol);
            if (asset) {
                esgScore += (asset.esg_score * (weight / 100));
            }
        });

        return { esgScore };
    }
}
