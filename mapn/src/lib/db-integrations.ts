/**
 * Database Integration Helpers
 * Connects LLM APIs, Market Data APIs with Supabase Database
 */

import { createClient } from '@/lib/supabase/server'
import { generateCompletion, generateJSONCompletion } from '@/lib/llm'
import { getStockQuote, getMultipleQuotes, getMarketNews } from '@/lib/market/finnhub'
import type { Database } from './database.types'

type MockAsset = Database['public']['Tables']['mock_assets']['Row']
type MockAssetInsert = Database['public']['Tables']['mock_assets']['Insert']

/**
 * Portfolio Analysis with LLM + Database
 */
export async function analyzeUserPortfolio(userId: string) {
    const supabase = await createClient()

    // Fetch user's portfolio from database
    const { data: assets, error } = await supabase
        .from('mock_assets')
        .select('*')
        .eq('user_id', userId)

    if (error) throw error

    // Get live market data for all assets
    const symbols = assets?.map(a => a.symbol) || []
    const quotes = await getMultipleQuotes(symbols)

    // Create analysis prompt with real data
    const prompt = `Analyze this investment portfolio:

Assets:
${assets?.map((a, i) => {
        const quote = quotes.find(q => q.symbol === a.symbol)
        return `- ${a.symbol}: ${a.quantity} shares @ $${a.purchase_price}, Current: $${quote?.currentPrice || 'N/A'}`
    }).join('\n')}

Total Portfolio Value: $${assets?.reduce((sum, a) => {
        const quote = quotes.find(q => q.symbol === a.symbol)
        return sum + (a.quantity * (quote?.currentPrice || a.purchase_price))
    }, 0).toFixed(2)}

Provide:
1. Risk assessment
2. Diversification analysis
3. Recommendations for rebalancing
`

    const analysis = await generateCompletion(prompt, { systemInstruction: 'You are a professional portfolio analyst.' })

    // Store analysis in database
    await supabase.from('portfolio_analyses').insert({
        user_id: userId,
        analysis_text: analysis,
        analyzed_at: new Date().toISOString(),
    })

    return { analysis, assets, quotes }
}

/**
 * AI-Powered Asset Recommendation with Database Integration
 */
export async function recommendAssets(userId: string, preferences?: {
    riskTolerance?: 'low' | 'medium' | 'high'
    investmentAmount?: number
    sectors?: string[]
}) {
    const prompt = `Recommend 5 stocks for a portfolio with:
- Risk Tolerance: ${preferences?.riskTolerance || 'medium'}
- Investment Amount: $${preferences?.investmentAmount || 10000}
- Preferred Sectors: ${preferences?.sectors?.join(', ') || 'diversified'}

Return as JSON array with: { symbol, name, sector, reason, allocation_percent }`

    interface Recommendation {
        symbol: string
        name: string
        sector: string
        reason: string
        allocation_percent: number
    }

    const recommendations = await generateJSONCompletion<Recommendation[]>(
        prompt,
        { systemInstruction: 'You are a financial advisor. Only recommend real stock symbols.' }
    )

    // Get real-time quotes for recommended stocks
    const symbols = recommendations.map(r => r.symbol)
    const quotes = await getMultipleQuotes(symbols)

    // Enrich recommendations with live data
    const enrichedRecommendations = recommendations.map(rec => {
        const quote = quotes.find(q => q.symbol === rec.symbol)
        return {
            ...rec,
            currentPrice: quote?.currentPrice || 0,
            change: quote?.change || 0,
            percentChange: quote?.percentChange || 0,
        }
    })

    return enrichedRecommendations
}

/**
 * Store Market News to Database
 */
export async function syncMarketNews() {
    const supabase = await createClient()

    // Fetch latest news from Finnhub
    const news = await getMarketNews('general')

    // Store in database (upsert to avoid duplicates)
    const newsToInsert = news.map(article => ({
        external_id: article.id.toString(),
        headline: article.headline,
        summary: article.summary,
        source: article.source,
        url: article.url,
        image_url: article.image,
        published_at: new Date(article.datetime * 1000).toISOString(),
        category: article.category,
    }))

    const { error } = await supabase
        .from('market_news')
        .upsert(newsToInsert, { onConflict: 'external_id' })

    if (error) throw error

    return news.length
}

