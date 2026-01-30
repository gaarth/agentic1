import { BaseAgent } from './agent';
import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';
import { COMPLIANCE_AGENT_PROMPT } from './prompts';

export class ComplianceAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Compliance Agent',
            role: 'Compliance Officer',
            persona: COMPLIANCE_AGENT_PROMPT,
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
        const isViolating = portfolioStats.esgScore < constraints.esg_minimum;
        const sectorExclusions = constraints.surveyResponse?.sectorExclusions || [];

        // Check for sector exclusion violations
        const excludedAllocations = this.checkSectorExclusions(currentAllocation, assets, sectorExclusions);

        const context = JSON.stringify({
            current_allocation: currentAllocation,
            portfolio_stats: {
                ...portfolioStats,
                esg_status: isViolating ? 'VIOLATION' : 'COMPLIANT'
            },
            constraints: {
                esg_minimum: constraints.esg_minimum,
                sector_exclusions: sectorExclusions
            },
            excluded_allocations: excludedAllocations,
            available_assets: assets.map(a => ({
                symbol: a.symbol,
                esg_score: a.esg_score,
                sector: a.sector,
                is_excluded: sectorExclusions.some(s => a.sector.toLowerCase().includes(s.toLowerCase()))
            })).sort((a, b) => b.esg_score - a.esg_score),
            round: roundNumber,
            must_veto: isViolating || excludedAllocations.length > 0
        }, null, 2);

        const prompt = `
    Analyze the current portfolio for ESG COMPLIANCE.
    
    ** CURRENT STATUS **
    Current Weighted ESG Score: ${portfolioStats.esgScore.toFixed(2)}
    Required Minimum ESG Score: ${constraints.esg_minimum}
    Gap: ${(constraints.esg_minimum - portfolioStats.esgScore).toFixed(2)}
    
    Sector Exclusions: ${sectorExclusions.length > 0 ? sectorExclusions.join(', ') : 'None'}
    Excluded Sector Violations: ${excludedAllocations.length > 0 ? excludedAllocations.map(e => `${e.symbol} (${e.sector})`).join(', ') : 'None'}
    
    STATUS: ${isViolating ? '⚠️ ESG VIOLATION - MUST VETO' : excludedAllocations.length > 0 ? '⚠️ SECTOR EXCLUSION VIOLATION - MUST VETO' : '✓ Compliant'}
    
    ${isViolating ?
                `CRITICAL: ESG score (${portfolioStats.esgScore.toFixed(2)}) is BELOW minimum (${constraints.esg_minimum}). You MUST set veto=true and propose changes to increase ESG score.` :
                excludedAllocations.length > 0 ?
                    `CRITICAL: Portfolio contains excluded sectors. You MUST set veto=true and propose removing: ${excludedAllocations.map(e => e.symbol).join(', ')}` :
                    `ESG compliance is satisfied. Maintain or improve.`
            }
    
    Provide your bid in strict JSON format with proposed_changes, reasoning, approval, veto, and veto_reason if applicable.
    `;

        return this.askLLM<AgentBid>(prompt, context);
    }

    private calculateStats(allocation: Record<string, number>, assets: MockAsset[]) {
        let esgScore = 0;
        let totalWeight = 0;

        Object.entries(allocation).forEach(([symbol, weight]) => {
            const asset = assets.find(a => a.symbol === symbol);
            if (asset && weight > 0) {
                esgScore += asset.esg_score * weight;
                totalWeight += weight;
            }
        });

        const factor = totalWeight > 0 ? 100 / totalWeight : 1;
        return { esgScore: (esgScore * factor) / 100 };
    }

    private checkSectorExclusions(
        allocation: Record<string, number>,
        assets: MockAsset[],
        exclusions: string[]
    ): { symbol: string; sector: string; weight: number }[] {
        if (exclusions.length === 0) return [];

        const violations: { symbol: string; sector: string; weight: number }[] = [];

        Object.entries(allocation).forEach(([symbol, weight]) => {
            if (weight <= 0) return;
            const asset = assets.find(a => a.symbol === symbol);
            if (asset) {
                const isExcluded = exclusions.some(
                    exc => asset.sector.toLowerCase().includes(exc.toLowerCase())
                );
                if (isExcluded) {
                    violations.push({ symbol, sector: asset.sector, weight });
                }
            }
        });

        return violations;
    }
}

