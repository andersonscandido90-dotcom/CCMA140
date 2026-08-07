import React from 'react';
import { LogEntry } from '../types';
import { STATUS_CONFIG } from '../constants';
import { Clock, History } from 'lucide-react';

interface Props {
  logs: LogEntry[];
}

export default function ActivityLog({ logs }: Props) {
  const sortedLogs = [...logs].reverse();

  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-[2rem] space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400">
          <History className="w-6 h-6" />
        </div>
        <h3 className="font-black uppercase text-white text-lg">Histórico de Alterações</h3>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
        {sortedLogs.length === 0 ? (
          <p className="text-slate-500 text-xs italic">Nenhuma alteração registrada neste turno.</p>
        ) : (
          sortedLogs.map((log) => {
            const oldConfig = STATUS_CONFIG[log.oldStatus];
            const newConfig = STATUS_CONFIG[log.newStatus];
            const time = new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="font-black text-white">{log.item}</span>
                    <span className="text-slate-500 text-[10px] block">{time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className={`px-2 py-0.5 rounded ${oldConfig.bgColor} ${oldConfig.textColor}`}>
                    {oldConfig.label}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded ${newConfig.bgColor} ${newConfig.textColor}`}>
                    {newConfig.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
