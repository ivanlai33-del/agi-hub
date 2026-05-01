'use client';

import React, { useState, useEffect } from 'react';
import { Users, Trash2, ChevronLeft, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState<{userId: string, role: string}[]>([]);
  const [currentUser, setCurrentUser] = useState<{userId: string, role: string} | null>(null);
  const [newUser, setNewUser] = useState({ userId: '', password: '', role: 'user' });

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setCurrentUser({ userId: data.userId, role: data.role });
          if (data.role === 'admin') {
            fetch('/api/auth/users').then(res => res.json()).then(setUsers);
          }
        }
      });
  }, []);

  const handleAddUser = async () => {
    if (!newUser.userId || !newUser.password) {
      import('sonner').then(({ toast }) => toast.error('請輸入帳號與密碼'));
      return;
    }
    await fetch('/api/auth/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    const updated = await fetch('/api/auth/users').then(res => res.json());
    setUsers(updated);
    setNewUser({ userId: '', password: '', role: 'user' });
    import('sonner').then(({ toast }) => toast.success('帳號已成功建立 / 更新'));
  };

  const handleDeleteUser = async (userId: string) => {
    if(userId === 'ivan') {
      import('sonner').then(({ toast }) => toast.error('無法刪除超級管理員帳號'));
      return;
    }
    await fetch('/api/auth/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const updated = await fetch('/api/auth/users').then(res => res.json());
    setUsers(updated);
    import('sonner').then(({ toast }) => toast.info('帳號已移除'));
  };

  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="glass-card p-12 text-center space-y-6">
          <AlertTriangle size={48} className="mx-auto text-amber-500" />
          <h2 className="text-2xl font-black text-white">無存取權限</h2>
          <p className="text-slate-400">只有管理員才能存取帳號管理中心。您目前的權限僅限於與 AGI 首頁對談。</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-all">
            <ChevronLeft size={20} />
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-8 sm:p-12 relative z-10">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white">帳號權限管理</h1>
            <p className="text-cyan-500/60 font-bold uppercase tracking-[0.4em] text-xs">Access Control Center</p>
          </div>
          <Link 
            href="/"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black tracking-widest transition-all border border-white/10 flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            返回導航首頁
          </Link>
        </div>

        {/* Info Banner */}
        <div className="p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl flex items-start gap-4">
          <Shield className="text-cyan-400 mt-1 flex-shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-bold text-cyan-400 mb-2">權限隔離說明</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              在此建立的使用者帳號預設為「普通使用者」，他們登入後<strong className="text-white">僅能與首頁的 AGI 進行對話</strong>。
              普通使用者無法開啟左上角的「職人大腦選單」，也無法進入「大腦智庫」與「資產清單」。
            </p>
          </div>
        </div>

        {/* Add User Form */}
        <div className="glass-card rounded-[2.5rem] border border-white/5 p-8 sm:p-10">
          <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
            <Users className="text-emerald-400" />
            新增 / 更新使用者
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">帳號 ID</label>
              <input 
                type="text" 
                placeholder="例如: staff_01" 
                value={newUser.userId}
                onChange={e => setNewUser({...newUser, userId: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">設定密碼</label>
              <input 
                type="password" 
                placeholder="輸入密碼" 
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">身分權限</label>
              <select 
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none transition-colors"
              >
                <option value="user">普通使用者 (僅限對話)</option>
                <option value="admin">管理員 (全權限)</option>
              </select>
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <button 
                onClick={handleAddUser}
                className="w-full h-[52px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[11px] tracking-widest transition-all shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1 ease-out"
              >
                儲存帳號
              </button>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="glass-card rounded-[2.5rem] border border-white/5 p-8 sm:p-10">
          <h3 className="text-xl font-black text-white mb-6">現有帳號清單</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.map(u => (
              <div key={u.userId} className="flex items-center justify-between p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-colors group">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-200">{u.userId}</span>
                  <span className={`text-[9px] uppercase tracking-widest font-black ${u.role === 'admin' ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {u.role === 'admin' ? 'Super Admin' : 'Basic User'}
                  </span>
                </div>
                {u.userId !== 'ivan' && (
                  <button 
                    onClick={() => handleDeleteUser(u.userId)}
                    className="p-3 bg-red-500/5 text-red-500/50 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
                    title="刪除帳號"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
