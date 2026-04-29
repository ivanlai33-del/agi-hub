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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6">
      
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleLogin}
        className="w-full max-w-[320px] space-y-6"
      >
        {/* Username Field */}
        <div className="relative group">
          <input 
            autoFocus
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="USERNAME"
            className="w-full bg-transparent hover:bg-slate-950/40 focus:bg-slate-950/60 backdrop-blur-md border border-emerald-500/0 hover:border-emerald-500/20 focus:border-emerald-500/40 rounded-full px-8 py-5 text-white text-center tracking-[0.3em] placeholder:text-slate-900 focus:placeholder:text-slate-800 focus:outline-none transition-all duration-700 animate-glow-pulse shadow-none hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
          />
        </div>

        {/* Password Field */}
        <div className="relative group">
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            className="w-full bg-transparent hover:bg-slate-950/40 focus:bg-slate-950/60 backdrop-blur-md border border-emerald-500/0 hover:border-emerald-500/20 focus:border-emerald-500/40 rounded-full px-8 py-5 text-white text-center tracking-[0.3em] placeholder:text-slate-900 focus:placeholder:text-slate-800 focus:outline-none transition-all duration-700 animate-glow-pulse [animation-delay:1s] shadow-none hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
          />
        </div>

        {/* Hidden Submit */}
        <button type="submit" className="hidden" />
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[10px] text-emerald-500/50 tracking-[0.5em] font-bold uppercase mt-6"
          >
            Authenticating...
          </motion.div>
        )}
      </motion.form>

      {/* Background Decorative Element */}
      <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[150px] rounded-full animate-pulse" />
      </div>
    </div>
  );
}
