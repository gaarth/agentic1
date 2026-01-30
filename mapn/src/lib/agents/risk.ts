import { BaseAgent, AgentConfig } from './agent';
import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';
import { RISK_AGENT_PROMPT } from './prompts';

export class RiskAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Risk Agent',
            role: 'Risk Manager',
            persona: RISK_AGENT_PROMPT,
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
        const isViolating = portfolioStats.volatility > constraints.max_volatility;
        const targetReturn = constraints.target_expected_return || 12;

        const context = JSON.stringify({
            current_allocation: currentAllocation,
            portfolio_stats: {
                ...portfolioStats,
                volatility_status: isViolating ? 'VIOLATION' : 'COMPLIANT'
            },
            constraints: {
                max_volatility: constraints.max_volatility,
                target_expected_return: targetReturn,
                risk_tolerance: constraints.max_volatility < 12 ? 'Conservative' : constraints.max_volatility < 20 ? 'Balanced' : 'Aggressive'
            },
            available_assets: assets.map(a => ({
                symbol: a.symbol,
                volatility: a.volatility || 0,
                expected_return: a.expected_return || 0,
                esg_score: a.esg_score || 0,
                sector: a.sector || 'Unknown'
            })),
            round: roundNumber,
            must_veto: isViolating
        }, null, 2);

        const prompt = `
    Analyze the current portfolio for RISK compliance.
    
    ** CURRENT STATUS **
    Current Portfolio Volatility: ${portfolioStats.volatility.toFixed(2)}%
    Maximum Allowed Volatility: ${constraints.max_volatility}%
    Current Expected Return: ${portfolioStats.expectedReturn.toFixed(2)}%
    Target Expected Return: ${targetReturn}%
    
    STATUS: ${isViolating ? '⚠️ VOLATILITY VIOLATION - MUST VETO' : '✓ Within limits'}
    
    ${isViolating ?
                `CRITICAL: Volatility (${portfolioStats.volatility.toFixed(2)}%) EXCEEDS limit (${constraints.max_volatility}%). You MUST set veto=true and propose changes to bring volatility under ${constraints.max_volatility}%.` :
                `Volatility is acceptable. Focus on optimizing the risk-return tradeoff.`
            }
    
    Provide your bid in strict JSON format with proposed_changes, reasoning, approval, veto, and veto_reason if applicable.
    `;

        return this.askLLM<AgentBid>(prompt, context);
    }

    private calculateStats(allocation: Record<string, number>, assets: MockAsset[]) {
        let volatility = 0;
        let expectedReturn = 0;
        let totalWeight = 0;

        Object.entries(allocation).forEach(([symbol, weight]) => {
            const asset = assets.find(a => a.symbol === symbol);
            if (asset && weight > 0) {
                volatility += (asset.volatility || 0) * weight;
                expectedReturn += (asset.expected_return || 0) * weight;
                totalWeight += weight;
            }
        });

        const factor = totalWeight > 0 ? 100 / totalWeight : 1;
        return {
            volatility: (volatility * factor) / 100,
            expectedReturn: (expectedReturn * factor) / 100
        };
    }
}

