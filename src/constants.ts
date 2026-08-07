import { EquipmentStatus, StatusConfig, EquipmentCategory } from './types';
import { ISIS_DATA } from './isisData';

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

export const CATEGORIES: EquipmentCategory[] = [
  {
    name: "Propulsão e Geração de Energia",
    items: ["MCP BB", "MCP BE", "MCA 1", "MCA 2", "MCA 3", "MCA 4", "Gerador de Emerg"]
  },
  {
    name: "Climatização do AR",
    items: ["URA 1", "URA 2", "URA 3", "URA 4", "URA 5", "URA 6"]
  },
  {
    name: "Osmose e Purificação",
    items: ["GOR 1", "GOR 2", "GOR 3", "GOR 4", "DEMIN", "Separador de Óleo/Água", "Purificador Óleo Comb 1", "Purificador Óleo Comb 2", "Purificador Óleo Lub 1", "Purificador Óleo Lub 2", "Purificador Redutora 1", "Purificador Redutora 2", "Purificador Óleo Lub GER Diesel"]
  },
  {
    name: "Governo (Leme)",
    items: ["Maquina do Leme BE 1", "Maquina do Leme BE 2", "Maquina do Leme BB 1", "Maquina do Leme BB 2"]
  },
  {
    name: "Rede de Incêndio",
    items: ["HPSW 1", "HPSW 2", "HPSW 3", "HPSW 4", "HPSW 5", "Bomba de Serviço 1", "Bomba de Serviço 2", "Bomba de Serviço 3", "MotoBomba 1", "MotoBomba 2", "MotoBomba 3", "MotoBomba 4"]
  },
  {
    name: "Compressores e Bombas de Resfriamento",
    items: ["LPSW 1", "LPSW 2", "LPSW 3", "LPSW 4", "CAP 1", "CAP 2", "CAP 3", "CMP 1", "CMP 2", "CMP de Emergência", "CBP 1", "CBP 2", "CBP 3", "CBP 4", "CBP 5"]
  },
  {
    name: "Planta Frigorífica e Climatização da Água",
    items: ["Planta Frigorífica 1", "Planta Frigorífica 2", "BAG 1", "BAG 2", "BAG 3", "BAG 4", "BOILER 1", "BOILER 2", "BOILER 3", "BOILER 4", "Bomba de Água Quente 1", "Bomba de Água Quente 2", "Container 1", "Container 2", "Container 3"]
  },
  {
    name: "Equipamentos Gerais",
    items: ["Elevador de Aeronaves AV", "Elevador de Aeronaves AR", "Guindaste", "Estabilizador BB", "Estabilizador BE", "Proteção Catódica AV", "Proteção Catódica AR"]
  }
];

export const EQUIPMENT_LOCATIONS: Record<string, string> = {
  "MCP BB": "9L", "MCP BE": "9H", "MCA 1": "9H", "MCA 2": "9H", "MCA 3": "9L", "MCA 4": "9L",
  "Gerador de Emerg": "1K", "URA 1": "9J", "URA 2": "9J", "URA 3": "9J", "URA 4": "9M", "URA 5": "9M", "URA 6": "9M",
  "GOR 1": "9J", "GOR 2": "9J", "GOR 3": "9M", "GOR 4": "9M", "DEMIN": "9K", "Separador de Óleo/Água": "9K",
  "Purificador Óleo Comb 1": "9K", "Purificador Óleo Comb 2": "9K", "Purificador Óleo Lub 1": "9K", "Purificador Óleo Lub 2": "9K",
  "Purificador Redutora 1": "9K", "Purificador Redutora 2": "9K", "Purificador Óleo Lub GER Diesel": "9K",
  "Maquina do Leme BE 1": "7T", "Maquina do Leme BE 2": "7T", "Maquina do Leme BB 1": "7T", "Maquina do Leme BB 2": "7T",
  "HPSW 1": "9D", "HPSW 2": "9F", "HPSW 3": "9H", "HPSW 4": "9L", "HPSW 5": "8Q",
  "Bomba de Serviço 1": "9H", "Bomba de Serviço 2": "9L", "Bomba de Serviço 3": "9L",
  "MotoBomba 1": "7G", "MotoBomba 2": "7J", "MotoBomba 3": "7N", "MotoBomba 4": "7R",
  "LPSW 1": "9H", "LPSW 2": "9H", "LPSW 3": "9L", "LPSW 4": "9L", "CAP 1": "9H", "CAP 2": "9L", "CAP 3": "7C",
  "CMP 1": "9H", "CMP 2": "9L", "CMP de Emergência": "1K", "CBP 1": "9J", "CBP 2": "9J", "CBP 3": "9M", "CBP 4": "9M", "CBP 5": "7P",
  "Planta Frigorífica 1": "7R", "Planta Frigorífica 2": "7R", "BAG 1": "9F", "BAG 2": "9F", "BAG 3": "9N", "BAG 4": "9N",
  "BOILER 1": "9F", "BOILER 2": "9F", "BOILER 3": "9N", "BOILER 4": "9N", "Bomba de Água Quente 1": "9F", "Bomba de Água Quente 2": "9N",
  "Container 1": "4R", "Container 2": "4R", "Container 3": "4R", "Elevador de Aeronaves AV": "1G", "Elevador de Aeronaves AR": "1N",
  "Guindaste": "1P", "Estabilizador BB": "9J", "Estabilizador BE": "9J", "Proteção Catódica AV": "9C", "Proteção Catódica AR": "9N"
};

export const SHIP_CONFIG = {
  name: "NAM ATLÂNTICO",
  hullNumber: "A140",
  designation: "Navio-Aeródromo Multipropósito",
  badgeUrl: "https://tse3.mm.bing.net/th/id/OIP.LNrxq3XEZYXeVQv73TZEtQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3"
};
