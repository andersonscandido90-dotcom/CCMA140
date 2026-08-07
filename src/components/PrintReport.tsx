import React, { useState, useRef } from 'react';
import { DailyReport, EquipmentStatus } from '../types';
import { CATEGORIES, SHIP_CONFIG, STATUS_CONFIG } from '../constants';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface Props {
  report: DailyReport;
  onClose?: () => void;
}

export default function PrintReport({ report, onClose }: Props) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printSheetRef = useRef<HTMLDivElement>(null);

  const [year, month, day] = (report.date || new Date().toISOString().split('T')[0]).split('-');
  const formattedDate = `${day}/${month}/${year}`;

  const triggerPrint = () => {
    try {
      window.print();
    } catch (e) {
      alert('A impressão pelo navegador não foi suportada no iFrame. Por favor, utilize o botão "Baixar Arquivo PDF".');
    }
  };

  const downloadPdfFile = () => {
    if (!printSheetRef.current) return;
    setIsGeneratingPdf(true);

    const element = printSheetRef.current;
    const opt = {
      margin: 6,
      filename: `Relatorio_NAM_Atlantico_${formattedDate.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => setIsGeneratingPdf(false))
        .catch((err: any) => {
          console.error('Error generating PDF:', err);
          setIsGeneratingPdf(false);
          triggerPrint();
        });
    } catch (err) {
      console.error(err);
      setIsGeneratingPdf(false);
      triggerPrint();
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
        <div className="flex items-center gap-3">
          <span className="font-black text-white uppercase text-xs sm:text-sm">Modo de Impressão Oficial A4</span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium">(Otimizado para 1 página)</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {onClose && (
            <button 
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase rounded-xl transition-all"
            >
              Voltar
            </button>
          )}
          
          <button 
            onClick={downloadPdfFile}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGeneratingPdf ? '⏳ Gerando PDF...' : '📄 Baixar Arquivo PDF'}
          </button>

          <button 
            onClick={triggerPrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            🖨️ Chamar Impressora
          </button>
        </div>
      </div>

      {/* Sheet Content (Styled for compact 1-page print) */}
      <div 
        ref={printSheetRef}
        id="print-report-sheet"
        className="print-container max-w-4xl mx-auto bg-white text-black p-6 sm:p-8 rounded-2xl shadow-2xl print:p-0 print:shadow-none print:max-w-none print:w-full print:bg-white print:text-black"
      >
        {/* Navy Header */}
        <div className="border-b-2 border-black pb-2 mb-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src={SHIP_CONFIG.badgeUrl} 
              alt="Logo Navio" 
              className="w-12 h-12 object-contain" 
              crossOrigin="anonymous"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
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
                <span className="text-gray-500 block text-[8px] font-bold uppercase">Banda (Heel)</span>
                <span className="font-bold">{report.stability.heel}°</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[8px] font-bold uppercase">GM (Metacentro)</span>
                <span className="font-bold">{report.stability.gm} m</span>
              </div>
              <div className="col-span-2 border-t border-gray-100 pt-1 mt-0.5">
                <span className="text-gray-500 block text-[8px] font-bold uppercase">Deslocamento</span>
                <span className="font-bold">{report.stability.displacement} Ton</span>
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

        {/* Signatures */}
        <div className="mt-6 pt-4 border-t border-gray-300 grid grid-cols-3 gap-4 text-center text-[9px] uppercase font-bold">
          <div>
            <div className="border-b border-black mb-1 w-4/5 mx-auto"></div>
            <span>SUPERVISOR DO CCM</span>
          </div>
          <div>
            <div className="border-b border-black mb-1 w-4/5 mx-auto"></div>
            <span>OFICIAL DE SERVIÇO QUE PASSA</span>
          </div>
          <div>
            <div className="border-b border-black mb-1 w-4/5 mx-auto"></div>
            <span>OFICIAL DE SERVIÇO QUE ENTRA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
