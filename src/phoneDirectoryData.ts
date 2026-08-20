import { ExtensionEntry } from './types';

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

const RAW_OFFICIAL_EXTENSIONS: Array<{ setor: string; ramal: string; dept: string; fav?: boolean }> = [
  // Imagem 1
  { setor: 'COC DA FORÇA', ramal: '500', dept: 'OPERAÇÕES' },
  { setor: 'COMANDANTE (PORTO)', ramal: '501', dept: 'ADMINISTRAÇÃO', fav: true },
  { setor: 'EGA (CAMAROTE)', ramal: '503', dept: 'ARMAMENTO' },
  { setor: 'COMANDANTE (VIAGEM)', ramal: '505', dept: 'ADMINISTRAÇÃO', fav: true },
  { setor: 'IMEDIATO (CAMAROTE)', ramal: '507', dept: 'ADMINISTRAÇÃO', fav: true },
  { setor: 'IMEDIATO (VIAGEM)', ramal: '508', dept: 'ADMINISTRAÇÃO', fav: true },
  { setor: 'SALA DE REUNIÃO DA 2ª DIVISÃO', ramal: '509', dept: 'ARMAMENTO' },
  { setor: 'ESCRITÓRIO IMEDIATO', ramal: '510', dept: 'ADMINISTRAÇÃO', fav: true },
  { setor: 'CAMAROTE SO (PAPA)', ramal: '511', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CORREDOR SO/SG 6P', ramal: '512', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SALÃO DE RECREIO 1º SG N', ramal: '514', dept: 'ADMINISTRAÇÃO' },
  { setor: 'OFICINA DA MIKE', ramal: '515', dept: 'MAQUINAS' },
  { setor: 'SUPERVISÃO DE ENFERMAGEM', ramal: '517', dept: 'SAÚDE', fav: true },
  { setor: 'PAIOL DE SOBRESSALENTES PRINCIPAL', ramal: '518', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CCM CONTENÇÃO', ramal: '519', dept: 'MAQUINAS' },
  { setor: 'SALA DO CAV DA AVIAÇÃO', ramal: '521', dept: 'AVIAÇÃO' },
  { setor: 'OFICINA ESTRUTURA AVIAÇÃO', ramal: '523', dept: 'AVIAÇÃO' },
  { setor: 'SALA DE PRONTIDÃO 5', ramal: '524', dept: 'AVIAÇÃO' },
  { setor: 'ESCOTERIA 2PZ7', ramal: '525', dept: 'ARMAMENTO' },
  { setor: 'OFICINA DA ROMEO', ramal: '526', dept: 'MAQUINAS' },
  { setor: 'ESCRITÓRIO TÉCNICO DO ARMAMENTO', ramal: '527', dept: 'ARMAMENTO' },
  { setor: 'REDUTORA DE RE', ramal: '528', dept: 'MAQUINAS' },
  { setor: 'PRAÇA DE MÁQUINAS AV (9H)', ramal: '529', dept: 'MAQUINAS' },
  { setor: 'COBERTA DE SG (6H)', ramal: '530', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESTAÇÃO RÁDIO', ramal: '531', dept: 'OPERAÇÕES' },
  { setor: 'PRAÇA DE MÁQUINAS A RÉ (9L)', ramal: '532', dept: 'MAQUINAS' },
  { setor: 'ESCRITÓRIO DA V-2', ramal: '533', dept: 'AVIAÇÃO' },
  { setor: 'ESCRITÓRIO TÉCNICO DO ARMAMENTO', ramal: '534', dept: 'ARMAMENTO' },
  { setor: 'ESCRITÓRIO DA GESTORIA DE MATERIAL', ramal: '536', dept: 'ADMINISTRAÇÃO' },
  { setor: 'OFICINA ET', ramal: '537', dept: 'OPERAÇÕES' },
  { setor: 'COC DA FORÇA', ramal: '538', dept: 'OPERAÇÕES' },
  { setor: 'SALA DE TRANSMISSÃO / OF. ET', ramal: '539', dept: 'OPERAÇÕES' },
  { setor: 'SECOM', ramal: '540', dept: 'OPERAÇÕES' },
  { setor: 'ESC. BABCOCK', ramal: '541', dept: 'MAQUINAS' },
  { setor: 'COZINHA', ramal: '543', dept: 'ADMINISTRAÇÃO' },
  { setor: 'PAIOL DE GÊNEROS (7Q)', ramal: '544', dept: 'ADMINISTRAÇÃO' },
  { setor: 'FERRAMENTARIA', ramal: '545', dept: 'AVIAÇÃO' },
  { setor: 'REPARO 1.1', ramal: '546', dept: 'MAQUINAS', fav: true },
  { setor: 'REPARO 1.2', ramal: '547', dept: 'MAQUINAS', fav: true },
  { setor: 'REPARO 1.3', ramal: '548', dept: 'MAQUINAS', fav: true },
  { setor: 'REPARO 2.1', ramal: '549', dept: 'MAQUINAS', fav: true },
  { setor: 'REPARO 2.2', ramal: '550', dept: 'MAQUINAS', fav: true },
  { setor: 'REPARO 3.1', ramal: '551', dept: 'MAQUINAS', fav: true },
  { setor: 'REPARO 3.2', ramal: '552', dept: 'MAQUINAS', fav: true },
  { setor: 'PAIOL DE BATERIAS', ramal: '553', dept: 'AVIAÇÃO' },
  { setor: 'GIRO AV', ramal: '554', dept: 'MAQUINAS' },
  { setor: 'ALA FEMININA (PRAÇAS)', ramal: '555', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCRITÓRIO DO CAPELÃO', ramal: '557', dept: 'ADMINISTRAÇÃO' },
  { setor: 'METEOROLOGIA', ramal: '558', dept: 'OPERAÇÕES' },
  { setor: 'INTERIOR DO MASTRO AR', ramal: '559', dept: 'OPERAÇÕES' },
  { setor: 'SALÃO REC. DOS CB/MN ADMINISTRAÇÃO', ramal: '560', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DA INTENDÊNCIA (6F)', ramal: '561', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COZINHA DE COMBATE', ramal: '562', dept: 'ADMINISTRAÇÃO' },
  { setor: 'HANGAR 1', ramal: '563', dept: 'AVIAÇÃO' },
  { setor: 'HANGAR DE MANUTENÇÃO', ramal: '564', dept: 'AVIAÇÃO' },
  { setor: 'LAVANDERIA (7M)', ramal: '566', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SALÃO DE RECREIO DE SO', ramal: '569', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SO MOR (CAMAROTE)', ramal: '570', dept: 'OPERAÇÕES' },
  { setor: 'CAMAROTE DESTACADO 2SY4', ramal: '571', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMARA COMTE DE FORÇA', ramal: '572', dept: 'ADMINISTRAÇÃO' },
  { setor: 'QEP AV (7JZ0)', ramal: '574', dept: 'MAQUINAS' },
  { setor: 'SALA DE PRONTIDÃO 1', ramal: '577', dept: 'AVIAÇÃO' },
  { setor: 'OFICINA ET', ramal: '578', dept: 'OPERAÇÕES' },
  { setor: 'SALA DE ESTAR COMANDANTE (VIAGEM)', ramal: '579', dept: 'ADMINISTRAÇÃO' },
  { setor: 'POPA BB', ramal: '580', dept: 'ARMAMENTO' },
  { setor: 'OFICINA DA AGUADA', ramal: '581', dept: 'MAQUINAS', fav: true },
  { setor: 'CORREDOR 7CAO', ramal: '582', dept: 'ADMINISTRAÇÃO' },
  { setor: 'OFICINA DA LIMA', ramal: '585', dept: 'MAQUINAS' },
  { setor: 'RANCHO DE CB/MN', ramal: '587', dept: 'ADMINISTRAÇÃO' },
  { setor: 'OFICINA DAS METRALHADORAS', ramal: '588', dept: 'ARMAMENTO' },
  { setor: 'COC', ramal: '589', dept: 'OPERAÇÕES', fav: true },
  { setor: 'SALA DE PRONTIDÃO SO/SG', ramal: '590', dept: 'AVIAÇÃO' },
  { setor: 'HANGAR', ramal: '592', dept: 'AVIAÇÃO' },
  { setor: 'HANGAR BE AR', ramal: '593', dept: 'AVIAÇÃO' },
  { setor: 'PRAÇA DARMAS ANTE SALA', ramal: '594', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMARIM DE NAVEGAÇÃO', ramal: '596', dept: 'OPERAÇÕES' },
  { setor: 'ESCRITÓRIO ADESTRAMENTO DA AVIAÇÃO', ramal: '597', dept: 'AVIAÇÃO' },
  { setor: 'PROA', ramal: '598', dept: 'ARMAMENTO' },
  { setor: 'SALA DE OPERAÇÕES AÉREAS', ramal: '599', dept: 'AVIAÇÃO' },
  { setor: 'PORTALÓ DE BE A RÉ', ramal: '600', dept: 'ARMAMENTO' },
  { setor: 'RADAR AV', ramal: '602', dept: 'OPERAÇÕES' },
  { setor: 'BRIEFING DE OPERAÇÕES', ramal: '603', dept: 'OPERAÇÕES' },
  { setor: 'SALA DE PRONTIDÃO (CHINUK)', ramal: '604', dept: 'AVIAÇÃO' },
  { setor: 'SUPERVISOR DO COC', ramal: '605', dept: 'OPERAÇÕES', fav: true },
  { setor: 'SARGENTEANCIA DA AVIAÇÃO', ramal: '606', dept: 'AVIAÇÃO' },
  { setor: 'ESCRITÓRIO DO GRUCET', ramal: '607', dept: 'OPERAÇÕES' },
  { setor: 'ESCRITÓRIO DO GRUCET 2KZ0', ramal: '608', dept: 'OPERAÇÕES' },
  { setor: 'MID 9K', ramal: '609', dept: 'MAQUINAS' },
  { setor: 'CAM 6QB1', ramal: '611', dept: 'AVIAÇÃO' },
  { setor: 'ESC. BABCOCK', ramal: '613', dept: 'MAQUINAS' },
  { setor: 'CONSULTÓRIO ODONTOLÓGICO', ramal: '614', dept: 'SAÚDE' },
  { setor: 'SALÃO DE RECREIO 2º/3º SG N', ramal: '615', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CT SOUZA SANTANA (CAMAROTE)', ramal: '616', dept: 'MAQUINAS' },
  { setor: 'BARBEARIA', ramal: '617', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CTI', ramal: '618', dept: 'SAÚDE', fav: true },
  { setor: 'CICE', ramal: '619', dept: 'ADMINISTRAÇÃO' },
  { setor: 'MID 9K', ramal: '620', dept: 'MAQUINAS' },
  { setor: '6L SERVIDOR', ramal: '623', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCRITÓRIO TÉCNICO DA MÁQUINA A/L', ramal: '625', dept: 'MAQUINAS' },
  { setor: 'FIEL DE PAGAMENTO', ramal: '627', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA CB/MN OPERAÇÕES', ramal: '628', dept: 'OPERAÇÕES' },
  { setor: 'OFICINA DO CONTROLE', ramal: '629', dept: 'MAQUINAS' },
  { setor: 'SALA DE PRONTIDÃO 5 5DA1', ramal: '630', dept: 'AVIAÇÃO' },
  { setor: 'CAMAROTE 6GW2', ramal: '631', dept: 'ARMAMENTO' },
  { setor: 'SALÃO DE RECREIO 1º SG N', ramal: '632', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS SG H', ramal: '633', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA 2º/3º SG H', ramal: '636', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SALÃO DE RECREIO DOS SG DESTACADOS', ramal: '637', dept: 'ADMINISTRAÇÃO' },
  { setor: 'OFICINA DO CAV', ramal: '641', dept: 'MAQUINAS', fav: true },
  { setor: 'CORREDOR 5N', ramal: '645', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCRITÓRIO TÉCNICO DA MÁQUINA M/R', ramal: '646', dept: 'MAQUINAS' },
  { setor: 'PAIOL DE SOBREVIVENCIA', ramal: '647', dept: 'AVIAÇÃO' },
  { setor: 'ESCOTERIA 2QA0', ramal: '648', dept: 'ARMAMENTO' },
  { setor: 'CORREDOR 2PA1', ramal: '649', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCRITÓRIO DO CHEMAQ', ramal: '650', dept: 'MAQUINAS', fav: true },
  { setor: 'GIRO A RÉ', ramal: '652', dept: 'MAQUINAS' },
  { setor: 'PAIOL DE ROUPA DE CAMA', ramal: '653', dept: 'ADMINISTRAÇÃO' },
  { setor: 'HQ2', ramal: '654', dept: 'MAQUINAS' },
  { setor: 'PRAÇA DE MÁQUINAS AV', ramal: '655', dept: 'MAQUINAS' },
  { setor: 'PRAÇA DE MÁQUINAS AV', ramal: '656', dept: 'MAQUINAS' },
  { setor: 'ILHA EXTERNA AV', ramal: '657', dept: 'AVIAÇÃO' },
  { setor: 'ACR/FSCO', ramal: '658', dept: 'AVIAÇÃO' },
  { setor: 'ESTAÇÃO TOM Nº 03', ramal: '659', dept: 'AVIAÇÃO' },
  { setor: 'SALA DO EQMAN', ramal: '660', dept: 'AVIAÇÃO' },
  { setor: 'ACR/FSCO', ramal: '662', dept: 'AVIAÇÃO' },
  { setor: 'COPA DO DAE', ramal: '663', dept: 'AVIAÇÃO' },
  { setor: 'COBERTA DE DESTACADOS 2BA4', ramal: '664', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 2BA1', ramal: '665', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 2CA2', ramal: '666', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 2CA1', ramal: '667', dept: 'ADMINISTRAÇÃO' },
  { setor: 'OFICINA CANHÃO DE BB AV', ramal: '668', dept: 'ARMAMENTO' },
  { setor: 'COBERTA DOS DESTACADOS 2DA2', ramal: '669', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 2DZ1', ramal: '670', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COC', ramal: '671', dept: 'OPERAÇÕES' },
  { setor: 'CORREDOR 2GA5', ramal: '673', dept: 'ARMAMENTO' },
  { setor: 'COMPARTIMENTO CMS', ramal: '675', dept: 'OPERAÇÕES' },
  { setor: 'CORREDOR 2TX0', ramal: '676', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA 4D', ramal: '677', dept: 'ADMINISTRAÇÃO' },
  { setor: 'REDUTORA A RE', ramal: '678', dept: 'MAQUINAS' },
  { setor: 'ESCRITÓRIO DA V-3', ramal: '680', dept: 'AVIAÇÃO' },
  { setor: 'SUPERVISOR FN', ramal: '681', dept: 'ARMAMENTO' },
  { setor: 'SEC. DA INTELIGÊNCIA', ramal: '682', dept: 'ARMAMENTO' },
  { setor: 'OFICINA DO CANHÃO DE BE AV', ramal: '683', dept: 'ARMAMENTO' },
  { setor: 'CORREDOR 5M BB', ramal: '685', dept: 'MAQUINAS' },
  { setor: 'OFICINA DE SOBREVIVÊNCIA DA AVIAÇÃO', ramal: '687', dept: 'AVIAÇÃO' },
  { setor: 'ESC. DE SEGURANÇA DA AVIAÇÃO', ramal: '688', dept: 'AVIAÇÃO' },
  { setor: 'COC DA FORÇA ANFÍBIA', ramal: '689', dept: 'OPERAÇÕES' },
  { setor: 'SARGENTEANCIA DO ADESTRAMENTO', ramal: '690', dept: 'OPERAÇÕES' },
  { setor: 'ENFERMARIA', ramal: '692', dept: 'SAÚDE', fav: true },
  { setor: 'LABORATÓRIO ODONTOLÓGICO', ramal: '693', dept: 'SAÚDE' },
  { setor: 'CONSULTÓRIO MÉDICO', ramal: '694', dept: 'SAÚDE', fav: true },
  { setor: 'CHEFE DEPTO SAÚDE', ramal: '695', dept: 'SAÚDE', fav: true },

  // Imagem 2
  { setor: 'PAIOL DE MATERIAL MÉDICO', ramal: '696', dept: 'SAÚDE' },
  { setor: 'ESCRITÓRIO ADESTRAMENTO DA AVIAÇÃO', ramal: '697', dept: 'AVIAÇÃO' },
  { setor: 'OFICINA DE AVIÔNICA', ramal: '698', dept: 'AVIAÇÃO' },
  { setor: 'PORTALÓ BB AR/POPA', ramal: '699', dept: 'ARMAMENTO' },
  { setor: 'CPD', ramal: '700', dept: 'OPERAÇÕES' },
  { setor: 'PORTALÓ AV BB/BE', ramal: '701', dept: 'ARMAMENTO', fav: true },
  { setor: 'SECRETARIA SEGURANÇA ORGÂNICA', ramal: '703', dept: 'ARMAMENTO' },
  { setor: 'COBERTA 1º SG H', ramal: '704', dept: 'ADMINISTRAÇÃO' },
  { setor: 'PAGAMENTO (ENCARREGADO)', ramal: '705', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCRITÓRIO DO MUNICIAMENTO', ramal: '706', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CORREDOR 2N NODE 16', ramal: '710', dept: 'ADMINISTRAÇÃO' },
  { setor: 'OFICINA ET', ramal: '711', dept: 'OPERAÇÕES' },
  { setor: 'SALA DE ESTADO', ramal: '713', dept: 'ARMAMENTO' },
  { setor: 'PRAÇA DE MÁQUINAS AV', ramal: '714', dept: 'MAQUINAS' },
  { setor: 'PRAÇA DE MÁQUINAS AR', ramal: '716', dept: 'MAQUINAS' },
  { setor: 'CAIXA DE ECONOMIAS', ramal: '717', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SARGENTEANCIA GERAL', ramal: '718', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCRITÓRIO DO DAE (HS-1)', ramal: '724', dept: 'OPERAÇÕES' },
  { setor: 'ESCRITÓRIO DO DAE (HU-2)', ramal: '725', dept: 'OPERAÇÕES' },
  { setor: 'CAMAROTE DESTACADO 2RA4', ramal: '726', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE DESTACADO FEMININO 2RA3', ramal: '727', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCRITÓRIO DO DAE (HU-1/HI-1)', ramal: '728', dept: 'OPERAÇÕES' },
  { setor: 'CBO (MATERIAL CONTROLADO)', ramal: '730', dept: 'OPERAÇÕES' },
  { setor: 'CAMAROTE DESTACADO 2TZ8', ramal: '731', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE DESTACADO 2TZ6', ramal: '732', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE DESTACADO 2TZ4', ramal: '733', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE DESTACADO 2TZ2', ramal: '734', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE DESTACADO 2TA5', ramal: '735', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE DESTACADO 2TA1', ramal: '736', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCOTERIA 2QZ3', ramal: '737', dept: 'ARMAMENTO' },
  { setor: 'CAMAROTE DESTACADO 2SY1', ramal: '738', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE DESTACADO 2SY3', ramal: '739', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE DESTACADO 2SY5', ramal: '740', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ACADEMIA 6TA0', ramal: '742', dept: 'ARMAMENTO' },
  { setor: 'COBERTA DOS DESTACADOS 3BA0', ramal: '743', dept: 'ADMINISTRAÇÃO' },
  { setor: 'PRAÇA DE MÁQUINAS A RÉ (9L)', ramal: '744', dept: 'MAQUINAS' },
  { setor: 'COBERTA DOS DESTACADOS 3CA4', ramal: '745', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 3DA4', ramal: '746', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 3CA0', ramal: '747', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 3DA1', ramal: '748', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE SO/SG 7JZ0', ramal: '749', dept: 'ADMINISTRAÇÃO' },
  { setor: 'AREA DE LAZER DO DECK 3', ramal: '750', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CORREDOR 5Q', ramal: '751', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CORREDOR 2Q', ramal: '752', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE DESTACADO 2TA3', ramal: '754', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SALA DE CONTROLE DO HANGAR', ramal: '755', dept: 'AVIAÇÃO' },
  { setor: 'OFICINA DO CANHÃO BB A RÉ', ramal: '756', dept: 'ARMAMENTO' },
  { setor: 'LAVANDERIA DO DECK 3', ramal: '757', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 4BA1', ramal: '758', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 4CA2', ramal: '760', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 4CA1', ramal: '761', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCRITÓRIO DO SUPERVISOR AM', ramal: '762', dept: 'ARMAMENTO' },
  { setor: 'COBERTA 4DZ4', ramal: '763', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCOTERIA', ramal: '764', dept: 'ARMAMENTO' },
  { setor: 'OFICINA DE MARINHARIA/ESC. MESTRE', ramal: '765', dept: 'ARMAMENTO' },
  { setor: 'SALÃO DE RECREIO DE 2º/3º SG', ramal: '766', dept: 'ADMINISTRAÇÃO' },
  { setor: 'OFICINA DE SOLDA', ramal: '769', dept: 'MAQUINAS' },
  { setor: 'OFICINA DO CANHÃO DE BE A RÉ', ramal: '771', dept: 'ARMAMENTO' },
  { setor: 'CORREDOR 6G', ramal: '772', dept: 'ADMINISTRAÇÃO' },
  { setor: 'PAIOL DE COLETES', ramal: '775', dept: 'ARMAMENTO' },
  { setor: 'COPA DA PRAÇA DARMAS', ramal: '780', dept: 'ADMINISTRAÇÃO' },
  { setor: 'PAIOL DE TINTAS', ramal: '782', dept: 'ARMAMENTO' },
  { setor: 'DIVISÃO DE PESSOAL', ramal: '783', dept: 'ADMINISTRAÇÃO' },
  { setor: 'REPARO 3.2', ramal: '784', dept: 'MAQUINAS', fav: true },
  { setor: 'CORREDOR 5P', ramal: '785', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CORREDOR 6L', ramal: '786', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COPA DO COMANDANTE', ramal: '788', dept: 'ADMINISTRAÇÃO' },
  { setor: 'RANCHO DOS SO/1º SG', ramal: '789', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SARGENTEANCIA DA MAQUINA', ramal: '790', dept: 'MAQUINAS' },
  { setor: 'QEP AR', ramal: '792', dept: 'MAQUINAS' },
  { setor: 'COBERTA CB/MN ARMAMENTO', ramal: '794', dept: 'ARMAMENTO' },
  { setor: 'COBERTA DOS SG H', ramal: '795', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA 2º/3º SG AVIAÇÃO', ramal: '797', dept: 'AVIAÇÃO' },
  { setor: 'COBERTA DOS SG H', ramal: '798', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SO GUERRA (CAMAROTE)', ramal: '799', dept: 'OPERAÇÕES' },
  { setor: 'COBERTA 2º/3º SG AVIAÇÃO', ramal: '802', dept: 'AVIAÇÃO' },
  { setor: 'COBERTA DOS CB DA AVIAÇÃO 7GZ0', ramal: '803', dept: 'AVIAÇÃO' },
  { setor: 'CORREDOR DOS CAMAROTE DE OFICIAIS J', ramal: '805', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CORREDOR DOS CAMAROTE DE OFICIAIS J', ramal: '806', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CORREDOR DOS CAMAROTE DE OFICIAIS J', ramal: '807', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SALA DE CFTV', ramal: '810', dept: 'ARMAMENTO' },
  { setor: 'ESCRITÓRIO TÉC. DA MÁQUINA AJUDANTES', ramal: '812', dept: 'MAQUINAS' },
  { setor: 'NAAFI / PAIOL DE MATERIAL DE LIMPEZA', ramal: '813', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCRITÓRIO SO MOR', ramal: '814', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CORREDOR DOS CAMAROTE DE OFICIAIS J', ramal: '815', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CC MONCORES (CAMAROTE)', ramal: '816', dept: 'OPERAÇÕES' },
  { setor: 'CORREDOR DOS CAMAROTE DE OFICIAIS J', ramal: '818', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SUBAVI (CAMAROTE)', ramal: '821', dept: 'AVIAÇÃO' },
  { setor: 'CC GABRIEL LEITE (CAMAROTE)', ramal: '822', dept: 'AVIAÇÃO' },
  { setor: 'CHEOPE (CAMAROTE)', ramal: '823', dept: 'OPERAÇÕES', fav: true },
  { setor: 'CC THURLER (CAMAROTE)', ramal: '824', dept: 'MAQUINAS' },
  { setor: 'COMPARTIMENTO DA HIDRAULICA AV', ramal: '827', dept: 'ARMAMENTO' },
  { setor: 'COBERTA DOS CB DA MÁQUINAS', ramal: '831', dept: 'MAQUINAS' },
  { setor: 'COBERTA DOS CB DA MÁQUINAS', ramal: '832', dept: 'MAQUINAS' },
  { setor: 'HPSW 7GZ6', ramal: '833', dept: 'MAQUINAS' },
  { setor: 'HPSW 7JA1', ramal: '834', dept: 'MAQUINAS' },
  { setor: 'HQ2', ramal: '836', dept: 'MAQUINAS' },
  { setor: 'SRE / TV STUDIO', ramal: '837', dept: 'OPERAÇÕES' },
  { setor: 'CENTRAL TELEFÔNICA', ramal: '838', dept: 'MAQUINAS', fav: true },
  { setor: 'OFICINA DA ALFA', ramal: '839', dept: 'MAQUINAS' },
  { setor: 'CCM CONSOLE PRINCIPAL', ramal: '840', dept: 'MAQUINAS', fav: true },
  { setor: 'PIRÓLISE', ramal: '842', dept: 'ADMINISTRAÇÃO' },
  { setor: 'HPSW 7NA1', ramal: '843', dept: 'MAQUINAS' },
  { setor: 'FRIGORIFICA', ramal: '844', dept: 'MAQUINAS' },
  { setor: 'HPSW 7RA2', ramal: '845', dept: 'MAQUINAS' },
  { setor: 'UTAS AV', ramal: '847', dept: 'MAQUINAS' },
  { setor: 'PRAÇA DE BOMBAS AR', ramal: '848', dept: 'MAQUINAS' },
  { setor: 'PRAÇA DE AVCAT AV', ramal: '849', dept: 'MAQUINAS' },
  { setor: 'PRAÇA DE AVCAT AR', ramal: '851', dept: 'MAQUINAS' },
  { setor: 'LOBBY DO PAIOL 9G BE', ramal: '853', dept: 'ARMAMENTO' },
  { setor: 'LOBBY DO PAIOL 9G BB', ramal: '854', dept: 'ARMAMENTO' },
  { setor: 'COBERTA DE CB/MN DA MÁQUINAS', ramal: '855', dept: 'MAQUINAS' },
  { setor: 'OFICINA DE MOTORES DA AVIAÇÃO', ramal: '857', dept: 'AVIAÇÃO' },
  { setor: 'ESCRITÓRIO DO DAE', ramal: '858', dept: 'AVIAÇÃO' },
  { setor: 'ESCRITÓRIO DO DAE', ramal: '860', dept: 'AVIAÇÃO' },
  { setor: 'PADARIA', ramal: '862', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DE CB DA MÁQUINAS', ramal: '863', dept: 'MAQUINAS' },
  { setor: 'BRIEFING DE OPERAÇÕES', ramal: '864', dept: 'OPERAÇÕES' },
  { setor: 'APOIO (FERRAMENTARIA DO CONVOO)', ramal: '865', dept: 'AVIAÇÃO' },
  { setor: 'CAMAROTE DESTACADO 2SY2', ramal: '867', dept: 'ADMINISTRAÇÃO' },
  { setor: 'ESCOTERIA 2QY2', ramal: '866', dept: 'ARMAMENTO' },
  { setor: 'CAMAROTE DESTACADO 2SB2', ramal: '868', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CORREDOR 7MZ0', ramal: '873', dept: 'ADMINISTRAÇÃO' },
  { setor: 'COBERTA DOS DESTACADOS 3BA2', ramal: '875', dept: 'ADMINISTRAÇÃO' },
  { setor: 'PRAÇA DE MÁQUINAS A RÉ (9L)', ramal: '876', dept: 'MAQUINAS' },
  { setor: 'REDUTORA AV', ramal: '877', dept: 'MAQUINAS' },
  { setor: 'COMBATE / COC', ramal: '890', dept: 'OPERAÇÕES', fav: true },
  { setor: 'PASSADIÇO', ramal: '891', dept: 'OPERAÇÕES', fav: true },
  { setor: 'COBERTA 1º SG H', ramal: '892', dept: 'ADMINISTRAÇÃO' },
  { setor: 'SALA DE PRONTIDÃO CB/MN', ramal: '896', dept: 'AVIAÇÃO' },
  { setor: 'OFICINA DO FIEL DE ÓLEO', ramal: '899', dept: 'MAQUINAS' },
  { setor: 'PASSADIÇO', ramal: '911', dept: 'OPERAÇÕES', fav: true },
  { setor: 'COC DA FORÇA ANFIBIA', ramal: '914', dept: 'OPERAÇÕES' },
  { setor: 'CHEINT (CAMAROTE)', ramal: '915', dept: 'ADMINISTRAÇÃO' },
  { setor: 'DIREITOS PECUNIÁRIOS', ramal: '916', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CAMAROTE 6JB3', ramal: '919', dept: 'MAQUINAS' },
  { setor: 'COMPARTIMENTO DO MAGE', ramal: '920', dept: 'OPERAÇÕES' },
  { setor: 'CAMAROTE DESTACADO ALA FEMININA', ramal: '921', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CT FELIPE VAZ (CAMAROTE)', ramal: '922', dept: 'MAQUINAS' },
  { setor: 'CAMAROTE DESTACADO ALA FEMININA', ramal: '928', dept: 'ADMINISTRAÇÃO' },
  { setor: 'CC DIOGO NASCIMENTO (CAMAROTE)', ramal: '929', dept: 'OPERAÇÕES' },
  { setor: 'CHEAVI (CAMAROTE)', ramal: '931', dept: 'AVIAÇÃO', fav: true },
  { setor: 'CHEMAQ (CAMAROTE)', ramal: '932', dept: 'MAQUINAS', fav: true },
  { setor: 'CHEADM (CAMAROTE)', ramal: '933', dept: 'ADMINISTRAÇÃO', fav: true },
  { setor: 'ELEVADOR DE MUNIC BE (CONVOO)', ramal: '940', dept: 'ARMAMENTO' },
  { setor: 'ELEVADOR DE MUNIC BE (HANGAR)', ramal: '941', dept: 'ARMAMENTO' },
  { setor: 'ELEVADOR DE MUNIC BB (HANGAR)', ramal: '942', dept: 'ARMAMENTO' },
  { setor: 'PAIOL 8G', ramal: '943', dept: 'ARMAMENTO' },
  { setor: 'PAIOL 8G', ramal: '944', dept: 'ARMAMENTO' },
  { setor: 'PASSAGEM DE TRANSF. DE MUNIC', ramal: '945', dept: 'ARMAMENTO' },
  { setor: 'PASSAGEM DE TRANSF. DE MUNIC', ramal: '946', dept: 'ARMAMENTO' },
  { setor: 'BRIEFING DE OPERAÇÕES AÉREAS', ramal: '988', dept: 'OPERAÇÕES' },
  { setor: 'EMERGÊNCIA', ramal: '999', dept: 'MAQUINAS', fav: true }
];

export const INITIAL_PHONE_DIRECTORY: ExtensionEntry[] = RAW_OFFICIAL_EXTENSIONS.map((item, index) => {
  return {
    id: `ramal-${item.ramal}-${index}`,
    ramal: item.ramal,
    setor: item.setor,
    departamento: item.dept,
    conves: deduceDeck(item.setor),
    responsavel: '',
    categoria: getCategory(item.setor, item.dept, item.ramal),
    observacoes: '',
    isFavorite: item.fav ?? (item.ramal === '999' || item.ramal === '891' || item.ramal === '890')
  };
});

export const SAMPLE_CSV_TEMPLATE = `Ramal;Setor / Compartimento;Departamento;Observações
500;COC DA FORÇA;OPERAÇÕES;
501;COMANDANTE (PORTO);ADMINISTRAÇÃO;
891;PASSADIÇO;OPERAÇÕES;
890;COMBATE / COC;OPERAÇÕES;
840;CCM CONSOLE PRINCIPAL;MAQUINAS;
692;ENFERMARIA;SAÚDE;
999;EMERGÊNCIA;MAQUINAS;Linha Direta de Emergência
`;

/**
 * Utility to parse CSV/TSV pasted text or uploaded files
 */
export function parseCSVToExtensions(text: string): ExtensionEntry[] {
  if (!text || !text.trim()) return [];

  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: semicolon, comma, or tab
  const firstLine = lines[0];
  let delimiter = ';';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if ((firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length) {
    delimiter = ';';
  } else if (firstLine.includes(',')) {
    delimiter = ',';
  }

  const results: ExtensionEntry[] = [];
  let startIndex = 0;

  // Check if first line is a header
  const lowerFirst = firstLine.toLowerCase();
  if (
    lowerFirst.includes('ramal') ||
    lowerFirst.includes('compartimento') ||
    lowerFirst.includes('setor') ||
    lowerFirst.includes('departamento') ||
    lowerFirst.includes('nome')
  ) {
    startIndex = 1; // Skip header
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const cols = rawLine.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length === 0) continue;

    // Detect if column 0 is Compartimento and col 1 is Ramal, or vice versa
    let ramal = '';
    let setor = '';
    let dept = '';
    let observacoes = '';

    // If col 0 is pure number (e.g. 500)
    if (/^\d+$/.test(cols[0])) {
      ramal = cols[0];
      setor = cols[1] || 'Setor sem Nome';
      dept = cols[2] || 'DIVERSOS';
      observacoes = cols[3] || cols[6] || '';
    } else {
      // col 0 is Compartimento
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
      isFavorite: ramal === '999' || ramal === '891' || ramal === '890' || ramal === '500' || ramal === '501'
    });
  }

  return results;
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
