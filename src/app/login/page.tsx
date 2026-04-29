'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// 預設使用者列表 (之後可搬移至資料庫)
const users = [
  { id: 'admin', name: 'System Admin', role: 'Root Access', avatar: 'SA' },
  { id: 'analyst', name: 'Senior Analyst', role: 'Data View', avatar: 'AN' },
];

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);

    try {
      // 呼叫登入 API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser?.id, password }),
      });

      if (res.ok) {
        toast.success('系統解鎖成功');
        router.push('/');
        router.refresh();
      } else {
        toast.error('身分驗證失敗，請檢查密碼');
        setPassword('');
      }
    } catch (error) {
      toast.error('連線異常');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-2xl mb-4">
          <Brain size={32} />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">AGI CONTROL CENTER</h1>
        <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Security Gateway v2.0</p>
      </motion.div>

      {/* User Selection */}
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        {users.map((user) => (
          <motion.button
            key={user.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedUser(user)}
            className={`flex flex-col items-center group transition-opacity ${selectedUser && selectedUser.id !== user.id ? 'opacity-40' : 'opacity-100'}`}
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold transition-all border-2 ${
              selectedUser?.id === user.id ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-white/10 bg-white/5 text-slate-400 group-hover:border-emerald-500/50'
            }`}>
              {user.avatar}
            </div>
            <span className="mt-4 text-white font-bold">{user.name}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{user.role}</span>
          </motion.button>
        ))}
      </div>

      {/* Password Input (Appears when user is selected) */}
      <AnimatePresence>
        {selectedUser && (
          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleLogin}
            className="w-full max-w-sm glass-card p-8 rounded-[2.5rem] relative"
          >
            <button 
              type="button"
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 text-slate-600 hover:text-white transition-colors"
            >
              取消
            </button>
            
            <h3 className="text-lg font-bold text-white mb-6">輸入 {selectedUser.name} 的密碼</h3>
            
            <div className="relative mb-6">
              <input 
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
              <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
            </div>

            <button 
              disabled={isLoading || !password}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? '驗證中...' : '進入控制中心'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Network Secure Tag */}
      <div className="fixed bottom-8 flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Encrypted Session Enabled
      </div>
    </div>
  );
}
