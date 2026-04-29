import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// AGI Navigation Hub - Reasoning Engine v1.2
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event_type, payload, asset_id, tenant_id } = body;

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `
# Role: AGI 思考導航中心 (AGI Navigation Hub)
你現在是所有外部應用程式的「中央大腦」。你的任務是接收事件訊號，並產出邏輯嚴密的決策。

## 任務指令：
1. 分析事件類型 [${event_type}]。
2. 根據資產標籤 [${asset_id}] 調配最適合的職人思維。
3. 如果是聊天訊息，請給予專業且具備導航性質的回覆。
4. 輸出的內容必須包含建議的思考積木標籤。

## 當前環境：
- Tenant: ${tenant_id || 'Global'}
- Asset: ${asset_id || 'Standalone Hub'}
`;

        const result = await model.generateContent(systemPrompt + "\n\nUser Event: " + JSON.stringify(payload));
        const text = result.response.text();

        // Mock block suggestions for now
        const mockBlocks = ['logic_chain', 'persona_mount', 'risk_audit'];

        return NextResponse.json({ 
            content: text, 
            suggested_blocks: mockBlocks,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Hub API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
