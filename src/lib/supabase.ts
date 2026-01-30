import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Re-export all types from database.types for convenience
export type {
  Database,
  MockAsset,
  MockAssetInsert,
  Negotiation,
  NegotiationInsert,
  NegotiationInputParams,
  AgentBid,
  NegotiationRound,
} from './database.types';
