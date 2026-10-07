import { ExtensionEntry } from './types';
import { getVaultData } from './utils/cryptoVault';

export const DEPARTMENTS = [
  'ADMINISTRAÇÃO',
  'OPERAÇÕES',
  'MAQUINAS',
  'AVIAÇÃO',
  'ARMAMENTO',
  'SAÚDE',
  'DIVERSOS'
];

export const DECKS = [
  'Passadiço / 03 Convés',
  '02 Convés',
  '01 Convés',
  'Convés Principal (1º Convés)',
  '2º Convés',
  '3º Convés',
  '4º Convés',
  '5º Convés',
  '6º Convés',
  '7º Convés',
  '8º Convés',
  '9º Convés / Porão',
  'Praça de Máquinas',
  'Diversos'
];

// Helper to determine category
function getCategory(setor: string, dept: string, ramal: string): ExtensionEntry['categoria'] {
  const s = setor.toUpperCase();
  if (ramal === '999' || s.includes('EMERGÊNCIA') || s.includes('EMERGENCIA') || s === 'ENFERMARIA' || s === 'CTI') {
    return 'EMERGENCIA';
  }
  if (s.includes('CAMAROTE') || s.includes('COBERTA') || s.includes('ALA FEMININA') || s.includes('SALÃO DE RECREIO') || s.includes('RANCHO')) {
    return 'CAMAROTE';
  }
  if (
    dept === 'ADMINISTRAÇÃO' ||
    s.includes('ESCRITÓRIO') ||
    s.includes('SECRETARIA') ||
    s.includes('PAGAMENTO') ||
    s.includes('MUNICIAMENTO') ||
    s.includes('SARGENTEANCIA') ||
    s.includes('DIVISÃO DE PESSOAL') ||
    s.includes('BARBEARIA') ||
    s.includes('LAVANDERIA') ||
    s.includes('COZINHA') ||
    s.includes('PADARIA')
  ) {
    return 'ADMINISTRATIVO';
  }
  return 'OPERACIONAL';
}

// Helper to deduce deck from name if applicable
function deduceDeck(setor: string): string {
  const s = setor.toUpperCase();
  if (s.includes('PASSADIÇO') || s.includes('CAMARIM DE NAVEGAÇÃO')) return 'Passadiço / 03 Convés';
  if (s.includes('DECK 3') || s.includes('3º CONVÉS')) return '3º Convés';
  if (s.includes('4D') || s.includes('4DZ') || s.includes('4BA') || s.includes('4CA')) return '4º Convés';
  if (s.includes('5N') || s.includes('5P') || s.includes('5M') || s.includes('5DA')) return '5º Convés';
  if (s.includes('6H') || s.includes('6F') || s.includes('6P') || s.includes('6G') || s.includes('6L') || s.includes('6TA') || s.includes('6QB') || s.includes('6GW') || s.includes('6JB')) return '6º Convés';
  if (s.includes('7Q') || s.includes('7M') || s.includes('7CAO') || s.includes('7JZ') || s.includes('7MZ') || s.includes('7GZ') || s.includes('7JA') || s.includes('7NA') || s.includes('7RA')) return '7º Convés';
  if (s.includes('8G')) return '8º Convés';
  if (s.includes('9H') || s.includes('9L') || s.includes('9K') || s.includes('9G') || s.includes('MÁQUINAS') || s.includes('MAQUINAS')) return '9º Convés / Porão';
  if (s.includes('2P') || s.includes('2Q') || s.includes('2R') || s.includes('2S') || s.includes('2T') || s.includes('2K') || s.includes('2G') || s.includes('2B') || s.includes('2C') || s.includes('2D')) return '2º Convés';
  if (s.includes('1º SG') || s.includes('HANGAR') || s.includes('CONVOO') || s.includes('PORTALÓ')) return 'Convés Principal (1º Convés)';
  return 'Diversos';
}

/**
 * Obtém os ramais decifrados em memória do cofre criptografado.
 * NENHUM ramal ou compartimento permanece em texto claro no código compilado.
 */
