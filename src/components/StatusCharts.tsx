import React from 'react';
import { EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Activity } from 'lucide-react';

interface Props {
  data: EquipmentData;
}

export default function StatusCharts({ data }: Props) {
  const counts: Record<EquipmentStatus, number> = {
    [EquipmentStatus.IN_LINE]: 0,
    [EquipmentStatus.IN_SERVICE]: 0,
    [EquipmentStatus.RESTRICTED]: 0,
    [EquipmentStatus.AVAILABLE]: 0,
    [EquipmentStatus.UNAVAILABLE]: 0,
  };

  Object.values(data).forEach((status) => {
    if (counts[status] !== undefined) {
      counts[status]++;
    }
  });

  const chartData = Object.entries(counts).map(([status, count]) => {
    const config = STATUS_CONFIG[status as EquipmentStatus];
    return {
      name: config.label,
      value: count,
      color: config.color,
    };
  }).filter(item => item.value > 0);

  const total = Object.values(counts).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-[2rem] space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600/20 rounded-xl text-indigo-400">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="font-black uppercase text-white text-lg">Resumo Operacional dos Equipamentos</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Gráfico */}
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Nenhum status registrado
            </div>
          )}
        </div>

        {/* Estatísticas Numéricas */}
        <div className="space-y-3">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const count = counts[key as EquipmentStatus] || 0;
            const pct = total > 0 ? ((count / total) * 100).toFixed(0) : '0';

            return (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-xs font-bold text-slate-300 uppercase">{config.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-black text-white">{count}</span>
                  <span className="text-[10px] font-mono text-slate-500">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
