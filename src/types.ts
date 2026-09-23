export enum EquipmentStatus {
  IN_LINE = 'IN_LINE',
  RESTRICTED = 'RESTRICTED',
  IN_SERVICE = 'IN_SERVICE',
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface StatusConfig {
  id: EquipmentStatus;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export interface FuelData {
  water: number;
  lubOil: number;
  fuelOil: number;
  jp5: number;
  maxWater: number;
  maxLubOil: number;
  maxFuelOil: number;
  maxJp5: number;
}

export interface StabilityData {
  draftForward: number; // Calado AV
  draftAft: number;     // Calado AR
  heel: number;         // Banda (Graus) - Positivo BE, Negativo BB
  gm: number;           // Altura Metacêntrica
  displacement: number; // Deslocamento
}

export interface PersonnelData {
  supervisorMO: string;
  supervisorEL: string;
  fielCav: string;
  encarregadoMaquinas: string;
  auxiliares: string[];
  patrulha: string[];
}

export interface EquipmentData {
  [name: string]: EquipmentStatus;
}

export interface LogEntry {
  id: string;
  item: string;
  timestamp: string;
  oldStatus: EquipmentStatus;
  newStatus: EquipmentStatus;
  user?: string;
}

export interface IsisEntry {
  channel: string;
  description: string;
  translation: string;
  category?: string;
}

export interface CorteSoldaEntry {
  id: string;
  compartimento: string;
  soldador: string;
  ompsEmpresa: string;
  servicos: {
    corte: boolean;
    solda: boolean;
    aquecimento: boolean;
  };
  fireBoys: string[];
}

export interface HidrometroEntry {
  id: string;
  descricao: string;
  inicio: number | '';
  fim: number | '';
}

export interface TanqueAguadaEntry {
  posicao: string;
  tanque: string;
  capacidadeMax: number;
  sondagem: number | '';
}

export interface AguadaData {
  sondagemAnterior: number | '';
  hidrometros: HidrometroEntry[];
  tanquesAtuais: TanqueAguadaEntry[];
  tanqueEmConsumo?: string;
  tanqueRecebendo?: string;
  bagSvc: {
    nivel: string;
    sondagem: number | '';
    observacoes: string;
  };
  tanqueSvc: {
    nivel: string;
    sondagem: number | '';
    observacoes: string;
  };
  fielAguadaNome?: string;
  observacoesGerais?: string;
}

export interface ExtensionEntry {
  id: string;
  ramal: string;
  setor: string;
  departamento: string;
  conves?: string;
  responsavel?: string;
  categoria?: 'EMERGENCIA' | 'OPERACIONAL' | 'ADMINISTRATIVO' | 'CAMAROTE' | 'DIVERSOS';
  observacoes?: string;
  isFavorite?: boolean;
}

export interface DailyReport {
  date: string;
  equipment: EquipmentData;
  fuel: FuelData;
  stability: StabilityData;
  personnel: PersonnelData;
  aguada?: AguadaData;
  logs?: LogEntry[];
  serviceNotes?: string;
  restrictionReasons?: Record<string, string>;
  eductorStatuses?: Record<string, boolean>;
  isisOverrides?: Record<string, string>;
  corteSoldaList?: CorteSoldaEntry[];
  phoneDirectory?: ExtensionEntry[];
  theme?: string;
  customEquipments?: CustomEquipment[];
  removedEquipments?: string[];
  cavExercises?: CavExerciseEntry[];
}

export interface CavExerciseEntry {
  id: string;
  name: string;
  tipoExercicio: 'alagamento' | 'incendio' | 'nivel_cm';
  date: string;
  time: string;
  compartimento: string;
  secao: string;
  conves?: string;
  
  // Parâmetros de medição em centímetros (Sondagens)
  nivelAguaCm?: number;
  areaCompartimentoM2?: number;
  taxaSubidaCmMin?: number;
  capacidadeEsgotoFixoTh?: number;
  saldoEsgotoTh?: number;
  tempoEsgotoMin?: number;
  
  // Parâmetros do furo / rombo
  tipoGeometria?: 'circular' | 'retangular' | 'area';
  diametroCm?: number;
  comprimentoCm?: number;
  larguraCm?: number;
  areaCm2?: number;
  profundidadeH?: number; // Profundidade do centro do orifício abaixo da linha d'água (m)
  coeficienteCd?: number; // Coeficiente de descarga
  densidadeAgua?: number; // t/m³ (1.025 água salgada)
  
  // Compartimento
  comprimentoComp?: number;
  bocaComp?: number;
  alturaComp?: number;
  permeabilidade?: number;
  
  // Recursos de esgoto mobilizados
  edutoresAtivos?: string[];
  bombasPortateisAtivas?: { tipo: string; capacidade: number; qtd: number }[];
  
  // Água de Incêndio (se aplicável)
  linhas15Pol?: number;
  linhas25Pol?: number;
  tempoCombateMin?: number;
  
  // Resultados calculados
  vazaoM3h: number;
  vazaoTh: number;
  velocidadeMs: number;
  pressaoKpa: number;
  forcaKgf: number;
  
  // Registro do exercício
  turmaReparo?: string;
  tempoContencaoMin?: number;
  tecnicaUtilizada?: string;
  observacoes?: string;
}

export interface EquipmentCategory {
  name: string;
  items: string[];
}

export interface CustomEquipment {
  name: string;
  category: string;
  location?: string;
  createdAt?: string;
}
