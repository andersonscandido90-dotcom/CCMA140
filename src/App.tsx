import React, { useState, useMemo, useRef, memo } from 'react';
import { 
  Activity, 
  Droplets, 
  LayoutDashboard,
  Calendar,
  Compass,
  Users,
  Shield,
  UserCheck,
  Menu,
  X,
  Tv,
  Monitor,
  ShieldAlert,
  ClipboardList,
  Clock,
  Download,
  Upload,
  Printer,
  Database
} from 'lucide-react';
import { EquipmentStatus, DailyReport, FuelData, EquipmentData, StabilityData, PersonnelData, LogEntry } from './types';
import { CATEGORIES, SHIP_CONFIG } from './constants';
import EquipmentSection from './components/EquipmentSection';
import FuelPanel from './components/FuelPanel';
import StabilityPanel from './components/StabilityPanel';
import StatusCharts from './components/StatusCharts';
import ActivityLog from './components/ActivityLog';
import CAVPanel from './components/CAVPanel';
import RestrictionsPanel from './components/RestrictionsPanel';
import IsisPanel from './components/IsisPanel';
import PrintReport from './components/PrintReport';
import BackupManagerModal from './components/BackupManagerModal';

const DEFAULT_FUEL: FuelData = { 
  water: 0, lubOil: 0, fuelOil: 0, jp5: 0,
  maxWater: 581.00, maxLubOil: 84.540, maxFuelOil: 1868.589, maxJp5: 450
};

const DEFAULT_STABILITY: StabilityData = {
  draftForward: 6.5, 
  draftAft: 6.5, 
  heel: 0, 
  gm: 2.3, 
  displacement: 21500
};

const DEFAULT_PERSONNEL: PersonnelData = {
  supervisorMO: '', supervisorEL: '', fielCav: '',
  encarregadoMaquinas: '', auxiliares: ['', '', ''], patrulha: ['', '', '']
};

