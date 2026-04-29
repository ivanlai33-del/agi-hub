import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { payload } = body;

        // 核心修正：讀取專屬的自定義金鑰名稱，徹底避開系統衝突
        const apiKey = (process.env.AGI_HUB_GEMINI_KEY || "").trim();
        
        console.log(`[AGI HUB] Unique Key Mode - Key Identity: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 5)}`);

        if (!apiKey) {
            return NextResponse.json({ error: 'Config Error: AGI_HUB_GEMINI_KEY not found in .env.local' }, { status: 500 });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: typeof payload === 'string' ? payload : (payload.text || "Hello") }]
                }]
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: 'Auth Failed', details: result }, { status: response.status });
        }

        return NextResponse.json({ 
            content: result.candidates?.[0]?.content?.parts?.[0]?.text || "No content", 
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
