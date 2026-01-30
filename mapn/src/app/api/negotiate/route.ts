import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { NegotiationEngine, EnhancedNegotiationRound } from '@/lib/negotiation-engine';
import { NegotiationInputParams, NegotiationRound, UserSurveyResponse } from '@/lib/database.types';
import { convertToINR, SupportedCurrency } from '@/lib/currency-api';

export const runtime = 'edge';

// Translate survey responses to concrete negotiation constraints
function translateSurveyToConstraints(survey: UserSurveyResponse, capitalINR: number): {
    max_volatility: number;
    esg_minimum: number;
    target_expected_return: number;
} {
    // Risk tolerance -> Volatility limits
    const volatilityMap = {
        conservative: 10,
        balanced: 18,
        aggressive: 28
    };

    // Risk tolerance + Expected return range -> Target return
    const returnMap = {
        conservative: { base: 8, max: 12 },
        balanced: { base: 12, max: 18 },
        aggressive: { base: 18, max: 30 }
    };

    // Downside comfort affects volatility adjustment
    const downsideAdjustment = {
        low: -3,
        medium: 0,
        high: 3
    };

    // ESG based on sector exclusions and tax sensitivity
    let esg_minimum = 50; // Base ESG
    if (survey.sectorExclusions.length > 0) {
        esg_minimum = Math.max(esg_minimum, 65);
    }
    if (survey.taxSensitivity === 'high') {
        esg_minimum = Math.max(esg_minimum, 60);
    }

    // Calculate final values
    const max_volatility = Math.max(5, volatilityMap[survey.riskTolerance] + downsideAdjustment[survey.downsideComfort]);

    // Use user's expected return range if provided, otherwise use profile default
    const target_expected_return = survey.expectedReturnRange?.min
        ? (survey.expectedReturnRange.min + survey.expectedReturnRange.max) / 2
        : returnMap[survey.riskTolerance].base;

    return {
        max_volatility,
        esg_minimum,
        target_expected_return
    };
}

export async function POST(req: NextRequest) {
    try {
        // Verify Authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            capital,
            currency = 'INR',
            surveyResponse
        } = body;

        // Convert capital to INR for consistent calculations
        const capitalINR = await convertToINR(capital, currency as SupportedCurrency);

        // Translate survey to constraints
        const surveyConstraints = surveyResponse
            ? translateSurveyToConstraints(surveyResponse, capitalINR)
            : { max_volatility: 15, esg_minimum: 50, target_expected_return: 12 };

        const constraints: NegotiationInputParams = {
            capital: capitalINR,
            currency,
            max_volatility: surveyConstraints.max_volatility,
            esg_minimum: surveyConstraints.esg_minimum,
            target_expected_return: surveyConstraints.target_expected_return,
            surveyResponse
        };

        // 1. Fetch Assets
        const { data: assets, error: assetError } = await supabase
            .from('mock_assets')
            .select('*');

        if (assetError || !assets || assets.length === 0) {
            return NextResponse.json({ error: 'Failed to load assets' }, { status: 500 });
        }

        // 2. Initialize Engine
        const engine = new NegotiationEngine(assets);

        // 3. Start Negotiation (DB Record) with User ID
        const negotiationId = await engine.startNegotiation(constraints, user.id);

        // 4. Create Stream
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                const send = (data: any) => {
                    controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
                };

                try {
                    // Send initial state & asset metadata with constraints
                    let currentAllocation = engine.getInitialPortfolio();
                    send({
                        type: 'init',
                        negotiationId,
                        initialAllocation: currentAllocation,
                        assets,
                        constraints: {
                            max_volatility: constraints.max_volatility,
                            esg_minimum: constraints.esg_minimum,
                            target_expected_return: constraints.target_expected_return,
                            capital: capitalINR,
                            currency
                        },
                        surveyResponse
                    });

                    const roundsLog: NegotiationRound[] = [];
                    const allRoundsData: EnhancedNegotiationRound[] = [];

                    // Run up to 5 rounds for better convergence
                    const maxRounds = 5;
                    for (let i = 1; i <= maxRounds; i++) {
                        send({ type: 'status', message: `Starting Round ${i}...` });

                        const roundResult = await engine.runRound(
                            negotiationId,
                            currentAllocation,
                            i,
                            constraints,
                            roundsLog
                        );

                        roundsLog.push(roundResult);
                        allRoundsData.push(roundResult);
                        currentAllocation = roundResult.proposed_allocation;

                        // Send enhanced round data including agent reasoning
                        send({
                            type: 'round',
                            data: roundResult,
                            roundNumber: i,
                            metrics: roundResult.metrics,
                            targetComparison: roundResult.targetComparison,
                            agentReasoning: roundResult.agentReasoning
                        });

                        if (roundResult.consensus_reached) {
                            send({ type: 'status', message: 'Consensus reached!' });
                            break;
                        }
                    }

                    // Send completion with full summary data
                    send({
                        type: 'done',
                        finalAllocation: currentAllocation,
                        allRounds: allRoundsData,
                        finalMetrics: allRoundsData[allRoundsData.length - 1]?.metrics,
                        targetComparison: allRoundsData[allRoundsData.length - 1]?.targetComparison,
                        agentReasoning: allRoundsData[allRoundsData.length - 1]?.agentReasoning,
                        constraints
                    });
                    controller.close();

                } catch (err) {
                    console.error(err);
                    send({ type: 'error', message: 'Negotiation failed' });
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/x-ndjson',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

