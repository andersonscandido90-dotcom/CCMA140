import React, { useState, useRef, useEffect } from 'react';
import { 
  Droplets, 
  Calculator, 
  Plus, 
  Trash2, 
  Printer, 
  RefreshCw, 
  User, 
  Waves,
  ArrowDownRight,
  ArrowUpRight,
  Gauge,
  CheckCircle2,
  Info,
  Flame,
  Zap
} from 'lucide-react';
import { AguadaData, HidrometroEntry, TanqueAguadaEntry, EquipmentData, EquipmentStatus, PersonnelData } from '../types';

// Capacidades e posições fixas oficiais do navio
export const FIXED_TANKS: TanqueAguadaEntry[] = [
  { posicao: 'AV', tanque: '9FB1', capacidadeMax: 117.76, sondagem: '' },
  { posicao: 'AV', tanque: '9FB2', capacidadeMax: 117.76, sondagem: '' },
  { posicao: 'AR', tanque: '8NA2', capacidadeMax: 161.64, sondagem: '' },
  { posicao: 'AR', tanque: '9Q', capacidadeMax: 180.19, sondagem: '' },
];

export const DEFAULT_AGUADA: AguadaData = {
  sondagemAnterior: '',
  hidrometros: [
    { id: '1', descricao: 'Hidrômetro Cais - Linha 1', inicio: '', fim: '' },
    { id: '2', descricao: 'Hidrômetro Cais - Linha 2', inicio: '', fim: '' },
  ],
  tanquesAtuais: FIXED_TANKS,
  tanqueEmConsumo: '9FB1',
  tanqueRecebendo: '8NA2',
  bagSvc: {
    nivel: '',
    sondagem: '',
    observacoes: ''
  },
  tanqueSvc: {
    nivel: '',
    sondagem: '',
    observacoes: ''
  },
  fielAguadaNome: '',
  observacoesGerais: ''
};

interface AguadaPanelProps {
  data?: AguadaData;
  onChange: (data: AguadaData) => void;
  equipmentData?: EquipmentData;
  personnelData?: PersonnelData;
  shipName?: string;
  selectedDate?: string;
}

