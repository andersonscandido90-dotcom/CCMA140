import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, X, Check, Trash2, Layers, MapPin, Activity, AlertCircle, Search, RotateCcw, Filter } from 'lucide-react';
import { EquipmentCategory, EquipmentStatus, CustomEquipment } from '../types';
import { STATUS_CONFIG } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'add' | 'delete';
  categories: EquipmentCategory[];
  customEquipments: CustomEquipment[];
  removedEquipments?: string[];
  locations?: Record<string, string>;
  onAddEquipment: (equipment: CustomEquipment, initialStatus: EquipmentStatus) => void;
  onDeleteEquipment: (name: string) => void;
  onRestoreEquipment?: (name: string) => void;
}

export const AddEquipmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialTab = 'add',
  categories,
  customEquipments,
  removedEquipments = [],
  locations = {},
  onAddEquipment,
  onDeleteEquipment,
  onRestoreEquipment
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'delete'>(initialTab);
  
  // Tab: Add Equipment states
  const [name, setName] = useState('');
  const [categorySelect, setCategorySelect] = useState(categories[0]?.name || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [location, setLocation] = useState('');
  const [initialStatus, setInitialStatus] = useState<EquipmentStatus>(EquipmentStatus.AVAILABLE);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab: Delete Equipment states
  const [deleteSearchTerm, setDeleteSearchTerm] = useState('');
  const [deleteCategoryFilter, setDeleteCategoryFilter] = useState('ALL');
  const [selectedEquipToDelete, setSelectedEquipToDelete] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError('');
      setSuccessMsg('');
      setDeleteSuccessMsg('');
      setShowConfirmDelete(null);
    }
  }, [isOpen, initialTab]);

  // Set of custom equipment names
  const customNamesSet = useMemo(() => {
    return new Set(customEquipments.map(e => e.name.toLowerCase()));
  }, [customEquipments]);

  // Flattened active equipments list for deletion tab
  const allActiveEquipments = useMemo(() => {
    const list: { name: string; category: string; location?: string; isCustom: boolean }[] = [];
    categories.forEach(cat => {
      cat.items.forEach(itemName => {
        list.push({
          name: itemName,
          category: cat.name,
          location: locations[itemName],
          isCustom: customNamesSet.has(itemName.toLowerCase())
        });
      });
    });
    return list;
  }, [categories, locations, customNamesSet]);

  // Filtered equipment list for deletion
  const filteredDeleteList = useMemo(() => {
    return allActiveEquipments.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(deleteSearchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(deleteSearchTerm.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(deleteSearchTerm.toLowerCase()));
      
      const matchesCategory = deleteCategoryFilter === 'ALL' || item.category === deleteCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allActiveEquipments, deleteSearchTerm, deleteCategoryFilter]);

  if (!isOpen) return null;

  const existingNames = new Set(
    categories.flatMap(c => c.items.map(i => i.trim().toLowerCase()))
  );

  const handleAddSubmit = (e: React.FormEvent) => {
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
    setSuccessMsg(`Equipamento "${trimmedName}" cadastrado com sucesso!`);
    
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

  const handleExecuteDelete = (itemNameToDelete: string) => {
    onDeleteEquipment(itemNameToDelete);
    setShowConfirmDelete(null);
    setSelectedEquipToDelete('');
    setDeleteSuccessMsg(`Equipamento "${itemNameToDelete}" excluído.`);
    setTimeout(() => {
      setDeleteSuccessMsg('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              activeTab === 'add' 
                ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' 
                : 'bg-red-600/20 border-red-500/30 text-red-400'
            }`}>
              {activeTab === 'add' ? <PlusCircle size={22} /> : <Trash2 size={22} />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
                {activeTab === 'add' ? 'Adicionar Equipamento' : 'Excluir Equipamento'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {activeTab === 'add' 
                  ? 'Cadastre novos equipamentos no painel de prontidão' 
                  : 'Remova equipamentos do painel e relatórios'}
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

        {/* Abas */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => { setActiveTab('add'); setError(''); setShowConfirmDelete(null); }}
            className={`pb-3 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle size={15} />
            <span>Novo Equipamento</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('delete'); setError(''); }}
            className={`pb-3 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'delete'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trash2 size={15} />
            <span>Excluir Equipamento</span>
            {customEquipments.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold">
                {customEquipments.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* Messages */}
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

          {deleteSuccessMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <Check size={16} className="shrink-0 text-red-400" />
              <span>{deleteSuccessMsg}</span>
            </div>
          )}

          {/* ABA 1: NOVO EQUIPAMENTO */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSubmit} className="space-y-4">
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
          )}

          {/* ABA 2: EXCLUIR EQUIPAMENTO */}
          {activeTab === 'delete' && (
            <div className="space-y-4">
              {/* Seleção Rápida de Exclusão */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <label className="block text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Trash2 size={14} className="text-red-400" />
                  Selecione o equipamento para excluir
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedEquipToDelete}
                    onChange={(e) => setSelectedEquipToDelete(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:border-red-500 focus:outline-none"
                  >
                    <option value="">-- Selecione o equipamento --</option>
                    {customEquipments.length > 0 && (
                      <optgroup label="Equipamentos Personalizados">
                        {customEquipments.map(e => (
                          <option key={`c-${e.name}`} value={e.name}>
                            {e.name} ({e.category}) {e.location ? `[#${e.location}]` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Todos os Equipamentos">
                      {allActiveEquipments
                        .filter(e => !customNamesSet.has(e.name.toLowerCase()))
                        .map(e => (
                          <option key={`a-${e.name}`} value={e.name}>
                            {e.name} ({e.category}) {e.location ? `[#${e.location}]` : ''}
                          </option>
                        ))}
                    </optgroup>
                  </select>

                  <button
                    type="button"
                    disabled={!selectedEquipToDelete}
                    onClick={() => {
                      if (selectedEquipToDelete) {
                        setShowConfirmDelete(selectedEquipToDelete);
                      }
                    }}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Trash2 size={14} />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>

              {/* Confirm Dialog Inline */}
              {showConfirmDelete && (
                <div className="p-4 bg-red-950/80 border border-red-700 rounded-xl text-xs text-white space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-sm">
                        Confirmar exclusão de &quot;{showConfirmDelete}&quot;?
                      </span>
                      <p className="text-slate-300 mt-1">
                        O equipamento será removido da grade de equipamentos, gráficos e relatórios.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-[11px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteDelete(showConfirmDelete)}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] flex items-center gap-1.5 shadow-md"
                    >
                      <Trash2 size={13} />
                      <span>Sim, Excluir</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Busca e Filtro de Categoria da Lista */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={deleteSearchTerm}
                    onChange={(e) => setDeleteSearchTerm(e.target.value)}
                    placeholder="Filtrar por nome, categoria ou compartimento..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none"
                  />
                  {deleteSearchTerm && (
                    <button
                      onClick={() => setDeleteSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:w-56">
                  <Filter size={14} className="text-slate-500 shrink-0" />
                  <select
                    value={deleteCategoryFilter}
                    onChange={(e) => setDeleteCategoryFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:border-red-500 focus:outline-none"
                  >
                    <option value="ALL">Todas Categorias</option>
                    {categories.map(c => (
                      <option key={`filter-${c.name}`} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista dos Equipamentos */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {filteredDeleteList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800">
                    Nenhum equipamento encontrado com esse filtro.
                  </div>
                ) : (
                  filteredDeleteList.map((item) => (
                    <div
                      key={`del-${item.name}`}
                      className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-white text-xs tracking-wide uppercase">
                            {item.name}
                          </span>
                          {item.location && (
                            <span className="bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono px-1.5 py-0.2 rounded">
                              #{item.location}
                            </span>
                          )}
                          {item.isCustom ? (
                            <span className="bg-blue-950/70 border border-blue-800/50 text-blue-300 text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                              Personalizado
                            </span>
                          ) : (
                            <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded">
                              Padrão
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                          {item.category}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowConfirmDelete(item.name)}
                        className="px-2.5 py-1.5 text-red-400 hover:text-white bg-red-950/30 hover:bg-red-600 border border-red-900/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                        title="Excluir equipamento"
                      >
                        <Trash2 size={13} />
                        <span className="hidden xs:inline">Excluir</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Se houver equipamentos excluídos, opção de restaurar */}
              {removedEquipments.length > 0 && onRestoreEquipment && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <RotateCcw size={13} className="text-slate-500" />
                    Equipamentos Excluídos ({removedEquipments.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {removedEquipments.map((remName) => (
                      <span
                        key={`rem-${remName}`}
                        className="bg-slate-950 border border-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <span className="line-through">{remName}</span>
                        <button
                          type="button"
                          onClick={() => onRestoreEquipment(remName)}
                          className="text-blue-400 hover:text-blue-300 hover:underline font-bold text-[10px] uppercase ml-1 flex items-center gap-0.5"
                          title="Restaurar este equipamento"
                        >
                          <RotateCcw size={10} /> Restaurar
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
