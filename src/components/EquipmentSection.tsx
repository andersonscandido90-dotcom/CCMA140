import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  Snowflake, 
  Droplets, 
  ShipWheel, 
  Flame, 
  Zap, 
  Wind, 
  Waves, 
  ShieldCheck,
  Power,
  Thermometer,
  Search,
  Filter,
  X
} from 'lucide-react';
import { EquipmentCategory, EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG, EQUIPMENT_LOCATIONS } from '../constants';

interface Props {
  categories: EquipmentCategory[];
  data: EquipmentData;
  onStatusChange: (name: string) => void;
}

const SnowLayer: React.FC = () => {
  const particles = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    duration: `${2 + Math.random() * 3}s`,
    delay: `${Math.random() * 5}s`,
    size: `${2 + Math.random() * 4}px`
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 z-0">
      {particles.map((p, i) => (
        <div 
          key={i} 
          className="snow-particle" 
          style={{ 
            left: p.left, 
            animationDuration: p.duration, 
            animationDelay: p.delay,
            width: p.size,
            height: p.size
          }} 
        />
      ))}
    </div>
  );
};

const EquipmentSection: React.FC<Props> = ({ categories, data, onStatusChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EquipmentStatus>('ALL');

  // Calculates status counters across all equipment
  const counts = useMemo(() => {
    let total = 0;
    const statCounts: Record<string, number> = {
      [EquipmentStatus.IN_LINE]: 0,
      [EquipmentStatus.IN_SERVICE]: 0,
      [EquipmentStatus.RESTRICTED]: 0,
      [EquipmentStatus.UNAVAILABLE]: 0,
      [EquipmentStatus.AVAILABLE]: 0,
    };

    categories.forEach(cat => {
      cat.items.forEach(item => {
        total++;
        const st = data[item] || EquipmentStatus.AVAILABLE;
        statCounts[st] = (statCounts[st] || 0) + 1;
      });
    });

    return { total, ...statCounts };
  }, [categories, data]);

  const getIcon = (name: string, status: EquipmentStatus, isMobile: boolean) => {
    const isRunning = status === EquipmentStatus.IN_LINE || status === EquipmentStatus.IN_SERVICE;
    const isUnavailable = status === EquipmentStatus.UNAVAILABLE;
    
    let animationClass = '';
    if (isRunning) {
      if (name.includes('Purificador') || name.includes('GOR') || name.includes('DEMIN') || name.includes('Separador')) {
        animationClass = 'animate-drip';
      } else if (
        (name.includes('HPSW') || name.includes('Bomba') || name.includes('MotoBomba') || name.includes('LPSW')) && 
        !name.includes('Água Quente')
      ) {
        animationClass = 'animate-wave-move';
      } else if (
        name.includes('MCA') || 
        name.includes('MCP') || 
        name.includes('Leme') || 
        name.includes('Gerador') || 
        name.includes('BAG') || 
        name.includes('Água Quente')
      ) {
        animationClass = 'animate-spin';
      } else if (name.includes('BOILER')) {
        animationClass = 'animate-pulse';
      } else {
        animationClass = 'animate-pulse';
      }
    }

    const props = {
      size: isMobile ? 20 : 32,
      className: `transition-all duration-700 ${!isUnavailable ? 'opacity-100' : 'opacity-40'} ${animationClass}`
    };

    if (name.includes('URA') || name.includes('Frigorífica') || name.includes('Container')) return <Snowflake {...props} />;
    if (
      name.includes('MCA') || 
      name.includes('MCP') || 
      name.includes('Gerador') || 
      name.includes('BAG') || 
      name.includes('Água Quente')
    ) return <Settings {...props} />;
    if (name.includes('BOILER')) return <Thermometer {...props} />;
    if (name.includes('Purificador') || name.includes('GOR') || name.includes('DEMIN') || name.includes('Separador')) return <Droplets {...props} />;
    if (name.includes('Leme')) return <ShipWheel {...props} />;
    if (
      (name.includes('HPSW') || name.includes('Bomba') || name.includes('LPSW') || name.includes('MotoBomba')) &&
      !name.includes('Água Quente')
    ) return <Waves {...props} />;
    if (name.includes('CBP') || name.includes('CMP') || name.includes('CAP')) return <Wind {...props} />;
    if (name.includes('Incêndio')) return <Flame {...props} />;
    if (name.includes('Proteção')) return <ShieldCheck {...props} />;
    
    return <Settings {...props} />;
  };

  const getNameSizeClass = (name: string) => {
    const len = name.length;
    // Mobile first sizing
    if (len <= 5) return 'text-xl xs:text-2xl sm:text-5xl lg:text-7xl';
    if (len <= 10) return 'text-base xs:text-xl sm:text-3xl lg:text-5xl';
    if (len <= 18) return 'text-sm xs:text-lg sm:text-2xl lg:text-4xl';
    return 'text-xs xs:text-sm sm:text-xl lg:text-3xl';
  };

  return (
    <div className="space-y-6 lg:space-y-10">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-6 rounded-2xl lg:rounded-[2rem] space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar equipamento por nome ou localização (ex: MCP, #9H)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-10 py-3 text-sm text-white font-mono focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'ALL' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Todos ({counts.total})
            </button>

            {Object.values(EquipmentStatus).map((st) => {
              const cfg = STATUS_CONFIG[st];
              const count = counts[st] || 0;
              const isActive = statusFilter === st;

              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    isActive 
                      ? `${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} shadow-md scale-105` 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.bgColor}`} />
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {categories.map(category => {
        // Filter items
        const filteredItems = category.items.filter((item) => {
          const st = data[item] || EquipmentStatus.AVAILABLE;
          const loc = EQUIPMENT_LOCATIONS[item] || '';
          const matchesSearch = 
            item.toLowerCase().includes(searchTerm.toLowerCase()) || 
            loc.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'ALL' || st === statusFilter;
          return matchesSearch && matchesStatus;
        });

        if (filteredItems.length === 0 && (searchTerm || statusFilter !== 'ALL')) {
          return null; // Skip empty category if filters are active
        }

        const isCoolingCategory = category.name.includes('Climatização') || category.name.includes('Planta Frigorífica');

        return (
          <div key={category.name} className="bg-slate-900/60 border border-slate-700/50 shadow-2xl backdrop-blur-md rounded-[1.5rem] lg:rounded-[3rem] p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-6 lg:mb-12 gap-3">
              <h4 className="font-black text-white uppercase tracking-widest text-sm sm:text-lg lg:text-3xl flex items-center gap-3">
                <div className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] shrink-0" />
                <span className="truncate">{category.name}</span>
              </h4>
              <span className="text-[8px] sm:text-xs font-bold text-slate-500 bg-slate-950 px-3 py-1 rounded-full whitespace-nowrap">
                {filteredItems.length} ITENS {filteredItems.length !== category.items.length ? `(de ${category.items.length})` : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {filteredItems.map((item) => {
                const status = data[item] || EquipmentStatus.AVAILABLE;
                const config = STATUS_CONFIG[status];
                const isRunning = status === EquipmentStatus.IN_LINE || status === EquipmentStatus.IN_SERVICE;
                const showSnow = isCoolingCategory && isRunning && (item.includes('URA') || item.includes('Frigorífica') || item.includes('Container'));

                return (
                  <button 
                    key={item}
                    onClick={() => onStatusChange(item)}
                    className={`relative transition-all duration-300 border-2 sm:border-[3px] lg:border-[4px] rounded-xl sm:rounded-[1.5rem] lg:rounded-[2.5rem] p-3 sm:p-4 lg:p-6 flex flex-col justify-between min-h-[140px] sm:min-h-[180px] lg:min-h-[260px] text-left overflow-hidden 
                      ${config.bgColor} ${config.textColor} ${config.borderColor} 
                      active:scale-95 hover:brightness-110 shadow-lg
                      ${status === EquipmentStatus.IN_LINE ? 'active-glow-green' : ''}
                    `}
                  >
                    {showSnow && <SnowLayer />}

                    <div className="flex justify-between items-start relative z-10 w-full mb-2">
                      <span className="font-black uppercase opacity-90 text-[8px] sm:text-xs lg:text-xl bg-black/40 px-2 py-1 sm:px-4 sm:py-2 rounded-lg lg:rounded-xl border border-white/10 shadow-lg">
                        #{EQUIPMENT_LOCATIONS[item] || '??'}
                      </span>
                      <div className="bg-white/10 p-1 lg:p-2 rounded-lg lg:rounded-2xl shrink-0">
                        {getIcon(item, status, true)}
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto w-full">
                      <span className={`font-black uppercase leading-[0.9] block tracking-tighter drop-shadow-md ${getNameSizeClass(item)}`}>
                        {item}
                      </span>
                      <div className="mt-2 sm:mt-4 lg:mt-6 flex justify-between items-center border-t border-white/20 pt-2 lg:pt-4">
                        <span className="text-[7px] sm:text-[11px] lg:text-[14px] font-black uppercase tracking-widest opacity-90 drop-shadow-sm truncate mr-1">
                          {status !== EquipmentStatus.UNAVAILABLE ? config.label : 'INDISP.'}
                        </span>
                        {isRunning && (
                          <div className="bg-white/20 p-1 lg:p-1.5 rounded-full shrink-0">
                            <Power size={12} className="animate-pulse text-white sm:w-[18px] sm:h-[18px]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EquipmentSection;
