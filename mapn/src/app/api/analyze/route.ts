import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeUserPortfolio } from '@/lib/db-integrations'

export async function GET() {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Generate AI analysis
        const analysis = await analyzeUserPortfolio(user.id)

        return NextResponse.json(analysis)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to analyze portfolio' },
            { status: 500 }
        )
    }
}
