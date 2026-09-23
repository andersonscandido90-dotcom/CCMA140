import { DailyReport, EquipmentData, EquipmentStatus } from '../types';

export interface PriorRestrictionInfo {
  reason: string;
  date: string;
  status?: EquipmentStatus;
  isSameStatus: boolean;
}

export interface RestrictionStreakInfo {
  startDate: string;
  daysCount: number;
}

/**
 * Retorna todas as datas que possuem relatórios salvos no localStorage, ordenadas cronologicamente.
 */
export function getAllSavedReportDates(): string[] {
  try {
    return Object.keys(localStorage)
      .filter(k => k.startsWith('report_'))
      .map(k => k.replace('report_', ''))
      .sort();
  } catch (e) {
    console.error('Erro ao listar datas de relatórios:', e);
    return [];
  }
}

/**
 * Retorna o relatório do dia anterior mais recente salvo no localStorage antes da data alvo.
 */
export function getPriorReport(targetDate: string): DailyReport | null {
  try {
    const allDates = getAllSavedReportDates()
      .filter(d => d < targetDate)
      .reverse();

    for (const date of allDates) {
      const raw = localStorage.getItem(`report_${date}`);
      if (raw) {
        return JSON.parse(raw) as DailyReport;
      }
    }
  } catch (e) {
    console.error('Erro ao buscar relatório anterior:', e);
  }
  return null;
}

/**
 * Busca a informação/motivo de restrição ou indisponibilidade mais recente de um equipamento
 * ocorrida em datas anteriores à targetDate.
 */
export function getPreviousRestrictionInfo(
  item: string,
  targetDate: string,
  currentStatus?: EquipmentStatus
): PriorRestrictionInfo | null {
  try {
    const allDates = getAllSavedReportDates()
      .filter(d => d < targetDate)
      .reverse();

    // 1º passo: Tenta encontrar um relatório anterior onde o equipamento tinha EXATAMENTE o mesmo status
    if (currentStatus) {
      for (const date of allDates) {
        const raw = localStorage.getItem(`report_${date}`);
        if (!raw) continue;
        const report = JSON.parse(raw) as DailyReport;
        const statusInReport = report.equipment?.[item];
        const reason = report.restrictionReasons?.[item];

        if (statusInReport === currentStatus && reason && reason.trim() !== '') {
          return {
            reason: reason.trim(),
            date,
            status: statusInReport,
            isSameStatus: true
          };
        }
      }
    }

    // 2º passo: Se não achou com o mesmo status exato, busca qualquer relatório anterior onde o item estava
    // RESTRICTED ou UNAVAILABLE e tinha um motivo registrado
    for (const date of allDates) {
      const raw = localStorage.getItem(`report_${date}`);
      if (!raw) continue;
      const report = JSON.parse(raw) as DailyReport;
      const statusInReport = report.equipment?.[item];
      const reason = report.restrictionReasons?.[item];

      if (
        (statusInReport === EquipmentStatus.RESTRICTED || statusInReport === EquipmentStatus.UNAVAILABLE) &&
        reason &&
        reason.trim() !== ''
      ) {
        return {
          reason: reason.trim(),
          date,
          status: statusInReport,
          isSameStatus: statusInReport === currentStatus
        };
      }
    }

    // 3º passo: Fallback para o master storage
    const masterDetailStr = localStorage.getItem('master_equipment_restrictions_detail');
    if (masterDetailStr) {
      const masterDetail = JSON.parse(masterDetailStr);
      if (masterDetail[item] && masterDetail[item].reason && masterDetail[item].reason.trim() !== '') {
        return {
          reason: masterDetail[item].reason.trim(),
          date: masterDetail[item].lastDate || '',
          status: masterDetail[item].status,
          isSameStatus: masterDetail[item].status === currentStatus
        };
      }
    }

    const masterReasonsStr = localStorage.getItem('master_equipment_reasons');
    if (masterReasonsStr) {
      const masterReasons = JSON.parse(masterReasonsStr);
      if (masterReasons[item] && masterReasons[item].trim() !== '') {
        return {
          reason: masterReasons[item].trim(),
          date: '',
          isSameStatus: true
        };
      }
    }
  } catch (e) {
    console.error('Erro ao buscar histórico de restrição do equipamento:', item, e);
  }

  return null;
}

