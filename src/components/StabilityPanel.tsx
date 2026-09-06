import React, { useMemo, useEffect, useState } from 'react';
import { StabilityData, FuelData } from '../types';
import { Compass, MoveVertical, Anchor, Gauge, Ship, Activity, AlertCircle, CheckCircle2, HelpCircle, X, BookOpen, Calculator, Droplets } from 'lucide-react';
import { formatPrecisionNumber } from './FuelPanel';

interface Props {
  data: StabilityData;
  fuelData: FuelData;
  onChange: (key: keyof StabilityData, val: number) => void;
}

const StabilityPanel: React.FC<Props> = ({ data, fuelData, onChange }) => {
  const [showCalcModal, setShowCalcModal] = useState(false);
  const meanDraft = (data.draftForward + data.draftAft) / 2;
  const trim = data.draftForward - data.draftAft; // Positivo = trim para vante
  
  // === Tabela Hidrostática Oficial NAM Atlântico (26 linhas de 5.0m a 7.5m) ===
  // Estrutura das 4 colunas:
  // [0] = (a) DE RÉ (1,0m < T < 2,0m)
  // [1] = (b) DE RÉ (T < 1,0m)
  // [2] = (c) NÍVEL
  // [3] = (d) DE PROA (T < 1,0m)
  const hydrostaticTable = useMemo(() => [
    { draft: 7.5, valores: [26118.811, 25580.9, 25086.6, 24634.0] },
    { draft: 7.4, valores: [25670.582, 25137.0, 24646.4, 24197.7] },
    { draft: 7.3, valores: [25224.438, 24695.1, 24208.2, 23763.6] },
    { draft: 7.2, valores: [24780.4, 24255.1, 23772.0, 23331.6] },
    { draft: 7.1, valores: [24338.3, 23817.1, 23337.8, 22901.8] },
    { draft: 7.0, valores: [23898.2, 23380.9, 22905.7, 22474.2] },
    { draft: 6.9, valores: [23460.1, 22946.7, 22475.8, 22048.7] },
    { draft: 6.8, valores: [23024.0, 22514.5, 22048.0, 21625.5] },
    { draft: 6.7, valores: [22589.9, 22084.4, 21622.4, 21204.4] },
    { draft: 6.6, valores: [22157.7, 21656.3, 21198.9, 20785.5] },
    { draft: 6.5, valores: [21727.4, 21230.5, 20777.6, 20368.8] },
    { draft: 6.4, valores: [21299.1, 20806.8, 20358.4, 19954.3] },
    { draft: 6.3, valores: [20873.0, 20385.2, 19941.4, 19542.2] },
    { draft: 6.2, valores: [20449.1, 19965.9, 19526.5, 19132.4] },
    { draft: 6.1, valores: [20027.3, 19548.6, 19113.8, 18725.1] },
    { draft: 6.0, valores: [19607.7, 19133.5, 18703.2, 18320.3] },
    { draft: 5.9, valores: [19190.4, 18720.6, 18294.9, 17918.4] },
    { draft: 5.8, valores: [18775.2, 18309.8, 17888.9, 17519.4] },
    { draft: 5.7, valores: [18362.2, 17901.3, 17485.2, 17123.4] },
    { draft: 5.6, valores: [17951.5, 17494.9, 17084.0, 16730.4] },
    { draft: 5.5, valores: [17542.9, 17090.8, 16685.3, 16340.4] },
    { draft: 5.4, valores: [17136.6, 16689.0, 16289.3, 15953.3] },
    { draft: 5.3, valores: [16732.5, 16289.5, 15896.1, 15569.2] },
    { draft: 5.2, valores: [16330.7, 15892.4, 15506.0, 15188.1] },
    { draft: 5.1, valores: [15931.2, 15497.8, 15119.1, 14809.8] },
    { draft: 5.0, valores: [15534.0, 15105.7, 14735.3, 14434.4] },
  ], []);

  // Condição do navio: Carregado vs. Leve
  const [operationalCondition, setOperationalCondition] = useState<'AUTO' | 'CARREGADO' | 'LEVE'>('AUTO');

  // === Função para determinar quais colunas usar baseado na Papeleta Oficial ===
  // (c) é SEMPRE a coluna NÍVEL (índice 2)
  // (k) é a coluna de trim correspondente:
  // - Trim de Ré e 1.0m <= |w| < 2.0m -> Coluna (a) [índice 0] (1,0m <= T < 2,0m)
  // - Trim de Ré e |w| < 1.0m -> Coluna (b) [índice 1] (T < 1,0m)
  // - Trim de Proa e |w| <= 1.0m (ou >0) -> Coluna (d) [índice 3]
  // - Nível (w = 0) -> Coluna (c) [índice 2]
  const getColumnsForTrim = (trimVal: number): { C_index: number; K_index: number; trimCase: string } => {
    const C_index = 2; // (c) NÍVEL é SEMPRE a coluna de índice 2
    const trimAbs = Math.abs(trimVal);

    if (Math.abs(trimVal) < 0.001) {
      return { C_index: 2, K_index: 2, trimCase: 'Nível / Compassado (w = 0)' };
    }

    if (trimVal < 0) {
      // Trim de Ré (x - y < 0)
      // Quando trim = 1.0m (ou >= 1.0m), considera a 1ª coluna [Coluna a]: 1,0m <= T < 2,0m
      if (trimAbs >= 0.9999) {
        return { C_index: 2, K_index: 0, trimCase: 'De Ré: 1,0m ≤ T < 2,0m [Coluna a]' };
      } else {
        return { C_index: 2, K_index: 1, trimCase: 'De Ré: T < 1,0m [Coluna b]' };
      }
    } else {
      // Trim de Proa / Vante (x - y > 0)
      return { C_index: 2, K_index: 3, trimCase: 'De Proa: T < 1,0m [Coluna d]' };
    }
  };

  // === Lógica Hidrostática Oficial NAM ATLÂNTICO (1ª, 2ª e 3ª Etapa) ===
  const hydrostatics = useMemo(() => {
    if (meanDraft <= 0) {
      return { 
        displacement: 21500, 
        gm: 2.3, 
        km: 8.0,
        trimCorrection: 0,
        baseDisplacement: 21500,
        K_value: 21500,
        C_value: 21500,
        r_value: 0,
        s_value: 0,
        t_value: 21500,
        u_value: 21490,
        v_value: 2.703,
        conditionName: 'Carregado',
        C_index: 2,
        K_index: 1,
        trimCase: 'De Ré: T < 1,0m'
      };
    }

    // 1ª ETAPA:
    // x = Calado AV
    // y = Calado AR
    // z = Calado Médio = (x + y) / 2
    // w = TRIM = x - y
    const x = data.draftForward;
    const y = data.draftAft;
    const z = meanDraft;
    const w = trim; // x - y

    // 2ª ETAPA: Determinar índices das colunas na tabela hidrostática
    const { C_index, K_index, trimCase } = getColumnsForTrim(w);

    // Interpolação linear na tabela hidrostática para Calado Médio (z)
    const sortedTable = [...hydrostaticTable].sort((a, b) => a.draft - b.draft);
    let lower = sortedTable[0];
    let upper = sortedTable[sortedTable.length - 1];

    if (z <= lower.draft) {
      lower = sortedTable[0];
      upper = sortedTable[0];
    } else if (z >= upper.draft) {
      lower = sortedTable[sortedTable.length - 1];
      upper = sortedTable[sortedTable.length - 1];
    } else {
      for (let i = 0; i < sortedTable.length - 1; i++) {
        if (sortedTable[i].draft <= z && sortedTable[i + 1].draft >= z) {
          lower = sortedTable[i];
          upper = sortedTable[i + 1];
          break;
        }
      }
    }

    const factor = lower.draft === upper.draft ? 0 : (z - lower.draft) / (upper.draft - lower.draft);

    // c = NÍVEL (coluna índice 2)
    const c = lower.valores[C_index] + (upper.valores[C_index] - lower.valores[C_index]) * factor;

    // k = TRIM DESL. (coluna correspondente a, b, ou d)
    const k = lower.valores[K_index] + (upper.valores[K_index] - lower.valores[K_index]) * factor;

    // 3ª ETAPA:
    // 1º Cálculo: r = c - k
    const r = c - k;

    // 2º Cálculo: s = r * w (utiliza o sinal de w)
    const s = r * w;

    // DESLOCAMENTO: t = c + s
    const t = c + s;

    // Definição da condição (Carregado vs. Leve):
    // Carregado: u = 21.490 t, v = 2,703
    // Leve:      u = 17.718 t, v = 2,561
    let isLoaded = true;
    if (operationalCondition === 'CARREGADO') {
      isLoaded = true;
    } else if (operationalCondition === 'LEVE') {
      isLoaded = false;
    } else {
      // AUTO
      isLoaded = t >= 19500;
    }

    const u = isLoaded ? 21490 : 17718;
    const v = isLoaded ? 2.703 : 2.561;

    // GM CALCULADO: p = (v * t) / u
    const p = (v * t) / u;

    // KM aproximado
    const km = 14.45 - (z * 0.1);

    return { 
      displacement: Math.max(0, t),
      gm: Math.max(0, p),
      km: Math.max(0, km),
      trimCorrection: s,
      baseDisplacement: c,
      K_value: k,
      C_value: c,
      r_value: r,
      s_value: s,
      t_value: t,
      u_value: u,
      v_value: v,
      conditionName: isLoaded ? 'Carregado' : 'Leve',
      C_index,
      K_index,
      trimCase
    };
  }, [meanDraft, trim, data.draftForward, data.draftAft, hydrostaticTable, operationalCondition]);

  // === ATUALIZAR O GM E DESLOCAMENTO ===
  useEffect(() => {
    if (Math.abs(hydrostatics.gm - data.gm) > 0.001) {
      onChange('gm', hydrostatics.gm);
    }
    if (Math.abs(hydrostatics.displacement - data.displacement) > 0.001) {
      onChange('displacement', hydrostatics.displacement);
    }
  }, [hydrostatics.gm, hydrostatics.displacement, data.gm, data.displacement, onChange]);

  const displayDisplacement = hydrostatics.displacement;

  // === Lógica de Status do Trim e Atitude Geral ===
  let statusLabel = "";
  let statusColor = "";
  
  if (Math.abs(data.draftForward - data.draftAft) < 0.01) {
    if (data.heel === 0) {
      statusLabel = "A CENTRO";
      statusColor = "bg-green-600 border-white text-white shadow-lg";
    } else {
      statusLabel = "COMPASSADO";
      statusColor = "bg-slate-800 border-slate-700 text-slate-400";
    }
  } else if (data.draftForward > data.draftAft) {
    statusLabel = "⚠ ABICADO";
    statusColor = "bg-blue-600 border-white text-white animate-pulse";
  } else {
    statusLabel = "⚠ DERRABADO";
    statusColor = "bg-amber-500 border-black text-black";
  }

  const scale = 15;
  const waterLineY = 130;
  const keelPosInSvg = 180;
  const verticalOffset = (waterLineY + (meanDraft * scale)) - keelPosInSvg;

  const distBetweenAxes = 400;
  const rotationRad = Math.atan((trim * scale) / distBetweenAxes);
  const rotationDeg = (rotationRad * 180) / Math.PI;

  const handleBBChange = (val: number) => {
    onChange('heel', val === 0 ? 0 : -Math.abs(val));
  };

  const handleBEChange = (val: number) => {
    onChange('heel', val === 0 ? 0 : Math.abs(val));
  };

  const getGMStatus = () => {
    if (hydrostatics.gm <= 0) return { label: 'PERIGO CRÍTICO', color: 'text-red-500', icon: <AlertCircle size={14} /> };
    if (hydrostatics.gm < 1.0) return { label: 'ESTABILIDADE REDUZIDA', color: 'text-amber-500', icon: <AlertCircle size={14} /> };
    return { label: 'ESTÁVEL', color: 'text-green-500', icon: <CheckCircle2 size={14} /> };
  };
  
  const gmStatus = getGMStatus();

  const heelStatus = useMemo(() => {
    if (data.heel === 0) return { label: 'A PRUMO', color: 'text-green-400', icon: <CheckCircle2 size={14} /> };
    return { 
      label: data.heel > 0 ? 'ADERNADO PARA BORESTE (BE)' : 'ADERNADO PARA BOMBORDO (BB)', 
      color: 'text-amber-400',
      icon: <AlertCircle size={14} /> 
    };
  }, [data.heel]);

  const renderInput = (label: string, value: number, onValChange: (v: number) => void, unit: string, icon: React.ReactNode, step = "0.1", readOnly = false) => (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-inner transition-all hover:bg-slate-800/60 group">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 rounded-lg sm:rounded-xl text-blue-400 p-2 sm:p-2.5 border border-slate-800 group-hover:scale-110 transition-transform shrink-0">
            {icon}
          </div>
          <span className="font-black text-slate-300 uppercase tracking-widest text-[9px] sm:text-[11px] leading-tight">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {readOnly ? (
            <span className="bg-transparent text-right font-black text-white text-lg sm:text-2xl w-16 sm:w-24">
              {label === 'GM' ? value.toFixed(4) : value.toFixed(2)}
            </span>
          ) : (
            <input
              type="number"
              step={step}
              value={value}
              onChange={(e) => onValChange(parseFloat(e.target.value) || 0)}
              className="bg-transparent text-right font-black text-white text-lg sm:text-2xl w-16 sm:w-24 focus:outline-none focus:text-blue-400 transition-colors"
            />
          )}
          <span className="text-slate-500 font-black uppercase text-[10px] sm:text-xs">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[1.5rem] sm:rounded-2xl lg:rounded-[3rem] p-5 sm:p-6 lg:p-10 flex flex-col gap-6 sm:gap-10 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-8 border-b border-slate-800/60 pb-6 sm:pb-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="p-3 sm:p-5 bg-blue-600 rounded-xl sm:rounded-[1.5rem] shadow-xl">
            <Compass className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase text-2xl sm:text-4xl lg:text-5xl tracking-tighter">Estabilidade</h3>
            <p className="text-slate-500 font-black text-[9px] sm:text-xs uppercase tracking-widest">A140 NAM ATLÂNTICO</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="bg-blue-600/10 border-2 border-blue-500/20 rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-4 text-center">
            <p className="font-black text-blue-400 uppercase text-[8px] sm:text-[10px] mb-1 tracking-widest">CALADO MÉDIO</p>
            <p className="font-black text-white text-xl sm:text-3xl lg:text-4xl">{meanDraft.toFixed(2)}m</p>
          </div>
          <div className="bg-indigo-600/10 border-2 border-indigo-500/20 rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-4 text-center">
            <p className="font-black text-indigo-400 uppercase text-[8px] sm:text-[10px] mb-1 tracking-widest">DESLOCAMENTO</p>
            <p className="font-black text-white text-xl sm:text-3xl lg:text-4xl">{formatPrecisionNumber(displayDisplacement, 3)} t</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-slate-950/50 border-2 border-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col items-center min-h-[480px] sm:min-h-[580px] relative overflow-hidden">
          <div className="w-full flex justify-between items-center mb-4 relative z-50">
            <span className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Ship size={14} /> Status do Trim
            </span>
            <div className={`px-3 py-1 sm:px-5 sm:py-2 rounded-lg text-[8px] sm:text-[11px] font-black uppercase border-2 transition-colors ${statusColor}`}>
              {statusLabel}
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden">
            <svg viewBox="0 0 500 250" className="w-full h-auto drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)] overflow-visible">
              <defs>
                <linearGradient id="shipGray" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="oceanBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <rect x="-50" y={waterLineY} width="600" height="200" fill="url(#oceanBlue)" />
              <line x1="-50" y1={waterLineY} x2="550" y2={waterLineY} stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              <g 
                className="transition-all duration-1000 ease-in-out"
                style={{ transform: `translateY(${verticalOffset}px) rotate(${rotationDeg}deg)`, transformOrigin: '250px 140px' }}
              >
                <path d="M15,40 L485,40 L485,95 L15,95 Z" fill="url(#shipGray)" stroke="#1e293b" strokeWidth="1" />
                <path d="M15,95 L485,95 L460,180 L40,180 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1.5" />
                <rect x="310" y="5" width="85" height="35" fill="#334155" />
                <rect x="330" y="-15" width="12" height="20" fill="#0f172a" />
                <rect x="360" y="-25" width="8" height="30" fill="#0f172a" />
                <text x="55" y="195" fontSize="10" fontWeight="900" fill="#475569" textAnchor="middle" className="uppercase tracking-widest">Popa (AR)</text>
                <text x="445" y="195" fontSize="10" fontWeight="900" fill="#475569" textAnchor="middle" className="uppercase tracking-widest">Proa (AV)</text>
                <text x="250" y="145" fontSize="14" fontWeight="900" fill="white" opacity="0.1" textAnchor="middle" className="uppercase tracking-[1.2em]">A140</text>
              </g>
            </svg>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mt-4 sm:mt-12 relative z-50">
            <div className={`text-center p-3 rounded-xl border bg-slate-900/95 shadow-xl transition-all ${data.draftAft > data.draftForward ? 'border-amber-500 ring-4 ring-amber-500/20' : 'border-slate-700'}`}>
              <p className="text-xl sm:text-4xl font-black text-white tracking-tighter">{data.draftAft.toFixed(2)}m</p>
              <p className="text-[8px] font-black uppercase text-slate-500 mt-1">Calado Popa (AR)</p>
            </div>
            <div className={`text-center p-3 rounded-xl border bg-slate-900/95 shadow-xl transition-all ${data.draftForward > data.draftAft ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-700'}`}>
              <p className="text-xl sm:text-4xl font-black text-white tracking-tighter">{data.draftForward.toFixed(2)}m</p>
              <p className="text-[8px] font-black uppercase text-slate-500 mt-1">Calado Proa (AV)</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/50 border-2 border-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col items-center min-h-[480px] sm:min-h-[580px]">
          <div className="w-full flex justify-between items-center mb-4 sm:mb-8">
            <span className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Status da Banda
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="relative w-48 h-48 sm:w-72 sm:h-72 border-4 border-slate-900 rounded-full flex items-center justify-center bg-slate-950/50 shadow-inner">
              <div className="absolute top-0 w-1 sm:w-1.5 h-8 bg-red-600 rounded-full -translate-y-1/2 z-20" />
              <div 
                className="w-32 h-12 sm:w-56 sm:h-20 transition-transform duration-1000 ease-out relative"
                style={{ transform: `rotate(${data.heel}deg)` }}
              >
                <div className="absolute bottom-0 left-0 w-full h-8 sm:h-12 bg-slate-800 rounded-b-[1.5rem] border-b-[6px] border-blue-600" />
                <div className="absolute top-0 left-0 w-full h-5 sm:h-8 bg-slate-700 rounded-t-sm shadow-xl" />
              </div>
              <div className="absolute -bottom-4 bg-slate-900 border border-blue-500/40 px-4 py-2 rounded-xl shadow-2xl">
                <span className="text-2xl sm:text-5xl font-black text-white tracking-tighter">{Math.abs(data.heel).toFixed(1)}°</span>
                <span className="text-[10px] font-black text-blue-400 ml-2 uppercase">
                  {data.heel > 0 ? 'BE' : data.heel < 0 ? 'BB' : 'Centro'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">A140:</span>
              <div className="flex items-center gap-2">
                {heelStatus.icon}
                <span className={`text-sm lg:text-lg font-black ${heelStatus.color} tracking-tight`}>
                  {heelStatus.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {renderInput("Calado AV", data.draftForward, (v) => onChange('draftForward', v), "m", <MoveVertical size={18} />)}
        {renderInput("Calado AR", data.draftAft, (v) => onChange('draftAft', v), "m", <MoveVertical size={18} />)}
        
        {renderInput("GM", hydrostatics.gm, (v) => onChange('gm', v), "m", <Anchor size={18} />, "0.1", true)}

        {renderInput("Banda BB", data.heel < 0 ? Math.abs(data.heel) : 0, handleBBChange, "°", <Activity size={18} />)}
        {renderInput("Banda BE", data.heel > 0 ? Math.abs(data.heel) : 0, handleBEChange, "°", <Activity size={18} />)}

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 sm:p-5 shadow-inner transition-all hover:bg-slate-800/60 group">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 rounded-lg text-blue-400 p-2 border border-slate-800 group-hover:scale-110 transition-transform shrink-0">
                <Gauge size={18} />
              </div>
              <span className="font-black text-slate-300 uppercase tracking-widest text-[9px] sm:text-[11px] leading-tight">Deslocamento</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-lg sm:text-2xl">
                {formatPrecisionNumber(displayDisplacement, 3)}
              </span>
              <span className="text-slate-500 font-black uppercase text-[10px]">t</span>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de status com informações detalhadas e Etapas Oficiais da Marinha */}
      <div className="mt-4 p-5 bg-slate-800/40 rounded-2xl border border-slate-700/60 shadow-inner">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-3">
              {gmStatus.icon}
              <span className={`font-black uppercase text-sm ${gmStatus.color}`}>
                {gmStatus.label}
              </span>
            </div>

            {/* Seletor de Condição Operacional */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/80">
              <span className="text-[10px] font-black uppercase text-slate-400 px-2">Condição:</span>
              <button
                onClick={() => setOperationalCondition('AUTO')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  operationalCondition === 'AUTO' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Auto ({hydrostatics.conditionName})
              </button>
              <button
                onClick={() => setOperationalCondition('CARREGADO')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  operationalCondition === 'CARREGADO' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Carregado
              </button>
              <button
                onClick={() => setOperationalCondition('LEVE')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  operationalCondition === 'LEVE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Leve
              </button>
            </div>

            <div className="text-right">
              <span className="text-white font-mono font-bold text-sm bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
                GM: {hydrostatics.gm.toFixed(4)} m
              </span>
            </div>
          </div>
          
          {/* 3 Etapas Oficiais da Papeleta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* 1ª Etapa */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-blue-400 font-black uppercase text-[10px] tracking-wider mb-1 flex items-center justify-between">
                <span>1ª ETAPA</span>
                <span className="text-slate-500">Inputs & Médias</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>AV (x) / AR (y):</span>
                <span className="font-bold text-white">{data.draftForward.toFixed(2)}m / {data.draftAft.toFixed(2)}m</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>Calado Médio (z):</span>
                <span className="font-bold text-blue-400">{meanDraft.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>Trim (w = x - y):</span>
                <span className={`font-bold ${trim < 0 ? 'text-amber-400' : trim > 0 ? 'text-blue-400' : 'text-green-400'}`}>
                  {trim.toFixed(2)} m ({trim < 0 ? 'Ré' : trim > 0 ? 'Vante' : 'Nível'})
                </span>
              </div>
              <div className="flex justify-between text-slate-400 font-mono text-[10px] pt-1 border-t border-slate-800">
                <span>u (Desl. Cond):</span>
                <span className="text-slate-200">{hydrostatics.u_value.toLocaleString()} t</span>
              </div>
              <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                <span>v (GMf Cond):</span>
                <span className="text-slate-200">{hydrostatics.v_value.toFixed(3)}</span>
              </div>
            </div>

            {/* 2ª Etapa */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-indigo-400 font-black uppercase text-[10px] tracking-wider mb-1 flex items-center justify-between">
                <span>2ª ETAPA</span>
                <span className="text-slate-500">Tabela Hidrostática</span>
              </div>
              <div className="text-slate-400 text-[10px] truncate" title={hydrostatics.trimCase}>
                Coluna: <strong className="text-amber-300">{hydrostatics.trimCase}</strong>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px] pt-1">
                <span>c (Nível):</span>
                <span className="font-bold text-white">{hydrostatics.C_value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>k (Trim Desl):</span>
                <span className="font-bold text-indigo-400">{hydrostatics.K_value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px] pt-1 border-t border-slate-800">
                <span>1º Cálc (r = c - k):</span>
                <span className="font-bold text-amber-400">{hydrostatics.r_value.toFixed(1)} t</span>
              </div>
            </div>

            {/* 3ª Etapa */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-emerald-400 font-black uppercase text-[10px] tracking-wider mb-1 flex items-center justify-between">
                <span>3ª ETAPA</span>
                <span className="text-slate-500">Resultados Finais</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>2º Cálc (s = r × w):</span>
                <span className="font-bold text-emerald-400">
                  {hydrostatics.s_value >= 0 ? '+' : ''}{hydrostatics.s_value.toFixed(2)} t
                </span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>Desloc. (t = c + s):</span>
                <span className="font-bold text-white text-xs">
                  {formatPrecisionNumber(hydrostatics.t_value, 3)} t
                </span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px] pt-1 border-t border-slate-800">
                <span>GM (p = v × t / u):</span>
                <span className="font-bold text-emerald-300 text-xs">{hydrostatics.gm.toFixed(4)} m</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                p = ({hydrostatics.v_value.toFixed(3)} × {formatPrecisionNumber(hydrostatics.t_value, 3)}) / {hydrostatics.u_value}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-slate-400 border-t border-slate-700/60 pt-2 flex flex-wrap justify-between items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">
              Fórmulas oficiais calibradas para o <strong className="text-slate-200">NAM Atlântico (A140)</strong>
            </span>
            <button
              onClick={() => setShowCalcModal(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-black uppercase hover:underline flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700"
            >
              <BookOpen size={14} /> Abrir Papeleta & Tabela Hidrostática
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Explicação Completa dos Cálculos e Papeleta Oficial */}
      {showCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Botão Fechar */}
            <button
              onClick={() => setShowCalcModal(false)}
              className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shrink-0">
                <Calculator size={28} />
              </div>
              <div>
                <h3 className="font-black text-white uppercase text-xl sm:text-2xl tracking-tight">
                  Papeleta e Memória de Cálculo de Estabilidade
                </h3>
                <p className="text-blue-400 font-bold text-xs uppercase tracking-wider">
                  NAM ATLÂNTICO (A140) — Padrão Oficial da Marinha do Brasil
                </p>
              </div>
            </div>

            {/* Papeleta Oficial Formatada */}
            <div className="space-y-6 text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
              
              {/* Box da Papeleta */}
              <div className="bg-slate-950 border-2 border-blue-500/30 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm font-black uppercase text-blue-400">PAPELETA DE ESTABILIDADE — NAM ATLÂNTICO</span>
                  <span className="text-xs font-mono text-slate-400">Condição: <strong className="text-white">{hydrostatics.conditionName}</strong></span>
                </div>

                {/* 1ª ETAPA */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-800/80 px-3 py-1.5 text-[11px] font-black uppercase text-slate-300 text-center">
                    1ª ETAPA
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-slate-800 text-center font-mono text-xs">
                    <div className="p-2">
                      <div className="text-[10px] text-slate-400">CALADO AV (x)</div>
                      <div className="font-bold text-white text-sm mt-1">{data.draftForward.toFixed(2)}m</div>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] text-slate-400">CALADO AR (y)</div>
                      <div className="font-bold text-white text-sm mt-1">{data.draftAft.toFixed(2)}m</div>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] text-slate-400">CALADO MÉDIO (z)</div>
                      <div className="font-bold text-blue-400 text-sm mt-1">{meanDraft.toFixed(2)}m</div>
                      <div className="text-[9px] text-slate-500">(x+y)/2</div>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] text-slate-400">TRIM (w)</div>
                      <div className="font-bold text-amber-400 text-sm mt-1">{trim.toFixed(2)}m</div>
                      <div className="text-[9px] text-slate-500">{trim < 0 ? 'para ré' : trim > 0 ? 'para vante' : 'nível'}</div>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] text-slate-400">DESL. CONDICIONAL (u)</div>
                      <div className="font-bold text-white text-sm mt-1">{hydrostatics.u_value.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500">t</div>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] text-slate-400">GMf CONDICIONAL (v)</div>
                      <div className="font-bold text-white text-sm mt-1">{hydrostatics.v_value.toFixed(3)}</div>
                    </div>
                  </div>
                </div>

                {/* 2ª ETAPA */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-800/80 px-3 py-1.5 text-[11px] font-black uppercase text-slate-300 text-center">
                    2ª ETAPA — TABELA HIDROSTÁTICA (Interpolação em Calado Médio z = {meanDraft.toFixed(2)}m)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800 text-center font-mono text-xs">
                    <div className={`p-2 ${hydrostatics.K_index === 0 ? 'bg-blue-950/40 ring-2 ring-blue-500/40' : ''}`}>
                      <div className="text-[10px] text-slate-400">DE RÉ 1,0m ≤ T &lt; 2,0m (a)</div>
                      <div className="font-bold text-white text-sm mt-1">
                        {hydrostatics.K_index === 0 ? `(k) = ${hydrostatics.K_value.toFixed(1)}` : '—'}
                      </div>
                    </div>
                    <div className={`p-2 ${hydrostatics.K_index === 1 ? 'bg-blue-950/40 ring-2 ring-blue-500/40' : ''}`}>
                      <div className="text-[10px] text-slate-400">DE RÉ T &lt; 1,0m (b)</div>
                      <div className="font-bold text-white text-sm mt-1">
                        {hydrostatics.K_index === 1 ? `(k) = ${hydrostatics.K_value.toFixed(1)}` : '—'}
                      </div>
                    </div>
                    <div className="p-2 bg-indigo-950/40 ring-2 ring-indigo-500/40">
                      <div className="text-[10px] text-slate-400">NÍVEL (c)</div>
                      <div className="font-bold text-indigo-300 text-sm mt-1">
                        (c) = {hydrostatics.C_value.toFixed(1)}
                      </div>
                    </div>
                    <div className={`p-2 ${hydrostatics.K_index === 3 ? 'bg-blue-950/40 ring-2 ring-blue-500/40' : ''}`}>
                      <div className="text-[10px] text-slate-400">DE PROA T &lt; 1,0m (d)</div>
                      <div className="font-bold text-white text-sm mt-1">
                        {hydrostatics.K_index === 3 ? `(k) = ${hydrostatics.K_value.toFixed(1)}` : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3ª ETAPA */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-800/80 px-3 py-1.5 text-[11px] font-black uppercase text-slate-300 text-center">
                    3ª ETAPA — EQUAÇÕES & RESULTADO
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800 text-center font-mono text-xs">
                    <div className="p-2">
                      <div className="text-[10px] text-slate-400">1º CÁLCULO (r = c - k)</div>
                      <div className="font-bold text-amber-400 text-sm mt-1">{hydrostatics.r_value.toFixed(1)}</div>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] text-slate-400">2º CÁLCULO (s = r × w)</div>
                      <div className="font-bold text-emerald-400 text-sm mt-1">{hydrostatics.s_value.toFixed(2)}</div>
                    </div>
                    <div className="p-2 bg-emerald-950/20">
                      <div className="text-[10px] text-slate-400">DESLOCAMENTO (t = c + s)</div>
                      <div className="font-bold text-white text-sm mt-1">{formatPrecisionNumber(hydrostatics.t_value, 3)} t</div>
                    </div>
                    <div className="p-2 bg-blue-950/30">
                      <div className="text-[10px] text-slate-400">GM (p = (v × t) / u)</div>
                      <div className="font-bold text-blue-300 text-sm mt-1">{hydrostatics.gm.toFixed(4)} m</div>
                    </div>
                  </div>
                </div>

                {/* Resumo Papeleta */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
                  <div className="text-blue-400 font-bold uppercase text-[11px]">Resumo para Preenchimento da Papeleta:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-300">
                    <div>• Calado Vante: <strong className="text-white">{data.draftForward.toFixed(2)}m</strong></div>
                    <div>• Calado Ré: <strong className="text-white">{data.draftAft.toFixed(2)}m</strong></div>
                    <div>• Calado Médio: <strong className="text-white">{meanDraft.toFixed(2)}m</strong></div>
                    <div>• Trim: <strong className="text-amber-400">{Math.abs(trim).toFixed(2)}m {trim < 0 ? 'para ré' : trim > 0 ? 'para vante' : 'a nível'}</strong></div>
                    <div>• Deslocamento: <strong className="text-emerald-400">{formatPrecisionNumber(hydrostatics.t_value, 3)} t</strong></div>
                    <div>• GM: <strong className="text-blue-300">{hydrostatics.gm.toFixed(4)} m</strong></div>
                    <div>• Grau de Banda: <strong className="text-white">{Math.abs(data.heel).toFixed(1)}° {data.heel > 0 ? 'BE' : data.heel < 0 ? 'BB' : 'Centro'}</strong></div>
                    <div>• Status: <strong className={gmStatus.color}>{gmStatus.label}</strong></div>
                  </div>
                </div>
              </div>

              {/* Tabela Hidrostática Completa para Consulta */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase text-indigo-400 flex items-center gap-2">
                    <BookOpen size={16} /> Tabela Hidrostática Completa (5.0m a 7.5m)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">26 Linhas de Calado</span>
                </div>
                <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="p-2">CM (m)</th>
                        <th className="p-2">DE RÉ (1.0 ≤ T &lt; 2.0)</th>
                        <th className="p-2">DE RÉ (T &lt; 1.0)</th>
                        <th className="p-2 text-indigo-400">NÍVEL</th>
                        <th className="p-2">DE PROA (T &lt; 1.0)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {hydrostaticTable.map((row) => {
                        const isCurrentRow = Math.abs(row.draft - meanDraft) < 0.05;
                        return (
                          <tr key={row.draft} className={isCurrentRow ? 'bg-blue-600/20 font-bold text-white' : 'hover:bg-slate-900/50'}>
                            <td className="p-2 font-bold text-blue-400">{row.draft.toFixed(1)}</td>
                            <td className="p-2">{row.valores[0].toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}</td>
                            <td className="p-2">{row.valores[1].toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                            <td className="p-2 text-indigo-300 font-bold">{row.valores[2].toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                            <td className="p-2">{row.valores[3].toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Rodapé do Modal */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowCalcModal(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase rounded-xl transition-all shadow-lg"
              >
                Entendido / Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StabilityPanel;
