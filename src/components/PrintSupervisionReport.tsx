import React, { useRef } from 'react';
import { DailyReport, EquipmentStatus } from '../types';
import { SHIP_CONFIG, STATUS_CONFIG } from '../constants';

interface Props {
  report: DailyReport;
  onClose?: () => void;
}

export default function PrintSupervisionReport({ report, onClose }: Props) {
  const printSheetRef = useRef<HTMLDivElement>(null);

  const [year, month, day] = (report.date || new Date().toISOString().split('T')[0]).split('-');
  const formattedDate = `${day}/${month}/${year}`;

  const restrictedItems = Object.entries(report.equipment || {}).filter(
    ([_, status]) => status === EquipmentStatus.RESTRICTED || status === EquipmentStatus.UNAVAILABLE
  );

  const triggerPrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error(e);
      alert('Utilize o atalho Ctrl+P para abrir a janela de impressão do seu navegador.');
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 p-2 sm:p-6 print:p-0 print:bg-white print:text-black">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          html, body {
            background: #fff !important;
            color: #000 !important;
            font-size: 12pt !important;
            overflow: visible !important;
            height: auto !important;
            width: 100% !important;
            position: static !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-modal-overlay {
            position: static !important;
            inset: auto !important;
            overflow: visible !important;
            background: #fff !important;
            height: auto !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
          }
          .break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Controller Topbar (Hidden in print) */}
      <div className="max-w-4xl mx-auto mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 no-print">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-black text-white uppercase text-xs sm:text-sm">Relatório de Restrições e Anotações</span>
            <span className="text-[10px] sm:text-xs text-amber-400 font-medium">(Impressão Direcionada)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            💡 <strong className="text-slate-200">Para salvar em PDF:</strong> Clique no botão e selecione <span className="text-blue-400 font-semibold">"Salvar como PDF"</span> na janela de impressão.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {onClose && (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase rounded-xl transition-all"
            >
              Voltar
            </button>
          )}

          <button 
            onClick={triggerPrint}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            🖨️ Imprimir / Salvar em PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div 
        ref={printSheetRef}
        id="print-supervision-sheet"
        className="print-container max-w-4xl mx-auto bg-white text-black p-6 sm:p-8 rounded-2xl shadow-2xl print:p-0 print:shadow-none print:max-w-none print:w-full print:bg-white print:text-black"
      >
        <div>
          {/* Header */}
          <div className="border-b-2 border-black pb-3 mb-5 flex justify-between items-center break-inside-avoid">
            <div className="flex items-center gap-3">
              <img 
                src={SHIP_CONFIG.badgeUrl} 
                alt="Brasão do Navio" 
                className="w-12 h-12 object-contain shrink-0" 
                onError={(e) => { 
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('supervision-badge-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div id="supervision-badge-fallback" className="hidden w-11 h-11 rounded-full bg-blue-950 text-amber-400 items-center justify-center shrink-0 border border-amber-500 shadow-sm print:bg-transparent print:text-blue-950 print:border-blue-950">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 0 1 2 2v2.07A6 6 0 0 1 19.93 11H22v2h-2.07A8.002 8.002 0 0 1 13 19.93V22h-2v-2.07A8.002 8.002 0 0 1 4.07 13H2v-2h2.07A6 6 0 0 1 10 6.07V4a2 2 0 0 1 2-2zm0 6a4 4 0 0 0-3.995 3.8L8 12a4 4 0 0 0 8 0 4 4 0 0 0-4-4zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                </svg>
              </div>
              <div>
                <h1 className="font-black text-base sm:text-lg uppercase tracking-wider leading-tight">{SHIP_CONFIG.name} {SHIP_CONFIG.hullNumber}</h1>
                <h2 className="text-xs font-black uppercase tracking-widest text-black">MARINHA DO BRASIL</h2>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase block text-gray-500">Data de Emissão</span>
              <span className="text-sm sm:text-base font-black text-blue-900 block">{formattedDate}</span>
            </div>
          </div>

          {/* 1. Registro de Restrições e Indisponibilidades */}
          <div className="border border-gray-300 rounded-md p-4 mb-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
              <h3 className="font-black text-sm sm:text-base uppercase text-blue-900">
                1. Equipamentos com Restrição ou Indisponibilidade
              </h3>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded">
                Total: {restrictedItems.length}
              </span>
            </div>

            {restrictedItems.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 font-mono italic bg-gray-50 rounded border border-gray-100">
                Nenhuma restrição ou indisponibilidade registrada para este dia.
              </div>
            ) : (
              <div className="space-y-3">
                {restrictedItems.map(([item, status]) => {
                  const cfg = STATUS_CONFIG[status];
                  const reason = report.restrictionReasons?.[item] || 'Sem detalhes informados.';
                  const isProblem = status === EquipmentStatus.UNAVAILABLE;

                  return (
                    <div 
                      key={item} 
                      className={`p-3 rounded-lg border break-inside-avoid ${
                        isProblem ? 'bg-red-50/70 border-red-200' : 'bg-amber-50/70 border-amber-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-gray-900 text-sm sm:text-base">{item}</span>
                        <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wide ${
                          isProblem ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {cfg?.label || status}
                        </span>
                      </div>
                      <div className="text-sm font-mono text-gray-900 leading-relaxed bg-white p-2.5 rounded border border-gray-200/80">
                        <span className="font-bold text-gray-600 mr-2 uppercase text-xs block sm:inline mb-1 sm:mb-0">Motivo/Ação:</span>
                        {reason}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Anotações Gerais do Serviço */}
          <div className="border border-gray-300 rounded-md p-4 mb-6 break-inside-avoid">
            <h3 className="font-black text-sm sm:text-base uppercase text-blue-900 border-b border-gray-200 pb-2 mb-3">
              2. Anotações do Serviço / Ocorrências Gerais
            </h3>
            {report.serviceNotes && report.serviceNotes.trim().length > 0 ? (
              <p className="text-sm font-mono whitespace-pre-wrap text-gray-900 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                {report.serviceNotes}
              </p>
            ) : (
              <div className="text-sm font-mono text-gray-400 italic p-3 bg-gray-50 rounded border border-gray-200">
                Nenhuma anotação de serviço registrada nesta data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
