'use client';

import React from 'react';
import { PersonaCard } from '@/components/agi-hub/PersonaCard';
import { 
  Cpu, Database, ShieldCheck, TrendingUp, Palette, Store, 
  Search, Sparkles, Brain, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function RegistryPage() {
  const [activeTab, setActiveTab] = React.useState('ALL');

  const categories = [
    { id: 'ALL', label: '全部大腦' },
    { id: 'MANAGEMENT', label: '經營管理' },
    { id: 'ENGINEERING', label: '技術開發' },
    { id: 'DESIGN', label: '創意設計' },
    { id: 'MARKETING', label: '市場行銷' },
    { id: 'LEGAL/FINANCE', label: '法律財務' },
  ];

  const personas = [
    // --- MANAGEMENT ---
    {
      persona_id: 'ceo_strategist',
      name: '執行長策略師 (CEO Strategist)',
      division: 'MANAGEMENT',
      mission: '提供高層決策支援，優化公司整體治理與戰略方向。',
      icon: ShieldCheck,
      color: 'emerald',
    },
    {
      persona_id: 'pm_expert',
      name: '資深專案經理 (Senior PM)',
      division: 'MANAGEMENT',
      mission: '掌控專案時程、資源分配與跨部門溝通，確保準時交付。',
      icon: Store,
      color: 'blue',
    },
    // --- ENGINEERING ---
    {
      persona_id: 'frontend_wizard_v1',
      name: '前端巫師 (Frontend Wizard)',
      division: 'ENGINEERING',
      mission: '打造極致流暢、美觀且具備無障礙設計的 Web 介面。',
      icon: Cpu,
      color: 'emerald',
    },
    {
      persona_id: 'backend_architect_v1',
      name: '後端架構師 (Backend Architect)',
      division: 'ENGINEERING',
      mission: '設計可高度擴展、安全且具備高可用性的 API 與資料結構。',
      icon: Database,
      color: 'blue',
    },
    {
      persona_id: 'devops_engineer',
      name: '雲端運維專家 (DevOps)',
      division: 'ENGINEERING',
      mission: '優化 CI/CD 流程，確保雲端基礎架構的穩定與擴充性。',
      icon: Database,
      color: 'violet',
    },
    {
      persona_id: 'ai_ml_expert',
      name: 'AI/ML 科學家',
      division: 'ENGINEERING',
      mission: '開發自定義訓練模型，將 AI 深度整合至業務流程中。',
      icon: Brain,
      color: 'pink',
    },
    // --- MARKETING ---
    {
      persona_id: 'growth_hacker_v1',
      name: '成長駭客 (Growth Hacker)',
      division: 'MARKETING',
      mission: '用最低成本換取最高用戶獲取與留存。',
      icon: TrendingUp,
      color: 'violet',
    },
    {
      persona_id: 'seo_specialist',
      name: 'SEO 搜尋優化師',
      division: 'MARKETING',
      mission: '提升自然搜尋排名，打造可持續增長的流量池。',
      icon: Search,
      color: 'emerald',
    },
    {
      persona_id: 'ads_optimizer',
      name: '廣告投放專家',
      division: 'MARKETING',
      mission: '優化 FB/Google 廣告投報率 (ROAS)，精準鎖定受眾。',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      persona_id: 'content_strategist',
      name: '內容行銷專家',
      division: 'MARKETING',
      mission: '產出具備品牌穿透力的內容，提升用戶黏度與信任。',
      icon: Sparkles,
      color: 'pink',
    },
    // --- DESIGN ---
    {
      persona_id: 'ui_designer_v1',
      name: 'UI 設計大師 (UI Designer)',
      division: 'DESIGN',
      mission: '將複雜的邏輯轉化為直覺且令人愉悅的視覺體驗。',
      icon: Palette,
      color: 'pink',
    },
    {
      persona_id: 'ux_researcher',
      name: 'UX 使用者研究員',
      division: 'DESIGN',
      mission: '透過數據與訪談，挖掘用戶深層需求，優化產品易用性。',
      icon: Search,
      color: 'blue',
    },
    {
      persona_id: 'brand_architect_v1',
      name: '品牌架構師 (Brand Architect)',
      division: 'DESIGN',
      mission: '定義品牌基因，確保視覺與溝通語言的一致性。',
      icon: Palette,
      color: 'pink',
    },
    // --- LEGAL/FINANCE ---
    {
      persona_id: 'legal_advisor_pro',
      name: '法務合規官 (Legal Compliance)',
      division: 'LEGAL/FINANCE',
      mission: '審核契約風險，確保專案執行符合勞動與商業法規。',
      icon: ShieldCheck,
      color: 'amber',
    },
    {
      persona_id: 'tax_strategist_v1',
      name: '稅務策劃師 (Tax Strategist)',
      division: 'LEGAL/FINANCE',
      mission: '優化專案金流與稅務結構，提供精準的節稅建議。',
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      persona_id: 'accountant_ai',
      name: '智能會計 (Accountant)',
      division: 'LEGAL/FINANCE',
      mission: '自動化財務報表分析，監控專案毛利與現金流健康。',
      icon: Database,
      color: 'blue',
    },
    // --- STRATEGY ---
    {
      persona_id: 'reality_checker_pro',
      name: '現實檢查員 (Reality Checker)',
      division: 'MANAGEMENT',
      mission: '對計畫進行極限壓力測試，找出邏輯漏洞與執行風險。',
      icon: ShieldCheck,
      color: 'amber',
    },
  ];

  const filteredPersonas = personas.filter(p => 
    activeTab === 'ALL' || p.division.includes(activeTab)
  );

  return (
    <div className="min-h-screen bg-transparent p-8 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-sm">
          <ArrowLeft size={16} /> 返回對話空間
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold">
          <Brain size={14} className="text-emerald-500" /> Standalone Mode Active
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden glass-card rounded-[3rem] p-16 border-white/5 shadow-2xl shadow-emerald-950/20">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Brain size={400} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} /> Intelligence Registry
          </div>
          <h1 className="text-6xl font-black text-white leading-tight">
            AGI <span className="text-emerald-400">職人大腦智庫</span>
          </h1>
          <p className="text-slate-400 text-xl leading-relaxed">
            這裡是全球 AI 職人的邏輯集散地。依照專業部門分類，
            您可以精準調度不同領域的大腦，為業務提供頂級導航。
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === cat.id 
                  ? 'bg-emerald-600/80 text-white shadow-lg shadow-emerald-900/40 backdrop-blur-md' 
                  : 'glass-button text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="搜尋職人..." 
              className="w-full glass-input rounded-2xl pl-12 py-4 text-slate-200 focus:ring-0 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredPersonas.map((persona) => (
            <PersonaCard key={persona.persona_id} persona={persona} />
          ))}
        </div>
      </div>
    </div>
  );
}
