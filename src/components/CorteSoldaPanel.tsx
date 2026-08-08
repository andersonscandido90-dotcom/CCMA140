import React from 'react';
import { Flame, Plus, Trash2, UserCheck, ShieldAlert, Wrench, Building2, CheckSquare, Square, UserPlus, Lock } from 'lucide-react';
import { CorteSoldaEntry } from '../types';

interface Props {
  list: CorteSoldaEntry[];
  onChange: (newList: CorteSoldaEntry[]) => void;
  readOnly?: boolean;
}

const CorteSoldaPanel: React.FC<Props> = ({ list = [], onChange, readOnly = false }) => {
  const handleAddEntry = () => {
    const newEntry: CorteSoldaEntry = {
      id: Math.random().toString(36).substring(2, 9),
      compartimento: '',
      soldador: '',
      ompsEmpresa: '',
      servicos: {
        corte: false,
        solda: false,
        aquecimento: false
      },
      fireBoys: ['']
    };
    onChange([...list, newEntry]);
  };

  const handleRemoveEntry = (id: string) => {
    onChange(list.filter(item => item.id !== id));
  };

  const handleUpdateEntry = (id: string, updates: Partial<CorteSoldaEntry>) => {
    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    onChange(updated);
  };

  const handleToggleServico = (id: string, key: 'corte' | 'solda' | 'aquecimento') => {
    const entry = list.find(item => item.id === id);
    if (!entry) return;
    handleUpdateEntry(id, {
      servicos: {
        ...entry.servicos,
        [key]: !entry.servicos[key]
      }
    });
  };

  const handleAddFireBoy = (id: string) => {
    const entry = list.find(item => item.id === id);
    if (!entry) return;
    handleUpdateEntry(id, {
      fireBoys: [...entry.fireBoys, '']
    });
  };

  const handleUpdateFireBoy = (id: string, index: number, value: string) => {
    const entry = list.find(item => item.id === id);
    if (!entry) return;
    const newFireBoys = [...entry.fireBoys];
    newFireBoys[index] = value;
    handleUpdateEntry(id, { fireBoys: newFireBoys });
  };

  const handleRemoveFireBoy = (id: string, index: number) => {
    const entry = list.find(item => item.id === id);
    if (!entry) return;
    const newFireBoys = entry.fireBoys.filter((_, idx) => idx !== index);
    handleUpdateEntry(id, { fireBoys: newFireBoys.length > 0 ? newFireBoys : [''] });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[1.5rem] sm:rounded-[3rem] p-3.5 sm:p-8 lg:p-12 backdrop-blur-md relative animate-in fade-in duration-500">
      {readOnly && (
        <div className="absolute top-4 right-10 flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase bg-slate-950 px-3 py-1 rounded-full border border-slate-800 z-10">
          <Lock size={10} /> Consulta
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-10 border-b border-slate-800/60 pb-4 sm:pb-8">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="p-3 sm:p-4 bg-amber-600 rounded-2xl shadow-xl shadow-amber-900/20 shrink-0">
            <Flame className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase text-xl sm:text-3xl lg:text-4xl tracking-tight">
              CAV — Controle de Avarias
            </h3>
            <p className="text-amber-400 font-black uppercase text-[10px] sm:text-xs lg:text-sm tracking-widest mt-0.5 sm:mt-1">
              Registro de Trabalhos a Quente (Corte / Solda / Aquecimento)
            </p>
          </div>
        </div>

        {!readOnly && (
          <button
            onClick={handleAddEntry}
            className="w-full sm:w-auto px-5 py-3.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black uppercase text-xs rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>Adicionar Corte / Solda</span>
          </button>
        )}
      </div>

      {/* Lista de Trabalhos a Quente */}
      {list.length === 0 ? (
        <div className="p-8 sm:p-16 text-center bg-slate-950/60 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl text-slate-600">
            <Flame size={48} />
          </div>
          <p className="font-black text-slate-400 uppercase text-sm sm:text-base">
            Nenhum serviço de corte ou solda registrado no dia.
          </p>
          {!readOnly && (
            <button
              onClick={handleAddEntry}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase rounded-xl transition-all flex items-center gap-2 shadow-md"
            >
              <Plus size={16} /> Cadastrar Primeiro Trabalho a Quente
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {list.map((item, index) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 shadow-xl relative transition-all hover:border-amber-500/40"
            >
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500/20 text-amber-400 font-black text-xs px-3 py-1 rounded-full uppercase border border-amber-500/30">
                    Trabalho #{index + 1}
                  </span>
                  <h4 className="font-black text-white text-base sm:text-lg uppercase">
                    {item.compartimento ? item.compartimento : 'Novo Compartimento'}
                  </h4>
                </div>

                {!readOnly && (
                  <button
                    onClick={() => handleRemoveEntry(item.id)}
                    className="p-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl transition-all flex items-center gap-1.5 text-xs font-black uppercase border border-red-500/20"
                    title="Remover este registro"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                )}
              </div>

              {/* Campos principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {/* COMPARTIMENTO */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert size={14} className="text-amber-400" />
                    COMPARTIMENTO:
                  </label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={item.compartimento}
                    onChange={(e) => handleUpdateEntry(item.id, { compartimento: e.target.value })}
                    placeholder="Ex: Praça d'Águas C-102"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 font-mono font-bold text-sm text-white focus:border-amber-500 outline-none uppercase transition-all"
                  />
                </div>

                {/* SOLDADOR */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Wrench size={14} className="text-amber-400" />
                    SOLDADOR:
                  </label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={item.soldador}
                    onChange={(e) => handleUpdateEntry(item.id, { soldador: e.target.value })}
                    placeholder="Ex: 3SG-MO SILVA"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 font-mono font-bold text-sm text-white focus:border-amber-500 outline-none uppercase transition-all"
                  />
                </div>

                {/* OMPS / EMPRESA */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={14} className="text-amber-400" />
                    OMPS / EMPRESA:
                  </label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={item.ompsEmpresa}
                    onChange={(e) => handleUpdateEntry(item.id, { ompsEmpresa: e.target.value })}
                    placeholder="Ex: AMRJ / EMPRESA ALFA"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 font-mono font-bold text-sm text-white focus:border-amber-500 outline-none uppercase transition-all"
                  />
                </div>
              </div>

              {/* SERVIÇO A SER REALIZADO */}
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-6 mb-6">
                <span className="block text-[11px] sm:text-xs font-black text-amber-400 uppercase tracking-wider mb-3">
                  SERVIÇO A SER REALIZADO:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* CORTE */}
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && handleToggleServico(item.id, 'corte')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border font-black text-xs uppercase transition-all ${
                      item.servicos.corte
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.servicos.corte ? (
                      <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                    <span>( ) CORTE</span>
                  </button>

                  {/* SOLDA */}
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && handleToggleServico(item.id, 'solda')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border font-black text-xs uppercase transition-all ${
                      item.servicos.solda
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.servicos.solda ? (
                      <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                    <span>( ) SOLDA</span>
                  </button>

                  {/* AQUECIMENTO EM PEÇA */}
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && handleToggleServico(item.id, 'aquecimento')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border font-black text-xs uppercase transition-all ${
                      item.servicos.aquecimento
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.servicos.aquecimento ? (
                      <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                    <span>( ) AQUECIMENTO EM PEÇA</span>
                  </button>
                </div>
              </div>

              {/* FIRE-BOY */}
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] sm:text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck size={16} className="text-amber-400" />
                    FIRE-BOY (SENTINELA DE INCÊNDIO):
                  </label>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleAddFireBoy(item.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-[10px] uppercase rounded-lg border border-amber-500/30 transition-all flex items-center gap-1.5"
                    >
                      <UserPlus size={14} /> + Adicionar Fire-Boy
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {item.fireBoys.map((fb, fbIdx) => (
                    <div key={fbIdx} className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 w-6 shrink-0">
                        #{fbIdx + 1}
                      </span>
                      <input
                        type="text"
                        disabled={readOnly}
                        value={fb}
                        onChange={(e) => handleUpdateFireBoy(item.id, fbIdx, e.target.value)}
                        placeholder="NOME DO FIRE-BOY..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono font-bold text-xs sm:text-sm text-white focus:border-amber-500 outline-none uppercase transition-all"
                      />
                      {!readOnly && item.fireBoys.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFireBoy(item.id, fbIdx)}
                          className="p-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl transition-all shrink-0 border border-red-500/20"
                          title="Remover Fire-Boy"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorteSoldaPanel;
