const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKey = envContent.split('\n').find(line => line.startsWith('AGI_HUB_GEMINI_KEY=')).split('=')[1].trim();
const brainsPath = './src/data/brains.json';
let brains = JSON.parse(fs.readFileSync(brainsPath, 'utf8'));

async function translateBatch(batch) {
  const prompt = `
Translate the following JSON array of AI agent metadata into Traditional Chinese (zh-TW).
ONLY translate the "name", "category", "description", and the strings inside "modules".
DO NOT translate "id", "instructions", or any other fields.
Keep the style professional and concise.
Return EXACTLY a valid JSON array matching the structure of the input, with the translated fields.
DO NOT wrap the response in markdown code blocks, just return the raw JSON array starting with [ and ending with ].

Input JSON:
${JSON.stringify(batch, null, 2)}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 }
    })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'API Error');
  
  let resultText = data.candidates[0].content.parts[0].text.trim();
  if (resultText.startsWith('```json')) resultText = resultText.substring(7);
  if (resultText.startsWith('```')) resultText = resultText.substring(3);
  if (resultText.endsWith('```')) resultText = resultText.substring(0, resultText.length - 3);
  
  return JSON.parse(resultText.trim());
}

async function run() {
  console.log('Starting translation of brains...');
  const agencyBrains = brains.filter(b => b.id.startsWith('agency_'));
  const otherBrains = brains.filter(b => !b.id.startsWith('agency_'));
  
  const translatedAgencyBrains = [];
  const batchSize = 30; // Increased batch size for speed
  
  for (let i = 0; i < agencyBrains.length; i += batchSize) {
    const batch = agencyBrains.slice(i, i + batchSize);
    console.log(`Translating batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(agencyBrains.length/batchSize)}...`);
    try {
      const payloadBatch = batch.map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        description: b.description,
        modules: b.modules
      }));
      
      const translatedPayload = await translateBatch(payloadBatch);
      
      for (const translated of translatedPayload) {
        const original = batch.find(b => b.id === translated.id);
        if (original) {
          translatedAgencyBrains.push({
            ...original,
            name: translated.name || original.name,
            category: translated.category || original.category,
            description: translated.description || original.description,
            modules: translated.modules || original.modules
          });
        }
      }
    } catch (e) {
      console.error(`Error translating batch ${Math.floor(i/batchSize) + 1}:`, e.message);
      // Fallback to original if translation fails
      translatedAgencyBrains.push(...batch);
    }
  }
  
  const finalBrains = [...otherBrains, ...translatedAgencyBrains];
  fs.writeFileSync(brainsPath, JSON.stringify(finalBrains, null, 2));
  console.log('Translation complete! Saved to brains.json.');
}

run();