export const getInitialPhoneDirectory = (): ExtensionEntry[] => {
  const exts = getVaultData()?.phoneExtensions || [];
  return exts.map((item, index) => ({
    id: `ramal-${item.ramal}-${index}`,
    ramal: item.ramal,
    setor: item.setor,
    departamento: item.dept,
    conves: deduceDeck(item.setor),
    responsavel: '',
    categoria: getCategory(item.setor, item.dept, item.ramal),
    observacoes: '',
    isFavorite: item.fav ?? (item.ramal === '999' || item.ramal === '891' || item.ramal === '890')
  }));
};

export const INITIAL_PHONE_DIRECTORY: ExtensionEntry[] = new Proxy([] as ExtensionEntry[], {
  get(target, prop, receiver) {
    const list = getInitialPhoneDirectory();
    if (prop === 'length') return list.length;
    if (prop === 'filter') return list.filter.bind(list);
    if (prop === 'find') return list.find.bind(list);
    if (prop === 'map') return list.map.bind(list);
    if (prop === 'forEach') return list.forEach.bind(list);
    if (prop === 'slice') return list.slice.bind(list);
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      return list[Number(prop)];
    }
    return Reflect.get(list, prop, receiver);
  }
});

export const SAMPLE_CSV_TEMPLATE = `Ramal;Setor / Compartimento;Departamento;Observações
500;COMANDO;OPERAÇÕES;
501;SUPERVISÃO;ADMINISTRAÇÃO;
999;EMERGÊNCIA;MAQUINAS;Linha Direta de Emergência
`;

/**
 * Utility to parse CSV/TSV pasted text or uploaded files
 */
export function parseCSVToExtensions(text: string): ExtensionEntry[] {
  if (!text || !text.trim()) return [];

  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  let delimiter = ';';
  if (firstLineContainsTab(lines[0])) {
    delimiter = '\t';
  } else if ((lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length) {
    delimiter = ';';
  } else if (lines[0].includes(',')) {
    delimiter = ',';
  }

  const results: ExtensionEntry[] = [];
  let startIndex = 0;

  const lowerFirst = lines[0].toLowerCase();
  if (
    lowerFirst.includes('ramal') ||
    lowerFirst.includes('compartimento') ||
    lowerFirst.includes('setor') ||
    lowerFirst.includes('departamento') ||
    lowerFirst.includes('nome')
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const cols = rawLine.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length === 0) continue;

    let setor = '';
    let ramal = '';
    let dept = 'DIVERSOS';
    let observacoes = '';

    if (/^\d{3,4}$/.test(cols[0]) || (!/^\d{3,4}$/.test(cols[1]) && cols[0].length < cols[1]?.length)) {
      ramal = cols[0];
      setor = cols[1] || 'Setor sem Nome';
      dept = cols[2] || 'DIVERSOS';
      observacoes = cols[3] || cols[6] || '';
    } else {
      setor = cols[0] || 'Setor sem Nome';
      ramal = cols[1] || `RAM-${i}`;
      dept = cols[2] || 'DIVERSOS';
      observacoes = cols[3] || cols[6] || '';
    }

    results.push({
      id: `ramal-${ramal}-${Math.random().toString(36).substring(2, 7)}`,
      ramal,
      setor,
      departamento: dept.toUpperCase(),
      observacoes,
      conves: deduceDeck(setor),
      responsavel: '',
      categoria: getCategory(setor, dept, ramal),
      isFavorite: ramal === '999' || ramal === '891' || ramal === '890' || ramal === '500' || ramal === '501'
    });
  }

  return results;
}

function firstLineContainsTab(line: string): boolean {
  return line.includes('\t');
}

/**
 * Utility to export extension entries to CSV format
 */
export function exportExtensionsToCSV(extensions: ExtensionEntry[]): string {
  const header = 'Ramal;Setor / Compartimento;Departamento;Observações\n';
  const rows = extensions.map(e => {
    return [
      `"${e.ramal || ''}"`,
      `"${e.setor || ''}"`,
      `"${e.departamento || ''}"`,
      `"${e.observacoes || ''}"`
    ].join(';');
  }).join('\n');

  return header + rows;
}
