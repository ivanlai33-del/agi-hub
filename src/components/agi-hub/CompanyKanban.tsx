'use client';

import React, { useState, useEffect } from 'react';
import { Layout, CheckCircle2, Clock, PlayCircle, Plus, RefreshCcw } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
}

export const CompanyKanban: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/multica');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    { id: 'todo', title: '待辦事項', icon: <Clock size={16} className="text-slate-500" /> },
    { id: 'in_progress', title: '執行中', icon: <PlayCircle size={16} className="text-emerald-400" /> },
    { id: 'done', title: '已完成', icon: <CheckCircle2 size={16} className="text-cyan-400" /> },
  ];

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
      
      await fetch('/api/v1/multica', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/hermes/sync', { method: 'POST' });
      const data = await res.json();
      import('sonner').then(({ toast }) => toast.success(data.message));
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-950/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-6 h-full flex flex-col gap-6 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <Layout size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-widest uppercase">Multica Kanban</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Production Line</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSync}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-full transition-all text-emerald-400 text-[10px] font-black uppercase tracking-widest"
            title="Sync Done tasks to Knowledge Base"
          >
            <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            Hermes Sync
          </button>
          <button 
            onClick={fetchTasks}
            className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-500 hover:text-white"
          >
            <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-2xl border border-white/5">
              {col.icon}
              <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">{col.title}</span>
              <span className="ml-auto text-[10px] font-black text-slate-600 bg-black/40 px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>

            <div className="space-y-3">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task.id}
                  onClick={() => {
                    const nextStatus = col.id === 'todo' ? 'in_progress' : col.id === 'in_progress' ? 'done' : 'todo';
                    handleStatusChange(task.id, nextStatus);
                  }}
                  className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-emerald-500/30 rounded-3xl p-4 transition-all duration-500 cursor-pointer shadow-lg hover:-translate-y-1 active:scale-95"
                >
                  <h4 className="text-xs font-bold text-slate-200 mb-2 group-hover:text-emerald-400 transition-colors">
                    {task.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-400">
                        E
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="h-20 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center">
                  <span className="text-[10px] font-black text-slate-700 tracking-widest uppercase">Empty</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full py-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 rounded-full transition-all group">
        <span className="text-[10px] font-black text-emerald-500/60 group-hover:text-emerald-400 tracking-[0.4em] uppercase flex items-center justify-center gap-2">
          <Plus size={14} /> 新增任務到生產線
        </span>
      </button>
    </div>
  );
};
