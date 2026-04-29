const apiKey = "AIzaSyAPXzwIYaZjcSBytDw8a0VkyNovv0be38E";

async function list() {
  const versions = ["v1", "v1beta"];
  for (const v of versions) {
    console.log(`Checking version: ${v}...`);
    const url = `https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ ${v} models:`, data.models.map(m => m.name).join(', '));
      } else {
        console.log(`❌ ${v} failed:`, JSON.stringify(data));
      }
    } catch (e) {
      console.log(`❌ ${v} error:`, e.message);
    }
  }
}

list();
