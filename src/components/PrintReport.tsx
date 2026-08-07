import React, { useRef } from 'react';
import { DailyReport, EquipmentStatus } from '../types';
import { CATEGORIES, SHIP_CONFIG, STATUS_CONFIG } from '../constants';

interface Props {
  report: DailyReport;
  onClose?: () => void;
}

function calculateDisplacement(draftForward: number, draftAft: number): number {
  const meanDraft = (draftForward + draftAft) / 2;
  const trim = draftForward - draftAft;

  if (meanDraft <= 0) return 21500;

  const hydrostaticTable = [
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
  ];

  const trimAbs = Math.abs(trim);
  let C_index = 0, K_index = 0;
  if (trim < 0) {
    if (trimAbs > 1.0) { C_index = 1; K_index = 0; }
    else { C_index = 2; K_index = 1; }
  } else {
    if (trimAbs > 1.0) { C_index = 1; K_index = 3; }
    else { C_index = 1; K_index = 2; }
  }

  const sortedTable = [...hydrostaticTable].sort((a, b) => a.draft - b.draft);
  let lower = sortedTable[0];
  let upper = sortedTable[sortedTable.length - 1];

  for (let i = 0; i < sortedTable.length - 1; i++) {
    if (sortedTable[i].draft <= meanDraft && sortedTable[i + 1].draft >= meanDraft) {
      lower = sortedTable[i];
      upper = sortedTable[i + 1];
      break;
    }
  }

  const factor = lower.draft === upper.draft ? 0 : (meanDraft - lower.draft) / (upper.draft - lower.draft);
  const C = lower.valores[C_index] + (upper.valores[C_index] - lower.valores[C_index]) * factor;
  const K = lower.valores[K_index] + (upper.valores[K_index] - lower.valores[K_index]) * factor;
  const T = C - K;
  const S = T * trim;
  const displacement = C + S;
  return Math.max(0, Math.round(displacement * 10) / 10);
}

