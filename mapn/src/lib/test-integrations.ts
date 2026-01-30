/**
 * Integration Test & Demo Script
 * Run this to verify all APIs are working
 */

import { generateCompletion } from '@/lib/llm'
import { getStockQuote, getMarketNews } from '@/lib/market/finnhub'

/**
 * Test Gemini API
 */
export async function testGeminiAPI() {
    console.log('🧠 Testing Gemini API...')
    try {
        const response = await generateCompletion(
            'What are the top 3 quality indicators for evaluating stocks? Be concise.',
            'You are a financial analyst.'
        )
        console.log('✅ Gemini API working!')
        console.log('Response:', response.substring(0, 100) + '...')
        return { success: true, response }
    } catch (error: any) {
        console.error('❌ Gemini API failed:', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Test Finnhub API
 */
export async function testFinnhubAPI() {
    console.log('📈 Testing Finnhub API...')
    try {
        const quote = await getStockQuote('AAPL')
        if (!quote) throw new Error('No quote returned')

        console.log('✅ Finnhub API working!')
        console.log(`AAPL Price: $${quote.currentPrice}`)
        console.log(`Change: ${quote.change > 0 ? '+' : ''}${quote.percentChange.toFixed(2)}%`)
        return { success: true, quote }
    } catch (error: any) {
        console.error('❌ Finnhub API failed:', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Test Market News API
 */
export async function testMarketNewsAPI() {
    console.log('📰 Testing Market News API...')
    try {
        const news = await getMarketNews('general')
        if (!news || news.length === 0) throw new Error('No news returned')

        console.log('✅ Market News API working!')
        console.log(`Fetched ${news.length} articles`)
        console.log('Latest:', news[0]?.headline.substring(0, 60) + '...')
        return { success: true, newsCount: news.length }
    } catch (error: any) {
        console.error('❌ Market News API failed:', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Run all integration tests
 */
export async function runAllTests() {
    console.log('\n🚀 Running All Integration Tests...\n')

    const results = {
        gemini: await testGeminiAPI(),
        finnhub: await testFinnhubAPI(),
        marketNews: await testMarketNewsAPI(),
    }

    console.log('\n📊 Test Results Summary:\n')
    console.log('Gemini API:', results.gemini.success ? '✅ PASS' : '❌ FAIL')
    console.log('Finnhub API:', results.finnhub.success ? '✅ PASS' : '❌ FAIL')
    console.log('Market News:', results.marketNews.success ? '✅ PASS' : '❌ FAIL')

    const allPassed = Object.values(results).every(r => r.success)
    console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED')

    return results
}

// Export individual test functions
export const tests = {
    gemini: testGeminiAPI,
    finnhub: testFinnhubAPI,
    marketNews: testMarketNewsAPI,
    all: runAllTests
}
