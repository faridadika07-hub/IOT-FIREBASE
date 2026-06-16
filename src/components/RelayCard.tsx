import React from 'react';
import { Lightbulb, LightbulbOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RelayCardProps {
  id: string;
  name: string;
  status: number;
  onToggle: (id: string, newStatus: number) => void;
}

export function RelayCard({ id, name, status, onToggle }: RelayCardProps) {
  const isOn = status === 1;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 flex flex-col items-center gap-4
        ${isOn 
          ? 'bg-cyan-950/20 border-cyan-500/50 glow-cyan' 
          : 'bg-slate-900/50 border-slate-800'}`}
    >
      <div className={`p-5 rounded-full transition-all duration-300 ${isOn ? 'bg-cyan-500/10 glow-cyan-strong' : 'bg-slate-800'}`}>
        {isOn ? (
          <Lightbulb className="w-10 h-10 text-cyan-400 text-glow-cyan animate-pulse" />
        ) : (
          <LightbulbOff className="w-10 h-10 text-slate-500" />
        )}
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-200">{name}</h3>
        <p className={`text-sm font-bold mt-1 tracking-wider ${isOn ? 'text-cyan-400' : 'text-slate-500'}`}>
          {isOn ? 'ACTIVE' : 'INACTIVE'}
        </p>
      </div>

      <div className="flex w-full gap-3 mt-2">
        <button
          onClick={() => onToggle(id, 1)}
          className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
            isOn 
              ? 'bg-cyan-500 text-slate-950 glow-cyan-strong shadow-lg' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          ON
        </button>
        <button
          onClick={() => onToggle(id, 0)}
          className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
            !isOn 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 glow-red' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          OFF
        </button>
      </div>
    </motion.div>
  );
}
