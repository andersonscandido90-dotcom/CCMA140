import React, { useState, useMemo } from 'react';
import { EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { 
  ClipboardList, 
  AlertCircle, 
  Printer, 
  RefreshCw, 
  Check, 
  Copy, 
  RotateCcw, 
  Calendar, 
  Clock, 
  ShieldAlert,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { 
  getPreviousRestrictionInfo, 
  getRestrictionStreak 
} from '../utils/restrictionHistory';

interface Props {
  data: EquipmentData;
  reasons: Record<string, string>;
  onReasonChange: (item: string, reason: string) => void;
  onPrintSupervision?: () => void;
  currentDate?: string;
  onSyncPreviousDay?: () => void;
}

export default function RestrictionsPanel({ 
  data, 
  reasons, 
  onReasonChange, 
  onPrintSupervision,
  currentDate = new Date().toISOString().split('T')[0],
  onSyncPreviousDay
}: Props) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [justSynced, setJustSynced] = useState(false);

  // Lista todos os itens com restrição ou indisponibilidade
  const restrictedItems = useMemo(() => {
    return Object.entries(data).filter(
      ([_, status]) => status === EquipmentStatus.RESTRICTED || status === EquipmentStatus.UNAVAILABLE
    );
  }, [data]);

  // Contadores
  const countRestricted = useMemo(() => {
    return restrictedItems.filter(([_, s]) => s === EquipmentStatus.RESTRICTED).length;
  }, [restrictedItems]);

  const countUnavailable = useMemo(() => {
    return restrictedItems.filter(([_, s]) => s === EquipmentStatus.UNAVAILABLE).length;
  }, [restrictedItems]);

  // Copiar anotação individual
  const handleCopyReason = (item: string, reasonText: string) => {
    const textToCopy = `⚓ [SITUAÇÃO DO EQUIPAMENTO: ${item}]
• Status: ${data[item] === EquipmentStatus.RESTRICTED ? 'COM RESTRIÇÃO' : 'INDISPONÍVEL'}
• Detalhes / Motivo: ${reasonText || 'Sem detalhes informados.'}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  // Disparar sincronização manual com feedback visual
  const handleManualSync = () => {
    if (onSyncPreviousDay) {
      onSyncPreviousDay();
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* CABEÇALHO SIMPLIFICADO */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-600/20 border border-amber-500/30 rounded-2xl text-amber-400 shadow-inner">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black uppercase text-white text-lg sm:text-2xl tracking-tight">
                Registro de Restrições e Indisponibilidades
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                Anotações e detalhes operacionais para acompanhamento dos equipamentos
              </p>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO SUPERIORES */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {onSyncPreviousDay && (
              <button
                onClick={handleManualSync}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all border active:scale-95 cursor-pointer shadow-md ${
                  justSynced
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
                title="Carregar informações de restrição do dia anterior para equipamentos que continuam com o mesmo status"
              >
                {justSynced ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Sincronizado!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} className="text-blue-400" />
                    <span>Recarregar do Dia Anterior</span>
                  </>
                )}
              </button>
            )}

            {onPrintSupervision && (
              <button
                onClick={onPrintSupervision}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border border-amber-500/30"
              >
                <Printer size={15} />
                <span>Imprimir / PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total de Pendências
              </span>
              <span className="text-2xl font-black text-white font-mono mt-0.5 block">
                {restrictedItems.length}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 text-slate-400">
              <ShieldAlert size={20} />
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Com Restrição
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">
                {countRestricted}
              </span>
            </div>
            <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase">
              Operacional c/ Limite
            </span>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                Indisponíveis
              </span>
              <span className="text-2xl font-black text-rose-400 font-mono mt-0.5 block">
                {countUnavailable}
              </span>
            </div>
            <span className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase">
              Fora de Serviço
            </span>
          </div>
        </div>

        {/* LISTAGEM DOS EQUIPAMENTOS */}
        {restrictedItems.length === 0 ? (
          <div className="p-10 text-center bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-white font-bold text-base">
              Nenhum equipamento com restrição ou indisponível no momento.
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Todos os equipamentos do navio estão operando normalmente ou em linha/prontos. 
              Ao alterar o status de qualquer máquina na aba Equipamentos, ela aparecerá aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {restrictedItems.map(([item, status]) => {
              const config = STATUS_CONFIG[status];
              const currentReason = reasons[item] || '';
              const isUnavailable = status === EquipmentStatus.UNAVAILABLE;

              // Obtém histórico da restrição (tempo contínuo e dia anterior)
              const streak = getRestrictionStreak(item, currentDate);
              const priorInfo = getPreviousRestrictionInfo(item, currentDate, status);
              const hasPriorHistory = !!priorInfo && priorInfo.reason !== '';
              const hasPriorDifferentText = hasPriorHistory && priorInfo?.reason !== currentReason.trim();

              return (
                <div 
                  key={item} 
                  className={`p-5 rounded-3xl border-2 transition-all space-y-3.5 ${
                    isUnavailable
                      ? 'bg-rose-950/20 border-rose-900/60 shadow-lg shadow-rose-950/20'
                      : 'bg-amber-950/20 border-amber-900/60 shadow-lg shadow-amber-950/20'
                  }`}
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-black text-white text-base sm:text-lg tracking-tight">
                        {item}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${config.bgColor} ${config.textColor}`}>
                        {config.label}
                      </span>

                      {/* Tempo contínuo da restrição */}
                      {streak.daysCount > 1 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1.5" title={`Em restrição contínua desde ${streak.startDate}`}>
                          <Clock size={12} className="text-amber-400" />
                          <span>Ativo há {streak.daysCount} dias</span>
                        </span>
                      )}
                    </div>

                    {/* Badge de histórico anterior se houver */}
                    {hasPriorHistory && priorInfo && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
                        <Calendar size={12} className="text-blue-400" />
                        <span>Histórico anterior disponível: <strong>{priorInfo.date || 'Anterior'}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Campo de Edição do Motivo / Justificativa */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                        <AlertCircle size={14} className={isUnavailable ? 'text-rose-400' : 'text-amber-400'} />
                        <span>Motivo da Restrição / Ação em Andamento / Previsão:</span>
                      </label>

                      {hasPriorDifferentText && priorInfo && (
                        <button
                          type="button"
                          onClick={() => onReasonChange(item, priorInfo.reason)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                          title="Restaurar o texto exato que estava gravado no dia anterior"
                        >
                          <RotateCcw size={12} />
                          <span>Restaurar texto do dia anterior ({priorInfo.date})</span>
                        </button>
                      )}
                    </div>

                    <textarea
                      value={currentReason}
                      onChange={(e) => onReasonChange(item, e.target.value)}
                      placeholder="Descreva o motivo da restrição, diagnóstico técnico, sobressalentes pendentes ou prazo de prontidão..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl p-4 text-white text-sm font-mono outline-none resize-y min-h-[90px] leading-relaxed shadow-inner"
                    />
                  </div>

                  {/* Rodapé do Card com Ações */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Check size={13} className="text-emerald-400" />
                      <span>Salvo automaticamente.</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {currentReason.trim() !== '' && (
                        <button
                          type="button"
                          onClick={() => onReasonChange(item, '')}
                          className="px-2.5 py-1 text-slate-500 hover:text-rose-400 text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Limpar motivo para este dia"
                        >
                          <Trash2 size={12} />
                          <span>Limpar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyReason(item, currentReason)}
                        className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-bold transition-all flex items-center gap-1.5"
                        title="Copiar texto formatado"
                      >
                        {copiedItem === item ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} className="text-slate-400" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
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
