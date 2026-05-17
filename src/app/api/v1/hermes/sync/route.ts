import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge/skills');
const MULTICA_API = 'http://localhost:8080/api/v1';

export async function POST() {
  try {
    // 1. Fetch completed issues from Multica
    // For this prototype, we simulate fetching from Multica API
    // In a real scenario, we'd use a Personal Access Token
    const res = await fetch(`${MULTICA_API}/issues?status=done`, {
      headers: { 'X-Workspace-ID': 'agi-hub' } 
    }).catch(() => null);
    
    let issues = [];
    if (res && res.ok) {
      const data = await res.json();
      issues = data.issues || [];
    } else {
      // Fallback to local cache
      const TASKS_FILE = path.join(process.cwd(), 'src/data/multica_tasks.json');
      if (fs.existsSync(TASKS_FILE)) {
        const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
        issues = data.filter((t: any) => t.status === 'done');
      }
    }
    
    let syncedCount = 0;

    for (const issue of issues) {
      const skillFileName = `MUL-${issue.number}-${issue.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      const filePath = path.join(KNOWLEDGE_DIR, skillFileName);
      
      if (!fs.existsSync(filePath)) {
        const content = `---
type: IMPLEMENTATION_SKILL
agent: ${issue.assignee_id || 'AI_ENGINEER'}
task_id: MUL-${issue.number}
date: ${new Date().toISOString().split('T')[0]}
tags: [multica, auto_sync]
---

# ${issue.title}

## 任務描述
${issue.description || '無描述'}

## 執行結果
> 此內容由 Multica 生產引擎自動同步。

${issue.result || '待補充詳細執行日誌'}

## 知識複利點
- 自動化同步於 ${new Date().toLocaleString()}
- [ ] 需要顧問職人審核代碼質量
`;
        fs.writeFileSync(filePath, content);
        syncedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      synced_count: syncedCount,
      message: `已同步 ${syncedCount} 筆新技能記錄到本地知識庫。`
    });

  } catch (error: any) {
    console.error('Hermes Sync Error:', error);
    return NextResponse.json({ error: 'Sync failed: ' + error.message }, { status: 500 });
  }
}
