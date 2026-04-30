const fs = require('fs');
const path = require('path');

const repoPath = '/tmp/agency-agents';
const targetJsonPath = path.join(__dirname, '../src/data/brains.json');

// Read existing brains to avoid overwriting them completely, or just append.
let existingBrains = [];
if (fs.existsSync(targetJsonPath)) {
  existingBrains = JSON.parse(fs.readFileSync(targetJsonPath, 'utf8'));
}

// Helper to parse markdown
function parseAgentFile(filePath, categoryFolder) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  let name = path.basename(filePath, '.md').replace(/-/g, ' ');
  let description = 'Agency agent imported from github.';
  let emoji = '🧠';

  if (match) {
    const frontmatter = match[1];
    const nameMatch = frontmatter.match(/name:\s*(.+)/);
    if (nameMatch) name = nameMatch[1].trim();
    
    const descMatch = frontmatter.match(/description:\s*(.+)/);
    if (descMatch) description = descMatch[1].trim();
    
    const emojiMatch = frontmatter.match(/emoji:\s*(.+)/);
    if (emojiMatch) emoji = emojiMatch[1].trim();
  }

  // Extract instructions (everything after frontmatter)
  const instructions = content.replace(/^---\n[\s\S]*?\n---/, '').trim();

  // Extract headings as modules
  const modules = [];
  const headingRegex = /^##\s+(.+)$/gm;
  let headingMatch;
  while ((headingMatch = headingRegex.exec(instructions)) !== null) {
    modules.push(headingMatch[1].replace(/^[^\w\s]+/, '').trim()); // Remove emoji from start
  }

  return {
    id: `agency_${path.basename(filePath, '.md')}`,
    name: `${emoji} ${name}`,
    category: categoryFolder.toUpperCase(),
    description: description,
    instructions: instructions, // Truncate to save tokens, or keep full
    modules: modules.length > 0 ? modules.slice(0, 5) : ["Core Logic", "Analysis"],
    tier: "pro"
  };
}

// Walk directories
const newBrains = [];
const dirs = fs.readdirSync(repoPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));

for (const dir of dirs) {
  const dirPath = path.join(repoPath, dir.name);
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const brain = parseAgentFile(filePath, dir.name);
      newBrains.push(brain);
    } catch (e) {
      console.error(`Error parsing ${filePath}`, e);
    }
  }
}

// Keep existing non-agency brains, replace/append agency brains
const nonAgencyBrains = existingBrains.filter(b => !b.id.startsWith('agency_'));

// To prevent making the json excessively huge and hitting context limits for the frontend,
// Let's just import all of them. The user wants them "truly moved in".
const combinedBrains = [...nonAgencyBrains, ...newBrains];

fs.writeFileSync(targetJsonPath, JSON.stringify(combinedBrains, null, 2));
console.log(`Successfully imported ${newBrains.length} agents into brains.json`);
