# AGI Navigation Hub (Artisan Edition)

Professional-grade AI Command Center & Production Engine.

## 核心架構
- **AGI Hub**: 基於 Next.js 的指揮中心，整合多個 AI 職人大腦 (Brains)。
- **Multica Engine**: 本地部署的生產引擎，負責自動化任務執行。
- **Hermes Protocol**: 自我進化協議，實現技能累積與複利。

## 快速啟動

### 1. 啟動 AGI Hub
```bash
npm run dev
```
造訪 `http://localhost:3000`

### 2. 啟動 Multica 生產引擎
後端 (Go): `external/multica/server/multica-server` (運行於 8080)
前端 (Next.js): `cd external/multica && pnpm dev:web` (運行於 3001)

### 3. 指揮中心
- 點擊 AGI Hub 介面右上角的 **[Kanban]** 圖示開啟生產看板。
- 在對話中發送 `CREATE_TASK: [標題] | [描述]` 可自動派發任務。

## 🧪 生產與進化流程
1.  **開啟看板**：點擊右上角 **[Kanban]**。
2.  **派發任務**：在對話中提及 `CREATE_TASK:` 觸發。
3.  **技能沉澱**：當任務狀態變更為 `done` 後，點擊看板上的 **[Hermes Sync]** 按鈕。
4.  **知識庫同步**：系統會自動將執行結果轉化為 Markdown 格式，存入 `knowledge/skills` 目錄，您可以將此目錄掛載到 **Obsidian** 實現企業知識複利。

## 目錄結構
- `/src`: AGI Hub 原始碼。
- `/external/multica`: Multica 生產引擎原始碼。
- `/knowledge`: 職人技能與治理日誌 (Obsidian 友好)。
- `/knowledge/skills`: 自動同步的實作技能 (Implementation Skills)。

---
Developed by Antigravity for AGI Enterprise.
