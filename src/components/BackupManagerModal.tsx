import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, Trash2, Calendar, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { DailyReport } from '../types';

interface Props {
  currentDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

interface SavedReportInfo {
  date: string;
  report: DailyReport;
}

export default function BackupManagerModal({ currentDate, onSelectDate, onClose }: Props) {
  const [reportsList, setReportsList] = useState<SavedReportInfo[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadSavedReports = () => {
    const list: SavedReportInfo[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('report_')) {
        const dateStr = key.replace('report_', '');
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as DailyReport;
          list.push({ date: dateStr, report: data });
        } catch (e) {
          console.error('Error parsing report for key', key, e);
        }
      }
    }
    list.sort((a, b) => b.date.localeCompare(a.date));
    setReportsList(list);
  };

  useEffect(() => {
    loadSavedReports();
  }, []);

  const handleExportGlobalBackup = () => {
    const allData: Record<string, any> = {
      app: 'NAM ATLANTICO COMMAND DASHBOARD',
      exportedAt: new Date().toISOString(),
      reports: {},
      master_reasons: localStorage.getItem('master_equipment_reasons') || '{}',
      master_isis: localStorage.getItem('master_isis_overrides') || '{}',
      service_notes: localStorage.getItem('service_notes') || '',
      theme: localStorage.getItem('app_theme') || 'bg-slate-950',
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('report_')) {
        try {
          allData.reports[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {}
      }
    }

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_completo_navio_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setMsg({ text: 'Backup completo exportado com sucesso!', type: 'success' });
  };

  const handleImportGlobalBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.reports || typeof json.reports !== 'object') {
          setMsg({ text: 'Formato de arquivo de backup global inválido.', type: 'error' });
          return;
        }

        let count = 0;
        Object.entries(json.reports).forEach(([key, value]) => {
          if (key.startsWith('report_')) {
            localStorage.setItem(key, JSON.stringify(value));
            count++;
          }
        });

        if (json.master_reasons) localStorage.setItem('master_equipment_reasons', typeof json.master_reasons === 'string' ? json.master_reasons : JSON.stringify(json.master_reasons));
        if (json.master_isis) localStorage.setItem('master_isis_overrides', typeof json.master_isis === 'string' ? json.master_isis : JSON.stringify(json.master_isis));
        if (json.service_notes) localStorage.setItem('service_notes', json.service_notes);

        loadSavedReports();
        setMsg({ text: `Backup restaurado com sucesso! (${count} relatórios importados)`, type: 'success' });
      } catch (err) {
        setMsg({ text: 'Erro ao ler arquivo de backup.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteReport = (dateToDelete: string) => {
    if (confirm(`Tem certeza que deseja apagar o relatório do dia ${dateToDelete}?`)) {
      localStorage.removeItem(`report_${dateToDelete}`);
      loadSavedReports();
      setMsg({ text: `Relatório do dia ${dateToDelete} excluído.`, type: 'success' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg uppercase">Gerenciador de Backups & Histórico</h3>
              <p className="text-xs text-slate-400">Armazenamento offline local ({reportsList.length} relatórios armazenados)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
          
          {msg && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${
              msg.type === 'success' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-600/20 text-red-300 border border-red-500/30'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleExportGlobalBackup}
              className="p-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <Upload size={18} /> Exportar Backup Global (Tudo)
            </button>

            <label className="p-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase rounded-2xl border border-slate-700 shadow-lg flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-95">
              <Download size={18} /> Importar Backup Global
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportGlobalBackup} 
                className="hidden" 
              />
            </label>
          </div>

          {/* History List */}
          <div className="space-y-3">
            <h4 className="font-black uppercase text-slate-400 text-xs tracking-wider flex items-center gap-2">
              <Calendar size={14} /> Relatórios Diários Salvos
            </h4>

            {reportsList.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs font-mono bg-slate-950 rounded-2xl border border-slate-800">
                Nenhum relatório salvo encontrado no navegador.
              </div>
            ) : (
              <div className="space-y-2">
                {reportsList.map(({ date, report }) => {
                  const isCurrent = date === currentDate;
                  const supervisor = report.personnel?.supervisorMO || 'Supervisor não inf.';

                  return (
                    <div 
                      key={date}
                      className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                        isCurrent 
                          ? 'bg-blue-950/40 border-blue-500/50' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 sm:p-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase shrink-0 ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {date}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block uppercase truncate">{supervisor}</span>
                          <span className="text-[10px] font-mono text-slate-500 block truncate">
                            Cargas: H2O {report.fuel?.water || 0}m³ | Comb. {report.fuel?.fuelOil || 0}m³
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              onSelectDate(date);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 transition-all"
                          >
                            <ExternalLink size={12} /> Carregar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReport(date)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Excluir do Histórico"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
