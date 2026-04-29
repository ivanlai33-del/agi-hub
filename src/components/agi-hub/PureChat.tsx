'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Brain, Shield, Menu, X, ArrowRight, LayoutGrid, Globe, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'agi';
  content: string;
  timestamp: string;
  blocks?: string[];
}

export const PureChat: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agi',
      content: '您好，這裡是獨立的 AGI 思考導航中心。我已準備好跨專案調度職人大腦。請問您今天想處理哪個領域的決策？',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'message_received',
          payload: { text: input },
          asset_id: 'hub_standalone_v1',
          tenant_id: 'internal_admin'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Unknown Error');
      }

      const agiMsg: Message = {
        role: 'agi',
        content: data.content,
        timestamp: new Date().toLocaleTimeString(),
        blocks: data.suggested_blocks,
      };

      setMessages((prev) => [...prev, agiMsg]);
    } catch (error: any) {
      console.error('Hub Link Broken', error);
      const errorMsg: Message = {
        role: 'agi',
        content: `⚠️ 系統連線中斷: ${error.message}。請檢查 API 金鑰設定。`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto relative px-4 sm:px-6">
      
      {/* Top Menu Button - Fixed to Screen Corner */}
      <div className="fixed top-6 right-6 z-[60]">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-4 glass-button rounded-2xl text-slate-400 hover:text-emerald-400 transition-all hover:scale-110 shadow-2xl"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Immersive Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-3xl animate-in fade-in duration-500 flex items-center justify-center p-8">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          
          <div className="max-w-md w-full space-y-12 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-widest">AGI HUB</h2>
              <p className="text-emerald-500/60 font-bold uppercase tracking-[0.4em] text-[10px]">Management Modules</p>
            </div>

            <nav className="grid grid-cols-1 gap-4">
              {[
                { id: 'registry', label: '職人大腦智庫', href: '/registry', color: 'hover:text-emerald-400' },
                { id: 'assets', label: '連線資產清單', href: '/assets', color: 'hover:text-cyan-400' },
                { id: 'settings', label: '系統參數設定', href: '#', color: 'hover:text-slate-200' },
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={() => {
                    if (item.id === 'settings') {
                      setIsSettingsOpen(true);
                      setIsMenuOpen(false);
                    } else if (item.href !== '#') {
                      router.push(item.href);
                    }
                  }}
                  className={`block p-6 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border border-white/5 hover:border-white/20 rounded-full transition-all duration-500 group opacity-20 hover:opacity-100 text-center w-full`}
                >
                  <span className={`text-sm font-bold tracking-[0.3em] text-slate-300 ${item.color} transition-colors`}>
                    {item.label}
                  </span>
                </button>
              ))}
              
              <button 
                onClick={handleLogout}
                className="block p-6 bg-red-500/5 hover:bg-red-500/10 backdrop-blur-xl border border-red-500/10 hover:border-red-500/30 rounded-full transition-all duration-500 group opacity-20 hover:opacity-100"
              >
                <span className="text-sm font-bold tracking-[0.3em] text-red-500/60 group-hover:text-red-500 transition-colors">
                  登出系統
                </span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* System Settings Panel Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="w-full max-w-lg glass-card rounded-[3rem] p-10 border border-emerald-500/10 relative">
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="mb-10">
              <h3 className="text-2xl font-black text-white tracking-widest mb-1">SYSTEM CORE</h3>
              <p className="text-[10px] text-emerald-500/50 font-bold uppercase tracking-[0.3em]">Runtime Parameters</p>
            </div>

            <div className="space-y-6">
              {[
                { label: '核心運算模型', value: 'Gemini-1.5-Flash-Latest' },
                { label: '通訊協議端點', value: 'Google Language v1beta' },
                { label: '連線認證狀態', value: 'Encrypted Session Active' },
                { label: '系統識別編號', value: 'AGI-HUB-DELTA-01' },
                { label: '平均響應延遲', value: '1.2s - 1.8s' },
                { label: '運作環境類型', value: 'Edge Runtime / Node.js' },
              ].map((param, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                  <span className="text-xs text-slate-500 font-bold tracking-widest">{param.label}</span>
                  <span className="text-xs text-emerald-400 font-mono tracking-tighter">{param.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
              <p className="text-[9px] text-emerald-500/40 font-bold tracking-[0.2em]">所有核心參數皆已根據獨立控制平面協議鎖定</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Info - Removed as requested */}
      <div className="pt-12" />

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-10 pb-32 pt-4 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-3 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {msg.role === 'user' ? 'You' : 'Hub Brain'}
              </span>
            </div>
            <div className={`max-w-[85%] px-6 py-5 rounded-[2rem] text-lg leading-relaxed shadow-sm ${
              msg.role === 'user' 
              ? 'bg-emerald-600/80 backdrop-blur-lg text-white rounded-tr-none' 
              : 'glass-card rounded-tl-none border-white/5'
            }`}>
              {msg.content}
              {msg.blocks && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {msg.blocks.map(block => (
                    <span key={block} className="text-[10px] px-3 py-1 rounded-full bg-slate-950/50 text-emerald-400 border border-emerald-500/10 font-bold">
                      #{block}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start gap-3">
             <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center animate-pulse">
                <Sparkles size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Thinking...</span>
            </div>
            <div className="p-6 bg-slate-900/50 rounded-[2rem] rounded-tl-none border border-slate-800 flex gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[120px] left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 sm:px-6">
        <div className="relative group">
          <div className="relative flex items-center glass-input rounded-full p-2 pr-4 shadow-2xl">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="輸入訊息，由 AGI 中心調度邏輯..."
              className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-500 focus:ring-0 outline-none px-6 py-4 text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 backdrop-blur-md text-emerald-400 p-4 rounded-full transition-all disabled:opacity-0 hover:scale-105 active:scale-95 group border border-emerald-500/20 opacity-20 hover:opacity-100"
            >
              <span className="text-[10px] font-black tracking-widest px-2">SEND</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
