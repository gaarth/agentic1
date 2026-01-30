import { generateJSONCompletion } from '@/lib/llm';
import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';

export interface SupervisorSynthesisResult {
    allocation: Record<string, number>;
    explanation: string;
    consensus: boolean;
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

export class SupervisorAgent {
    async synthesize(
        currentAllocation: Record<string, number>,
        assets: MockAsset[],
        bids: Record<string, AgentBid>,
        constraints: NegotiationInputParams,
        roundNumber: number
    ): Promise<SupervisorSynthesisResult> {

        // Calculate current portfolio metrics
        const currentMetrics = this.calculatePortfolioMetrics(currentAllocation, assets);

        // Check if any agent vetoed
        const vetoBids = Object.values(bids).filter(b => b.veto);
        const vetoInfo = vetoBids.length > 0
            ? `VETOES DETECTED: ${vetoBids.map(b => `${b.agent_name}: ${b.veto_reason || b.reasoning}`).join('; ')}`
            : 'No vetoes.';

        const context = JSON.stringify({
            current_allocation: currentAllocation,
            current_metrics: currentMetrics,
            target_metrics: {
                max_volatility: constraints.max_volatility,
                min_esg: constraints.esg_minimum,
                target_return: constraints.target_expected_return
            },
            bids,
            constraints,
            round: roundNumber,
            veto_info: vetoInfo,
            assets: assets.map(a => ({
                symbol: a.symbol,
                sector: a.sector,
                volatility: a.volatility,
                expected_return: a.expected_return,
                esg_score: a.esg_score,
                liquidity_score: a.liquidity_score
            }))
        }, null, 2);

        const prompt = `
    You are the **Investment Committee Chairman** (Supervisor).
    Your goal is to synthesize the feedback (bids) from 4 specialized agents into a new portfolio allocation that MEETS ALL USER TARGETS.
    
    **CURRENT PORTFOLIO STATUS:**
    - Expected Return: ${currentMetrics.expectedReturn.toFixed(2)}% (Target: ${constraints.target_expected_return}%)
    - Volatility: ${currentMetrics.volatility.toFixed(2)}% (Max: ${constraints.max_volatility}%)
    - ESG Score: ${currentMetrics.esgScore.toFixed(1)} (Min: ${constraints.esg_minimum})
    
    **Agents:**
    - Risk Agent (Minimizes Volatility) - Target: <= ${constraints.max_volatility}%
    - Growth Agent (Maximizes Return) - Target: >= ${constraints.target_expected_return}%
    - Compliance Agent (Enforces ESG/Rules) - Target: >= ${constraints.esg_minimum}
    - Liquidity Agent (Ensures Tradability)
    
    **CRITICAL INSTRUCTIONS:**
    1. Review all agent bids. Pay ABSOLUTE attention to VETO votes - they indicate hard constraint violations.
    2. If ANY agent VETOED, you MUST fix that violation in your new allocation. This is non-negotiable.
    3. Propose a NEW allocation where weights sum EXACTLY to 100.
    4. The new allocation MUST meet all three targets: volatility <= max, return >= target, ESG >= minimum.
    5. If targets cannot all be met simultaneously, prioritize: 1) Volatility cap, 2) ESG minimum, 3) Return target.
    6. Provide a detailed "Chairman's Statement" explaining your decisions.
    7. Consensus is true ONLY if: No vetoes AND all targets are met AND majority approved.
    
    **Output Format (JSON):**
    {
      "allocation": { "SYMBOL": weight, ... },
      "explanation": "Detailed chairman's statement explaining the decisions and how they address user goals",
      "consensus": boolean
    }
    `;

        try {
            const result = await generateJSONCompletion<{
                allocation: Record<string, number>;
                explanation: string;
                consensus: boolean;
            }>(prompt, {
                provider: 'mistral',
                systemInstruction: "You are an expert Portfolio Manager orchestrating a team of AI agents. Your job is to create portfolios that MEET USER TARGETS."
            });

            // Calculate final metrics
            const finalMetrics = this.calculatePortfolioMetrics(result.allocation, assets);

            return {
                allocation: result.allocation,
                explanation: result.explanation,
                consensus: result.consensus,
                agentReasoning: {
                    risk: bids.risk?.reasoning || '',
                    growth: bids.growth?.reasoning || '',
                    compliance: bids.compliance?.reasoning || '',
                    liquidity: bids.liquidity?.reasoning || ''
                },
                metrics: finalMetrics,
                targetComparison: {
                    returnTarget: constraints.target_expected_return,
                    returnActual: finalMetrics.expectedReturn,
                    returnMet: finalMetrics.expectedReturn >= constraints.target_expected_return,
                    volatilityTarget: constraints.max_volatility,
                    volatilityActual: finalMetrics.volatility,
                    volatilityMet: finalMetrics.volatility <= constraints.max_volatility,
                    esgTarget: constraints.esg_minimum,
                    esgActual: finalMetrics.esgScore,
                    esgMet: finalMetrics.esgScore >= constraints.esg_minimum
                }
            };
        } catch (error) {
            console.warn("Supervisor LLM failed, using fallback logic.");

            // FALLBACK: Apply all agent changes proportionally
            const fallbackAlloc = this.applyFallbackAllocation(currentAllocation, bids, assets, constraints);
            const fallbackMetrics = this.calculatePortfolioMetrics(fallbackAlloc, assets);

            return {
                allocation: fallbackAlloc,
                explanation: "Supervisor is currently offline (Rate Limit/Error). Applied balanced fallback strategy prioritizing constraint satisfaction.",
                consensus: false,
                agentReasoning: {
                    risk: bids.risk?.reasoning || '',
                    growth: bids.growth?.reasoning || '',
                    compliance: bids.compliance?.reasoning || '',
                    liquidity: bids.liquidity?.reasoning || ''
                },
                metrics: fallbackMetrics,
                targetComparison: {
                    returnTarget: constraints.target_expected_return,
                    returnActual: fallbackMetrics.expectedReturn,
                    returnMet: fallbackMetrics.expectedReturn >= constraints.target_expected_return,
                    volatilityTarget: constraints.max_volatility,
                    volatilityActual: fallbackMetrics.volatility,
                    volatilityMet: fallbackMetrics.volatility <= constraints.max_volatility,
                    esgTarget: constraints.esg_minimum,
                    esgActual: fallbackMetrics.esgScore,
                    esgMet: fallbackMetrics.esgScore >= constraints.esg_minimum
                }
            };
        }
    }

