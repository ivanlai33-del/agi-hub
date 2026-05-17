import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { payload, brain_config, messages } = body;

        const apiKey = (process.env.AGI_HUB_GEMINI_KEY || "").trim();
        
        if (!apiKey) {
            return NextResponse.json({ error: 'Config Error: AGI_HUB_GEMINI_KEY missing' }, { status: 500 });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        // Construct System Context based on the dispatched brain
        const systemPrompt = `
You are the AGI Navigation Core, currently operating as the dispatched brain: "${brain_config?.name || 'General Assistant'}".

[MISSION]
${brain_config?.instructions || 'Provide general navigation and assistance.'}

[AVAILABLE NAVIGATION BLOCKS]
${brain_config?.modules?.map((m: string) => `- ${m}`).join('\n') || 'General Chat'}

[THINKING FLOW STANDARD]
You MUST follow the 6-step thinking flow for every decision:
1. Understanding (理解): Analyze user intent.
2. Identification (辨識): Identify relevant resources or personas.
3. Decision (決策): Choose the best action path.
4. Execution (執行): Provide the response or trigger action.
5. Record (紀錄): Document the outcome.
6. Automation (自動化): Suggest optimization.

[FORMATTING RULES]
- NEVER use Markdown formatting symbols like **, ###, or lists with bullets (* or -).
- Use PLAIN TEXT only.
- When listing items or steps, place the number (e.g., 1., 2., 3.) as the VERY FIRST character of the line.
- Use clear line breaks and empty lines to separate paragraphs.
- Maintain a clean, professional look.

Keep your response professional, concise, and aligned with your specific persona.
You MUST ALWAYS respond in Traditional Chinese (zh-TW).

[SELF-BUILDING CAPABILITY]
If the user asks you to "create", "design", or "train" a new brain (e.g., for Pilates, Red Cord, etc.), you should design its name, category, instructions, and modules.
At the END of your response, you MUST include a block like this:
CREATE_BRAIN:
{
  "id": "unique_id",
  "name": "Brain Name",
  "category": "Category",
  "description": "Brief description",
  "instructions": "Personality Core instructions",
  "modules": ["Module 1", "Module 2"]
}
        `;

        // Map history to Gemini contents format
        let history = (messages || []).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));
        
        // Google Gemini API requires the first message in history to be from 'user'
        if (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }
        
        if (history.length === 0) {
            history = [{
                role: 'user',
                parts: [{ text: typeof payload === 'string' ? payload : (payload?.text || "Hello") }]
            }];
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: history
            })
        });

        const result = await response.json();
        
        // 金鑰脫敏防護：確保日誌與回傳錯誤中絕不包含明文 API Key
        const sanitizeText = (text: string) => {
            if (!apiKey) return text;
            return text.split(apiKey).join('[REDACTED_API_KEY]');
        };

        console.log('[AGI HUB] Google API Result:', sanitizeText(JSON.stringify(result, null, 2)));

        if (!response.ok) {
            const sanitizedDetails = JSON.parse(sanitizeText(JSON.stringify(result)));
            return NextResponse.json({ error: 'LLM Error', details: sanitizedDetails }, { status: response.status });
        }

        return NextResponse.json({ 
            content: result.candidates?.[0]?.content?.parts?.[0]?.text || "No content", 
            timestamp: new Date().toISOString(),
            dispatched_as: brain_config?.name
        });

    } catch (error: any) {
        const apiKey = (process.env.AGI_HUB_GEMINI_KEY || "").trim();
        const errorMessage = error?.message || "";
        const sanitizedError = apiKey ? errorMessage.split(apiKey).join('[REDACTED_API_KEY]') : errorMessage;
        return NextResponse.json({ error: sanitizedError }, { status: 500 });
    }
}
