// Utilitários de segurança e controle de acesso confidencial

const STORAGE_KEY_PASSWORD = 'ccm_security_password';
const STORAGE_KEY_AUTOLOCK_MINUTES = 'ccm_autolock_minutes';
const SESSION_KEY_AUTH = 'ccm_session_authenticated';
const DEFAULT_PASSWORD = 'zerofofoca';

export const getStoredPassword = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PASSWORD);
    if (saved && saved.trim().length > 0) {
      // Se era a senha antiga de desenvolvimento ccm2026, atualiza para a nova senha solicitada
      if (saved === 'ccm2026') {
        localStorage.setItem(STORAGE_KEY_PASSWORD, DEFAULT_PASSWORD);
        return DEFAULT_PASSWORD;
      }
      return saved;
    }
  } catch (e) {
    console.error('Erro ao ler senha do localStorage:', e);
  }
  return DEFAULT_PASSWORD;
};

export const setStoredPassword = (newPassword: string): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY_PASSWORD, newPassword);
    return true;
  } catch (e) {
    console.error('Erro ao salvar nova senha:', e);
    return false;
  }
};

export const verifyPassword = (inputPassword: string): boolean => {
  const currentPassword = getStoredPassword();
  return inputPassword === currentPassword;
};

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

export const isDefaultPassword = (): boolean => {
  return getStoredPassword() === DEFAULT_PASSWORD;
};
