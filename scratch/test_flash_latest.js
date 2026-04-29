const apiKey = "AIzaSyAPXzwIYaZjcSBytDw8a0VkyNovv0be38E";
const model = "gemini-flash-latest";

async function test() {
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
      console.log(`✅ ${model} works! Result:`, data.candidates[0].content.parts[0].text);
    } else {
      console.log(`❌ ${model} failed:`, JSON.stringify(data.error || data));
    }
  } catch (e) {
    console.log(`❌ ${model} error:`, e.message);
  }
}

test();
