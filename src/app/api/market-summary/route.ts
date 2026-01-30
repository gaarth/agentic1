import { NextResponse } from 'next/server'
import { getAIMarketSummary, syncMarketNews } from '@/lib/db-integrations'

export async function GET() {
    try {
        // Sync latest news first
        await syncMarketNews()

        // Generate AI summary
        const summary = await getAIMarketSummary()

        return NextResponse.json({ summary })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch market summary' },
            { status: 500 }
        )
    }
}
