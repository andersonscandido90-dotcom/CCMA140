// Módulo de Criptografia do Cofre de Dados Confidenciais (Zero-Knowledge)
// Utiliza Web Crypto API nativa do navegador: PBKDF2 (100.000 iterações) + AES-GCM 256 bits.
// Os dados confidenciais NUNCA ficam em texto claro no código compilado.

import { ENCRYPTED_VAULT_PAYLOAD } from '../data/encryptedPayload';

export interface DecryptedVaultData {
  shipConfig: {
    name: string;
    hullNumber: string;
    designation: string;
    badgeUrl: string;
  };
  categories: Array<{ name: string; items: string[] }>;
  equipmentLocations: Record<string, string>;
  eductorSections: Array<{
    section: string;
    name: string;
    eductors: Array<{ capacity: number; deck: number; side?: 'BB' | 'BE' }>;
    sewageVia?: string;
  }>;
  isisData: Array<{
    channel: string;
    description: string;
    translation: string;
  }>;
  phoneExtensions?: Array<{
    setor: string;
    ramal: string;
    dept: string;
    fav?: boolean;
  }>;
}

const SESSION_TOKEN_KEY = 'ccm_session_auth_token';

// Armazenamento estritamente em memória volátil (RAM)
let memoryVault: DecryptedVaultData | null = null;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Tenta decifrar o cofre criptografado com a senha fornecida pelo operador.
 * Se a senha estiver correta, decodifica os 79 equipamentos, 671 alarmes e compartimentos na RAM.
 * Se a senha estiver incorreta, o algoritmo AES-GCM rejeita a autenticação e retorna null.
 */
export async function decryptVault(password: string): Promise<DecryptedVaultData | null> {
  if (!password || password.trim().length === 0) return null;

  try {
    const combined = base64ToUint8Array(ENCRYPTED_VAULT_PAYLOAD);
    const salt = combined.subarray(0, 16);
    const iv = combined.subarray(16, 28);
    const ciphertext = combined.subarray(28);

    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    const decodedStr = new TextDecoder().decode(decryptedBuffer);
    const data: DecryptedVaultData = JSON.parse(decodedStr);
    memoryVault = data;

    // Guarda credencial na sessão volátil do navegador (limpa ao fechar aba)
    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, password);
    } catch {}

    return data;
  } catch (err) {
    // Falha criptográfica: a chave derivada da senha não confere com o tag de autenticação
    return null;
  }
}

/**
 * Tenta restaurar a sessão descriptografando automaticamente se o operador já se autenticou na aba atual.
 */
export async function tryRestoreSessionVault(): Promise<boolean> {
  if (memoryVault !== null) return true;
  try {
    const saved = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (saved) {
      const data = await decryptVault(saved);
      return data !== null;
    }
  } catch {}
  return false;
}

/**
 * Retorna os dados em memória RAM se o cofre estiver destravado.
 */
export function getVaultData(): DecryptedVaultData | null {
  return memoryVault;
}

/**
 * Limpa a memória volátil ao bloquear o terminal.
 */
export function clearVaultData(): void {
  memoryVault = null;
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {}
}

/**
 * Verifica se o cofre está destravado na memória.
 */
export function isVaultUnlocked(): boolean {
  return memoryVault !== null;
}