/**
 * Calcula há quantos dias consecutivos o equipamento está com status de restrição ou indisponibilidade.
 */
export function getRestrictionStreak(
  item: string,
  targetDate: string
): RestrictionStreakInfo {
  try {
    const allDates = getAllSavedReportDates()
      .filter(d => d <= targetDate)
      .reverse();

    if (allDates.length === 0) {
      return { startDate: targetDate, daysCount: 1 };
    }

    let count = 0;
    let earliestDate = targetDate;

    for (const date of allDates) {
      const raw = localStorage.getItem(`report_${date}`);
      if (!raw) break;
      const report = JSON.parse(raw) as DailyReport;
      const st = report.equipment?.[item];

      if (st === EquipmentStatus.RESTRICTED || st === EquipmentStatus.UNAVAILABLE) {
        count++;
        earliestDate = date;
      } else {
        break; // interrompe se o status não foi restrito/indisponível
      }
    }

    return {
      startDate: earliestDate,
      daysCount: Math.max(1, count)
    };
  } catch (e) {
    return { startDate: targetDate, daysCount: 1 };
  }
}

/**
 * Preenche automaticamente as restrições vazias para equipamentos RESTRICTED ou UNAVAILABLE,
 * carregando as informações anteriores caso o status continue o mesmo ou venha de histórico.
 */
export function resolveAutoRestrictions(
  equipment: EquipmentData,
  currentReasons: Record<string, string>,
  targetDate: string
): {
  resolvedReasons: Record<string, string>;
  carriedOverMeta: Record<string, { fromDate: string; isSameStatus: boolean }>;
  autoFilledCount: number;
} {
  const resolved = { ...currentReasons };
  const carriedOverMeta: Record<string, { fromDate: string; isSameStatus: boolean }> = {};
  let autoFilledCount = 0;

  Object.entries(equipment).forEach(([item, status]) => {
    if (status === EquipmentStatus.RESTRICTED || status === EquipmentStatus.UNAVAILABLE) {
      const existing = resolved[item];
      // Se não possui motivo preenchido na data atual, busca do dia anterior/histórico
      if (!existing || existing.trim() === '') {
        const priorInfo = getPreviousRestrictionInfo(item, targetDate, status);
        if (priorInfo && priorInfo.reason) {
          resolved[item] = priorInfo.reason;
          carriedOverMeta[item] = {
            fromDate: priorInfo.date,
            isSameStatus: priorInfo.isSameStatus
          };
          autoFilledCount++;
        }
      }
    }
  });

  return {
    resolvedReasons: resolved,
    carriedOverMeta,
    autoFilledCount
  };
}

/**
 * Salva a anotação de restrição no histórico mestre para persistência contínua.
 */
export function saveMasterRestriction(
  item: string,
  reason: string,
  status?: EquipmentStatus,
  date?: string
) {
  try {
    // 1. Salva em master_equipment_reasons
    const masterReasonsStr = localStorage.getItem('master_equipment_reasons');
    const masterReasons = masterReasonsStr ? JSON.parse(masterReasonsStr) : {};
    if (reason && reason.trim() !== '') {
      masterReasons[item] = reason;
    }
    localStorage.setItem('master_equipment_reasons', JSON.stringify(masterReasons));

    // 2. Salva em master_equipment_restrictions_detail com metadados
    const masterDetailStr = localStorage.getItem('master_equipment_restrictions_detail');
    const masterDetail = masterDetailStr ? JSON.parse(masterDetailStr) : {};
    if (reason && reason.trim() !== '') {
      masterDetail[item] = {
        reason: reason.trim(),
        status,
        lastDate: date || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };
    }
    localStorage.setItem('master_equipment_restrictions_detail', JSON.stringify(masterDetail));
  } catch (e) {
    console.error('Erro ao salvar no histórico mestre de restrições:', e);
  }
}
