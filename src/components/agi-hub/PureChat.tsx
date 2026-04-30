'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Brain, Shield, Menu, X, ArrowRight, LayoutGrid, Globe, Settings, LogOut, Plus } from 'lucide-react';
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
  const [activeBrain, setActiveBrain] = useState<any>(null);
  const [brains, setBrains] = useState<any[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResetX, setShowResetX] = useState(false);
  const [isBrainListOpen, setIsBrainListOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for active brain from registry
    const storedBrain = localStorage.getItem('active_brain');
    if (storedBrain) {
      try {
        const brain = JSON.parse(storedBrain);
        setActiveBrain(brain);
        setMessages([
          {
            role: 'agi',
            content: `您好，我是您的「${brain.name}」。我已根據您在智庫中配置的 ${brain.modules.length} 個積木完成掛載。請問有什麼可以協助您的？`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } catch (e) {
        console.error('Failed to parse active brain');
      }
    }

    // Also fetch all available brains for the quick-switcher
    fetch('/api/v1/brains')
      .then(res => res.json())
      .then(data => setBrains(data))
      .catch(err => console.error('Failed to fetch brains for switcher', err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBrainListOpen(false);
        setShowResetX(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          messages: [...messages, userMsg],
          asset_id: 'hub_standalone_v1',
          tenant_id: 'internal_admin',
          brain_id: activeBrain?.id,
          brain_config: activeBrain
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Unknown Error');
      }

      let content = data.content;
      
      // Check for self-building trigger
      if (content.includes('CREATE_BRAIN:')) {
        const parts = content.split('CREATE_BRAIN:');
        content = parts[0].trim();
        try {
          // Find the start of the JSON block
          const jsonStr = parts[1].trim();
          const brainData = JSON.parse(jsonStr);
          // Call API to persist the new brain
          await fetch('/api/v1/brains', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(brainData),
          });
          // Use window.dispatchEvent or similar if we want to notify other components
          // For now, toast is enough
          import('sonner').then(({ toast }) => toast.success(`新大腦「${brainData.name}」已自動存入智庫`));
        } catch (e) {
          console.error('Failed to parse auto-created brain', e);
        }
      }

      const agiMsg: Message = {
        role: 'agi',
        content: content,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleResetBrain = () => {
    localStorage.removeItem('active_brain');
    setActiveBrain(null);
    setShowResetX(false);
    setIsBrainListOpen(false);
    setMessages([
      {
        role: 'agi',
        content: '身分已重置。我已回到「AGI Navigation Hub」中央導航核心模式。隨時為您進行全域調度。',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    import('sonner').then(({ toast }) => toast.info('已回歸中央導航核心'));
  };

  const handleSwitchBrain = (brain: any) => {
    localStorage.setItem('active_brain', JSON.stringify(brain));
    setActiveBrain(brain);
    setIsBrainListOpen(false);
    setShowResetX(false);
    setMessages([
      {
        role: 'agi',
        content: `切換成功。我是您的「${brain.name}」。已掛載 ${brain.modules.length} 個專業積木，隨時準備導航。`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    import('sonner').then(({ toast }) => toast.success(`已切換為 ${brain.name}`));
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
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={() => {
                    router.push(item.href);
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

      {/* Identity Light Indicator & Quick Switcher - Top Left */}
      <div ref={dropdownRef} className="fixed top-8 left-8 z-[60] flex flex-col items-start gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (activeBrain) {
                setShowResetX(!showResetX);
              } else {
                setIsBrainListOpen(!isBrainListOpen);
              }
            }}
            className={`w-3 h-3 rounded-full transition-all duration-500 shadow-lg ${
              activeBrain ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' : 'bg-slate-700 shadow-white/5 hover:bg-slate-500 hover:scale-125'
            }`}
            title={activeBrain ? `Active Brain: ${activeBrain.name}` : 'Click to select Brain identity'}
          />
          
          {showResetX && activeBrain && (
            <button 
              onClick={handleResetBrain}
              className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-rose-500/20 border border-white/10 rounded-full animate-in slide-in-from-left-2 duration-300 group"
            >
              <span className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors">{activeBrain.name}</span>
              <X size={10} className="text-slate-500 group-hover:text-rose-400" />
            </button>
          )}
        </div>

        {/* Quick Switcher Dropdown */}
        {isBrainListOpen && !activeBrain && (
          <div className="w-56 glass-card rounded-2xl border border-white/10 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300 shadow-2xl">
            <div className="p-3 border-b border-white/5 bg-white/5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Persona</span>
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-hide py-2">
              {brains.map((brain) => (
                <button
                  key={brain.id}
                  onClick={() => handleSwitchBrain(brain)}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all border-l-2 border-transparent hover:border-emerald-500 group flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold group-hover:translate-x-1 transition-transform">{brain.name}</span>
                    <span className="text-[8px] opacity-40 uppercase tracking-tighter">{brain.category}</span>
                  </div>
                  <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Header Info - Removed as requested */}
      <div className="pt-16" />

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pb-48 pt-4 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar Column */}
            <div className="flex flex-col items-center flex-shrink-0 mt-1">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                msg.role === 'user' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Brain size={20} />}
              </div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">
                {msg.role === 'user' ? 'You' : 'Brain'}
              </span>
            </div>

            {/* Content Column */}
            <div className={`max-w-[80%] px-8 py-5 rounded-[2.5rem] text-base leading-relaxed shadow-2xl transition-all hover:scale-[1.01] ${
              msg.role === 'user' 
              ? 'bg-gradient-to-br from-emerald-500/80 to-emerald-900/80 backdrop-blur-3xl text-white rounded-tr-none border border-emerald-400/20' 
              : 'bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-3xl text-slate-200 rounded-tl-none border border-white/10'
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
          <div className="flex flex-row gap-4">
            <div className="flex flex-col items-center flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
                <Brain size={20} />
              </div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2 animate-pulse">Wait</span>
            </div>
            <div className="p-5 bg-slate-900/40 backdrop-blur-md rounded-[2rem] rounded-tl-none border border-white/5 flex gap-2 h-fit mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[120px] left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="relative flex items-center glass-input rounded-full p-2 pr-4 shadow-2xl">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="輸入訊息，由 AGI 中心調度邏輯..."
              className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-500 focus:ring-0 outline-none px-6 py-4 text-sm"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 backdrop-blur-md text-emerald-400 p-4 rounded-full transition-all disabled:opacity-0 hover:scale-105 active:scale-95 group border border-emerald-500/20 opacity-20 hover:opacity-100"
            >
              <span className="text-[10px] font-black tracking-widest px-2">SEND</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
