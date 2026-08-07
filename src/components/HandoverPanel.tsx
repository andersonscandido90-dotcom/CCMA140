import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  Droplets, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileCheck,
  Send,
  Compass
} from 'lucide-react';
import { EquipmentData, EquipmentStatus, FuelData, PersonnelData, StabilityData } from '../types';
import { CATEGORIES } from '../constants';

interface Props {
  equipmentData: EquipmentData;
  fuelData: FuelData;
  stabilityData: StabilityData;
  personnelData: PersonnelData;
  restrictionReasons: Record<string, string>;
  eductorStatuses: Record<string, boolean>;
  serviceNotes: string;
  selectedDate: string;
  onConfirmHandover: (outgoingOfficer: string, incomingOfficer: string, handoverNotes: string) => void;
}

export default function HandoverPanel({
  equipmentData,
  fuelData,
  stabilityData,
  personnelData,
  restrictionReasons,
  eductorStatuses,
  serviceNotes,
  selectedDate,
  onConfirmHandover
}: Props) {
  const [outgoing, setOutgoing] = useState(personnelData.supervisorMO || '');
  const [incoming, setIncoming] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Calcula estatísticas
  const totalEquipments = CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
  const restrictedItems = Object.entries(equipmentData).filter(
    ([_, status]) => status === EquipmentStatus.RESTRICTED
  );
  const unavailableItems = Object.entries(equipmentData).filter(
    ([_, status]) => status === EquipmentStatus.UNAVAILABLE
  );
  const inServiceItems = Object.entries(equipmentData).filter(
    ([_, status]) => status === EquipmentStatus.IN_SERVICE || status === EquipmentStatus.IN_LINE
  );

  // Alertas de Cargas
  const fuelAlerts = [];
  if (fuelData.maxWater && (fuelData.water / fuelData.maxWater) < 0.25) {
    fuelAlerts.push(`Água Doce em nível baixo: ${((fuelData.water / fuelData.maxWater) * 100).toFixed(1)}%`);
  }
  if (fuelData.maxFuelOil && (fuelData.fuelOil / fuelData.maxFuelOil) < 0.25) {
    fuelAlerts.push(`Óleo Combustível em nível baixo: ${((fuelData.fuelOil / fuelData.maxFuelOil) * 100).toFixed(1)}%`);
  }
  if (fuelData.maxLubOil && (fuelData.lubOil / fuelData.maxLubOil) < 0.25) {
    fuelAlerts.push(`Óleo Lubrificante em nível baixo: ${((fuelData.lubOil / fuelData.maxLubOil) * 100).toFixed(1)}%`);
  }
  if (fuelData.maxJp5 && (fuelData.jp5 / fuelData.maxJp5) < 0.20) {
    fuelAlerts.push(`JP-5 em nível crítico: ${((fuelData.jp5 / fuelData.maxJp5) * 100).toFixed(1)}%`);
  }

  // Edutores avariados
  const damagedEductors = Object.entries(eductorStatuses).filter(([_, status]) => status === false);

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outgoing.trim() || !incoming.trim()) {
      alert('Por favor, informe quem está passando e quem está recebendo o serviço.');
      return;
    }
    onConfirmHandover(outgoing, incoming, notes);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 4000);
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Passagem de Quarto de Serviço
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              Checklist de prontidão e termo formal de transferência de responsabilidade operacional
            </p>
          </div>
        </div>
        <div className="bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 block">Data do Relatório</span>
            <span className="text-sm font-black text-white">{selectedDate}</span>
          </div>
        </div>
      </div>

      {/* Grid de Resumo de Prontidão */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{inServiceItems.length} / {totalEquipments}</span>
            <span className="text-[10px] font-black uppercase text-slate-500 block">Em Serviço / Na Linha</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black font-amber-400 text-amber-400">{restrictedItems.length}</span>
            <span className="text-[10px] font-black uppercase text-slate-500 block">Com Restrição</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-red-400">{unavailableItems.length}</span>
            <span className="text-[10px] font-black uppercase text-slate-500 block">Indisponíveis</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black text-white">{stabilityData.draftForward}m / {stabilityData.draftAft}m</span>
            <span className="text-[10px] font-black uppercase text-slate-500 block">Calado AV / AR</span>
          </div>
        </div>
      </div>

      {/* Seção Principal: Destaques Críticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Painel de Equipamentos Não Operacionais & Restrições */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2rem] space-y-5">
          <h3 className="font-black uppercase text-white text-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Pendências & Restrições Operacionais
          </h3>

          {restrictedItems.length === 0 && unavailableItems.length === 0 ? (
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-400 font-bold text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              Nenhum equipamento restrito ou indisponível registrado.
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {unavailableItems.map(([item]) => (
                <div key={item} className="bg-slate-950 p-4 rounded-xl border-l-4 border-l-red-500 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{item}</span>
                    <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                      INDISPONÍVEL
                    </span>
                  </div>
                  {restrictionReasons[item] && (
                    <p className="text-xs text-slate-400 font-mono mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      Motivo: {restrictionReasons[item]}
                    </p>
                  )}
                </div>
              ))}

              {restrictedItems.map(([item]) => (
                <div key={item} className="bg-slate-950 p-4 rounded-xl border-l-4 border-l-amber-500 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{item}</span>
                    <span className="bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                      RESTRIÇÃO
                    </span>
                  </div>
                  {restrictionReasons[item] && (
                    <p className="text-xs text-slate-400 font-mono mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      Motivo: {restrictionReasons[item]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status de Cargas & CAV */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2rem] space-y-6">
          <h3 className="font-black uppercase text-white text-lg flex items-center gap-3">
            <Droplets className="w-5 h-5 text-cyan-400" />
            Alertas de Níveis & CAV
          </h3>

          <div className="space-y-4">
            {fuelAlerts.length > 0 ? (
              fuelAlerts.map((alertMsg, idx) => (
                <div key={idx} className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-xl flex items-center gap-3 text-amber-300 text-xs font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{alertMsg}</span>
                </div>
              ))
            ) : (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 text-xs font-bold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                Níveis de tanques (Água, Lub, Combustível e JP-5) dentro dos parâmetros de segurança.
              </div>
            )}

            {damagedEductors.length > 0 ? (
              <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-xl text-red-300 text-xs font-bold flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span>Eductores CAV Avariados: {damagedEductors.map(([id]) => id).join(', ')}</span>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 text-xs font-bold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                Todos os edutores do CAV operacionais.
              </div>
            )}
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 block">Equipe de Serviço Atual</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              <div><strong className="text-white">Supervisor MO:</strong> {personnelData.supervisorMO || 'Não informado'}</div>
              <div><strong className="text-white">Supervisor EL:</strong> {personnelData.supervisorEL || 'Não informado'}</div>
              <div><strong className="text-white">Fiel CAV:</strong> {personnelData.fielCav || 'Não informado'}</div>
              <div><strong className="text-white">Encarregado Máq:</strong> {personnelData.encarregadoMaquinas || 'Não informado'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Transferência e Confirmação de Passagem */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2rem] space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <FileCheck className="w-6 h-6 text-indigo-400" />
          <h3 className="font-black uppercase text-white text-lg sm:text-xl">
            Termo de Transferência e Passagem do Quarto
          </h3>
        </div>

        {confirmed && (
          <div className="p-4 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-sm flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Passagem de quarto registrada com sucesso no Log de Atividades!
          </div>
        )}

        <form onSubmit={handleHandoverSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                Militar Entregando o Serviço (Passando)
              </label>
              <input 
                type="text"
                value={outgoing}
                onChange={(e) => setOutgoing(e.target.value)}
                placeholder="Ex: 1º TEN MARCOS..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 font-black uppercase text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                Militar Assumindo o Serviço (Recebendo)
              </label>
              <input 
                type="text"
                value={incoming}
                onChange={(e) => setIncoming(e.target.value)}
                placeholder="Ex: 2º TEN SILVA..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 font-black uppercase text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
              Observações / Recomendações Especiais para o Próximo Quarto
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Digite orientações do comandante, ordens de serviço pendentes ou instruções específicas..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-white focus:border-indigo-500 outline-none resize-y min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase rounded-xl transition-all shadow-lg flex items-center gap-3 active:scale-95"
            >
              <Send size={16} /> Confirmar Registro de Passagem de Quarto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
