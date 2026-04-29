import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PersonaProps {
  persona: {
    persona_id: string;
    name: string;
    division: string;
    mission: string;
    icon: any;
    color: string;
  };
}

export const PersonaCard: React.FC<PersonaProps> = ({ persona }) => {
  const Icon = persona.icon;
  
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20 hover:border-emerald-500/50',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-500/20 hover:border-blue-500/50',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-500/20 hover:border-amber-500/50',
    violet: 'text-violet-400 bg-violet-400/10 border-violet-500/20 hover:border-violet-500/50',
    pink: 'text-pink-400 bg-pink-400/10 border-pink-500/20 hover:border-pink-500/50',
  };

  return (
    <div className={`glass-card p-6 rounded-2xl transition-all group backdrop-blur-3xl ${colorMap[persona.color] || colorMap.emerald}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-xl glass-button border-none`}>
          <Icon size={24} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
          {persona.division}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
            {persona.name}
          </h3>
          <p className="text-[10px] font-mono opacity-50 mt-1">{persona.persona_id}</p>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed min-h-[4rem]">
          {persona.mission}
        </p>

        <button className="w-full mt-4 flex items-center justify-center gap-2 glass-button py-3 rounded-xl font-bold text-xs uppercase tracking-widest">
          調度此職人大腦 <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