export default function PrintReport({ report, onClose }: Props) {
  const printSheetRef = useRef<HTMLDivElement>(null);

  const [year, month, day] = (report.date || new Date().toISOString().split('T')[0]).split('-');
  const formattedDate = `${day}/${month}/${year}`;

  const currentDisplacement = calculateDisplacement(report.stability.draftForward, report.stability.draftAft);
  const displayDisplacement = (report.stability.displacement && report.stability.displacement !== 21500) 
    ? report.stability.displacement 
    : currentDisplacement;

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
          margin: 8mm 10mm 8mm 10mm;
        }
        @media print {
          html, body {
            background: #fff !important;
            color: #000 !important;
            font-size: 10px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Controls (Hidden during print) */}
      <div className="max-w-5xl mx-auto mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 no-print">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-black text-white uppercase text-xs sm:text-sm">Modo de Impressão Oficial A4</span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">(Otimizado para 1 página)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            💡 <strong className="text-slate-200">Para salvar em PDF:</strong> Ao clicar no botão, selecione <span className="text-blue-400 font-semibold">"Salvar como PDF"</span> no destino da impressora.
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
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            🖨️ Imprimir / Salvar em PDF
          </button>
        </div>
      </div>

      {/* Sheet Content (Styled for compact 1-page print with signatures at bottom) */}
      <div 
        ref={printSheetRef}
        id="print-report-sheet"
        className="print-container max-w-4xl mx-auto bg-white text-black p-6 sm:p-8 rounded-2xl shadow-2xl print:p-0 print:shadow-none print:max-w-none print:w-full print:bg-white print:text-black flex flex-col justify-between min-h-[260mm] sm:min-h-[275mm]"
      >
        <div>
          {/* Navy Header */}
          <div className="border-b-2 border-black pb-2 mb-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Ship Badge / Crest */}
              <img 
                src={SHIP_CONFIG.badgeUrl} 
                alt="Brasão do Navio" 
                className="w-12 h-12 object-contain shrink-0" 
                onError={(e) => { 
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('ship-badge-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div id="ship-badge-fallback" className="hidden w-11 h-11 rounded-full bg-blue-950 text-amber-400 items-center justify-center shrink-0 border border-amber-500 shadow-sm print:bg-transparent print:text-blue-950 print:border-blue-950">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 0 1 2 2v2.07A6 6 0 0 1 19.93 11H22v2h-2.07A8.002 8.002 0 0 1 13 19.93V22h-2v-2.07A8.002 8.002 0 0 1 4.07 13H2v-2h2.07A6 6 0 0 1 10 6.07V4a2 2 0 0 1 2-2zm0 6a4 4 0 0 0-3.995 3.8L8 12a4 4 0 0 0 8 0 4 4 0 0 0-4-4zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                </svg>
              </div>
              <div>
                <h1 className="font-black text-base sm:text-lg uppercase tracking-wider leading-tight">{SHIP_CONFIG.name} {SHIP_CONFIG.hullNumber}</h1>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-700">{SHIP_CONFIG.designation} — MARINHA DO BRASIL</h2>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase block text-gray-500">Data de Emissão</span>
              <span className="text-sm font-black text-blue-900 block">{formattedDate}</span>
            </div>
          </div>

        {/* 1. Quadros de Cargas e Estabilidade */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="border border-gray-300 rounded-md p-2.5">
            <h3 className="font-black text-[10px] uppercase text-blue-900 border-b border-gray-200 pb-1 mb-1.5">
              1. Carga Líquida
            </h3>
            <table className="w-full text-[10px] font-mono leading-tight">
              <thead>
                <tr className="text-left font-bold border-b border-gray-200 text-gray-600">
                  <th className="pb-0.5">Fluido</th>
                  <th className="pb-0.5 text-right">Vol (m³)</th>
                  <th className="pb-0.5 text-right">Nível (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-0.5">Água Doce</td>
                  <td className="py-0.5 text-right font-bold">{report.fuel.water.toFixed(1)}</td>
                  <td className="py-0.5 text-right">{((report.fuel.water / (report.fuel.maxWater || 1)) * 100).toFixed(0)}%</td>
                </tr>
                <tr>
                  <td className="py-0.5">Óleo Combustível</td>
                  <td className="py-0.5 text-right font-bold">{report.fuel.fuelOil.toFixed(1)}</td>
                  <td className="py-0.5 text-right">{((report.fuel.fuelOil / (report.fuel.maxFuelOil || 1)) * 100).toFixed(0)}%</td>
                </tr>
                <tr>
                  <td className="py-0.5">Óleo Lubrificante</td>
                  <td className="py-0.5 text-right font-bold">{report.fuel.lubOil.toFixed(1)}</td>
                  <td className="py-0.5 text-right">{((report.fuel.lubOil / (report.fuel.maxLubOil || 1)) * 100).toFixed(0)}%</td>
                </tr>
                <tr>
                  <td className="py-0.5">JP-5</td>
                  <td className="py-0.5 text-right font-bold">{report.fuel.jp5.toFixed(1)}</td>
                  <td className="py-0.5 text-right">{((report.fuel.jp5 / (report.fuel.maxJp5 || 1)) * 100).toFixed(0)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-gray-300 rounded-md p-2.5">
            <h3 className="font-black text-[10px] uppercase text-blue-900 border-b border-gray-200 pb-1 mb-1.5">
              2. Parâmetros de Estabilidade
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-tight">
              <div>
                <span className="text-gray-500 block text-[8px] font-bold uppercase">Calado AV</span>
                <span className="font-bold">{report.stability.draftForward} m</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[8px] font-bold uppercase">Calado AR</span>
                <span className="font-bold">{report.stability.draftAft} m</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[8px] font-bold uppercase">Banda</span>
                <span className="font-bold">{report.stability.heel}°</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[8px] font-bold uppercase">GM (Metacentro)</span>
                <span className="font-bold">{report.stability.gm} m</span>
              </div>
              <div className="col-span-2 border-t border-gray-100 pt-1 mt-0.5">
                <span className="text-gray-500 block text-[8px] font-bold uppercase">Deslocamento</span>
                <span className="font-bold">{displayDisplacement.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Prontidão dos Equipamentos */}
        <div className="border border-gray-300 rounded-md p-2.5 mb-3">
          <h3 className="font-black text-[10px] uppercase text-blue-900 border-b border-gray-200 pb-1 mb-2">
            3. Prontidão dos Equipamentos por Categoria
          </h3>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => {
              const catItems = cat.items;
              return (
                <div key={cat.name} className="border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-[9px] font-black uppercase text-gray-700 block mb-1">
                    {cat.name}
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 text-[9px] font-mono">
                    {catItems.map((item) => {
                      const st = report.equipment[item] || EquipmentStatus.AVAILABLE;
                      const cfg = STATUS_CONFIG[st];
                      const isProblem = st === EquipmentStatus.UNAVAILABLE || st === EquipmentStatus.RESTRICTED;
                      return (
                        <div 
                          key={item} 
                          className={`p-1 rounded border leading-tight flex justify-between items-center ${
                            isProblem ? 'bg-red-50 border-red-200 font-bold' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <span className="truncate mr-1 font-medium">{item}</span>
                          <span className={`text-[8px] font-black px-1 py-0.2 rounded uppercase shrink-0 ${
                            st === EquipmentStatus.IN_SERVICE || st === EquipmentStatus.IN_LINE
                              ? 'bg-blue-100 text-blue-800'
                              : st === EquipmentStatus.UNAVAILABLE
                              ? 'bg-red-600 text-white'
                              : st === EquipmentStatus.RESTRICTED
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Escala do Quarto de Serviço */}
        <div className="border border-gray-300 rounded-md p-2.5 mb-3">
          <h3 className="font-black text-[10px] uppercase text-blue-900 border-b border-gray-200 pb-1 mb-1.5">
            4. Divisão de Serviço do CCM
          </h3>
          <div className="grid grid-cols-4 gap-2 text-[10px] font-mono leading-tight">
            <div>
              <span className="text-gray-500 text-[8px] block font-bold uppercase">Supervisor MO</span>
              <span className="font-bold">{report.personnel?.supervisorMO || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[8px] block font-bold uppercase">Supervisor EL</span>
              <span className="font-bold">{report.personnel?.supervisorEL || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[8px] block font-bold uppercase">Fiel CAV</span>
              <span className="font-bold">{report.personnel?.fielCav || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[8px] block font-bold uppercase">Encarregado Máquinas</span>
              <span className="font-bold">{report.personnel?.encarregadoMaquinas || '-'}</span>
            </div>
          </div>
        </div>

        {/* 4. Anotações Oficiais */}
        {report.serviceNotes && (
          <div className="border border-gray-300 rounded-md p-2 mb-3">
            <h3 className="font-black text-[9px] uppercase text-blue-900 border-b border-gray-200 pb-0.5 mb-1">
              5. Anotações do Serviço
            </h3>
            <p className="text-[9px] font-mono whitespace-pre-wrap text-gray-800 leading-snug">
              {report.serviceNotes}
            </p>
          </div>
        )}
        </div>

        {/* Signatures pushed to footer without top divider line */}
        <div className="mt-auto pt-10 grid grid-cols-3 gap-6 text-center text-[10px] uppercase font-black">
          <div>
            <div className="border-b-2 border-black mb-2 w-4/5 mx-auto"></div>
            <span>SUPERVISOR DO CCM</span>
          </div>
          <div>
            <div className="border-b-2 border-black mb-2 w-4/5 mx-auto"></div>
            <span>OFICIAL DE SERVIÇO QUE PASSA</span>
          </div>
          <div>
            <div className="border-b-2 border-black mb-2 w-4/5 mx-auto"></div>
            <span>OFICIAL DE SERVIÇO QUE ENTRA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
