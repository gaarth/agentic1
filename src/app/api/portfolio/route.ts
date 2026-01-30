import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPortfolioWithLiveData } from '@/lib/db-integrations'

export async function GET() {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get portfolio with live market data
        const portfolio = await getUserPortfolioWithLiveData(user.id)

        return NextResponse.json(portfolio)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch portfolio' },
            { status: 500 }
        )
    }
}
