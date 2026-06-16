import React from 'react';
import { Thermometer, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

interface SensorCardProps {
  type: 'temperature' | 'humidity';
  value: number;
}

export function SensorCard({ type, value }: SensorCardProps) {
  const isTemp = type === 'temperature';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex items-center justify-between group hover:border-cyan-500/30 transition-all duration-300"
    >
      {/* Background glow decoration */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${isTemp ? 'bg-orange-500' : 'bg-cyan-500'}`}></div>

      <div>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">
          {isTemp ? 'Temperature' : 'Humidity'}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-mono font-bold text-slate-100 drop-shadow-md">
            {Number(value || 0).toFixed(1)}
          </span>
          <span className={`text-xl font-semibold ${isTemp ? 'text-orange-400' : 'text-cyan-400'}`}>
            {isTemp ? '°C' : '%'}
          </span>
        </div>
      </div>

      <div className={`p-4 rounded-2xl ${isTemp ? 'bg-orange-500/10' : 'bg-cyan-500/10'}`}>
        {isTemp ? (
          <Thermometer className="w-8 h-8 text-orange-400" />
        ) : (
          <Droplets className="w-8 h-8 text-cyan-400" />
        )}
      </div>
    </motion.div>
  );
}
