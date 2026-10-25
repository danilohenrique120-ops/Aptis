'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Trophy,
  Target,
  ShieldCheck
} from 'lucide-react';

function PerformanceLoginFormContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/performance/painel';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const performLogin = async (loginEmail: string, loginPass: string) => {
    if (!loginEmail || !loginPass) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user) {
          try {
            localStorage.setItem('ecossistema_lider_current_user_id', data.user.id);
            localStorage.setItem('ecossistema_lider_current_tenant_id', data.user.tenantId);
          } catch {}
        }
        window.location.href = redirectUrl;
      } else {
        setErrorMessage(data.error || 'Credenciais inválidas. Acesso exclusivo para treinadores autorizados.');
      }
    } catch {
      setErrorMessage('Erro de conexão ao autenticar no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Glow de Fundo Fitness High-Performance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[420px] bg-orange-500/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Card Principal */}
      <div className="w-full max-w-md bg-slate-900/95 border border-orange-500/30 rounded-3xl p-8 shadow-[0_0_70px_rgba(0,0,0,0.9)] relative z-10 space-y-6 backdrop-blur-xl">
        {/* Header Exclusivo Aptis Performance Pro */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link
            href="/performance"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/40 hover:border-orange-400 transition-all"
          >
            <Flame className="w-6 h-6 text-orange-400" />
            <span className="font-black tracking-wider text-white text-base uppercase">
              APTIS <span className="text-orange-400">PERFORMANCE PRO</span>
            </span>
          </Link>

          <div className="pt-1">
            <h1 className="text-xl font-black text-white tracking-tight">
              Acesso Restrito do Treinador
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Ambiente exclusivo para gestão técnica da consultoria
            </p>
          </div>
        </div>

        {/* Aviso de Segurança: Separação Aluno vs Treinador */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Você é aluno da consultoria?</span>
          </div>
          <Link
            href="/performance/aluno"
            className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 font-bold text-xs transition-all shrink-0"
          >
            Ir para App do Aluno →
          </Link>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              E-mail do Treinador / Consultoria
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="treinador@aptis.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Senha de Acesso
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <span>Autenticando Consultoria...</span>
            ) : (
              <>
                <span>Acessar Painel do Treinador</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Rodapé */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 text-orange-400/90 font-medium">
            <Trophy className="w-3.5 h-3.5" />
            Alta Performance & Fitness
          </span>
          <Link href="/performance" className="hover:text-slate-300 transition-colors">
            ← Voltar para a Página & Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PerformanceLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <PerformanceLoginFormContent />
    </Suspense>
  );
}
