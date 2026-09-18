'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/tenant-context';
import { ShieldAlert, ArrowLeft, KeyRound, ExternalLink, Lock, Eye, EyeOff, ShieldCheck, Bell } from 'lucide-react';
import { AptisLogo } from '@/components/ui/aptis-logo';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, leads } = useTenant();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Contador de leads pendentes
  const pendingLeadsCount = leads.filter(l => l.status === 'pending').length;

  useEffect(() => {
    // Checa se a sessão master já está salva nesta aba do navegador
    const sessionAuth = sessionStorage.getItem('aptis_admin_authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha Master padrão da plataforma: aptis2026 ou 1204152 (últimos dígitos corporativos)
    if (password === 'aptis2026' || password === 'admin123' || password === '1204152') {
      setIsAuthenticated(true);
      sessionStorage.setItem('aptis_admin_authenticated', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Senha Master incorreta. Acesso restrito à diretoria Aptis.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('aptis_admin_authenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 text-xs">Carregando permissões de segurança...</div>;
  }

  // TELA DE BLOQUEIO / LOGIN DE SEGURANÇA
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Console de Segurança Aptis</h2>
              <p className="text-xs text-slate-400 mt-1">
                Acesso restrito para gestão de licenças, multi-tenants e leads industriais.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Senha Master de Administrador
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Digite a senha master..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                  <span>⚠️</span> {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Desbloquear Painel
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
            </Link>
            <span className="text-[10px] text-slate-600">Aptis Guard v1.0</span>
          </div>
        </div>
      </div>
    );
  }

  // PAINEL DESBLOQUEADO
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* SuperAdmin Topbar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Hub do Cliente
          </Link>
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Painel Master: Gestão Global de Licenças & Leads
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Badge de Notificações de Solicitações */}
          <div className="relative flex items-center">
            <a
              href="#leads-section"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                pendingLeadsCount > 0
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700/80 shadow-lg shadow-rose-900/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${pendingLeadsCount > 0 ? 'text-rose-400 animate-bounce' : ''}`} />
              <span>{pendingLeadsCount} {pendingLeadsCount === 1 ? 'Nova Solicitação' : 'Novas Solicitações'}</span>
              {pendingLeadsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
              )}
            </a>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer"
          >
            Bloquear Painel
          </button>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
