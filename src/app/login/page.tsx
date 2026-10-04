'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AptisLogo } from '@/components/ui/aptis-logo';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Building2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Redireciona para o dashboard com recarregamento para sincronizar cookies
        window.location.href = redirectUrl;
      } else {
        setErrorMessage(data.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch {
      setErrorMessage('Erro de conexão ao autenticar no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Glow e Efeitos de Fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Card Principal */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <AptisLogo size="md" showTagline={true} glow={true} />
          </Link>
          <div className="pt-2">
            <h1 className="text-xl font-black text-white tracking-tight">Portal Operacional de Liderança</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Acesse com as credenciais da sua unidade industrial
            </p>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              E-mail Corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoFocus
                placeholder="nome@suaempresa.ind.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Senha de Acesso
              </label>
              <span className="text-[10px] text-cyan-400/80 cursor-pointer hover:underline" title="Entre em contato com o administrador da sua unidade">
                Esqueceu a senha?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Verificando Autenticação...</span>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Perfis de Acesso Rápido para Validação e Testes */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Perfis de Acesso Rápido para Teste:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('carlos.silveira@alfa.ind.br', 'alfa123')}
              className="p-2 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer group"
            >
              <div className="font-bold text-slate-200 group-hover:text-cyan-300 truncate">Carlos Silveira</div>
              <div className="text-[10px] text-slate-500">Gestor Industrial</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('mariana.souza@alfa.ind.br', 'alfa123')}
              className="p-2 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer group"
            >
              <div className="font-bold text-slate-200 group-hover:text-cyan-300 truncate">Mariana Souza</div>
              <div className="text-[10px] text-slate-500">Supervisora de Turno</div>
            </button>
          </div>
        </div>

        {/* Rodapé do Card */}
        <div className="text-center text-[11px] text-slate-500 pt-1">
          <span>Ambiente seguro protegido por criptografia de ponta a ponta.</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 text-xs">Carregando portal seguro...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
