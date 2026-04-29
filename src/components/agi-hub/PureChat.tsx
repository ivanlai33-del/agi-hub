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
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300 flex items-center justify-center p-8">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-2">
              <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-2xl shadow-emerald-900/40 mb-6">
                <Brain size={40} />
              </div>
              <h2 className="text-3xl font-black text-white">AGI Hub Control</h2>
              <p className="text-slate-500 font-medium">切換至獨立管理模組</p>
            </div>

            <nav className="grid grid-cols-1 gap-3">
              {[
                { label: '職人大腦智庫', href: '/registry', icon: Brain, color: 'text-emerald-400' },
                { label: '連線資產清單', href: '/assets', icon: Globe, color: 'text-cyan-400' },
                { label: '系統參數設定', href: '#', icon: Settings, color: 'text-slate-500' },
              ].map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-4 p-5 glass-button rounded-3xl group"
                >
                  <div className={`p-3 rounded-2xl bg-slate-950 ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="flex-1 text-left font-bold text-slate-200">{item.label}</span>
                  <ArrowRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                </Link>
              ))}
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 p-5 glass-button rounded-3xl group border-red-500/10 hover:border-red-500/30"
              >
                <div className="p-3 rounded-2xl bg-slate-950 text-red-400">
                  <LogOut size={20} />
                </div>
                <span className="flex-1 text-left font-bold text-red-400/80 group-hover:text-red-400">登出系統</span>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-red-400 transition-colors" />
              </button>
            </nav>
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
          {/* Removed focus glow inset-0 */}
          <div className="relative flex items-center glass-input rounded-[2.5rem] p-2 pr-4 shadow-2xl">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="輸入訊息，由 AGI 中心調度邏輯..."
              className="flex-1 bg-transparent border-none text-slate-100 placeholder:text-slate-600 focus:ring-0 outline-none px-6 py-4 text-lg"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-14 h-14 rounded-full bg-emerald-600/80 hover:bg-emerald-500 backdrop-blur-md disabled:opacity-30 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 transition-all active:scale-90"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
