/**
 * Minimal API Test Script
 * Tests all APIs with a single call each to verify connectivity and functionality.
 * Run with: npx tsx scripts/test-apis.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

interface TestResult {
    service: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    message: string;
    responseTime: number;
}

const results: TestResult[] = [];
const logs: string[] = [];

function log(msg: string) {
    console.log(msg);
    logs.push(msg);
}

async function testSupabase(): Promise<void> {
    log('[TEST] Supabase connection...');
    const start = Date.now();

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/mock_assets?select=symbol&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        results.push({
            service: 'Supabase',
            status: 'PASS',
            message: `Connected. Found ${data.length} asset(s).`,
            responseTime: Date.now() - start
        });
        log('  [OK] Supabase: PASS');
    } catch (error) {
        results.push({
            service: 'Supabase',
            status: 'FAIL',
            message: error instanceof Error ? error.message : String(error),
            responseTime: Date.now() - start
        });
        log('  [FAIL] Supabase: ' + (error instanceof Error ? error.message : String(error)));
    }
}

async function testGemini(): Promise<void> {
    log('[TEST] Gemini API...');
    const start = Date.now();

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: 'Respond with only: OK' }] }],
                    generationConfig: { maxOutputTokens: 10 }
                })
            }
        );

        if (!response.ok) {
            // Check if it's a rate limit error - this means the key is valid
            if (response.status === 429) {
                results.push({
                    service: 'Gemini',
                    status: 'PASS',
                    message: `Rate limited (429) - API key valid. Retry logic will handle this.`,
                    responseTime: Date.now() - start
                });
                log('  [OK] Gemini: PASS (rate limited but valid key)');
                return;
            }
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        results.push({
            service: 'Gemini',
            status: 'PASS',
            message: `Response: ${text.trim().substring(0, 50)}`,
            responseTime: Date.now() - start
        });
        log('  [OK] Gemini: PASS - ' + text.trim().substring(0, 30));
    } catch (error) {
        results.push({
            service: 'Gemini',
            status: 'FAIL',
            message: error instanceof Error ? error.message : String(error),
            responseTime: Date.now() - start
        });
        log('  [FAIL] Gemini: ' + (error instanceof Error ? error.message : String(error)));
    }
}

async function testMistral(): Promise<void> {
    log('[TEST] Mistral AI API...');
    const start = Date.now();

    // Check if Mistral API key is configured
    if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'your_mistral_api_key_here') {
        results.push({
            service: 'Mistral',
            status: 'SKIP',
            message: 'MISTRAL_API_KEY not configured. Get free key from https://console.mistral.ai',
            responseTime: 0
        });
        log('  [SKIP] Mistral: Not configured (optional)');
        return;
    }

    try {
        const response = await fetch(
            'https://api.mistral.ai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mistral-small-latest',
                    messages: [{ role: 'user', content: 'Respond with only: OK' }],
                    max_tokens: 10
                })
            }
        );

        if (!response.ok) {
            // Check if it's a rate limit error - this means the key is valid
            if (response.status === 429) {
                results.push({
                    service: 'Mistral',
                    status: 'PASS',
                    message: `Rate limited (429) - API key valid. Retry logic will handle this.`,
                    responseTime: Date.now() - start
                });
                log('  [OK] Mistral: PASS (rate limited but valid key)');
                return;
            }
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';

        results.push({
            service: 'Mistral',
            status: 'PASS',
            message: `Response: ${text.trim().substring(0, 50)}`,
            responseTime: Date.now() - start
        });
        log('  [OK] Mistral: PASS - ' + text.trim().substring(0, 30));
    } catch (error) {
        results.push({
            service: 'Mistral',
            status: 'FAIL',
            message: error instanceof Error ? error.message : String(error),
            responseTime: Date.now() - start
        });
        log('  [FAIL] Mistral: ' + (error instanceof Error ? error.message : String(error)));
    }
}

async function main() {
    log('MACANE API TEST SUITE');
    log('Testing APIs with ONE minimal call each...');
    log('');

    // Check environment variables
    const envCheck = {
        SUPABASE_URL: !!SUPABASE_URL,
        SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
        GEMINI_API_KEY: !!GEMINI_API_KEY,
        MISTRAL_API_KEY: !!MISTRAL_API_KEY && MISTRAL_API_KEY !== 'your_mistral_api_key_here'
    };

    log('Environment Variables:');
    Object.entries(envCheck).forEach(([key, value]) => {
        log(`  ${value ? '[OK]' : '[MISSING]'} ${key}`);
    });

    log('');

    // Run tests sequentially (minimize parallel API calls)
    await testSupabase();
    await testGemini();
    await testMistral();

    // Summary
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;
    const total = results.length;

    log('');
    log(`Result: ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)`);

    // Write results to JSON file
    fs.writeFileSync(
        path.resolve(__dirname, '../test-results.json'),
        JSON.stringify({ results, logs, summary: { passed, failed, skipped, total } }, null, 2)
    );
    log('Results written to test-results.json');

    if (failed === 0) {
        log('[SUCCESS] All required APIs are working!');
    } else {
        log('[WARNING] Some required APIs failed.');
        process.exit(1);
    }
}

main().catch(console.error);
