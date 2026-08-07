import React, { useState, useMemo } from 'react';
import { Search, Monitor, Terminal, Tag, Edit3, CheckCircle2 } from 'lucide-react';
import { ISIS_DATA } from '../constants';

interface Props {
  overrides: Record<string, string>;
  onOverrideChange: (channel: string, translation: string) => void;
}

const IsisPanel: React.FC<Props> = ({ overrides, onOverrideChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return [];
    return ISIS_DATA.filter(item => 
      item.channel.includes(searchTerm) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (overrides[item.channel] || item.translation).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, overrides]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[1.5rem] lg:rounded-[3rem] p-6 lg:p-12 backdrop-blur-md animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-900/20">
            <Monitor className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase text-2xl lg:text-5xl tracking-tighter">ISIS</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] lg:text-xs tracking-widest mt-1">Dicionário e Tradução de Alarmes</p>
          </div>
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text"
            placeholder="BUSCAR CANAL OU ALARME..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 font-black uppercase text-sm text-white focus:border-cyan-500 outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-950/50 rounded-[2rem] border-2 border-dashed border-slate-800">
          <Terminal size={48} className="text-slate-700 mb-4" />
          <span className="font-black text-slate-600 uppercase tracking-widest">
            {searchTerm ? 'Nenhum resultado encontrado' : 'Digite o canal ISIS para tradução'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.map((item) => {
            const currentTranslation = overrides[item.channel] || item.translation;
            const isEdited = !!overrides[item.channel];

            return (
              <div key={item.channel} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all group">
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-cyan-600/10 border border-cyan-500/30 px-4 py-1.5 rounded-lg font-mono font-black text-cyan-400 text-lg">
                    {item.channel}
                  </span>
                  {isEdited ? (
                    <div className="flex items-center gap-1.5 text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-md">
                      <CheckCircle2 size={12} />
                      <span className="text-[8px] font-black uppercase">Editado</span>
                    </div>
                  ) : (
                    <Tag size={14} className="text-slate-600" />
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Description (En)</label>
                    <p className="font-mono text-sm text-slate-400 font-bold uppercase">{item.description}</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl focus-within:border-cyan-500/50 transition-all">
                    <label className="text-[9px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                      <Edit3 size={10} /> Tradução (Pt)
                    </label>
                    <textarea
                      value={currentTranslation}
                      onChange={(e) => onOverrideChange(item.channel, e.target.value)}
                      className="w-full bg-transparent border-none text-xs lg:text-sm text-white font-black uppercase resize-none focus:outline-none min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IsisPanel;
