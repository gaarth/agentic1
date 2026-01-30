import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recommendAssets } from '@/lib/db-integrations'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { riskTolerance, investmentAmount, sectors } = body

        // Get AI recommendations
        const recommendations = await recommendAssets(user.id, {
            riskTolerance,
            investmentAmount,
            sectors
        })

        return NextResponse.json({ recommendations })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to generate recommendations' },
            { status: 500 }
        )
    }
}
