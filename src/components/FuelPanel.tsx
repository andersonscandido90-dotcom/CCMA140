import React from 'react';
import { FuelData } from '../types';
import { Droplet, Waves, Plane, LucideIcon, Cog, AlertCircle } from 'lucide-react';

interface Props {
  fuel: FuelData;
  onChange: (key: keyof FuelData, val: number) => void;
  fullWidth?: boolean;
}

const FuelPanel: React.FC<Props> = ({ fuel, onChange, fullWidth }) => {
  const items: {
    key: keyof FuelData;
    maxKey: keyof FuelData;
    label: string;
    icon: LucideIcon;
    unit: string;
    color: string;
    shadowColor: string;
    accentColor: string;
  }[] = [
    { key: 'water', maxKey: 'maxWater', label: 'Água Doce', icon: Waves, unit: 'm³', color: 'bg-blue-500', shadowColor: 'shadow-blue-500/20', accentColor: 'text-blue-400' },
    { key: 'lubOil', maxKey: 'maxLubOil', label: 'Óleo Lub.', icon: Cog, unit: 'm³', color: 'bg-amber-600', shadowColor: 'shadow-amber-600/20', accentColor: 'text-amber-500' },
    { key: 'fuelOil', maxKey: 'maxFuelOil', label: 'Óleo Comb.', icon: Droplet, unit: 'm³', color: 'bg-slate-400', shadowColor: 'shadow-slate-400/20', accentColor: 'text-slate-300' },
    { key: 'jp5', maxKey: 'maxJp5', label: 'JP-5 (AV)', icon: Plane, unit: 'm³', color: 'bg-indigo-500', shadowColor: 'shadow-indigo-500/20', accentColor: 'text-indigo-400' },
  ];

  const totalVolume = fuel.water + fuel.lubOil + fuel.fuelOil + fuel.jp5;

  const handleValueChange = (key: keyof FuelData, maxKey: keyof FuelData, value: number) => {
    const max = fuel[maxKey] || 0;
    // Bloqueia se o valor for maior que o máximo
    if (value > max) {
      return; // Não faz nada (bloqueia a entrada)
    }
    onChange(key, value);
  };

  return (
    <div className={`bg-slate-900/40 border border-slate-800 shadow-2xl rounded-[1.5rem] sm:rounded-[3rem] lg:rounded-[4rem] p-3.5 sm:p-8 lg:p-12 backdrop-blur-xl ${fullWidth ? 'w-full' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 sm:mb-12 gap-4 sm:gap-6">
        <h3 className={`font-black flex items-center gap-3 sm:gap-6 text-white uppercase tracking-tighter ${fullWidth ? 'text-xl sm:text-4xl lg:text-7xl' : 'text-lg sm:text-2xl lg:text-4xl'}`}>
          <div className="p-2.5 sm:p-4 bg-blue-600 rounded-2xl sm:rounded-3xl shadow-lg shadow-blue-600/20 shrink-0">
            <Droplet className="text-white w-5 h-5 sm:w-8 sm:h-8 lg:w-12 lg:h-12" />
          </div>
          Cargas Líquidas
        </h3>
        {fullWidth && (
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-[2rem] flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shadow-inner w-full sm:w-auto justify-between">
            <span className="font-black text-slate-500 uppercase tracking-widest text-[8px] lg:text-xs">Volume Total</span>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-blue-400 text-xl sm:text-3xl lg:text-5xl tracking-tighter">
                {totalVolume.toLocaleString('pt-BR')}
              </span>
              <span className="font-black text-slate-600 text-[10px] sm:text-xl uppercase tracking-widest sm:tracking-normal">m³</span>
            </div>
          </div>
        )}
      </div>
      
      <div className={`grid gap-3 sm:gap-8 lg:gap-12 ${fullWidth ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {items.map((item) => {
          const maxValue = fuel[item.maxKey] || 1;
          const currentVal = fuel[item.key];
          const percentage = Math.min((currentVal / maxValue) * 100, 100);
          const Icon = item.icon;
          const isFull = currentVal >= maxValue;
          
          return (
            <div key={item.key} className={`bg-slate-950/60 border-2 rounded-[1.5rem] sm:rounded-[2.5rem] p-3.5 sm:p-8 lg:p-10 flex flex-col gap-4 sm:gap-8 group transition-all duration-500 relative overflow-hidden ${isFull ? 'border-blue-500/50' : 'border-slate-800/50 hover:border-blue-500/30'}`}>
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none hidden sm:block">
                <Icon size={200} />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className={`bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl ${item.accentColor} shadow-xl shrink-0`}>
                    <Icon className="w-5 h-5 sm:w-8 sm:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-white uppercase tracking-widest text-sm sm:text-lg lg:text-2xl mb-1 truncate">{item.label}</h4>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-[7px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">CAPACIDADE:</span>
                      <input 
                        type="number" 
                        value={fuel[item.maxKey]}
                        onChange={(e) => onChange(item.maxKey, parseFloat(e.target.value) || 0)}
                        className="bg-slate-900/50 border border-slate-800 rounded-md sm:rounded-lg px-1.5 py-0.5 text-blue-400 font-black w-14 sm:w-20 text-[9px] sm:text-sm focus:outline-none focus:border-blue-500 transition-all"
                      />
                      <span className="text-slate-600 font-bold text-[7px] sm:text-[10px] uppercase">m³</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-2xl flex flex-col items-center justify-center min-w-[60px] sm:min-w-[100px] shadow-inner shrink-0">
                  <span className={`font-black text-lg sm:text-3xl lg:text-4xl tracking-tighter ${percentage >= 100 ? 'text-blue-400' : percentage < 15 ? 'text-red-500' : 'text-white'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                  <span className="text-[7px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest">NÍVEL</span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-1">
                <div className="flex items-baseline gap-2 sm:gap-4">
                  <input 
                    type="number" 
                    value={currentVal}
                    max={maxValue}
                    onChange={(e) => handleValueChange(item.key, item.maxKey, parseFloat(e.target.value) || 0)}
                    className={`bg-transparent font-black w-full focus:outline-none tracking-tighter text-4xl sm:text-7xl lg:text-9xl transition-colors ${isFull ? 'text-blue-400' : 'text-white hover:text-blue-400 focus:text-blue-400'}`}
                  />
                  <span className="text-slate-500 font-black uppercase tracking-widest text-sm sm:text-2xl lg:text-4xl shrink-0">
                    {item.unit}
                  </span>
                </div>
                {currentVal >= maxValue && (
                   <div className="flex items-center gap-2 text-blue-400 animate-pulse mt-1">
                      <AlertCircle size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Capacidade Máxima Atingida</span>
                   </div>
                )}
              </div>
              
              <div className="relative z-10 mt-auto space-y-3 sm:space-y-4">
                <div className="relative bg-slate-900 h-4 sm:h-6 lg:h-8 rounded-full overflow-hidden border-2 border-slate-800/50 shadow-inner">
                  <div 
                    className={`absolute left-0 top-0 h-full transition-all duration-1000 ${item.color} relative overflow-hidden`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between items-center px-1 sm:px-2">
                  <span className={`font-black uppercase tracking-widest text-[7px] sm:text-[10px] lg:text-xs ${percentage < 15 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                    {percentage < 15 ? '⚠ CRÍTICO' : isFull ? 'LIMITE MÁXIMO' : 'OPERACIONAL'}
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                    <span className="text-slate-600 font-black text-[7px] sm:text-[9px] uppercase tracking-widest">REAL-TIME VALIDATION</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FuelPanel;
