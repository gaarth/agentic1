import { AgentBid, NegotiationInputParams, MockAsset, NegotiationRound } from '@/lib/database.types';
import { generateJSONCompletion, LLMProvider } from '@/lib/llm';

export interface AgentConfig {
    name: string;
    role: string;
    persona: string;
    llmProvider: LLMProvider;
}

export abstract class BaseAgent {
    public name: string;
    public role: string;
    protected persona: string;
    protected llmProvider: LLMProvider;

    constructor(config: AgentConfig) {
        this.name = config.name;
        this.role = config.role;
        this.persona = config.persona;
        this.llmProvider = config.llmProvider;
    }

    /**
     * Evaluates the current portfolio state and proposes changes or critiques.
     */
    abstract evaluate(
        currentAllocation: Record<string, number>, // symbol -> weight (0-100)
        assets: MockAsset[],
        constraints: NegotiationInputParams,
        roundNumber: number,
        previousRounds: NegotiationRound[]
    ): Promise<AgentBid>;

    protected async askLLM<T>(prompt: string, systemContext?: string): Promise<T> {
        const fullSystemPrompt = `You are the ${this.name} (${this.role}).\n${this.persona}\n\n${systemContext || ''}`;

        try {
            return await generateJSONCompletion<T>(prompt, {
                provider: this.llmProvider,
                systemInstruction: fullSystemPrompt
            });
        } catch (error) {
            console.warn(`⚠️  Agent ${this.name} hit an API issue. Using fail-safe (Neutral Bid).`);

            // Fail-safe: Return a "Neutral" bid to keep the negotiation running
            // We cast this to T, assuming T matches AgentBid structure roughly
            return {
                agent_name: this.name,
                proposed_changes: {},
                reasoning: "Agent momentarily unavailable (Network/JSON Error). Holding neutral position.",
                approval: true,
                veto: false
            } as unknown as T;
        }
    }
}