/**
 * Get AI Market Summary from Database + Live News
 */
export async function getAIMarketSummary() {
    const supabase = await createClient()

    // Get recent news from database
    const { data: recentNews } = await supabase
        .from('market_news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(10)

    const newsHeadlines = recentNews?.map(n => `- ${n.headline}`) || []

    const prompt = `Based on these recent market headlines:

${newsHeadlines.join('\n')}

Provide a concise 3-paragraph market summary covering:
1. Key market movements
2. Major news impact
3. Outlook for investors`

    const summary = await generateCompletion(
        prompt,
        { systemInstruction: 'You are a financial news analyst providing daily market summaries.' }
    )

    return summary
}

/**
 * Execute Trade with Validation
 */
export async function executeTrade(params: {
    userId: string
    symbol: string
    action: 'buy' | 'sell'
    quantity: number
}) {
    const supabase = await createClient()

    // Get live quote for validation
    const quote = await getStockQuote(params.symbol)
    if (!quote) throw new Error(`Unable to get quote for ${params.symbol}`)

    const { userId, symbol, action, quantity } = params

    if (action === 'buy') {
        // Insert new asset
        const newAsset: MockAssetInsert = {
            user_id: userId,
            symbol,
            quantity,
            purchase_price: quote.currentPrice,
            purchase_date: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from('mock_assets')
            .insert(newAsset)
            .select()
            .single()

        if (error) throw error
        return { action: 'buy', asset: data, price: quote.currentPrice }
    } else {
        // Sell existing asset
        const { data: existingAsset } = await supabase
            .from('mock_assets')
            .select('*')
            .eq('user_id', userId)
            .eq('symbol', symbol)
            .single()

        if (!existingAsset) throw new Error('Asset not found in portfolio')
        if (existingAsset.quantity < quantity) throw new Error('Insufficient shares')

        const newQuantity = existingAsset.quantity - quantity

        if (newQuantity === 0) {
            // Delete asset if all shares sold
            await supabase
                .from('mock_assets')
                .delete()
                .eq('id', existingAsset.id)
        } else {
            // Update quantity
            await supabase
                .from('mock_assets')
                .update({ quantity: newQuantity })
                .eq('id', existingAsset.id)
        }

        return {
            action: 'sell',
            symbol,
            quantity,
            salePrice: quote.currentPrice,
            profit: (quote.currentPrice - existingAsset.purchase_price) * quantity
        }
    }
}

/**
 * Get User Portfolio with Live Data
 */
export async function getUserPortfolioWithLiveData(userId: string) {
    const supabase = await createClient()

    const { data: assets, error } = await supabase
        .from('mock_assets')
        .select('*')
        .eq('user_id', userId)

    if (error) throw error
    if (!assets || assets.length === 0) return { assets: [], totalValue: 0, totalGainLoss: 0 }

    // Get live quotes
    const symbols = assets.map(a => a.symbol)
    const quotes = await getMultipleQuotes(symbols)

    // Calculate portfolio metrics
    const enrichedAssets = assets.map(asset => {
        const quote = quotes.find(q => q.symbol === asset.symbol)
        const currentPrice = quote?.currentPrice || asset.purchase_price
        const marketValue = currentPrice * asset.quantity
        const costBasis = asset.purchase_price * asset.quantity
        const gainLoss = marketValue - costBasis
        const gainLossPercent = ((currentPrice - asset.purchase_price) / asset.purchase_price) * 100

        return {
            ...asset,
            currentPrice,
            marketValue,
            costBasis,
            gainLoss,
            gainLossPercent,
            change: quote?.change || 0,
            percentChange: quote?.percentChange || 0,
        }
    })

    const totalValue = enrichedAssets.reduce((sum, a) => sum + a.marketValue, 0)
    const totalCost = enrichedAssets.reduce((sum, a) => sum + a.costBasis, 0)
    const totalGainLoss = totalValue - totalCost

    return {
        assets: enrichedAssets,
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainLossPercent: ((totalValue - totalCost) / totalCost) * 100
    }
}
