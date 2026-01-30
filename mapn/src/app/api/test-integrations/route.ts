import { NextResponse } from 'next/server'
import { runAllTests } from '@/lib/test-integrations'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results = await runAllTests()

        const allPassed = Object.values(results).every((r: any) => r.success)

        return NextResponse.json({
            status: allPassed ? 'success' : 'partial',
            message: allPassed
                ? 'All API integrations working!'
                : 'Some API tests failed',
            results,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Test execution failed',
                error: error.message
            },
            { status: 500 }
        )
    }
}
