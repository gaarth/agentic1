export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            mock_assets: {
                Row: {
                    esg_score: number
                    expected_return: number
                    liquidity_score: number
                    name: string
                    sector: string
                    symbol: string
                    volatility: number
                }
                Insert: {
                    esg_score: number
                    expected_return: number
                    liquidity_score: number
                    name: string
                    sector: string
                    symbol: string
                    volatility: number
                }
                Update: {
                    esg_score?: number
                    expected_return?: number
                    liquidity_score?: number
                    name?: string
                    sector?: string
                    symbol?: string
                    volatility?: number
                }
                Relationships: []
            }
            negotiations: {
                Row: {
                    created_at: string | null
                    explanation: string | null
                    final_allocation: Json | null
                    id: string
                    input_params: Json
                    rounds_log: Json[] | null
                }
                Insert: {
                    created_at?: string | null
                    explanation?: string | null
                    final_allocation?: Json | null
                    id?: string
                    input_params: Json
                    rounds_log?: Json[] | null
                }
                Update: {
                    created_at?: string | null
                    explanation?: string | null
                    final_allocation?: Json | null
                    id?: string
                    input_params?: Json
                    rounds_log?: Json[] | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Convenience types for direct table access
export type MockAsset = Database['public']['Tables']['mock_assets']['Row']
export type MockAssetInsert = Database['public']['Tables']['mock_assets']['Insert']
export type Negotiation = Database['public']['Tables']['negotiations']['Row']
export type NegotiationInsert = Database['public']['Tables']['negotiations']['Insert']

// Typed input params for negotiations
export interface NegotiationInputParams {
    capital: number
    max_volatility: number
    esg_minimum: number
    custom_constraints?: string
}

// Typed agent bid structure
export interface AgentBid {
    agent_name: string
    proposed_changes: Record<string, number>
    reasoning: string
    approval: boolean
    veto?: boolean
    veto_reason?: string
}

// Typed round structure
export interface NegotiationRound {
    round_number: number
    agent_bids: {
        risk: AgentBid
        growth: AgentBid
        compliance: AgentBid
        liquidity: AgentBid
    }
    proposed_allocation: Record<string, number>
    consensus_reached: boolean
}
