import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { NegotiationEngine } from '@/lib/negotiation-engine';
import { NegotiationInputParams, NegotiationRound } from '@/lib/database.types';

export const runtime = 'edge'; // Use Edge Runtime for better streaming performance if possible, though 'nodejs' might be safer for Supabase if not using edge-compat client. Let's try edge.
// actually, standard supabase-js works in edge.

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { capital, max_volatility, esg_minimum, custom_constraints } = body;

        const constraints: NegotiationInputParams = {
            capital,
            max_volatility: max_volatility || 15,
            esg_minimum: esg_minimum || 0,
            custom_constraints
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

        // 3. Start Negotiation (DB Record)
        // Note: We await this to get the ID, but the heavy lifting happens in the stream
        const negotiationId = await engine.startNegotiation(constraints);

        // 4. Create Stream
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                const send = (data: any) => {
                    controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
                };

                try {
                    // Send initial state & asset metadata
                    let currentAllocation = engine.getInitialPortfolio();
                    send({
                        type: 'init',
                        negotiationId,
                        initialAllocation: currentAllocation,
                        assets: assets // Send asset definitions so frontend can calculate metrics
                    });

                    const roundsLog: NegotiationRound[] = [];

                    // Run up to 3 rounds
                    for (let i = 1; i <= 3; i++) {
                        // Processing message
                        send({ type: 'status', message: `Starting Round ${i}...` });

                        const roundResult = await engine.runRound(
                            negotiationId,
                            currentAllocation,
                            i,
                            constraints,
                            roundsLog
                        );

                        roundsLog.push(roundResult);
                        currentAllocation = roundResult.proposed_allocation;

                        send({ type: 'round', data: roundResult });

                        if (roundResult.consensus_reached) {
                            send({ type: 'status', message: 'Consensus reached!' });
                            break;
                        }
                    }

                    send({ type: 'done', finalAllocation: currentAllocation });
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
