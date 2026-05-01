'use client';

import React, { useState, useEffect } from 'react';
import { Brain, ArrowLeft, Plus, Settings, Shield, Zap, ChevronRight, Save, Globe, Users, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface BrainConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  instructions: string;
  modules: string[];
}

export default function RegistryPage() {
  const [brains, setBrains] = useState<BrainConfig[]>([]);
  const [selectedBrain, setSelectedBrain] = useState<BrainConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentUser, setCurrentUser] = useState<{userId: string, role: string} | null>(null);

  useEffect(() => {
    fetch('/api/v1/brains')
      .then(res => res.json())
      .then(data => {
        setBrains(data);
        if (data.length > 0) setSelectedBrain(data[0]);
      });

    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setCurrentUser({ userId: data.userId, role: data.role });
        }
      });
  }, []);



  const handleSave = async () => {
    if (!selectedBrain) return;
    const res = await fetch('/api/v1/brains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedBrain),
    });
    if (res.ok) {
      toast.success('大腦配置已同步');
      setIsEditing(false);
      // Refresh list to ensure consistency
      const updatedRes = await fetch('/api/v1/brains');
      const updatedData = await updatedRes.json();
      setBrains(updatedData);
    }
  };

  const handleCreateBrain = () => {
    const newBrain: BrainConfig = {
      id: `new_brain_${Date.now()}`,
      name: '未命名職人大腦',
      category: 'NEW_CATEGORY',
      description: '請描述此大腦的專業領域...',
      instructions: '請輸入此大腦的人格核心指令...',
      modules: ['新功能積木']
    };
    setBrains([newBrain, ...brains]);
    setSelectedBrain(newBrain);
    setIsEditing(true);
    toast.info('已建立新大腦模板，請開始配置');
  };

  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Shield size={64} className="text-amber-500 opacity-50" />
        <h2 className="text-3xl font-black text-white">無權限存取智庫</h2>
        <p className="text-slate-400 max-w-md">
          您的帳號權限僅限於與首頁 AGI 進行對話。智庫配置與管理功能僅對管理員開放。
        </p>
        <Link href="/" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-all">
          返回導航首頁
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-8 sm:p-12 relative z-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex items-center justify-between w-full">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white">智庫管理中心</h1>
            <p className="text-emerald-500/60 font-bold uppercase tracking-[0.4em] text-xs">AGI Registry Management</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black tracking-widest transition-all border border-white/10 flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              返回導航首頁
            </button>
          </div>
        </div>
      </div>

      {/* Fixed-height Grid for Independent Scrolling */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 h-[calc(100vh-240px)]">
        {/* Left: Brain List (Independent Scroll) */}
        <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-2">可用大腦母版庫</div>
          
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-2 flex-shrink-0">
            {['All', ...Array.from(new Set(brains.map(b => b.category)))].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${
                  activeCategory === cat 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                {cat === 'All' ? '全部領域' : cat}
              </button>
            ))}
          </div>

          <div className="space-y-3 overflow-y-auto pb-10 scrollbar-hide flex-1 pr-2">
            {(activeCategory === 'All' ? brains : brains.filter(b => b.category === activeCategory)).map(brain => {
              const isMaster = brain.id.startsWith('agency_');
              return (
            <div
              key={brain.id}
              onClick={() => {
                setSelectedBrain(brain);
                setIsEditing(false);
              }}
              className={`cursor-pointer w-full text-left p-4 rounded-[1.5rem] border transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden ${
                selectedBrain?.id === brain.id 
                ? 'bg-emerald-600/10 border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-emerald-500/10' 
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-white/5'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${selectedBrain?.id === brain.id ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white transition-colors'}`}>
                  <Brain size={16} />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 truncate">{brain.category}</span>
                  {isMaster && (
                    <span className="px-1.5 py-0.5 bg-slate-800/80 text-emerald-500/80 rounded text-[8px] font-bold tracking-widest border border-emerald-500/20 whitespace-nowrap">
                      母版
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">{brain.name}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">{brain.description}</p>
              
                <div className="flex items-center gap-2 mt-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      localStorage.setItem('active_brain', JSON.stringify(brain));
                      toast.success(`已調度 ${brain.name}`);
                      setTimeout(() => window.location.href = '/', 500);
                    }}
                    className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all border border-emerald-500/20"
                    title="立即調度"
                  >
                    <Zap size={14} />
                  </button>
                  {selectedBrain?.id === brain.id && (
                    <div className="text-emerald-500 ml-auto">
                      <ChevronRight size={18} />
                    </div>
                  )}
                </div>
            </div>
            )})}
          </div>
        </div>

        {/* Right: Module Config (Independent Scroll) */}
        <div className="lg:col-span-8 overflow-y-auto scrollbar-hide pr-2">
          {selectedBrain ? (
            <div className="glass-card rounded-[3.5rem] border border-white/5 p-12 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 ease-out bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-black tracking-tight text-white">{selectedBrain.name}</h2>
                    {selectedBrain.id.startsWith('agency_') && (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-bold tracking-widest">
                        官方母版
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-500/60 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">母版配置 V1.0</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      localStorage.setItem('active_brain', JSON.stringify(selectedBrain));
                      toast.success(`已成功調度 ${selectedBrain.name}`);
                      setTimeout(() => window.location.href = '/', 800);
                    }}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black tracking-widest transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2"
                  >
                    <Zap size={16} />
                    立即調度此職人
                  </button>
                  <button 
                    onClick={() => {
                      if (isEditing) {
                        handleSave();
                      } else {
                        if (selectedBrain.id.startsWith('agency_')) {
                          // Clone logic
                          const newBrain = { ...selectedBrain, id: `custom_${Date.now()}`, name: `${selectedBrain.name} (客製版)` };
                          setBrains([newBrain, ...brains]);
                          setSelectedBrain(newBrain);
                          setIsEditing(true);
                          toast.success('已複製母版，您可以開始客製化了');
                        } else {
                          setIsEditing(true);
                        }
                      }
                    }}
                    className={`px-8 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 border ${
                      isEditing ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                    }`}
                  >
                    {isEditing ? <Save size={16} /> : (selectedBrain.id.startsWith('agency_') ? <Plus size={16} /> : <Settings size={16} />)}
                    {isEditing ? '儲存配置' : (selectedBrain.id.startsWith('agency_') ? '複製為客製版本' : '修改模組')}
                  </button>
                </div>
              </div>

              {/* Instructions Block */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Shield size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">人格核心積木 (Personality Core)</span>
                </div>
                {isEditing ? (
                  <textarea 
                    value={selectedBrain.instructions}
                    onChange={(e) => setSelectedBrain({...selectedBrain, instructions: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-8 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/30 min-h-[180px] leading-relaxed"
                  />
                ) : (
                  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-sm text-slate-400 italic leading-relaxed shadow-inner">
                    "{selectedBrain.instructions}"
                  </div>
                )}
              </div>

              {/* Navigation Thinking Flow Block */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe size={16} className="text-cyan-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">6 段思考導航流 (Thinking Flow)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {['理解', '辨識', '決策', '執行', '紀錄', '自動化'].map((step, i) => (
                    <div key={i} className="flex flex-col items-center p-4 bg-white/5 border border-white/5 rounded-2xl text-center group hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 ease-out">
                      <span className="text-[9px] text-slate-500 font-black mb-2 opacity-50">STEP {i+1}</span>
                      <span className="text-xs font-black text-emerald-400">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Functional Modules Block */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Zap size={16} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">思考導航積木 (Navigation Blocks)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedBrain.modules.map((mod, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] group hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 ease-out">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-slate-300 group-hover:text-white transition-colors">{mod}</span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">啟用積木</span>
                      </div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                    </div>
                  ))}
                  {isEditing && (
                    <button className="flex items-center justify-center p-6 bg-emerald-500/5 border border-emerald-500/10 border-dashed rounded-[2rem] text-emerald-500 hover:bg-emerald-500/10 transition-all">
                      <Plus size={24} />
                    </button>
                  )}
                </div>
              </div>

              {/* Data Security Info */}
              <div className="p-8 bg-emerald-500/[0.01] border border-white/5 rounded-[3rem] flex items-center justify-between group hover:bg-emerald-500/[0.03] transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h4 className="text-md font-black text-slate-200">數據安全隔離保護中</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Advanced Edge Isolation v2.4 Active</p>
                  </div>
                </div>
                <div className="px-6 py-2 bg-slate-900 border border-white/10 rounded-full text-[10px] font-black tracking-widest text-emerald-400">
                  SECURE
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] text-slate-700 bg-white/[0.01]">
              <Brain size={64} className="mb-6 opacity-20" />
              <p className="text-xs font-black uppercase tracking-[0.4em] italic">請從左側大腦智庫選擇目標進行內容調閱</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
