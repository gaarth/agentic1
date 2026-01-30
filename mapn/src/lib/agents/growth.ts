import { BaseAgent } from './agent';
import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';
import { GROWTH_AGENT_PROMPT } from './prompts';

export class GrowthAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Growth Agent',
            role: 'Portfolio Manager',
            persona: GROWTH_AGENT_PROMPT,
            llmProvider: 'mistral'
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
        const targetReturn = constraints.target_expected_return || 12;
        const isBelowTarget = portfolioStats.expectedReturn < targetReturn;

        const context = JSON.stringify({
            current_allocation: currentAllocation,
            portfolio_stats: {
                ...portfolioStats,
                return_status: isBelowTarget ? 'BELOW TARGET' : 'MEETING TARGET'
            },
            constraints: {
                target_expected_return: targetReturn,
                max_volatility: constraints.max_volatility,
                volatility_budget_remaining: constraints.max_volatility - portfolioStats.volatility
            },
            available_assets: assets.map(a => ({
                symbol: a.symbol,
                expected_return: a.expected_return,
                volatility: a.volatility,
                esg_score: a.esg_score,
                sector: a.sector
            })).sort((a, b) => b.expected_return - a.expected_return),
            round: roundNumber,
            action_required: isBelowTarget ? 'INCREASE_RETURN' : 'MAINTAIN'
        }, null, 2);

        const prompt = `
    Analyze the current portfolio for GROWTH optimization.
    
    ** CURRENT STATUS **
    Current Expected Return: ${portfolioStats.expectedReturn.toFixed(2)}%
    Target Expected Return: ${targetReturn}%
    Gap: ${(targetReturn - portfolioStats.expectedReturn).toFixed(2)}%
    
    Current Volatility: ${portfolioStats.volatility.toFixed(2)}%
    Max Volatility Budget: ${constraints.max_volatility}%
    Remaining Risk Budget: ${(constraints.max_volatility - portfolioStats.volatility).toFixed(2)}%
    
    STATUS: ${isBelowTarget ? '⚠️ RETURN BELOW TARGET - ACTION REQUIRED' : '✓ Meeting return target'}
    
    ${isBelowTarget ?
                `CRITICAL: Expected return (${portfolioStats.expectedReturn.toFixed(2)}%) is BELOW target (${targetReturn}%). You have ${(constraints.max_volatility - portfolioStats.volatility).toFixed(2)}% risk budget remaining. Propose BOLD changes to increase return.` :
                `Return target is met. Optimize further if risk budget allows, otherwise maintain.`
            }
    
    Provide your bid in strict JSON format with proposed_changes, reasoning, and approval.
    `;

        return this.askLLM<AgentBid>(prompt, context);
    }

    private calculateStats(allocation: Record<string, number>, assets: MockAsset[]) {
        let expectedReturn = 0;
        let volatility = 0;
        let totalWeight = 0;

        Object.entries(allocation).forEach(([symbol, weight]) => {
            const asset = assets.find(a => a.symbol === symbol);
            if (asset && weight > 0) {
                expectedReturn += asset.expected_return * weight;
                volatility += asset.volatility * weight;
                totalWeight += weight;
            }
        });

        const factor = totalWeight > 0 ? 100 / totalWeight : 1;
        return {
            expectedReturn: (expectedReturn * factor) / 100,
            volatility: (volatility * factor) / 100
        };
    }
}

