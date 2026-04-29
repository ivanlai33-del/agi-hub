'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: username.toLowerCase(), password }),
      });

      if (res.ok) {
        toast.success('系統存取授權成功');
        router.push('/');
        router.refresh();
      } else {
        toast.error('憑證錯誤，請重新輸入');
      }
    } catch (error) {
      toast.error('連線異常');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative">
      
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleLogin}
        className="w-full max-w-[320px] space-y-6 relative z-20"
      >
        {/* Username Field */}
        <div className="relative group">
          <input 
            autoFocus
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="USERNAME"
            className="w-full bg-slate-950/20 hover:bg-slate-950/40 focus:bg-slate-950/60 backdrop-blur-md border border-emerald-500/10 hover:border-emerald-500/30 focus:border-emerald-500/50 rounded-full px-8 py-5 text-white text-center tracking-[0.3em] placeholder:text-slate-900 focus:placeholder:text-slate-800 focus:outline-none transition-all duration-700 animate-glow-pulse shadow-none"
          />
        </div>

        {/* Password Field */}
        <div className="relative group">
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            className="w-full bg-slate-950/20 hover:bg-slate-950/40 focus:bg-slate-950/60 backdrop-blur-md border border-emerald-500/10 hover:border-emerald-500/30 focus:border-emerald-500/50 rounded-full px-8 py-5 text-white text-center tracking-[0.3em] placeholder:text-slate-900 focus:placeholder:text-slate-800 focus:outline-none transition-all duration-700 animate-glow-pulse [animation-delay:1s] shadow-none"
          />
        </div>

        {/* Glass Unlock Button */}
        <button 
          type="submit"
          disabled={isLoading || !username || !password}
          className="w-full py-5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 rounded-full text-white font-bold tracking-[0.5em] text-[11px] transition-all duration-500 disabled:opacity-0 active:scale-95 opacity-20 hover:opacity-100"
        >
          {isLoading ? 'VERIFYING...' : 'UNLOCK HUB'}
        </button>
      </motion.form>

      {/* Atmospheric elements to match the main page */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/[0.03] blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
      </div>
    </div>
  );
}
