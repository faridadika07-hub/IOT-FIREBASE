import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface SceneCardProps {
  name: string;
  icon: LucideIcon;
  onActivate: () => void;
  onDeactivate: () => void;
}

export function SceneCard({ name, icon: Icon, onActivate, onDeactivate }: SceneCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-purple-500/30 transition-all text-center group"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-800 rounded-xl text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col justify-center h-full text-left">
          <span className="font-semibold text-slate-300 group-hover:text-purple-100 tracking-wide">{name}</span>
        </div>
      </div>
      
      <div className="flex w-full gap-3 mt-2">
        <button
          onClick={onActivate}
          className="flex-1 py-2.5 rounded-xl font-semibold transition-all bg-slate-800 text-slate-400 hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500/30 hover:glow-purple border border-transparent"
        >
          ON
        </button>
        <button
          onClick={onDeactivate}
          className="flex-1 py-2.5 rounded-xl font-semibold transition-all bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 hover:glow-red border border-transparent"
        >
          OFF
        </button>
      </div>
    </motion.div>
  );
}

