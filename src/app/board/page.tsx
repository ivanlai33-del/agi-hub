'use client';

import React from 'react';
import { CompanyKanban } from '@/components/agi-hub/CompanyKanban';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BoardPage() {
  return (
    <main className="w-full h-screen bg-slate-950 p-4 sm:p-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/"
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">生產指揮中心</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Company Production Dashboard</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <CompanyKanban />
      </div>
    </main>
  );
}
