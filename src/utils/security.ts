// Utilitários de sessão e auditoria de segurança

const STORAGE_KEY_AUTOLOCK_MINUTES = 'ccm_autolock_minutes';
const SESSION_KEY_AUTH = 'ccm_session_authenticated';

export const isSessionAuthenticated = (): boolean => {
  try {
    return sessionStorage.getItem(SESSION_KEY_AUTH) === 'true';
  } catch {
    return false;
  }
};

export const setSessionAuthenticated = (status: boolean): void => {
  try {
    if (status) {
      sessionStorage.setItem(SESSION_KEY_AUTH, 'true');
    } else {
      sessionStorage.removeItem(SESSION_KEY_AUTH);
    }
  } catch (e) {
    console.error('Erro ao atualizar sessão de autenticação:', e);
  }
};

export const getAutoLockMinutes = (): number => {
  try {
    const val = localStorage.getItem(STORAGE_KEY_AUTOLOCK_MINUTES);
    if (val !== null) {
      return parseInt(val, 10);
    }
  } catch {}
  return 15; // padrão 15 minutos de inatividade
};

export const setAutoLockMinutes = (minutes: number): void => {
  try {
    localStorage.setItem(STORAGE_KEY_AUTOLOCK_MINUTES, minutes.toString());
  } catch (e) {
    console.error('Erro ao salvar tempo de bloqueio:', e);
  }
};
