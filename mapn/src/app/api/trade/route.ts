import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeTrade } from '@/lib/db-integrations'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { symbol, action, quantity } = body

        // Validate input
        if (!symbol || !action || !quantity) {
            return NextResponse.json(
                { error: 'Missing required fields: symbol, action, quantity' },
                { status: 400 }
            )
        }

        if (!['buy', 'sell'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be "buy" or "sell"' },
                { status: 400 }
            )
        }

        if (quantity <= 0) {
            return NextResponse.json(
                { error: 'Quantity must be greater than 0' },
                { status: 400 }
            )
        }

        // Execute trade
        const result = await executeTrade({
            userId: user.id,
            symbol: symbol.toUpperCase(),
            action,
            quantity
        })

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to execute trade' },
            { status: 500 }
        )
    }
}