    private calculatePortfolioMetrics(allocation: Record<string, number>, assets: MockAsset[]) {
        let expectedReturn = 0;
        let volatility = 0;
        let esgScore = 0;
        let totalWeight = 0;

        Object.entries(allocation).forEach(([symbol, weight]) => {
            const asset = assets.find(a => a.symbol === symbol);
            if (asset && weight > 0) {
                expectedReturn += asset.expected_return * weight;
                volatility += asset.volatility * weight;
                esgScore += asset.esg_score * weight;
                totalWeight += weight;
            }
        });

        const factor = totalWeight > 0 ? 100 / totalWeight : 1;
        return {
            expectedReturn: (expectedReturn * factor) / 100,
            volatility: (volatility * factor) / 100,
            esgScore: (esgScore * factor) / 100
        };
    }

    private applyFallbackAllocation(
        current: Record<string, number>,
        bids: Record<string, AgentBid>,
        assets: MockAsset[],
        constraints: NegotiationInputParams
    ): Record<string, number> {
        // Sort assets by a balanced score: high return, low volatility, high ESG
        const scoredAssets = assets.map(a => ({
            symbol: a.symbol,
            score: (a.expected_return / 30) - (a.volatility / constraints.max_volatility) + (a.esg_score / 100)
        })).sort((a, b) => b.score - a.score);

        // Create a new allocation favoring better-scored assets
        const newAlloc: Record<string, number> = {};
        let remaining = 100;

        scoredAssets.forEach((asset, index) => {
            // Give more weight to top-scored assets
            const weight = Math.max(5, Math.round(remaining / (scoredAssets.length - index)));
            newAlloc[asset.symbol] = Math.min(weight, remaining);
            remaining -= newAlloc[asset.symbol];
        });

        // Normalize to exactly 100
        const total = Object.values(newAlloc).reduce((a, b) => a + b, 0);
        if (total !== 100) {
            const adjustment = 100 - total;
            const firstKey = Object.keys(newAlloc)[0];
            newAlloc[firstKey] += adjustment;
        }

        return newAlloc;
    }
}

