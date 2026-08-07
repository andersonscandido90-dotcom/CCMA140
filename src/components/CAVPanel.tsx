import React from 'react';
import { ShieldAlert, Info, Waves, Lock } from 'lucide-react';

const SewageValveIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="10" r="8" /><path d="M12 2v16" /><path d="M4 10h16" /><circle cx="12" cy="10" r="2" fill="currentColor" /><path d="M2 20c1 1 2 0 3-1 2-2 3 0 5 0s3 2 5 2 3-2 5-2c1 0 2 1 3 1" />
  </svg>
);

interface Eductor {
  capacity: number;
  deck: number;
  side?: 'BB' | 'BE';
}

interface SectionData {
  section: string;
  eductors: Eductor[];
  sewageVia?: string; // Novo campo solicitado
}

const SECTIONS: SectionData[] = [
  { section: 'C', eductors: [], sewageVia: 'Seção D' },
  { section: 'D', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'F', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'G', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'H', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'J', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'K', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'L', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'M', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'N', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'P', eductors: [], sewageVia: 'Seção N' },
  { section: 'Q', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'R', eductors: [], sewageVia: 'Seção Q' },
  { section: 'S', eductors: [], sewageVia: 'Não possui equipamento de esgoto fixo' },
  { section: 'T', eductors: [{ capacity: 15, deck: 7 }] },
];

interface Props {
  eductorStatuses: Record<string, boolean>;
  onStatusToggle: (id: string) => void;
  readOnly?: boolean;
}

const CAVPanel: React.FC<Props> = ({ eductorStatuses, onStatusToggle, readOnly }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[1.5rem] sm:rounded-[3rem] p-6 lg:p-12 backdrop-blur-md relative animate-in fade-in duration-500">
      {readOnly && <div className="absolute top-4 right-10 flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase bg-slate-950 px-3 py-1 rounded-full border border-slate-800 z-10"><Lock size={10} /> Consulta</div>}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 border-b border-slate-800/60 pb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-red-600 rounded-2xl shadow-xl shadow-red-900/20">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase text-2xl lg:text-5xl tracking-tighter">Controle de Avarias (CAV)</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] lg:text-sm tracking-widest mt-1">Esgoto por Arrastamento (Edutores)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
        {SECTIONS.map((item) => (
          <div 
            key={item.section}
            className={`relative p-8 lg:p-10 rounded-[2.5rem] border-2 transition-all duration-300 group ${
              item.eductors.length > 0 
                ? 'bg-slate-950 border-slate-800 hover:border-blue-500/40' 
                : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="flex justify-between items-start mb-10">
              <div className="flex flex-col">
                <span className="text-7xl lg:text-9xl font-black text-white leading-none tracking-tighter">
                  {item.section}
                </span>
                <span className="text-[14px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">SEÇÃO</span>
              </div>
              {item.eductors.length > 0 && <SewageValveIcon className="text-blue-500" size={48} />}
            </div>

            <div className="space-y-4">
              {item.eductors.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {item.eductors.map((ed, idx) => {
                    const eductorId = `${item.section}-${idx}`;
                    const isAvailable = eductorStatuses[eductorId] !== false;
                    return (
                      <button 
                        key={idx} 
                        disabled={readOnly}
                        onClick={() => !readOnly && onStatusToggle(eductorId)}
                        className={`flex items-center justify-between border-2 p-6 rounded-2xl transition-all ${!readOnly ? 'active:scale-95' : 'cursor-default'} ${
                          isAvailable 
                            ? 'bg-blue-600/5 border-blue-500/20 hover:border-blue-500/40' 
                            : 'bg-red-600/10 border-red-500/40'
                        }`}
                      >
                        <div className="flex flex-col text-left gap-1">
                          <span className={`text-[11px] lg:text-[13px] font-black uppercase tracking-wider ${isAvailable ? 'text-blue-400/80' : 'text-red-400/80'}`}>
                            {ed.capacity} ton/h — Deck {ed.deck}
                          </span>
                          <span className={`text-xl lg:text-3xl font-black uppercase tracking-widest leading-none ${isAvailable ? 'text-white' : 'text-red-500'}`}>
                            {isAvailable ? 'PRONTO' : 'AVARIADO'}
                          </span>
                        </div>
                        <SewageValveIcon size={24} className={isAvailable ? 'text-blue-400' : 'text-red-400'} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center bg-blue-600/5 rounded-2xl border border-dashed border-blue-500/20 min-h-[140px] animate-in fade-in zoom-in duration-700">
                  <Waves className="text-blue-500/40 mb-3" size={32} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Esgoto Realizado Via:</span>
                  <span className="text-md font-black text-blue-400 uppercase tracking-tighter leading-tight drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">
                    {item.sewageVia || 'Compartimento Adjacente'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CAVPanel;
