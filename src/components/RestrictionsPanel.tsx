import React from 'react';
import { EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { ClipboardList, AlertCircle, Printer } from 'lucide-react';

interface Props {
  data: EquipmentData;
  reasons: Record<string, string>;
  onReasonChange: (item: string, reason: string) => void;
  onPrintSupervision?: () => void;
}

export default function RestrictionsPanel({ data, reasons, onReasonChange, onPrintSupervision }: Props) {
  const restrictedItems = Object.entries(data).filter(
    ([_, status]) => status === EquipmentStatus.RESTRICTED || status === EquipmentStatus.UNAVAILABLE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2rem] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-600/20 rounded-xl text-amber-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black uppercase text-white text-lg sm:text-xl">
                Registro de Restrições e Indisponibilidades
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Anotações e detalhes para acompanhamento dos equipamentos
              </p>
            </div>
          </div>

          {onPrintSupervision && (
            <button
              onClick={onPrintSupervision}
              className="w-full sm:w-auto px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0 border border-amber-500/30"
            >
              <Printer size={16} />
              <span>Imprimir / PDF Restrições e Anotações</span>
            </button>
          )}
        </div>

        {restrictedItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 font-medium">
            Nenhum equipamento com restrição ou indisponível no momento.
          </div>
        ) : (
          <div className="space-y-4">
            {restrictedItems.map(([item, status]) => {
              const config = STATUS_CONFIG[status];
              const reason = reasons[item] || '';

              return (
                <div key={item} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{item}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${config.bgColor} ${config.textColor}`}>
                      {config.label}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Motivo / Detalhes da Restrição:
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => onReasonChange(item, e.target.value)}
                      placeholder="Descreva o motivo da restrição ou ação em andamento..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-sm font-mono focus:border-amber-500 outline-none resize-y min-h-[80px]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
