'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Building2, 
  Calendar, 
  DollarSign, 
  Maximize2, 
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Search
} from 'lucide-react';

export interface RealEstateSummaryData {
  city: string;
  district: string;
  building_type: string;
  season: string;
  deal_count: number;
  avg_unit_ping: number; // 單價元/坪
  median_unit_ping: number;
  avg_total_price: number; // 總價元
  avg_ping: number;
}

export interface RealEstateCardProps {
  data: RealEstateSummaryData[];
  title?: string;
  subtitle?: string;
  aiAnalysis?: {
    rating: 'S' | 'A' | 'B' | 'C';
    trend: 'up' | 'down' | 'stable';
    summary: string;
    tags: string[];
    recommendation: string;
  };
  isLoading?: boolean;
}

export const RealEstateCard: React.FC<RealEstateCardProps> = ({
  data = [],
  title = '不動產市場情報大腦',
  subtitle = '內政部實價登錄 OGDL 歷史大數據 × 即時市場感知',
  aiAnalysis,
  isLoading = false,
}) => {
  const [selectedType, setSelectedType] = useState<string>('全部');

  if (isLoading) {
    return (
      <div className="w-full rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 shadow-2xl animate-pulse">
        <div className="h-8 bg-slate-700/50 rounded-lg w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-700/50 rounded-lg w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800/60 rounded-2xl border border-slate-700/30"></div>
          ))}
        </div>
        <div className="h-48 bg-slate-800/60 rounded-2xl border border-slate-700/30"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 text-center shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 mb-4 text-slate-400">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-sans">尚無不動產行情數據</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          請提供明確的縣市與行政區（例如：台北市南港區），大腦將立即調用政府實價登錄資料庫為您生成深度分析。
        </p>
      </div>
    );
  }

  // 取得不重複的建物型態清單
  const buildingTypes = ['全部', ...Array.from(new Set(data.map(item => item.building_type)))].filter(Boolean);

  // 根據選擇過濾資料
  const filteredData = selectedType === '全部' 
    ? data 
    : data.filter(item => item.building_type === selectedType);

  // 取得最新一季的整體均值（若選擇全部，則加總/平均計算）
  const latestSeason = filteredData[0]?.season || '最新';
  const latestItems = filteredData.filter(item => item.season === latestSeason);
  
  const totalDeals = latestItems.reduce((acc, curr) => acc + curr.deal_count, 0);
  const avgPingPrice = latestItems.length > 0 
    ? Math.round(latestItems.reduce((acc, curr) => acc + curr.avg_unit_ping, 0) / latestItems.length) 
    : 0;
  const avgTotalPrice = latestItems.length > 0 
    ? Math.round(latestItems.reduce((acc, curr) => acc + curr.avg_total_price, 0) / latestItems.length) 
    : 0;
  const avgArea = latestItems.length > 0 
    ? Math.round(latestItems.reduce((acc, curr) => acc + curr.avg_ping, 0) / latestItems.length) 
    : 0;

  // 計算與前一季的漲跌幅
  const seasons = Array.from(new Set(filteredData.map(item => item.season))).sort().reverse();
  const prevSeason = seasons[1];
  const prevItems = filteredData.filter(item => item.season === prevSeason);
  const prevAvgPingPrice = prevItems.length > 0 
    ? Math.round(prevItems.reduce((acc, curr) => acc + curr.avg_unit_ping, 0) / prevItems.length) 
    : avgPingPrice;

  const priceDiffPercent = prevAvgPingPrice > 0 
    ? (((avgPingPrice - prevAvgPingPrice) / prevAvgPingPrice) * 100).toFixed(1) 
    : '0.0';
  const isPriceUp = parseFloat(priceDiffPercent) >= 0;

  // 取得顯示區域代表名稱
  const city = data[0]?.city || '';
  const district = data[0]?.district || '全區';

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-8 font-sans overflow-hidden relative">
      {/* 頂部裝飾背景光暈 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* 頂部 Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-8 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> 政府開放資料授權 (OGDL)
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" /> AI 職人情報感知
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" /> {city} {district} · {subtitle}
          </p>
        </div>

        {/* 建物型態篩選 Tab */}
        <div className="mt-4 md:mt-0 flex flex-wrap gap-1.5 p-1 bg-slate-800/60 rounded-xl border border-slate-700/50 backdrop-blur-md">
          {buildingTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                selectedType === type
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 核心指標 Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8 relative z-10">
        {/* 指標卡 1: 當季每坪均價 */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> 當季每坪均價
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {latestSeason}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {(avgPingPrice / 10000).toFixed(1)}
            </span>
            <span className="text-slate-400 text-sm font-semibold">萬/坪</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded ${
              isPriceUp ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {isPriceUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {priceDiffPercent}%
            </span>
            <span className="text-slate-500 font-medium">較上一季</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300" />
        </div>

        {/* 指標卡 2: 單季成交規模 */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" /> 成交物件總數
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              樣本數
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {totalDeals}
            </span>
            <span className="text-slate-400 text-sm font-semibold">筆/棟</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500" /> 涵蓋實價登錄買賣明細
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all duration-300" />
        </div>

        {/* 指標卡 3: 平均總價行情 */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-400" /> 平均總價行情
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {latestSeason}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {(avgTotalPrice / 10000).toFixed(0)}
            </span>
            <span className="text-slate-400 text-sm font-semibold">萬</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-slate-500" /> 依據登記總價平均換算
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />
        </div>

        {/* 指標卡 4: 平均移轉坪數 */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-amber-400" /> 平均移轉坪數
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              含公設
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {avgArea}
            </span>
            <span className="text-slate-400 text-sm font-semibold">坪</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" /> 1 坪 = 3.3058 平方公尺
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all duration-300" />
        </div>
      </div>

      {/* 核心主體結構：左側走勢表 / 右側 AI 分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* 左側：近 8 季價格走勢表 (佔 2 欄) */}
        <div className="lg:col-span-2 bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-slate-700/40 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> 近期季度價格趨勢明細
              </h3>
              <span className="text-xs font-medium text-slate-400">單位：萬元 / 坪</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-700/50 text-xs font-bold text-slate-400 uppercase bg-slate-800/50">
                    <th className="py-3 px-4 rounded-l-lg">季度</th>
                    <th className="py-3 px-4">建物型態</th>
                    <th className="py-3 px-4">成交筆數</th>
                    <th className="py-3 px-4">每坪均價</th>
                    <th className="py-3 px-4">平均總價</th>
                    <th className="py-3 px-4 rounded-r-lg">均坪數</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30 font-medium">
                  {filteredData.slice(0, 6).map((item, idx) => (
                    <tr key={`${item.season}-${item.building_type}-${idx}`} className="hover:bg-slate-700/30 transition-colors duration-150">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        {item.season}
                        {idx === 0 && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded border border-emerald-500/30 font-bold">最新</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{item.building_type}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">{item.deal_count} 筆</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{(item.avg_unit_ping / 10000).toFixed(1)} 萬</td>
                      <td className="py-3.5 px-4 text-slate-300">{(item.avg_total_price / 10000).toFixed(0)} 萬</td>
                      <td className="py-3.5 px-4 text-slate-400">{Math.round(item.avg_ping)} 坪</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
            <span>資料來源：內政部實價登錄開放資料庫</span>
            <span>更新週期：每季自動同步</span>
          </div>
        </div>

        {/* 右側：AI 戰略大腦短評 (佔 1 欄) */}
        <div className="bg-gradient-to-br from-slate-800/70 via-slate-900/70 to-slate-950/70 rounded-2xl border border-emerald-500/30 p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
          
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-slate-700/40 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" /> AI 戰略家洞察評估
              </h3>
              {aiAnalysis?.rating && (
                <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md">
                  評級 {aiAnalysis.rating}
                </span>
              )}
            </div>

            {aiAnalysis ? (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">市場判定總結</h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    {aiAnalysis.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">智慧戰略標籤</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">大腦投資行動建議</h4>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 text-slate-200 text-sm leading-relaxed">
                    {aiAnalysis.recommendation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-spin" style={{ animationDuration: '6s' }} />
                <h4 className="text-base font-bold text-slate-300 mb-2">大腦情報分析中...</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  正在結合實價登錄歷史大數據與即時市場掃描情報，計算區域溢價率與租金投報率。
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> AGI 職人模組驗證
            </span>
            <span className="text-emerald-400 font-bold">RealEstate Analyst v1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
