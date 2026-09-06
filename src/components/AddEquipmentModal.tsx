import React, { useState } from 'react';
import { PlusCircle, X, Check, Trash2, Layers, MapPin, Activity, ListFilter, AlertCircle } from 'lucide-react';
import { EquipmentCategory, EquipmentStatus, CustomEquipment } from '../types';
import { STATUS_CONFIG } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: EquipmentCategory[];
  customEquipments: CustomEquipment[];
  onAddEquipment: (equipment: CustomEquipment, initialStatus: EquipmentStatus) => void;
  onDeleteEquipment: (name: string) => void;
}

export const AddEquipmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  customEquipments,
  onAddEquipment,
  onDeleteEquipment
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [name, setName] = useState('');
  const [categorySelect, setCategorySelect] = useState(categories[0]?.name || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [location, setLocation] = useState('');
  const [initialStatus, setInitialStatus] = useState<EquipmentStatus>(EquipmentStatus.AVAILABLE);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const existingNames = new Set(
    categories.flatMap(c => c.items.map(i => i.trim().toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor, informe o nome do equipamento.');
      return;
    }

    if (existingNames.has(trimmedName.toLowerCase())) {
      setError(`Já existe um equipamento cadastrado com o nome "${trimmedName}".`);
      return;
    }

    let finalCategory = categorySelect;
    if (categorySelect === '__NEW__') {
      const trimmedNewCat = newCategoryName.trim();
      if (!trimmedNewCat) {
        setError('Por favor, digite o nome da nova categoria.');
        return;
      }
      finalCategory = trimmedNewCat;
    }

    const trimmedLocation = location.trim().toUpperCase();

    const newEquip: CustomEquipment = {
      name: trimmedName,
      category: finalCategory,
      location: trimmedLocation || undefined,
      createdAt: new Date().toISOString()
    };

    onAddEquipment(newEquip, initialStatus);
    setSuccessMsg(`Equipamento "${trimmedName}" adicionado com sucesso!`);
    
    // Reset fields
    setName('');
    setLocation('');
    setInitialStatus(EquipmentStatus.AVAILABLE);
    if (categorySelect === '__NEW__') {
      setCategorySelect(finalCategory);
      setNewCategoryName('');
    }

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <PlusCircle size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
                Adicionar Equipamento
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Cadastre novos equipamentos no painel de prontidão
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4 sm:px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => { setActiveTab('add'); setError(''); }}
            className={`pb-3 px-3 font-black text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Novo Cadastro
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('list'); setError(''); }}
            className={`pb-3 px-3 font-black text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Personalizados</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {customEquipments.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-950/60 border border-green-800 rounded-xl text-green-200 text-xs flex items-center gap-2">
              <Check size={16} className="shrink-0 text-green-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'add' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-slate-300 tracking-wider">
                  Nome do Equipamento <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    placeholder="Ex: MCA 5, Bomba de Incêndio 6, URA 7..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-medium placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-400" />
                  Categoria <span className="text-red-400">*</span>
                </label>
                <select
                  value={categorySelect}
                  onChange={(e) => {
                    setCategorySelect(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:border-blue-500 focus:outline-none transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name} className="bg-slate-900 text-white">
                      {cat.name}
                    </option>
                  ))}
                  <option value="__NEW__" className="bg-slate-900 text-blue-400 font-bold">
                    + Criar Nova Categoria...
                  </option>
                </select>

                {categorySelect === '__NEW__' && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => { setNewCategoryName(e.target.value); setError(''); }}
                      placeholder="Digite o nome da nova categoria..."
                      className="w-full bg-slate-950 border border-blue-500/80 rounded-xl px-4 py-2.5 text-sm text-white font-medium placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Localização / Compartimento */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-blue-400" />
                  Compartimento / Localização <span className="text-slate-500 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value.toUpperCase())}
                  placeholder="Ex: 9H, 7P, 2K, Praça de Máquinas..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Status Inicial */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-blue-400" />
                  Status Inicial
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(EquipmentStatus).map((st) => {
                    const cfg = STATUS_CONFIG[st];
                    const isSelected = initialStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setInitialStatus(st)}
                        className={`p-2.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${
                          isSelected
                            ? `${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} ring-2 ring-blue-400 shadow-md`
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{cfg.label}</span>
                        {isSelected && <Check size={14} className="shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  <span>Cadastrar Equipamento</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {customEquipments.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <ListFilter size={32} className="mx-auto text-slate-600" />
                  <p className="text-sm font-bold text-slate-400">Nenhum equipamento adicionado manualmente ainda.</p>
                  <p className="text-xs text-slate-500">
                    Use a aba &quot;Novo Cadastro&quot; acima para adicionar novos equipamentos ao sistema.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-medium pb-1">
                    Equipamentos adicionados pelo usuário. Você pode removê-los a qualquer momento:
                  </p>
                  {customEquipments.map((eq) => (
                    <div
                      key={eq.name}
                      className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-white text-sm tracking-wide uppercase">
                            {eq.name}
                          </span>
                          {eq.location && (
                            <span className="bg-blue-950/80 text-blue-300 border border-blue-800/50 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                              #{eq.location}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          Categoria: <strong className="text-slate-300">{eq.category}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remover o equipamento "${eq.name}" do sistema?`)) {
                            onDeleteEquipment(eq.name);
                          }
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
                        title="Remover equipamento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
