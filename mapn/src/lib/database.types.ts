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
                    id: string
                    user_id: string
                    symbol: string
                    quantity: number
                    purchase_price: number
                    purchase_date: string
                    name?: string
                    sector?: string
                    esg_score?: number
                    expected_return?: number
                    liquidity_score?: number
                    volatility?: number
                }
                Insert: {
                    id?: string
                    user_id: string
                    symbol: string
                    quantity: number
                    purchase_price: number
                    purchase_date?: string
                    name?: string
                    sector?: string
                    esg_score?: number
                    expected_return?: number
                    liquidity_score?: number
                    volatility?: number
                }
                Update: {
                    id?: string
                    user_id?: string
                    symbol?: string
                    quantity?: number
                    purchase_price?: number
                    purchase_date?: string
                    name?: string
                    sector?: string
                    esg_score?: number
                    expected_return?: number
                    liquidity_score?: number
                    volatility?: number
                }
                Relationships: []
            }
            market_news: {
                Row: {
                    id: number
                    external_id: string
                    headline: string
                    summary: string
                    source: string
                    url: string
                    image_url: string
                    published_at: string
                    category: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    external_id: string
                    headline: string
                    summary: string
                    source: string
                    url: string
                    image_url: string
                    published_at: string
                    category: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    external_id?: string
                    headline?: string
                    summary?: string
                    source?: string
                    url?: string
                    image_url?: string
                    published_at?: string
                    category?: string
                    created_at?: string
                }
                Relationships: []
            }
            portfolio_analyses: {
                Row: {
                    id: number
                    user_id: string
                    analysis_text: string
                    analyzed_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    analysis_text: string
                    analyzed_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    analysis_text?: string
                    analyzed_at?: string
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

// User survey response types
export type RiskTolerance = 'conservative' | 'balanced' | 'aggressive';
export type InvestmentHorizon = 'short' | 'medium' | 'long';
export type DownsideComfort = 'low' | 'medium' | 'high';
export type IncomeNeeds = 'none' | 'some' | 'regular';
export type TaxSensitivity = 'low' | 'medium' | 'high';
export type GeographicPreference = 'domestic' | 'international' | 'global';
export type RebalancingFrequency = 'monthly' | 'quarterly' | 'annually';
export type AssetClass = 'equities' | 'debt' | 'crypto' | 'alternatives';

export interface UserSurveyResponse {
    riskTolerance: RiskTolerance;
    expectedReturnRange: { min: number; max: number };
    assetClasses: AssetClass[];
    investmentHorizon: InvestmentHorizon;
    downsideComfort: DownsideComfort;
    incomeNeeds: IncomeNeeds;
    taxSensitivity: TaxSensitivity;
    geographicPreference: GeographicPreference;
    rebalancingFrequency: RebalancingFrequency;
    sectorExclusions: string[];
}

// Typed input params for negotiations
export interface NegotiationInputParams {
    capital: number;
    currency: string;
    max_volatility: number;
    esg_minimum: number;
    target_expected_return: number;
    custom_constraints?: string;
    surveyResponse?: UserSurveyResponse;
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
