'use client';

import React from 'react';
import Link from 'next/link';
import PerformanceProModule from '@/modules/performance-pro';
import { useTenant } from '@/context/tenant-context';
import {
  Flame,
  ExternalLink,
  LogOut,
  Trophy,
  Target,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function PerformancePainelPage() {
  const { currentUser } = useTenant();

  const handlePerformanceLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/performance/login';
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* ====================================================================
          TOPBAR EXCLUSIVA DO TREINADOR (100% FITNESS • ZERO TERMOS FABRIS)
      ==================================================================== */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Esquerda: Marca Aptis Performance Pro */}
          <div className="flex items-center gap-4">
            <Link
              href="/performance/painel"
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/40 hover:border-orange-400 transition-all"
            >
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="font-black tracking-wider text-white text-sm uppercase">
                APTIS <span className="text-orange-400">PERFORMANCE PRO</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-[11px] font-bold">
                <Trophy className="w-3.5 h-3.5 text-orange-400" />
                Consultoria Online & Alta Performance
              </span>
            </div>
          </div>

          {/* Direita: Atalho para o Quiz da Bio + App do Aluno + Perfil do Treinador + Sair */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/performance/aluno"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-bold transition-all"
              title="Abrir o App / Portal do Aluno"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">App do Aluno</span>
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
            </Link>

            <Link
              href="/performance#diagnostico"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
              title="Abrir a Página Pública e o Quiz de Score da Bio"
            >
              <Target className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden md:inline">Vitrine & Quiz</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-white" suppressHydrationWarning>
                  Treinador Head (DRZ TEAM)
                </div>
                <div className="text-[10px] text-orange-400 font-semibold">
                  Ambiente Oficial do Treinador
                </div>
              </div>
            </div>

            <button
              onClick={handlePerformanceLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 text-xs font-bold transition-all cursor-pointer"
              title="Encerrar sessão do painel do treinador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          CONTEÚDO PRINCIPAL DO MÓDULO UNIFICADO APTIS PERFORMANCE PRO
      ==================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PerformanceProModule />
      </main>
    </div>
  );
}
