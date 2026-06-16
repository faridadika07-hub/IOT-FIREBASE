import React from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ActivityLog({ logs }: { logs: LogEntry[] }) {
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-800 rounded-lg">
          <Terminal className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">Activity Log</h3>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 min-h-[200px]">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-800/50 text-sm"
            >
              <span className="text-slate-500 font-mono flex-shrink-0 mt-0.5">
                [{formatTime(log.timestamp)}]
              </span>
              <span className={`flex-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-cyan-400' : 'text-slate-300'}`}>
                {log.message}
              </span>
            </motion.div>
          ))}
          {logs.length === 0 && (
            <p className="text-center text-slate-500 italic mt-10">No recent activity.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
