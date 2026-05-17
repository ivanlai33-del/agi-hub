'use client';

import React, { useEffect, useState } from 'react';
import { RealEstateCard, RealEstateSummaryData } from '@/components/agi-hub/RealEstateCard';
import { Building2, RefreshCw, Search } from 'lucide-react';

export default function LvrDemoPage() {
  const [city, setCity] = useState<string>('台北市');
  const [district, setDistrict] = useState<string>('');
  const [data, setData] = useState<RealEstateSummaryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLvrData = async (selectedCity: string, selectedDistrict: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/v1/lvr?mode=summary&city=${encodeURIComponent(selectedCity)}`;
      if (selectedDistrict) {
        url += `&district=${encodeURIComponent(selectedDistrict)}`;
      }
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || '無法取得實價登錄資料');
      }

      setData(json.data || []);
    } catch (err: any) {
      console.error('Fetch LVR error:', err);
      setError(err.message || '連線失敗');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLvrData(city, district);
  }, [city, district]);

  // 模擬 AI 戰略家動態計算出來的投資短評
  const getMockAiAnalysis = () => {
    if (city === '台北市') {
      return {
        rating: 'A' as const,
        trend: 'up' as const,
        summary: '台北市核心蛋黃區抗跌屬性極強，2026Q1 均價呈現微幅上漲趨勢。雖然整體租金投報率偏低（約 1.8%~2.2%），但資本利得潛力與保值度位居全台之冠。',
        tags: ['抗跌保值', '蛋黃區', '高資本門檻', '都更潛力'],
        recommendation: '建議鎖定中古電梯大樓或具備都更題材的低樓層公寓。若有強烈置產需求，可關注南港、北士科等具備產業聚落支撐之板塊，避開無捷運接駁之山坡地帶。',
      };
    }
    return {
      rating: 'B' as const,
      trend: 'stable' as const,
      summary: `${city}不動產市場目前處於盤整階段，自住剛性需求為市場主力支撐。`,
      tags: ['剛性自住', '穩健盤整'],
      recommendation: '建議多方比價實價登錄歷史行情，優先選擇生活機能成熟且學區完整之商圈，避免追高預售屋開價。',
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 頂部 Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-3">
              <Building2 className="w-3.5 h-3.5" /> AGI Navigation Hub · 智慧地產大腦
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              全國實價登錄 × AI 戰略情報展示
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              結合政府 OGDL 開放資料庫與大腦 Persona 即時洞察，為您生成高階不動產戰略情報卡片
            </p>
          </div>

          {/* 縣市與行政區切換工具列 */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/50">
              <Search className="w-4 h-4 text-slate-400" />
              <select 
                value={city} 
                onChange={(e) => { setCity(e.target.value); setDistrict(''); }}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="台北市" className="bg-slate-900 text-white">台北市</option>
                <option value="新北市" className="bg-slate-900 text-white">新北市</option>
                <option value="桃園市" className="bg-slate-900 text-white">桃園市</option>
                <option value="台中市" className="bg-slate-900 text-white">台中市</option>
              </select>
            </div>

            {city === '台北市' && (
              <select 
                value={district} 
                onChange={(e) => setDistrict(e.target.value)}
                className="bg-slate-800/80 text-sm font-bold text-white px-3 py-2 rounded-xl border border-slate-700/50 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-white">全區平均</option>
                <option value="南港區" className="bg-slate-900 text-white">南港區</option>
                <option value="大安區" className="bg-slate-900 text-white">大安區</option>
                <option value="信義區" className="bg-slate-900 text-white">信義區</option>
                <option value="中山區" className="bg-slate-900 text-white">中山區</option>
              </select>
            )}

            <button 
              onClick={() => fetchLvrData(city, district)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50"
              title="重新載入資料"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold flex items-center gap-2 animate-shake">
            ⚠️ 資料載入失敗: {error}
          </div>
        )}

        {/* 實價登錄 Generative UI 卡片展示區 */}
        <RealEstateCard 
          data={data}
          title={`${city}${district ? ` ${district}` : ''} 不動產市場情報大腦`}
          subtitle="內政部實價登錄 OGDL 歷史大數據 × 即時市場感知"
          aiAnalysis={getMockAiAnalysis()}
          isLoading={isLoading}
        />

        {/* 底部說明 */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <p className="font-bold text-slate-300">💡 職人大腦模組整合說明 (Real Estate Analyst Brain Integration)</p>
          <p>當您在 AGI Navigation Hub 與「全台不動產戰略家」對話時，大腦會自動調用後端 MCP 服務分析您的需求，並輸出結構化 JSON 觸發此 Generative UI 卡片。</p>
          <p>本組件支援根據不同行政區與建物型態（住宅大樓、公寓、套房等）進行切換與比對，確保提供顧問級別的精準視覺化報告。</p>
        </div>
      </div>
    </div>
  );
}
