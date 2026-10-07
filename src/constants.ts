import { EquipmentStatus, StatusConfig, EquipmentCategory } from './types';
import { ISIS_DATA } from './isisData';
import { getVaultData } from './utils/cryptoVault';

export { ISIS_DATA };

export const STATUS_CONFIG: Record<EquipmentStatus, StatusConfig> = {
  [EquipmentStatus.IN_LINE]: {
    id: EquipmentStatus.IN_LINE,
    label: "Na Linha",
    color: "#22c55e",
    bgColor: "bg-green-600",
    textColor: "text-white",
    borderColor: "border-green-400"
  },
  [EquipmentStatus.IN_SERVICE]: {
    id: EquipmentStatus.IN_SERVICE,
    label: "De Serviço",
    color: "#3b82f6",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    borderColor: "border-blue-400"
  },
  [EquipmentStatus.RESTRICTED]: {
    id: EquipmentStatus.RESTRICTED,
    label: "Com Restrição",
    color: "#eab308",
    bgColor: "bg-yellow-500",
    textColor: "text-black",
    borderColor: "border-yellow-300"
  },
  [EquipmentStatus.AVAILABLE]: {
    id: EquipmentStatus.AVAILABLE,
    label: "Disponível",
    color: "#94a3b8",
    bgColor: "bg-slate-700",
    textColor: "text-slate-200",
    borderColor: "border-slate-500"
  },
  [EquipmentStatus.UNAVAILABLE]: {
    id: EquipmentStatus.UNAVAILABLE,
    label: "Indisponível",
    color: "#ef4444",
    bgColor: "bg-red-600",
    textColor: "text-white",
    borderColor: "border-red-400"
  }
};

export const getVaultCategories = (): EquipmentCategory[] => {
  return getVaultData()?.categories || [];
};

export const getVaultLocations = (): Record<string, string> => {
  return getVaultData()?.equipmentLocations || {};
};

export const getVaultShipConfig = () => {
  return getVaultData()?.shipConfig || {
    name: "CENTRO DE CONTROLE DE MÁQUINAS",
    hullNumber: "",
    designation: "",
    badgeUrl: ""
  };
};

export const getVaultEductorSections = (): SectionEductorData[] => {
  return getVaultData()?.eductorSections || [];
};

/**
 * Categorias de Equipamentos decifradas na memória.
 * NENHUM nome de equipamento permanece em texto claro no bundle.
 */
export const CATEGORIES: EquipmentCategory[] = new Proxy([] as EquipmentCategory[], {
  get(target, prop, receiver) {
    const list = getVaultData()?.categories || [];
    if (prop === 'length') return list.length;
    if (prop === Symbol.iterator) return list[Symbol.iterator].bind(list);
    const val = (list as any)[prop];
    if (typeof val === 'function') return val.bind(list);
    return val;
  }
});

/**
 * Localizações dos equipamentos decifradas na memória.
 * NENHUM compartimento interno permanece em texto claro no bundle.
 */
export const EQUIPMENT_LOCATIONS: Record<string, string> = new Proxy({} as Record<string, string>, {
  get(target, prop, receiver) {
    const locs = getVaultData()?.equipmentLocations || {};
    return (locs as any)[prop];
  },
  ownKeys() {
    return Object.keys(getVaultData()?.equipmentLocations || {});
  },
  getOwnPropertyDescriptor(target, prop) {
    const locs = getVaultData()?.equipmentLocations || {};
    if (typeof prop === 'string' && prop in locs) {
      return { configurable: true, enumerable: true, value: locs[prop] };
    }
    return undefined;
  },
  has(target, prop) {
    const locs = getVaultData()?.equipmentLocations || {};
    return typeof prop === 'string' && prop in locs;
  }
});

/**
 * Identificação do navio decifrada dinamicamente na memória.
 */
export const SHIP_CONFIG = new Proxy({
  name: "CENTRO DE CONTROLE DE MÁQUINAS",
  hullNumber: "",
  designation: "",
  badgeUrl: ""
}, {
  get(target, prop, receiver) {
    const sc = getVaultData()?.shipConfig || target;
    return Reflect.get(sc, prop, receiver);
  }
});

export interface EductorInfo {
  capacity: number;
  deck: number;
  side?: 'BB' | 'BE';
}

export interface SectionEductorData {
  section: string;
  name: string;
  eductors: EductorInfo[];
  sewageVia?: string;
}

/**
 * Seções e edutores de Controle de Avarias (CAV) decifrados na memória.
 */
export const EDUCTOR_SECTIONS: SectionEductorData[] = new Proxy([] as SectionEductorData[], {
  get(target, prop, receiver) {
    const list = getVaultData()?.eductorSections || [];
    if (prop === 'length') return list.length;
    if (prop === Symbol.iterator) return list[Symbol.iterator].bind(list);
    const val = (list as any)[prop];
    if (typeof val === 'function') return val.bind(list);
    return val;
  }
});
