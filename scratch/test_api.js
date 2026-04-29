const apiKey = "AIzaSyAPXzwIYaZjcSBytDw8a0VkyNovv0be38E";
const models = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-pro"];

async function test() {
  for (const model of models) {
    console.log(`Testing model: ${model}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello" }] }]
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ ${model} works!`);
      } else {
        console.log(`❌ ${model} failed:`, JSON.stringify(data.error || data));
      }
    } catch (e) {
      console.log(`❌ ${model} error:`, e.message);
    }
  }
}

test();