export default function AguadaPanel({ 
  data = DEFAULT_AGUADA, 
  onChange, 
  equipmentData, 
  personnelData,
  shipName = 'NAVIO', 
  selectedDate = '' 
}: AguadaPanelProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const printSheetRef = useRef<HTMLDivElement>(null);

  // Garantir que os tanques fixos existam com as capacidades corretas
  const mergedTanques = FIXED_TANKS.map(fixed => {
    const existing = data.tanquesAtuais?.find(t => t.tanque === fixed.tanque);
    return {
      posicao: fixed.posicao,
      tanque: fixed.tanque,
      capacidadeMax: fixed.capacidadeMax,
      sondagem: existing ? existing.sondagem : fixed.sondagem
    };
  });

  const currentData: AguadaData = {
    sondagemAnterior: data.sondagemAnterior ?? DEFAULT_AGUADA.sondagemAnterior,
    hidrometros: data.hidrometros?.length ? data.hidrometros : DEFAULT_AGUADA.hidrometros,
    tanquesAtuais: mergedTanques,
    tanqueEmConsumo: data.tanqueEmConsumo ?? '9FB1',
    tanqueRecebendo: data.tanqueRecebendo ?? '8NA2',
    bagSvc: { ...DEFAULT_AGUADA.bagSvc, ...data.bagSvc },
    tanqueSvc: { ...DEFAULT_AGUADA.tanqueSvc, ...data.tanqueSvc },
    fielAguadaNome: data.fielAguadaNome ?? '',
    observacoesGerais: data.observacoesGerais ?? ''
  };

  // Identificação automática de BAGs em serviço/na linha na aba Equipamentos
  const activeBags = ['BAG 1', 'BAG 2', 'BAG 3', 'BAG 4'].filter(bag => {
    if (!equipmentData) return false;
    const st = equipmentData[bag];
    return st === EquipmentStatus.IN_SERVICE || st === EquipmentStatus.IN_LINE;
  });

  const activeBagsString = activeBags.length > 0 
    ? activeBags.join(', ') + ' (EM SERVIÇO / NA LINHA)' 
    : 'NENHUMA BAG EM SERVIÇO';

  // Sincronizar automaticamente BAG de serviço se o usuário não tiver escrito um texto personalizado
  useEffect(() => {
    if (activeBags.length > 0 && (!currentData.bagSvc.nivel || currentData.bagSvc.nivel.includes('BAG'))) {
      const formatted = activeBags.join(', ') + ' (EM SERVIÇO)';
      if (currentData.bagSvc.nivel !== formatted) {
        onChange({
          ...currentData,
          bagSvc: {
            ...currentData.bagSvc,
            nivel: formatted
          }
        });
      }
    }
  }, [equipmentData]);

  // Identificar militar de Patrulha no quarto de serviço 16:00 às 20:00 para o Fiel da Aguada
  const patrulha1620 = personnelData?.patrulha?.[2] || '';

  // Sincronizar Fiel da Aguada automaticamente com o militar de 16:00 às 20:00 da Patrulha
  useEffect(() => {
    if (patrulha1620 && currentData.fielAguadaNome !== patrulha1620) {
      onChange({
        ...currentData,
        fielAguadaNome: patrulha1620
      });
    }
  }, [patrulha1620]);

  // Cálculos de Totais
  const valA = typeof currentData.sondagemAnterior === 'number' ? currentData.sondagemAnterior : 0;

  // Cálculo B: Soma das diferenças de hidrômetro (fim - início)
  const totalRecebidoB = currentData.hidrometros.reduce((acc, item) => {
    const inicio = typeof item.inicio === 'number' ? item.inicio : 0;
    const fim = typeof item.fim === 'number' ? item.fim : 0;
    const diff = fim >= inicio ? fim - inicio : 0;
    return acc + diff;
  }, 0);

  // Cálculo C: Soma das sondagens dos tanques atuais
  const totalGeralC = currentData.tanquesAtuais.reduce((acc, item) => {
    const sondagem = typeof item.sondagem === 'number' ? item.sondagem : 0;
    return acc + sondagem;
  }, 0);

  // Capacidade total combinada dos tanques fixos (117.76 + 117.76 + 161.64 + 180.19 = 577.35 m³)
  const capacidadeTotalTanques = currentData.tanquesAtuais.reduce((acc, item) => {
    return acc + (item.capacidadeMax || 0);
  }, 0);

  // Porcentagem geral de preenchimento do navio
  const percentualTotalAguada = capacidadeTotalTanques > 0 
    ? (totalGeralC / capacidadeTotalTanques) * 100 
    : 0;

  // Consumo = (A + B - C)
  const consumoTotal = (valA + totalRecebidoB) - totalGeralC;

  // Handlers para Atualizações
  const updateField = (patch: Partial<AguadaData>) => {
    onChange({ ...currentData, ...patch });
  };

  const handleHidrometroChange = (index: number, field: keyof HidrometroEntry, value: any) => {
    const updated = [...currentData.hidrometros];
    updated[index] = { ...updated[index], [field]: value };
    updateField({ hidrometros: updated });
  };

  const addHidrometroRow = () => {
    const newRow: HidrometroEntry = {
      id: Date.now().toString(),
      descricao: `Hidrômetro ${currentData.hidrometros.length + 1}`,
      inicio: '',
      fim: ''
    };
    updateField({ hidrometros: [...currentData.hidrometros, newRow] });
  };

  const removeHidrometroRow = (index: number) => {
    if (currentData.hidrometros.length <= 1) return;
    const updated = currentData.hidrometros.filter((_, i) => i !== index);
    updateField({ hidrometros: updated });
  };

  const handleTanqueSondagemChange = (index: number, value: number | '') => {
    const updated = [...currentData.tanquesAtuais];
    updated[index] = { ...updated[index], sondagem: value };
    updateField({ tanquesAtuais: updated });
  };

  const syncBagFromEquipment = () => {
    const formatted = activeBags.length > 0 
      ? activeBags.join(', ') + ' (EM SERVIÇO)' 
      : 'NENHUMA BAG EM SERVIÇO';
    updateField({
      bagSvc: { ...currentData.bagSvc, nivel: formatted }
    });
  };

  const resetData = () => {
    if (window.confirm('Deseja redefinir os dados da Papeleta de Aguada para os valores padrão?')) {
      onChange(DEFAULT_AGUADA);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Principal */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 sm:p-4 bg-cyan-950 border border-cyan-800/60 rounded-2xl text-cyan-400 shadow-inner">
            <Droplets className="w-7 h-7 sm:w-9 sm:h-9" />
          </div>
          <div>
            <h2 className="font-black text-white uppercase text-xl sm:text-2xl lg:text-3xl tracking-tight">
              Papeleta para Serviço de Fiel da Aguada no Porto
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold mt-0.5">
              Controle de Sondagem, Recebimento, Tanque em Consumo e Consumo de Água Potável
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase px-4 py-3 rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-95"
            title="Visualizar e Imprimir Papeleta"
          >
            <Printer size={16} />
            <span>Imprimir Papeleta</span>
          </button>
          <button
            onClick={resetData}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase px-3 py-3 rounded-xl transition-all border border-slate-700"
            title="Redefinir dados"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Cards de Resumo Executivo / Balanço (A, B, C e Consumo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* A - Sondagem Anterior */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              (A) Sondagem SVC Anterior
            </span>
            <div className="p-2 bg-slate-800 text-amber-400 rounded-lg">
              <Gauge size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {typeof currentData.sondagemAnterior === 'number' ? currentData.sondagemAnterior.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs font-bold text-slate-400">m³</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-2">
            Volume inicial registrado
          </span>
        </div>

        {/* B - Recebimento Total */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              (B) Total Recebido
            </span>
            <div className="p-2 bg-slate-800 text-emerald-400 rounded-lg">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              +{totalRecebidoB.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">m³</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-2">
            Leitura dos hidrômetros
          </span>
        </div>

        {/* C - Total Sondagem Atual */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              (C) Sondagem Atual
            </span>
            <div className="p-2 bg-slate-800 text-cyan-400 rounded-lg">
              <Droplets size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400">
              {totalGeralC.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">/ {capacidadeTotalTanques.toFixed(1)} m³</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(percentualTotalAguada, 100)}%` }}
            />
          </div>
        </div>

        {/* CONSUMO (A + B - C) */}
        <div className={`border p-5 rounded-2xl flex flex-col justify-between ${
          consumoTotal < 0 
            ? 'bg-red-950/40 border-red-800/80' 
            : 'bg-blue-950/40 border-blue-800/80'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase text-blue-200 tracking-wider">
              CONSUMO (A + B - C)
            </span>
            <div className="p-2 bg-blue-900/60 text-blue-300 rounded-lg">
              <Calculator size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {consumoTotal.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-blue-300">m³</span>
          </div>
          <span className="text-[10px] text-blue-300 font-medium mt-2">
            Água consumida no serviço
          </span>
        </div>
      </div>

      {/* PAINEL DE CONTROLE DE OPERAÇÃO DOS TANQUES (CONSUMO E RECEBIMENTO) */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[1.5rem] space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
          <Waves size={18} />
          <h3 className="font-black uppercase text-sm sm:text-base text-white tracking-wide">
            Operação e Fluxo de Tanques no Porto
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tanque em Consumo */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                <ArrowUpRight size={14} />
                Tanque em Consumo
              </label>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Fornecendo Água</span>
            </div>
            <select
              value={currentData.tanqueEmConsumo}
              onChange={(e) => updateField({ tanqueEmConsumo: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-black text-white focus:border-amber-500 outline-none uppercase"
            >
              <option value="NENHUM">Nenhum / Em Paralelo</option>
              {currentData.tanquesAtuais.map(t => (
                <option key={t.tanque} value={t.tanque}>
                  {t.tanque} ({t.posicao}) - Cap. {t.capacidadeMax} m³
                </option>
              ))}
            </select>
          </div>

          {/* Tanque Recebendo Água */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                <ArrowDownRight size={14} />
                Tanque Recebendo Água
              </label>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Recebimento do Cais</span>
            </div>
            <select
              value={currentData.tanqueRecebendo}
              onChange={(e) => updateField({ tanqueRecebendo: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-black text-white focus:border-emerald-500 outline-none uppercase"
            >
              <option value="NENHUM">Nenhum / Sem Recebimento</option>
              {currentData.tanquesAtuais.map(t => (
                <option key={t.tanque} value={t.tanque}>
                  {t.tanque} ({t.posicao}) - Cap. {t.capacidadeMax} m³
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Principal: Seções da Papeleta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* SEÇÃO 1 & 2: SONDAGEM ANTERIOR + RECEBIMENTO DE ÁGUA */}
        <div className="space-y-6">
          {/* SONDAGEM DE AGUADA SVC ANTERIOR */}
          <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[1.5rem] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Gauge size={18} />
                <h3 className="font-black uppercase text-sm sm:text-base text-white tracking-wide">
                  Sondagem de Aguada SVC Anterior (A)
                </h3>
              </div>
              <span className="text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md">
                VALOR A
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Volume em m³ (Sondagem Anterior)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={currentData.sondagemAnterior}
                  onChange={(e) => updateField({ 
                    sondagemAnterior: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 
                  })}
                  placeholder="Ex: 150.0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-base font-black text-white focus:border-amber-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* RECEBIMENTO DE ÁGUA (HIDRÔMETRO) */}
          <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[1.5rem] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ArrowDownRight size={18} />
                <h3 className="font-black uppercase text-sm sm:text-base text-white tracking-wide">
                  Recebimento de Água (Hidrômetro) (B)
                </h3>
              </div>
              <button
                onClick={addHidrometroRow}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase px-2.5 py-1.5 rounded-lg transition-all"
              >
                <Plus size={14} />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Tabela de Hidrômetros */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-black">
                    <th className="py-2 px-2">Hidrômetro</th>
                    <th className="py-2 px-2 w-24">Início</th>
                    <th className="py-2 px-2 w-24">Fim</th>
                    <th className="py-2 px-2 w-24 text-right">Vol (m³)</th>
                    <th className="py-2 px-1 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {currentData.hidrometros.map((item, idx) => {
                    const inicioNum = typeof item.inicio === 'number' ? item.inicio : 0;
                    const fimNum = typeof item.fim === 'number' ? item.fim : 0;
                    const diff = fimNum >= inicioNum ? fimNum - inicioNum : 0;

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.descricao}
                            onChange={(e) => handleHidrometroChange(idx, 'descricao', e.target.value)}
                            placeholder="Descrição / Cais"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs font-semibold text-slate-200 focus:border-emerald-500 outline-none"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.1"
                            value={item.inicio}
                            onChange={(e) => handleHidrometroChange(idx, 'inicio', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs font-bold text-white text-right focus:border-emerald-500 outline-none"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.1"
                            value={item.fim}
                            onChange={(e) => handleHidrometroChange(idx, 'fim', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs font-bold text-white text-right focus:border-emerald-500 outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-black text-emerald-400">
                          {diff > 0 ? `+${diff.toFixed(1)}` : '0.0'}
                        </td>
                        <td className="py-2 px-1 text-center">
                          <button
                            onClick={() => removeHidrometroRow(idx)}
                            className="text-slate-600 hover:text-red-400 p-1 rounded transition-colors"
                            title="Remover linha"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Recebido (B) */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-300">
                TOTAL RECEBIDO (B)
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                +{totalRecebidoB.toFixed(1)} m³
              </span>
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: SONDAGEM DE AGUADA ATUAL (C) - TANQUES FIXOS */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[1.5rem] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Droplets size={18} />
                <h3 className="font-black uppercase text-sm sm:text-base text-white tracking-wide">
                  Sondagem de Aguada Atual (C)
                </h3>
              </div>
              <span className="text-[10px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                4 TANQUES FIXOS
              </span>
            </div>

            {/* Tabela de Tanques Fixos do Navio */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-black">
                    <th className="py-2 px-2 w-16">Posição</th>
                    <th className="py-2 px-2">Tanque</th>
                    <th className="py-2 px-2 text-center w-24">Cap. Máx (m³)</th>
                    <th className="py-2 px-2 text-right w-28">Sondagem (m³)</th>
                    <th className="py-2 px-2 text-right w-20">% Cap.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {currentData.tanquesAtuais.map((item, idx) => {
                    const sondagemNum = typeof item.sondagem === 'number' ? item.sondagem : 0;
                    const maxCap = item.capacidadeMax || 100;
                    const pct = Math.min((sondagemNum / maxCap) * 100, 100);
                    const isConsumo = currentData.tanqueEmConsumo === item.tanque;
                    const isRecebendo = currentData.tanqueRecebendo === item.tanque;

                    return (
                      <tr key={item.tanque} className={`hover:bg-slate-800/40 transition-colors ${
                        isConsumo ? 'bg-amber-950/20' : isRecebendo ? 'bg-emerald-950/20' : ''
                      }`}>
                        <td className="py-2.5 px-2 font-black text-amber-400 uppercase">
                          {item.posicao}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1.5 font-bold text-white uppercase">
                            <span>{item.tanque}</span>
                            {isConsumo && (
                              <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded font-black">
                                CONSUMO
                              </span>
                            )}
                            {isRecebendo && (
                              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-black">
                                RECEBENDO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                          {item.capacidadeMax.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={item.capacidadeMax}
                            value={item.sondagem}
                            onChange={(e) => handleTanqueSondagemChange(idx, e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs font-black text-cyan-300 text-right focus:border-cyan-500 outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-black text-[11px] ${
                              pct > 80 ? 'text-emerald-400' : pct > 30 ? 'text-cyan-400' : 'text-amber-400'
                            }`}>
                              {pct.toFixed(0)}%
                            </span>
                            <div className="w-12 bg-slate-800 rounded-full h-1 mt-0.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  pct > 80 ? 'bg-emerald-400' : pct > 30 ? 'bg-cyan-400' : 'bg-amber-400'
                                }`} 
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Geral (C) */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-300">
                TOTAL GERAL (C) (Sincronizado com Cargas)
              </span>
              <span className="text-base font-black text-cyan-400 font-mono">
                {totalGeralC.toFixed(1)} / {capacidadeTotalTanques.toFixed(1)} m³
              </span>
            </div>
          </div>

          {/* SEÇÕES BAG DE SERVIÇO E TANQUE DE SERVIÇO */}
          <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[1.5rem] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Waves size={18} />
                <h3 className="font-black uppercase text-sm sm:text-base text-white tracking-wide">
                  BAG de Serviço & Tanque de Serviço
                </h3>
              </div>
              <button
                onClick={syncBagFromEquipment}
                className="flex items-center gap-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-all"
                title="Sincronizar com o status da aba Equipamentos"
              >
                <RefreshCw size={12} />
                <span>Sincronizar Equipamentos</span>
              </button>
            </div>

            {/* Banner de Sincronização Automática com Equipamentos */}
            <div className="bg-slate-950 border border-blue-900/50 p-3 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    BAGs Ativas em Equipamentos:
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {activeBagsString}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BAG DE SERVIÇO */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <span className="text-xs font-black uppercase text-blue-300 block border-b border-slate-800/80 pb-2">
                  BAG de Serviço
                </span>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Nível / Status da BAG</label>
                  <input
                    type="text"
                    value={currentData.bagSvc.nivel}
                    onChange={(e) => updateField({ bagSvc: { ...currentData.bagSvc, nivel: e.target.value } })}
                    placeholder="Ex: BAG 1, BAG 2 (Em Serviço)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-bold text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* TANQUE DE SERVIÇO */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-black uppercase text-amber-400">
                    Tanque de Serviço
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Em Consumo</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Tanque em Consumo</label>
                  <select
                    value={currentData.tanqueEmConsumo}
                    onChange={(e) => updateField({ tanqueEmConsumo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-black text-amber-300 focus:border-amber-500 outline-none uppercase"
                  >
                    <option value="NENHUM">NENHUM TANQUE SELECIONADO</option>
                    {currentData.tanquesAtuais.map(t => (
                      <option key={t.tanque} value={t.tanque}>
                        {t.tanque} ({t.posicao}) - Sondagem: {t.sondagem !== '' ? `${t.sondagem} m³` : '0 m³'} / Cap. {t.capacidadeMax} m³
                      </option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const activeTank = currentData.tanquesAtuais.find(t => t.tanque === currentData.tanqueEmConsumo);
                  if (!activeTank) return null;
                  const sondagem = typeof activeTank.sondagem === 'number' ? activeTank.sondagem : 0;
                  const pct = (sondagem / activeTank.capacidadeMax) * 100;
                  return (
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase">Volume Atual:</span>
                      <span className="font-mono font-black text-amber-400">{sondagem.toFixed(1)} / {activeTank.capacidadeMax.toFixed(2)} m³ ({pct.toFixed(0)}%)</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Fiel da Aguada / Responsável */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">
                  Nome do Fiel da Aguada
                </label>
                {patrulha1620 && (
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                    Sincronizado c/ Patrulha (16:00 às 20:00)
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={currentData.fielAguadaNome}
                  onChange={(e) => updateField({ fielAguadaNome: e.target.value })}
                  placeholder="NOME DO MILITAR RESPONSÁVEL..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 pl-10 text-xs font-black uppercase text-white focus:border-blue-500 outline-none"
                />
                <User size={15} className="absolute left-3.5 top-3 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL / VISUALIZAÇÃO DE IMPRESSÃO DA PAPELETA */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex flex-col justify-between p-2 sm:p-6 overflow-y-auto">
          {/* Barra Superior de Controle */}
          <div className="max-w-4xl mx-auto w-full mb-4 flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 no-print">
            <div className="flex items-center gap-3">
              <Droplets className="text-cyan-400" size={24} />
              <div>
                <h3 className="font-black text-white uppercase text-sm sm:text-base">
                  Visualização da Papeleta de Aguada
                </h3>
                <p className="text-slate-400 text-xs">
                  Pronto para impressão em folha A4
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={triggerPrint}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <Printer size={16} />
                <span>Imprimir Agora</span>
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all"
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Folha de Impressão (Design Fiel à Papeleta de Serviço) */}
          <div
            ref={printSheetRef}
            className="max-w-4xl mx-auto w-full bg-white text-black p-8 sm:p-10 rounded-xl shadow-2xl font-sans text-xs border border-gray-200"
          >
            {/* Cabeçalho Oficial */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="font-black text-lg sm:text-xl uppercase tracking-tight text-black">
                PAPELETA PARA SERVIÇO DE FIEL DA AGUADA NO PORTO
              </h1>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 mt-2 px-2">
                <span>NAVIO: {shipName}</span>
                <span>DATA: {selectedDate || new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* OPERAÇÃO DOS TANQUES */}
            <div className="grid grid-cols-2 gap-4 border border-black rounded-md p-3 mb-4 bg-gray-50">
              <div>
                <span className="font-black text-[10px] text-gray-500 uppercase block">TANQUE EM CONSUMO:</span>
                <span className="font-black text-sm uppercase text-black">{currentData.tanqueEmConsumo || 'NENHUM'}</span>
              </div>
              <div>
                <span className="font-black text-[10px] text-gray-500 uppercase block">TANQUE RECEBENDO ÁGUA:</span>
                <span className="font-black text-sm uppercase text-black">{currentData.tanqueRecebendo || 'NENHUM'}</span>
              </div>
            </div>

            {/* 1. SONDAGEM DE AGUADA SVC ANTERIOR */}
            <div className="border border-black rounded-md p-3 mb-4 bg-gray-50/50">
              <h2 className="font-black text-xs uppercase border-b border-black pb-1 mb-2 text-blue-950">
                SONDAGEM DE AGUADA SVC ANTERIOR
              </h2>
              <div className="flex justify-between items-center text-sm font-mono">
                <span className="font-bold">VOL. ANTERIOR (A):</span>
                <span className="font-black text-base">
                  {typeof currentData.sondagemAnterior === 'number' ? `${currentData.sondagemAnterior.toFixed(1)} m³` : '___ m³'}
                </span>
              </div>
            </div>

            {/* 2. RECEBIMENTO DE ÁGUA */}
            <div className="border border-black rounded-md p-3 mb-4">
              <h2 className="font-black text-xs uppercase border-b border-black pb-1 mb-2 text-blue-950">
                RECEBIMENTO DE ÁGUA (HIDRÔMETROS)
              </h2>
              <table className="w-full text-left border-collapse font-mono text-xs mb-2">
                <thead>
                  <tr className="border-b border-black text-[10px] uppercase font-black bg-gray-100">
                    <th className="p-1.5 border-r border-black">HIDRÔMETRO</th>
                    <th className="p-1.5 border-r border-black text-center w-28">INÍCIO</th>
                    <th className="p-1.5 border-r border-black text-center w-28">FIM</th>
                    <th className="p-1.5 text-right w-28">VOL (m³)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {currentData.hidrometros.map((item, idx) => {
                    const inicio = typeof item.inicio === 'number' ? item.inicio : null;
                    const fim = typeof item.fim === 'number' ? item.fim : null;
                    const diff = inicio !== null && fim !== null && fim >= inicio ? fim - inicio : null;

                    return (
                      <tr key={idx}>
                        <td className="p-1.5 border-r border-gray-400 font-semibold">{item.descricao || `Hidrômetro ${idx + 1}`}</td>
                        <td className="p-1.5 border-r border-gray-400 text-center">{inicio !== null ? inicio.toFixed(1) : '-'}</td>
                        <td className="p-1.5 border-r border-gray-400 text-center">{fim !== null ? fim.toFixed(1) : '-'}</td>
                        <td className="p-1.5 text-right font-bold">{diff !== null ? `+${diff.toFixed(1)}` : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="border-t border-black pt-2 flex justify-between items-center text-xs font-mono font-black bg-gray-100 p-2 rounded">
                <span>TOTAL RECEBIDO (B):</span>
                <span className="text-sm">+{totalRecebidoB.toFixed(1)} m³</span>
              </div>
            </div>

            {/* 3. SONDAGEM DE AGUADA ATUAL */}
            <div className="border border-black rounded-md p-3 mb-4">
              <h2 className="font-black text-xs uppercase border-b border-black pb-1 mb-2 text-blue-950">
                SONDAGEM DE AGUADA ATUAL
              </h2>
              <table className="w-full text-left border-collapse font-mono text-xs mb-2">
                <thead>
                  <tr className="border-b border-black text-[10px] uppercase font-black bg-gray-100">
                    <th className="p-1.5 border-r border-black w-20 text-center">POSIÇÃO</th>
                    <th className="p-1.5 border-r border-black">TANQUE</th>
                    <th className="p-1.5 border-r border-black text-center w-28">CAPACIDADE</th>
                    <th className="p-1.5 text-right w-36">SONDAGEM EM m³</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {currentData.tanquesAtuais.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-1.5 border-r border-gray-400 text-center font-bold">{item.posicao}</td>
                      <td className="p-1.5 border-r border-gray-400 font-bold">{item.tanque}</td>
                      <td className="p-1.5 border-r border-gray-400 text-center font-bold">{item.capacidadeMax.toFixed(2)} m³</td>
                      <td className="p-1.5 text-right font-bold">
                        {typeof item.sondagem === 'number' ? `${item.sondagem.toFixed(1)} m³` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-black pt-2 flex justify-between items-center text-xs font-mono font-black bg-gray-100 p-2 rounded">
                <span>TOTAL GERAL (C):</span>
                <span className="text-sm">{totalGeralC.toFixed(1)} / {capacidadeTotalTanques.toFixed(1)} m³</span>
              </div>
            </div>

            {/* 4. CONSUMO (A + B - C) */}
            <div className="border-2 border-black rounded-md p-3 mb-4 bg-gray-100/80">
              <div className="flex justify-between items-center text-sm font-black font-mono">
                <span>CONSUMO (A + B - C):</span>
                <span className="text-base text-black">
                  {consumoTotal.toFixed(1)} m³
                </span>
              </div>
              <p className="text-[9px] font-sans text-gray-600 mt-1 uppercase font-bold">
                Cálculo: ({valA.toFixed(1)} + {totalRecebidoB.toFixed(1)} - {totalGeralC.toFixed(1)})
              </p>
            </div>

            {/* 5. BAG DE SERVIÇO & TANQUE DE SERVIÇO */}
            <div className="grid grid-cols-2 gap-4 border border-black rounded-md p-3 mb-6">
              <div>
                <span className="font-black text-xs uppercase block border-b border-black pb-1 mb-2">
                  BAG DE SERVIÇO
                </span>
                <div className="space-y-1 font-mono text-xs">
                  <div><span className="font-bold">Nível/Status:</span> {currentData.bagSvc.nivel || '---'}</div>
                  <div><span className="font-bold">Sondagem:</span> {typeof currentData.bagSvc.sondagem === 'number' ? `${currentData.bagSvc.sondagem} m³` : '---'}</div>
                </div>
              </div>

              <div>
                <span className="font-black text-xs uppercase block border-b border-black pb-1 mb-2">
                  TANQUE DE SERVIÇO
                </span>
                <div className="space-y-1 font-mono text-xs">
                  <div><span className="font-bold">Tanque em Consumo:</span> {currentData.tanqueEmConsumo || 'NENHUM'}</div>
                  {(() => {
                    const activeTank = currentData.tanquesAtuais.find(t => t.tanque === currentData.tanqueEmConsumo);
                    if (!activeTank) return <div><span className="font-bold">Sondagem:</span> ---</div>;
                    const sondagem = typeof activeTank.sondagem === 'number' ? activeTank.sondagem : 0;
                    return (
                      <div><span className="font-bold">Sondagem:</span> {sondagem.toFixed(1)} / {activeTank.capacidadeMax.toFixed(2)} m³</div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Assinaturas Oficiais */}
            <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs uppercase font-black">
              <div>
                <div className="border-b-2 border-black mb-2 w-4/5 mx-auto"></div>
                <span>{currentData.fielAguadaNome || 'FIEL DA AGUADA'}</span>
                <span className="block text-[9px] font-normal text-gray-600">FIEL DA AGUADA DE SERVIÇO</span>
              </div>
              <div>
                <div className="border-b-2 border-black mb-2 w-4/5 mx-auto"></div>
                <span>CHEFE DE QUARTO</span>
                <span className="block text-[9px] font-normal text-gray-600">CHEFE DE QUARTO</span>
              </div>
              <div>
                <div className="border-b-2 border-black mb-2 w-4/5 mx-auto"></div>
                <span>OFICIAL DE SERVIÇO</span>
                <span className="block text-[9px] font-normal text-gray-600">OFICIAL DE SERVIÇO</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
