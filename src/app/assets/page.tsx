'use client';

import React from 'react';
import { 
  Globe, Shield, Zap, ArrowLeft, RefreshCw, Plus, 
  ExternalLink, Brain, Activity 
} from 'lucide-react';
import Link from 'next/link';

export default function AssetsPage() {
  const assets = [
    {
      id: 'site_estimator_pro',
      name: '捷報 Estimator Pro',
      type: 'Web Runtime',
      status: 'Online',
      brain: 'Senior PM v1.2',
      risk: 'L1 Safe',
      latency: '45ms',
      lastSeen: '2分鐘前'
    },
    {
      id: 'line_bot_shop_a',
      name: 'LINE 智能店長 (Shop A)',
      type: 'LINE Bot',
      status: 'Online',
      brain: 'Retail Master v1.0',
      risk: 'L2 Guard',
      latency: '120ms',
      lastSeen: '15秒前'
    }
  ];

  return (
    <div className="min-h-screen bg-transparent p-8 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-sm">
          <ArrowLeft size={16} /> 返回對話空間
        </Link>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button text-slate-300 text-xs font-bold">
            <RefreshCw size={14} /> 重新整理
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/80 backdrop-blur-md text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
            <Plus size={14} /> 接入新資產
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
            <Globe size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic">Asset Inventory</h1>
            <p className="text-slate-500 text-sm font-medium">管理所有連線至此大腦中心的外部應用實體</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: '總連線資產', value: '14', icon: Globe, color: 'text-blue-400' },
            { label: '活躍腦袋', value: '6', icon: Brain, color: 'text-emerald-400' },
            { label: '平均延遲', tone: 'Low', value: '82ms', icon: Zap, color: 'text-amber-400' },
            { label: '安全狀態', tone: 'Active', value: 'Risk Guard', icon: Shield, color: 'text-cyan-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-[2rem] space-y-2 border-white/5">
              <div className="flex justify-between items-start">
                <stat.icon size={20} className={stat.color} />
                {stat.tone && <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{stat.tone}</span>}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-6">資產名稱 / ID</th>
                <th className="px-8 py-6">類型</th>
                <th className="px-8 py-6">狀態</th>
                <th className="px-8 py-6">掛載腦袋</th>
                <th className="px-8 py-6">延遲</th>
                <th className="px-8 py-6">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {assets.map((asset) => (
                <tr key={asset.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-slate-100 font-bold text-sm">{asset.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{asset.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs text-slate-400 font-medium">{asset.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest">{asset.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Brain size={14} className="text-cyan-400" />
                      <span className="text-xs font-bold">{asset.brain}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-mono text-slate-500">
                    {asset.latency}
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-2 text-slate-600 hover:text-white transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
