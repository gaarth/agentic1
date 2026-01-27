import { generateJSONCompletion } from '@/lib/llm';
import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';

export class SupervisorAgent {
    async synthesize(
        currentAllocation: Record<string, number>,
        assets: MockAsset[],
        bids: Record<string, AgentBid>,
        constraints: NegotiationInputParams,
        roundNumber: number
    ): Promise<{
        allocation: Record<string, number>;
        explanation: string;
        consensus: boolean;
    }> {

        // Check if any agent vetoed
        const vetoBids = Object.values(bids).filter(b => b.veto);
        if (vetoBids.length > 0) {
            // If vetoed, we must address the veto. For simplicity in this demo,
            // we'll ask the Supervisor to specifically fix the vetoed constraint.
            // But for now, let's just pass the veto info to the prompt.
        }

        const context = JSON.stringify({
            current_allocation: currentAllocation,
            bids,
            constraints,
            round: roundNumber,
            assets: assets.map(a => ({
                symbol: a.symbol,
                sector: a.sector,
                risk: a.volatility,
                return: a.expected_return
            }))
        }, null, 2);

        const prompt = `
    You are the **Investment Committee Chairman** (Supervisor).
    Your goal is to synthesize the feedback (bids) from 4 specialized agents into a new portfolio allocation.
    
    **Agents:**
    - Risk Agent (Minimizes Volatility)
    - Growth Agent (Maximizes Return)
    - Compliance Agent (Enforces ESG/Rules)
    - Liquidity Agent (Ensures Tradability)
    
    **Instructions:**
    1. Review all agent bids. Pay special attention to VETO votes.
    2. Propose a NEW allocation (weights must sum to 100).
    3. If an agent VETOED, you MUST correct the violation in your new allocation.
    4. Provide a "Chairman's Statement" explaining your decision.
    5. Decide if we have reached consensus. Consensus is true if:
       - No agent VETOED.
       - A majority of agents voted 'approval: true'.
       - OR if the changes requested are very minor.
    
    **Output Format (JSON):**
    {
      "allocation": { "SYMBOL": weight, ... },
      "explanation": "string",
      "consensus": boolean
    }
    `;

        try {
            return await generateJSONCompletion<{
                allocation: Record<string, number>;
                explanation: string;
                consensus: boolean;
            }>(prompt, {
                provider: 'gemini', // Supervisor uses Gemini 2.0 Flash
                systemInstruction: "You are an expert Portfolio Manager orchestrating a team of AI agents."
            });
        } catch (error) {
            console.warn("Supervisor LLM failed, using fallback logic.");

            // FALLBACK: Accept Growth's changes but simpler
            const fallbackAlloc = bids.growth?.proposed_changes ?
                this.applyChanges(currentAllocation, bids.growth.proposed_changes) :
                currentAllocation;

            return {
                allocation: fallbackAlloc,
                explanation: "Supervisor is currently offline (Rate Limit/Error). Defaulting to Growth strategy.",
                consensus: false
            };
        }
    }

    private applyChanges(current: Record<string, number>, changes: Record<string, number>): Record<string, number> {
        const newAlloc = { ...current };
        Object.entries(changes).forEach(([symbol, delta]) => {
            newAlloc[symbol] = Math.max(0, (newAlloc[symbol] || 0) + delta);
        });
        // Normalize
        const total = Object.values(newAlloc).reduce((a, b) => a + b, 0);
        if (total > 0) {
            Object.keys(newAlloc).forEach(k => newAlloc[k] = (newAlloc[k] / total) * 100);
        }
        return newAlloc;
    }
}
