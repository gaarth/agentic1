import { BaseAgent, AgentConfig } from './agent';
import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';
import { RISK_AGENT_PROMPT } from './prompts';

export class RiskAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Risk Agent',
            role: 'Risk Manager',
            persona: RISK_AGENT_PROMPT,
            llmProvider: 'nemotron' // Nemotron is good for reasoning/math
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

        // Construct valid JSON context for the LLM
        const context = JSON.stringify({
            current_allocation: currentAllocation,
            portfolio_stats: portfolioStats,
            constraints: {
                max_volatility: constraints.max_volatility,
                risk_tolerance: constraints.max_volatility < 15 ? 'Low' : constraints.max_volatility < 25 ? 'Medium' : 'High'
            },
            available_assets: assets.map(a => ({
                symbol: a.symbol,
                volatility: a.volatility,
                expected_return: a.expected_return,
                sector: a.sector
            })),
            round: roundNumber
        }, null, 2);

        const prompt = `
    Analyze the current portfolio. 
    Current Volatility: ${portfolioStats.volatility.toFixed(2)}
    Max Allowed Volatility: ${constraints.max_volatility}
    
    Provide your bid in strict JSON format.
    `;

        return this.askLLM<AgentBid>(prompt, context);
    }

    private calculateStats(allocation: Record<string, number>, assets: MockAsset[]) {
        let volatility = 0;

        // Simple weighted avg for demo purposes (real risk aggregation is covariance matrix)
        Object.entries(allocation).forEach(([symbol, weight]) => {
            const asset = assets.find(a => a.symbol === symbol);
            if (asset) {
                volatility += (asset.volatility * (weight / 100));
            }
        });

        return { volatility };
    }
}
