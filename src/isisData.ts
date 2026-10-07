import { IsisEntry } from './types';
import { getVaultData } from './utils/cryptoVault';

/**
 * Retorna os 671 canais de alarmes do ISIS a partir do cofre criptografado em memória.
 * NENHUM canal de alarme permanece em texto claro no código compilado.
 */
export const getIsisData = (): IsisEntry[] => {
  return getVaultData()?.isisData || [];
};

export const ISIS_DATA: IsisEntry[] = new Proxy([] as IsisEntry[], {
  get(target, prop, receiver) {
    const list = getVaultData()?.isisData || [];
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
