import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Star, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Layers, 
  FileSpreadsheet, 
  X, 
  RefreshCw, 
  LayoutGrid, 
  Table, 
  ChevronLeft, 
  ChevronRight,
  Info,
  PhoneCall
} from 'lucide-react';
import { ExtensionEntry } from '../types';
import { 
  DEPARTMENTS, 
  INITIAL_PHONE_DIRECTORY, 
  SAMPLE_CSV_TEMPLATE, 
  parseCSVToExtensions, 
  exportExtensionsToCSV 
} from '../phoneDirectoryData';

interface PhoneDirectoryPanelProps {
  entries?: ExtensionEntry[];
  onUpdateEntries?: (newEntries: ExtensionEntry[]) => void;
}

export const PhoneDirectoryPanel: React.FC<PhoneDirectoryPanelProps> = ({
  entries: propEntries,
  onUpdateEntries
}) => {
  // Local state initialized with prop or localStorage or initial list
  const [entries, setEntries] = useState<ExtensionEntry[]>(() => {
    if (propEntries && propEntries.length > 0) return propEntries;
    const saved = localStorage.getItem('ship_phone_directory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Erro ao carregar lista telefônica salva:', e);
      }
    }
    return INITIAL_PHONE_DIRECTORY;
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('TODOS');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(30);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExtensionEntry | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState<Partial<ExtensionEntry>>({
    ramal: '',
    setor: '',
    departamento: DEPARTMENTS[0],
    observacoes: ''
  });

  // Import Modal states
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('append');
  const [importPreview, setImportPreview] = useState<ExtensionEntry[]>([]);

  // Feedback Toast state
  const [copiedRamal, setCopiedRamal] = useState<string | null>(null);

  // Save changes to localStorage & trigger callback if present
  const updateList = (newList: ExtensionEntry[]) => {
    setEntries(newList);
    localStorage.setItem('ship_phone_directory', JSON.stringify(newList));
    if (onUpdateEntries) {
      onUpdateEntries(newList);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (ramal: string) => {
    navigator.clipboard.writeText(ramal);
    setCopiedRamal(ramal);
    setTimeout(() => setCopiedRamal(null), 2500);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e);
    updateList(updated);
  };

  // Delete entry
  const handleDelete = (id: string, setor: string) => {
    if (confirm(`Tem certeza que deseja excluir o ramal do setor "${setor}"?`)) {
      const updated = entries.filter(e => e.id !== id);
      updateList(updated);
    }
  };

  // Open add modal
  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormData({
      ramal: '',
      setor: '',
      departamento: DEPARTMENTS[0],
      observacoes: ''
    });
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (entry: ExtensionEntry) => {
    setEditingEntry(entry);
    setFormData({ ...entry });
    setShowAddModal(true);
  };

  // Save Add / Edit form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ramal || !formData.setor) {
      alert('Por favor, preencha pelo menos o Ramal e o Setor/Compartimento.');
      return;
    }

    if (editingEntry) {
      // Edit
      const updated = entries.map(e => e.id === editingEntry.id ? { ...e, ...formData } as ExtensionEntry : e);
      updateList(updated);
    } else {
      // Create new
      const newEntry: ExtensionEntry = {
        id: `ramal-${formData.ramal}-${Date.now()}`,
        ramal: formData.ramal || '',
        setor: formData.setor || '',
        departamento: formData.departamento || 'DIVERSOS',
        observacoes: formData.observacoes || '',
        isFavorite: false
      };
      updateList([newEntry, ...entries]);
    }

    setShowAddModal(false);
  };

  // Reset to initial sample data
  const handleResetDefaults = () => {
    if (confirm('Deseja restaurar a lista telefônica com os ramais padrão do navio? Seus ramais adicionados e edições atuais serão mantidos e integrados.')) {
      const existingRamais = new Set(entries.map(e => e.ramal));
      const toAdd = INITIAL_PHONE_DIRECTORY.filter(i => !existingRamais.has(i.ramal));
      const merged = [...entries, ...toAdd];
      updateList(merged);
    }
  };

  // Parse import preview when import text changes
  const handleTextChange = (text: string) => {
    setImportText(text);
    const parsed = parseCSVToExtensions(text);
    setImportPreview(parsed);
  };

  // Handle file drop/upload in import modal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        handleTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  // Confirm CSV / Batch import
  const handleConfirmImport = () => {
    if (importPreview.length === 0) {
      alert('Nenhum ramal válido foi encontrado no texto ou arquivo fornecido.');
      return;
    }

    if (importMode === 'replace') {
      if (confirm(`Atenção: A lista atual (${entries.length} ramais) será substituída por ${importPreview.length} novos ramais. Confirmar?`)) {
        updateList(importPreview);
        setShowImportModal(false);
        setImportText('');
        setImportPreview([]);
      }
    } else {
      // Append
      updateList([...entries, ...importPreview]);
      setShowImportModal(false);
      setImportText('');
      setImportPreview([]);
      alert(`${importPreview.length} ramais foram adicionados à sua lista telefônica com sucesso!`);
    }
  };

  // Download CSV template helper
  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_lista_telefonica_navio.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export current list to CSV file
  const handleExportCSV = () => {
    const csvContent = exportExtensionsToCSV(entries);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista_telefonica_navio_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRamal = e.ramal.toLowerCase().includes(query);
        const matchesSetor = e.setor.toLowerCase().includes(query);
        const matchesDept = e.departamento.toLowerCase().includes(query);
        const matchesObs = (e.observacoes || '').toLowerCase().includes(query);

        if (!matchesRamal && !matchesSetor && !matchesDept && !matchesObs) {
          return false;
        }
      }

      // Department filter
      if (selectedDept !== 'TODOS' && e.departamento !== selectedDept) {
        return false;
      }

      // Favorites filter
      if (onlyFavorites && !e.isFavorite) {
        return false;
      }

      return true;
    });
  }, [entries, searchQuery, selectedDept, onlyFavorites]);

  // Priority emergency extensions for quick header access
  const priorityExtensions = useMemo(() => {
    const priorityList = entries.filter(e => e.ramal === '999' || e.ramal === '891' || e.ramal === '890' || e.ramal === '500' || e.ramal === '501' || e.isFavorite);
    return priorityList.slice(0, 6);
  }, [entries]);

  // Paginated entries
  const totalPages = Math.ceil(filteredEntries.length / pageSize) || 1;
  const paginatedEntries = useMemo(() => {
    if (pageSize >= 1000) return filteredEntries; // show all
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, currentPage, pageSize]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {copiedRamal && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white font-black text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Check size={20} className="text-emerald-300" />
          <span>Ramal <strong className="underline decoration-blue-300">{copiedRamal}</strong> copiado para a área de transferência!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400 shrink-0">
              <PhoneCall size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                  Lista Telefônica do Navio
                </h2>
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {entries.length} Ramais
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Quick Contacts Bar */}
        {priorityExtensions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-3 text-slate-400 font-black text-xs uppercase tracking-wider">
              <ShieldAlert size={14} className="text-red-400" />
              <span>Ramais de Emergência e Prioritários:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {priorityExtensions.map(ext => (
                <button
                  key={ext.id}
                  onClick={() => handleCopy(ext.ramal)}
                  className="bg-slate-950/80 hover:bg-blue-950/50 border border-slate-800 hover:border-blue-500/50 p-2.5 rounded-xl text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono font-black text-lg text-amber-400 group-hover:text-blue-400 transition-colors">
                      {ext.ramal}
                    </span>
                    <Copy size={12} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 truncate block leading-tight">
                    {ext.setor}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-10 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por Ramal (ex: 500, 891, 999), Setor / Compartimento ou Departamento..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 font-medium focus:border-blue-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* View Mode Toggle & Favorites */}
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-1.5 font-black text-xs ${
                onlyFavorites
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Mostrar apenas favoritos"
            >
              <Star size={16} className={onlyFavorites ? 'fill-amber-400' : ''} />
            </button>

            <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Visualização em Tabela"
              >
                <Table size={18} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Department Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2 pb-1">
          <button
            onClick={() => {
              setSelectedDept('TODOS');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedDept === 'TODOS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({entries.length})
          </button>
          {DEPARTMENTS.map(dept => {
            const count = entries.filter(e => e.departamento === dept).length;
            return (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 px-2">
        <div>
          Mostrando <strong className="text-white">{paginatedEntries.length}</strong> de{' '}
          <strong className="text-white">{filteredEntries.length}</strong> ramais filtrados{' '}
          {entries.length !== filteredEntries.length && `(Total: ${entries.length})`}
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span>Itens por página:</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-bold outline-none"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={9999}>Todos ({entries.length})</option>
          </select>
        </div>
      </div>

      {/* Main Content View (Table or Cards Grid) */}
      {paginatedEntries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Phone className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-black text-xl text-white uppercase">Nenhum ramal encontrado</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Não encontramos nenhum ramal com os filtros selecionados. Tente limpar a busca ou importar sua lista CSV de ramais.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('TODOS');
                setOnlyFavorites(false);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-black px-4 py-2 rounded-xl text-xs uppercase"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase"
            >
              Importar Lista CSV
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-black uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4 w-12 text-center">★</th>
                  <th className="py-4 px-4 font-mono w-32">Ramal</th>
                  <th className="py-4 px-4">Setor / Compartimento</th>
                  <th className="py-4 px-4 w-48">Departamento</th>
                  <th className="py-4 px-4 text-right w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {paginatedEntries.map(entry => (
                  <tr 
                    key={entry.id} 
                    className="hover:bg-slate-800/50 transition-colors group text-slate-200"
                  >
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleFavorite(entry.id)}
                        className="text-slate-600 hover:text-amber-400 transition-colors"
                        title="Favoritar ramal"
                      >
                        <Star size={16} className={entry.isFavorite ? 'fill-amber-400 text-amber-400' : ''} />
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleCopy(entry.ramal)}
                        className="font-mono font-black text-sm sm:text-base text-amber-400 group-hover:text-blue-400 flex items-center gap-2 transition-colors bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 hover:border-blue-500/50"
                        title="Clique para copiar ramal"
                      >
                        <span>{entry.ramal}</span>
                        <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{entry.setor}</div>
                      {entry.observacoes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-lg mt-0.5">{entry.observacoes}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-bold text-[11px]">
                        {entry.departamento}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar ramal"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id, entry.setor)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Excluir ramal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedEntries.map(entry => (
            <div 
              key={entry.id}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(entry.ramal)}
                      className="font-mono font-black text-2xl text-amber-400 group-hover:text-blue-400 transition-colors bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 hover:border-blue-500 flex items-center gap-2"
                      title="Copiar ramal"
                    >
                      <span>{entry.ramal}</span>
                      <Copy size={14} className="opacity-40 group-hover:opacity-100" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(entry.id)}
                      className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      <Star size={18} className={entry.isFavorite ? 'fill-amber-400 text-amber-400' : ''} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id, entry.setor)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h4 className="font-black text-white text-base leading-tight mb-2">
                  {entry.setor}
                </h4>

                <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Layers size={13} className="text-slate-500 shrink-0" />
                    <span className="font-bold text-slate-300">{entry.departamento}</span>
                  </div>
                  {entry.observacoes && (
                    <p className="text-[11px] text-slate-400 pt-1 italic border-t border-slate-800/60 mt-2">
                      "{entry.observacoes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                <button
                  onClick={() => handleCopy(entry.ramal)}
                  className="text-xs font-black text-blue-400 hover:text-blue-300 flex items-center gap-1 uppercase"
                >
                  <Copy size={12} />
                  <span>Copiar Ramal</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-mono text-slate-400">
            Página <strong className="text-white">{currentPage}</strong> de <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
              let pageNum = idx + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + idx;
                if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 font-black text-xs rounded-xl transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Extension */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white p-2 rounded-xl bg-slate-950 border border-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl text-white uppercase">
                  {editingEntry ? 'Editar Ramal' : 'Novo Ramal do Navio'}
                </h3>
                <p className="text-xs text-slate-400">
                  Preencha o número do ramal, setor e departamento correspondente.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 uppercase tracking-wider mb-1.5">Número do Ramal *</label>
                  <input
                    type="text"
                    required
                    value={formData.ramal || ''}
                    onChange={e => setFormData({ ...formData, ramal: e.target.value })}
                    placeholder="Ex: 500, 891"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono font-black text-white text-base focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase tracking-wider mb-1.5">Departamento</label>
                  <select
                    value={formData.departamento || DEPARTMENTS[0]}
                    onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 font-bold text-slate-200 text-xs focus:border-blue-500 outline-none uppercase"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase tracking-wider mb-1.5">Setor / Compartimento *</label>
                <input
                  type="text"
                  required
                  value={formData.setor || ''}
                  onChange={e => setFormData({ ...formData, setor: e.target.value })}
                  placeholder="Ex: Passadiço, CCM Console Principal, Enfermaria..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-bold text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase tracking-wider mb-1.5">Observações (Opcional)</label>
                <textarea
                  value={formData.observacoes || ''}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais, linha direta, etc..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-medium text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black px-5 py-3 rounded-xl uppercase text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-xl uppercase text-xs shadow-lg"
                >
                  {editingEntry ? 'Salvar Alterações' : 'Adicionar Ramal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Batch CSV / Excel Import */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white p-2 rounded-xl bg-slate-950 border border-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <FileSpreadsheet size={28} />
              </div>
              <div>
                <h3 className="font-black text-2xl text-white uppercase">
                  Importar Ramais em Lote (CSV / Excel)
                </h3>
                <p className="text-xs text-slate-400">
                  Carregue um arquivo CSV ou cole a tabela com os ramais do navio para importar instantaneamente.
                </p>
              </div>
            </div>

            {/* Instruction banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <Info size={14} /> Formato Esperado do Arquivo / Tabela:
                </span>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 px-3 py-1 rounded-xl font-black text-[11px] uppercase transition-all flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Baixar Modelo CSV</span>
                </button>
              </div>
              <p className="text-slate-400 font-mono text-[11px] leading-relaxed">
                Ramal ; Setor / Compartimento ; Departamento ; Observações
              </p>
            </div>

            {/* File Upload Drop Box */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase mb-2">
                Opção 1: Selecionar Arquivo CSV / TXT / TSV
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/50 transition-colors">
                <Upload size={24} className="text-slate-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  Clique ou arraste seu arquivo CSV aqui
                </span>
                <span className="text-[11px] text-slate-500 block mb-3">
                  Compatível com arquivos exportados do Excel, Google Sheets ou arquivos de texto.
                </span>
                <input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer transition-all shadow-md"
                >
                  Escolher Arquivo...
                </label>
              </div>
            </div>

            {/* Direct Paste Text Area */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase mb-2">
                Opção 2: Cole o texto ou tabela diretamente do Excel / Word
              </label>
              <textarea
                value={importText}
                onChange={e => handleTextChange(e.target.value)}
                placeholder={`500;COC DA FORÇA;OPERAÇÕES\n501;COMANDANTE (PORTO);ADMINISTRAÇÃO\n891;PASSADIÇO;OPERAÇÕES;Oficial de Quarto\n999;EMERGÊNCIA;MAQUINAS;Linha direta`}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none resize-y"
              />
            </div>

            {/* Preview of Parsed Entries */}
            {importPreview.length > 0 && (
              <div className="space-y-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Check size={16} /> {importPreview.length} Ramais Encontrados e Prontos para Importação!
                  </span>
                </div>

                <div className="overflow-x-auto max-h-40 custom-scrollbar rounded-xl border border-slate-800">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-black sticky top-0">
                      <tr>
                        <th className="p-2">Ramal</th>
                        <th className="p-2">Setor / Compartimento</th>
                        <th className="p-2">Departamento</th>
                        <th className="p-2">Observações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {importPreview.slice(0, 5).map((p, idx) => (
                        <tr key={idx} className="text-slate-300">
                          <td className="p-2 font-black text-amber-400">{p.ramal}</td>
                          <td className="p-2 font-bold text-white">{p.setor}</td>
                          <td className="p-2">{p.departamento}</td>
                          <td className="p-2 text-slate-400">{p.observacoes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 5 && (
                    <div className="p-2 text-center text-[10px] text-slate-500 bg-slate-900 font-bold border-t border-slate-800">
                      ... e mais {importPreview.length - 5} ramais.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Import Mode Radio Options */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-300 uppercase">
                Modo de Importação:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  importMode === 'append' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="accent-blue-500"
                  />
                  <div>
                    <span className="font-black text-xs uppercase block">Adicionar aos Existentes</span>
                    <span className="text-[10px] text-slate-400">Mantém a lista atual ({entries.length}) e junta os novos ramais.</span>
                  </div>
                </label>

                <label className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  importMode === 'replace' ? 'bg-red-600/20 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-red-500"
                  />
                  <div>
                    <span className="font-black text-xs uppercase block text-red-400">Substituir Toda a Lista</span>
                    <span className="text-[10px] text-slate-400">Apaga a lista atual e instala apenas a nova lista importada.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black px-5 py-3 rounded-xl uppercase text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importPreview.length === 0}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black px-6 py-3 rounded-xl uppercase text-xs shadow-lg transition-all"
              >
                Confirmar Importação ({importPreview.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneDirectoryPanel;