const ShipLogo = memo(({ className = "w-24 h-auto", customUrl }: { className?: string, customUrl?: string | null }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const logoSrc = customUrl || SHIP_CONFIG.badgeUrl;
  
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {isLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {!imageError ? (
        <img 
          src={logoSrc}
          alt="Logo do Navio" 
          className={`w-full h-full object-contain drop-shadow-2xl transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          crossOrigin="anonymous"
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            console.error("Erro ao carregar logo:", logoSrc);
            setImageError(true);
            setIsLoading(false);
            
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const existingFallback = parent.querySelector('.fallback-icon');
              if (existingFallback) existingFallback.remove();
              
              const icon = document.createElement('div');
              icon.className = "fallback-icon p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl";
              icon.innerHTML = `
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.1)"/>
                  <path d="M2 17L12 22L22 17" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.1)"/>
                  <path d="M2 12L12 17L22 12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.1)"/>
                  <circle cx="12" cy="12" r="2" stroke="white" stroke-width="1.5" fill="white" fill-opacity="0.2"/>
                </svg>
              `;
              parent.appendChild(icon);
            }
          }}
        />
      ) : (
        <div className="fallback-icon p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.1)"/>
            <path d="M2 17L12 22L22 17" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.1)"/>
            <path d="M2 12L12 17L22 12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.1)"/>
            <circle cx="12" cy="12" r="2" stroke="white" stroke-width="1.5" fill="white" fill-opacity="0.2"/>
          </svg>
        </div>
      )}
    </div>
  );
});

const PersonnelView: React.FC<{ 
  data: PersonnelData; 
  onChange: (key: keyof PersonnelData, value: any) => void;
  serviceNotes: string;
  onServiceNotesChange: (notes: string) => void;
}> = ({ data, onChange, serviceNotes, onServiceNotesChange }) => {
  const shifts = ["08:00 às 12:00", "12:00 às 16:00", "16:00 às 20:00"];

  const renderField = (label: string, value: string, key: keyof PersonnelData, icon: React.ReactNode) => (
    <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col gap-4">
      <div className="flex items-center gap-3 text-blue-400">
        {icon}
        <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder="NOME DO MILITAR..."
        className="bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 font-black uppercase text-xs sm:text-sm text-white focus:border-blue-500 outline-none transition-all"
      />
    </div>
  );

  const renderShiftList = (label: string, list: string[], key: 'auxiliares' | 'patrulha', icon: React.ReactNode) => (
    <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-3 text-blue-400">
        {icon}
        <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="space-y-4">
        {list.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 ml-1">
              <Clock size={10} className="text-slate-600" />
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{shifts[idx] || `Turno ${idx + 1}`}</span>
            </div>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const newList = [...list];
                newList[idx] = e.target.value;
                onChange(key, newList);
              }}
              placeholder="NOME DO MILITAR..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 font-black uppercase text-xs sm:text-sm text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
        <div className="space-y-6 sm:space-y-8">
          <h3 className="font-black flex items-center gap-4 text-white uppercase text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            Supervisão
          </h3>
          {renderField("Supervisor MO", data.supervisorMO, "supervisorMO", <UserCheck size={18} />)}
          {renderField("Supervisor EL", data.supervisorEL, "supervisorEL", <UserCheck size={18} />)}
          {renderField("Fiel CAV", data.fielCav, "fielCav", <Shield size={18} />)}
          {renderField("Supervisor de Máquinas", data.encarregadoMaquinas, "encarregadoMaquinas", <Activity size={18} />)}
        </div>
        
        <div className="space-y-6 sm:space-y-8">
          <h3 className="font-black flex items-center gap-4 text-white uppercase text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            Escalas de Serviço
          </h3>
          {renderShiftList("Auxiliares de Serviço", data.auxiliares, "auxiliares", <Users size={18} />)}
          {renderShiftList("Patrulhas de Serviço", data.patrulha, "patrulha", <Shield size={18} />)}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-600/20 rounded-xl">
            <ClipboardList className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="font-black uppercase text-white text-lg sm:text-xl">
            Anotações do Serviço
          </h3>
        </div>
        
        <textarea
          value={serviceNotes}
          onChange={(e) => onServiceNotesChange(e.target.value)}
          placeholder="Digite aqui observações gerais, ocorrências, lembretes, procedimentos ou qualquer informação relevante para o serviço..."
          className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 font-mono text-white placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none transition-all resize-y min-h-[200px] text-base"
        />
        
        <div className="flex justify-end mt-4">
          <span className="text-sm font-mono text-slate-600">
            {serviceNotes.length} caracteres
          </span>
        </div>
      </div>
    </div>
  );
};

// ========== INICIALIZAÇÃO SÍNCRONA ==========
const initializeAppData = () => {
  let savedDate = localStorage.getItem('selected_date') || new Date().toISOString().split('T')[0];
  console.log('📅 Data salva encontrada:', savedDate);

  let report: DailyReport | null = null;
  const savedReport = localStorage.getItem(`report_${savedDate}`);
  if (savedReport) {
    try {
      report = JSON.parse(savedReport) as DailyReport;
      console.log('✅ Relatório carregado para', savedDate, report);
    } catch (e) {
      console.error('❌ Erro ao parsear relatório:', e);
    }
  }

  if (!report) {
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('report_'));
    if (allKeys.length > 0) {
      const lastKey = allKeys.sort().reverse()[0];
      const fallbackDate = lastKey.replace('report_', '');
      const fallbackData = localStorage.getItem(lastKey);
      if (fallbackData) {
        try {
          report = JSON.parse(fallbackData) as DailyReport;
          savedDate = fallbackDate;
          localStorage.setItem('selected_date', savedDate);
          console.log('🔄 Usando último relatório disponível:', savedDate);
        } catch (e) {
          console.error('❌ Erro no fallback:', e);
        }
      }
    }
  }

  if (!report) {
    console.log('📭 Nenhum relatório salvo – iniciando vazio.');
    report = {
      date: savedDate,
      equipment: {},
      fuel: DEFAULT_FUEL,
      stability: DEFAULT_STABILITY,
      personnel: DEFAULT_PERSONNEL,
      restrictionReasons: {},
      eductorStatuses: {},
      isisOverrides: {},
      logs: [],
      serviceNotes: localStorage.getItem('service_notes') || ''
    };
  } else {
    // Garante que serviceNotes exista, senão tenta recuperar do localStorage antigo
    if (!report.serviceNotes) {
      report.serviceNotes = localStorage.getItem('service_notes') || '';
    }
  }

  return { savedDate, report };
};

const App: React.FC = () => {
  const { savedDate, report: initialReport } = initializeAppData();

  const [selectedDate, setSelectedDate] = useState<string>(savedDate);
  const [equipmentData, setEquipmentData] = useState<EquipmentData>(initialReport.equipment);
  const [fuelData, setFuelData] = useState<FuelData>(initialReport.fuel);
  const [stabilityData, setStabilityData] = useState<StabilityData>(initialReport.stability);
  const [personnelData, setPersonnelData] = useState<PersonnelData>(initialReport.personnel);
  const [restrictionReasons, setRestrictionReasons] = useState<Record<string, string>>(initialReport.restrictionReasons);
  const [eductorStatuses, setEductorStatuses] = useState<Record<string, boolean>>(initialReport.eductorStatuses);
  const [isisOverrides, setIsisOverrides] = useState<Record<string, string>>(initialReport.isisOverrides);
  const [logs, setLogs] = useState<LogEntry[]>(initialReport.logs);
  const [serviceNotes, setServiceNotes] = useState<string>(initialReport.serviceNotes || '');
  const [view, setView] = useState<'menu-inicial' | 'equipment' | 'fuel' | 'stability' | 'personnel' | 'tv-mode' | 'cav' | 'restrictions' | 'isis'>('menu-inicial');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTvSlide, setCurrentTvSlide] = useState(0);
  const [customLogo, setCustomLogo] = useState<string | null>(localStorage.getItem('custom_ship_logo'));
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const NAV_ITEMS = useMemo(() => [
    { id: 'menu-inicial', icon: <LayoutDashboard size={18} />, label: 'Menu inicial' },
    { id: 'equipment', icon: <Activity size={18} />, label: 'Equipamentos' },
    { id: 'restrictions', icon: <ClipboardList size={18} />, label: 'Restrições' },
    { id: 'fuel', icon: <Droplets size={18} />, label: 'Cargas' },
    { id: 'stability', icon: <Compass size={18} />, label: 'Estabilidade' },
    { id: 'cav', icon: <ShieldAlert size={18} />, label: 'CAV' },
    { id: 'isis', icon: <Monitor size={18} />, label: 'ISIS' },
    { id: 'personnel', icon: <Users size={18} />, label: 'Tabela de Serviço' }
  ], []);

  // Handler de anotações do serviço (precisa estar definido antes de qualquer uso)
  const handleServiceNotesChange = (notes: string) => {
    setServiceNotes(notes);
    localStorage.setItem('service_notes', notes); // compatibilidade
    // Salva também no relatório diário
    const currentReport = localStorage.getItem(`report_${selectedDate}`);
    if (currentReport) {
      const report = JSON.parse(currentReport) as DailyReport;
      report.serviceNotes = notes;
      localStorage.setItem(`report_${selectedDate}`, JSON.stringify(report));
    }
  };

  const updateSelectedDate = (newDate: string) => {
    setSelectedDate(newDate);
    localStorage.setItem('selected_date', newDate);
    const saved = localStorage.getItem(`report_${newDate}`);
    if (saved) {
      try {
        const data = JSON.parse(saved) as DailyReport;
        setEquipmentData(data.equipment);
        setFuelData(data.fuel);
        setStabilityData(data.stability);
        setPersonnelData(data.personnel || DEFAULT_PERSONNEL);
        setRestrictionReasons(data.restrictionReasons || {});
        setEductorStatuses(data.eductorStatuses || {});
        setIsisOverrides(data.isisOverrides || {});
        setLogs(data.logs || []);
        setServiceNotes(data.serviceNotes || localStorage.getItem('service_notes') || '');
        console.log('✅ Dados carregados para', newDate);
      } catch (e) { console.error(e); }
    } else {
      setEquipmentData({});
      setFuelData(DEFAULT_FUEL);
      setStabilityData(DEFAULT_STABILITY);
      setPersonnelData(DEFAULT_PERSONNEL);
      setRestrictionReasons({});
      setEductorStatuses({});
      setIsisOverrides({});
      setLogs([]);
      setServiceNotes('');
      console.log('📭 Nenhum dado para', newDate);
    }
  };

  const saveCurrentReport = () => {
    const report: DailyReport = {
      date: selectedDate,
      equipment: equipmentData,
      fuel: fuelData,
      stability: stabilityData,
      personnel: personnelData,
      restrictionReasons,
      eductorStatuses,
      isisOverrides,
      logs,
      serviceNotes
    };
    localStorage.setItem(`report_${selectedDate}`, JSON.stringify(report));
    console.log('💾 Relatório salvo:', selectedDate);
  };

  const saveData = (updates: Partial<DailyReport>) => {
    if (updates.equipment) setEquipmentData(updates.equipment);
    if (updates.fuel) setFuelData(updates.fuel);
    if (updates.stability) setStabilityData(updates.stability);
    if (updates.personnel) setPersonnelData(updates.personnel);
    if (updates.restrictionReasons) setRestrictionReasons(updates.restrictionReasons);
    if (updates.eductorStatuses) setEductorStatuses(updates.eductorStatuses);
    if (updates.isisOverrides) {
      setIsisOverrides(updates.isisOverrides);
      localStorage.setItem('master_isis_overrides', JSON.stringify(updates.isisOverrides));
    }
    if (updates.logs) setLogs(updates.logs);
    if (updates.serviceNotes !== undefined) {
      setServiceNotes(updates.serviceNotes);
      localStorage.setItem('service_notes', updates.serviceNotes);
    }

    const report: DailyReport = {
      date: selectedDate,
      equipment: updates.equipment !== undefined ? updates.equipment : equipmentData,
      fuel: updates.fuel !== undefined ? updates.fuel : fuelData,
      stability: updates.stability !== undefined ? updates.stability : stabilityData,
      personnel: updates.personnel !== undefined ? updates.personnel : personnelData,
      restrictionReasons: updates.restrictionReasons !== undefined ? updates.restrictionReasons : restrictionReasons,
      eductorStatuses: updates.eductorStatuses !== undefined ? updates.eductorStatuses : eductorStatuses,
      isisOverrides: updates.isisOverrides !== undefined ? updates.isisOverrides : isisOverrides,
      logs: updates.logs !== undefined ? updates.logs : logs,
      serviceNotes: updates.serviceNotes !== undefined ? updates.serviceNotes : serviceNotes
    };
    localStorage.setItem(`report_${selectedDate}`, JSON.stringify(report));
    console.log('💾 Relatório atualizado e salvo:', selectedDate);

    if (updates.restrictionReasons) {
      const masterReasonsStr = localStorage.getItem('master_equipment_reasons');
      const masterReasons = masterReasonsStr ? JSON.parse(masterReasonsStr) : {};
      const newMaster = { ...masterReasons, ...updates.restrictionReasons };
      localStorage.setItem('master_equipment_reasons', JSON.stringify(newMaster));
    }
  };

  const handleStatusChange = (name: string) => {
    const statusOrder = [
      EquipmentStatus.AVAILABLE, 
      EquipmentStatus.IN_LINE, 
      EquipmentStatus.IN_SERVICE, 
      EquipmentStatus.RESTRICTED, 
      EquipmentStatus.UNAVAILABLE
    ];
    const oldStatus = equipmentData[name] || EquipmentStatus.AVAILABLE;
    const nextIdx = (statusOrder.indexOf(oldStatus) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIdx];
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      item: name,
      timestamp: new Date().toISOString(),
      oldStatus,
      newStatus: nextStatus,
      user: 'CENTRO DE COMANDO'
    };
    saveData({ equipment: { ...equipmentData, [name]: nextStatus }, logs: [...logs, newLog] });
  };

  const handleEductorToggle = (id: string) => {
    const newStatuses = { ...eductorStatuses, [id]: !(eductorStatuses[id] !== false) };
    saveData({ eductorStatuses: newStatuses });
  };

  const handleReasonChange = (item: string, reason: string) => {
    const newReasons = { ...restrictionReasons, [item]: reason };
    saveData({ restrictionReasons: newReasons });
  };

  const handleIsisOverride = (channel: string, translation: string) => {
    const newOverrides = { ...isisOverrides, [channel]: translation };
    saveData({ isisOverrides: newOverrides });
  };

  const handleViewChange = (newView: any) => {
    setView(newView);
    setSidebarOpen(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomLogo(base64);
        localStorage.setItem('custom_ship_logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // 📤 Exportar JSON (agora com anotações)
  const handleExportJSON = () => {
    saveCurrentReport();
    const relatorio: DailyReport = {
      date: selectedDate,
      equipment: equipmentData,
      fuel: fuelData,
      stability: stabilityData,
      personnel: personnelData,
      restrictionReasons,
      eductorStatuses,
      isisOverrides,
      logs,
      serviceNotes
    };
    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${selectedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 📥 Importar JSON (agora com anotações)
  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dados = JSON.parse(e.target?.result as string) as DailyReport;
          if (!dados.date || !dados.equipment || !dados.fuel) {
            alert('Arquivo JSON inválido. Precisa ter os campos: date, equipment, fuel...');
            return;
          }
          const usarDataOriginal = confirm(
            `O arquivo contém dados do dia ${dados.date}. Manter essa data?\n` +
            `(OK = muda para a data do arquivo, Cancelar = mantém data atual)`
          );
          if (usarDataOriginal) {
            updateSelectedDate(dados.date);
          }
          setEquipmentData(dados.equipment);
          setFuelData(dados.fuel);
          setStabilityData(dados.stability);
          setPersonnelData(dados.personnel || DEFAULT_PERSONNEL);
          setRestrictionReasons(dados.restrictionReasons || {});
          setEductorStatuses(dados.eductorStatuses || {});
          setIsisOverrides(dados.isisOverrides || {});
          setLogs(dados.logs || []);
          setServiceNotes(dados.serviceNotes || '');
          localStorage.setItem(`report_${usarDataOriginal ? dados.date : selectedDate}`, JSON.stringify(dados));
          if (dados.restrictionReasons) {
            const masterReasonsStr = localStorage.getItem('master_equipment_reasons');
            const masterReasons = masterReasonsStr ? JSON.parse(masterReasonsStr) : {};
            localStorage.setItem('master_equipment_reasons', JSON.stringify({ ...masterReasons, ...dados.restrictionReasons }));
          }
          if (dados.isisOverrides) {
            localStorage.setItem('master_isis_overrides', JSON.stringify(dados.isisOverrides));
          }
          alert('Relatório importado com sucesso!');
        } catch (erro) {
          alert('Erro ao ler o arquivo JSON. Verifique o formato.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const formattedSelectedDate = useMemo(() => {
    const [year, month, day] = selectedDate.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  const currentViewLabel = useMemo(() => {
    return NAV_ITEMS.find(item => item.id === view)?.label || view;
  }, [view, NAV_ITEMS]);

  if (view === 'tv-mode') {
    return (
      <div className="fixed inset-0 bg-slate-950 text-white flex flex-col overflow-hidden z-[100]">
        <div className="bg-slate-900 border-b-4 border-blue-600 p-8 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <ShipLogo className="h-24 w-auto" customUrl={customLogo} />
            <div>
              <h1 className="text-5xl font-black uppercase">{SHIP_CONFIG.name}</h1>
              <p className="text-xl text-slate-400 font-bold uppercase">{formattedSelectedDate}</p>
            </div>
          </div>
          <button onClick={() => setView('menu-inicial')} className="bg-red-600 px-8 py-4 rounded-xl font-black">SAIR</button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {currentTvSlide === 0 && <StabilityPanel fuelData={fuelData} data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />}
          {currentTvSlide === 1 && <FuelPanel fuel={fuelData} fullWidth onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />}
          {currentTvSlide === 2 && <EquipmentSection categories={CATEGORIES} data={equipmentData} onStatusChange={handleStatusChange} />}
          {currentTvSlide === 3 && <CAVPanel eductorStatuses={eductorStatuses} onStatusToggle={handleEductorToggle} />}
        </div>
        <div className="bg-slate-900 p-6 flex justify-center gap-6">
          {['ESTABILIDADE', 'CARGAS', 'EQUIPAMENTOS', 'CAV'].map((l, i) => (
            <button key={l} onClick={() => setCurrentTvSlide(i)} className={`px-10 py-4 rounded-xl font-black ${currentTvSlide === i ? 'bg-blue-600' : 'bg-slate-800'}`}>{l}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-blue-600 relative overflow-x-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-80 bg-slate-900 border-r border-slate-800 lg:static transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} print:hidden`}>
        <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <h2 className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Navegação</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 bg-slate-800 rounded-lg text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-10">
            <button onClick={() => fileInputRef.current?.click()} className="group relative">
              <ShipLogo className="w-24 h-auto" customUrl={customLogo} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <span className="text-[10px] font-black text-white">TROCAR</span>
              </div>
            </button>
            <h1 className="font-black text-xl mt-4 text-center leading-tight uppercase">{SHIP_CONFIG.name}</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map(item => (
              <button 
                key={item.id} 
                onClick={() => handleViewChange(item.id as any)} 
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-black uppercase text-[11px] transition-all ${view === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          
          <button onClick={() => setView('tv-mode')} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 p-4 rounded-xl font-black uppercase text-[11px] flex items-center gap-3 justify-center transition-all border border-slate-700">
            <Tv size={18} /> Modo TV
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="px-3 py-2.5 sm:px-8 sm:py-6 border-b border-slate-800/50 flex flex-wrap sm:flex-nowrap items-center justify-between bg-slate-950/40 backdrop-blur-md gap-2 sm:gap-4 print:hidden">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 sm:p-3 bg-slate-900 border border-slate-800 rounded-xl text-blue-500 shadow-lg active:scale-95 transition-all shrink-0"
              aria-label="Abrir menu"
            >
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>
            <h2 className="text-sm sm:text-2xl font-black uppercase text-white truncate">{currentViewLabel}</h2>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end shrink-0">
            <div className="bg-slate-900 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-3 border border-slate-800 shadow-inner">
              <Calendar size={12} className="text-blue-500 shrink-0 sm:w-3.5 sm:h-3.5" />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => updateSelectedDate(e.target.value)} 
                className="bg-transparent font-black text-white text-[10px] sm:text-xs outline-none w-[95px] sm:w-auto" 
              />
            </div>

            <button
              onClick={() => setShowPrintView(true)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] rounded-xl uppercase transition-all flex items-center gap-1 sm:gap-1.5 shadow-md"
              title="Gerar visualização para impressão A4 / Salvar em PDF"
            >
              <Printer size={13} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline sm:hidden">PDF</span>
              <span className="hidden sm:inline">Impressão / PDF</span>
            </button>

            <button
              onClick={() => setShowBackupModal(true)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-[10px] rounded-xl uppercase transition-all flex items-center gap-1 sm:gap-1.5 border border-slate-700"
              title="Gerenciar backups locais e histórico multidias"
            >
              <Database size={13} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Backups</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] rounded-xl uppercase transition-all flex items-center gap-1 sm:gap-1.5"
              title="Exportar relatório do dia"
            >
              <Upload size={13} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden md:inline">Exportar</span>
            </button>
            <button
              onClick={handleImportJSON}
              className="px-2 py-1.5 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-xl uppercase transition-all flex items-center gap-1 sm:gap-1.5"
              title="Importar relatório"
            >
              <Download size={13} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden md:inline">Importar</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-12 space-y-4 sm:space-y-8 lg:space-y-12 custom-scrollbar print:p-0 print:overflow-visible print:h-auto">
          {view === 'menu-inicial' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8 xl:gap-12">
               <FuelPanel fuel={fuelData} onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />
               <StabilityPanel fuelData={fuelData} data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />
               <StatusCharts data={equipmentData} />
               <ActivityLog logs={logs} />
            </div>
          )}
          {view === 'equipment' && <EquipmentSection categories={CATEGORIES} data={equipmentData} onStatusChange={handleStatusChange} />}
          {view === 'fuel' && <FuelPanel fuel={fuelData} fullWidth onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />}
          {view === 'stability' && <StabilityPanel fuelData={fuelData} data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />}
          {view === 'cav' && <CAVPanel eductorStatuses={eductorStatuses} onStatusToggle={handleEductorToggle} />}
          {view === 'restrictions' && <RestrictionsPanel data={equipmentData} reasons={restrictionReasons} onReasonChange={handleReasonChange} />}
          {view === 'isis' && <IsisPanel overrides={isisOverrides} onOverrideChange={handleIsisOverride} />}
          {view === 'personnel' && <PersonnelView data={personnelData} onChange={(k, v) => saveData({ personnel: { ...personnelData, [k as keyof PersonnelData]: v } })} serviceNotes={serviceNotes} onServiceNotesChange={handleServiceNotesChange} />}
        </div>
      </main>

      {showPrintView && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950">
          <PrintReport 
            report={{
              date: selectedDate,
              equipment: equipmentData,
              fuel: fuelData,
              stability: stabilityData,
              personnel: personnelData,
              restrictionReasons,
              eductorStatuses,
              isisOverrides,
              logs,
              serviceNotes
            }}
            onClose={() => setShowPrintView(false)}
          />
        </div>
      )}

      {showBackupModal && (
        <BackupManagerModal 
          currentDate={selectedDate}
          onSelectDate={(newDate) => updateSelectedDate(newDate)}
          onClose={() => setShowBackupModal(false)}
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleLogoUpload}
      />
    </div>
  );
};

export default App;
