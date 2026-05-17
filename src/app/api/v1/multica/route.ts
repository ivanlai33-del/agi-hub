import { NextResponse } from 'next/server';

// 記憶體內的簡易 Task 儲存庫，解決 CompanyKanban 404 報錯
let tasks: any[] = [
  {
    id: 'task-1',
    title: '不動產大數據視覺卡片整合',
    description: '完成 RealEstateCard 漸層與 Bento Grid 設計',
    status: 'completed',
    priority: 'high',
    assignee: 'AGI 導航中心',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Scrapling MCP 爬蟲防固與脫敏',
    description: '實施 SSRF 攔截盾與 Browser Context 隔離',
    status: 'completed',
    priority: 'high',
    assignee: 'Security Architect',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'PureChat 聊天室 Generative UI 攔截',
    description: '實時解析 LLM 輸出 JSON 並原地展開奢華卡片',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Frontend Expert',
    created_at: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  try {
    const newTask = await request.json();
    const task = {
      id: newTask.id || `task-${Date.now()}`,
      title: newTask.title || '未命名任務',
      description: newTask.description || '',
      status: newTask.status || 'todo',
      priority: newTask.priority || 'medium',
      assignee: newTask.assignee || 'AGI 導航中心',
      created_at: new Date().toISOString(),
    };
    tasks = [task, ...tasks];
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
