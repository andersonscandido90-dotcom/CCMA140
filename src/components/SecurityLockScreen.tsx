import React, { useState, useEffect, useRef } from 'react';
import { Lock, Shield, Eye, EyeOff, KeyRound, AlertCircle, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { verifyPassword } from '../utils/security';

interface SecurityLockScreenProps {
  onUnlock: () => void;
}

export const SecurityLockScreen: React.FC<SecurityLockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Foco automático no campo de senha ao montar a tela
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!password) {
      setError(true);
      setErrorMessage('Digite a credencial de acesso.');
      triggerShake();
      return;
    }

    if (verifyPassword(password)) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setErrorMessage('Credencial incorreta. Tentativa não autorizada registrada.');
      triggerShake();
      setPassword('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Luz de fundo sutil de segurança */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className={`w-full max-w-md relative z-10 transition-transform duration-200 ${isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Cabeçalho do Bloqueio de Segurança */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 flex items-center justify-center shadow-lg shadow-blue-900/30 border border-blue-500/30">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-red-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <ShieldCheck size={12} />
              Área Restrita & Sigilosa
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
              Terminal de Controle
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Sistema protegido por credenciais de segurança. Autentique-se para ter acesso às informações operacionais.
            </p>
          </div>

          {/* Formulário de Acesso */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound size={18} />
                </div>
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="DIGITE A SENHA..."
                  autoComplete="current-password"
                  className={`w-full bg-slate-950 border ${
                    error ? 'border-red-500 focus:border-red-400' : 'border-slate-800 focus:border-blue-500'
                  } rounded-2xl py-3.5 pl-11 pr-12 text-sm font-mono tracking-widest text-white placeholder-slate-600 outline-none transition-all shadow-inner`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs mt-2 ml-1 animate-in fade-in">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-black uppercase text-xs sm:text-sm py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Desbloquear Terminal</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* AVISO DISSUASÓRIO PARA ESPANTAR CURIOSOS */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-4 text-left shadow-inner">
              <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider mb-2">
                <ShieldAlert size={16} className="text-red-400 shrink-0" />
                <span>Aviso de Segurança Operacional</span>
              </div>
              
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                <strong className="text-red-300 font-bold uppercase">Uso estritamente restrito.</strong> Esta estação contém informações reservadas e confidenciais da Seção de Máquinas.
              </p>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-red-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] text-amber-400 font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                  SISTEMA DE MONITORAMENTO ATIVO
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Todas as tentativas de acesso indevidas, logins não autorizados e ações neste console são continuamente registradas e auditadas. O acesso sem autorização expressa sujeita o infrator a sanções disciplinares e penais militares.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center uppercase tracking-widest mt-4">
              Uso Autorizado • Departamento de Máquinas
            </div>
          </div>
        </div>

        {/* Rodapé de segurança */}
        <div className="text-center mt-4">
          <p className="text-[10px] text-slate-600 font-mono">
            Terminal monitorado • Tentativas registradas nesta sessão: {attempts}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};

export default SecurityLockScreen;
