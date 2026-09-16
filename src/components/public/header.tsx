'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { AptisLogo } from '@/components/ui/aptis-logo';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Oficial Aptis */}
        <Link href="/" className="flex items-center gap-3 group">
          <AptisLogo size="md" showTagline={true} glow={true} />
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <a href="#catalogo" className="hover:text-cyan-400 transition-colors">
            Módulos da Suíte
          </a>
          <a href="#score" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            The Aptis Score
          </a>
          <a href="#diferenciais" className="hover:text-cyan-400 transition-colors">
            4 Pilares
          </a>
          <a href="#arquitetura" className="hover:text-cyan-400 transition-colors">
            Arquitetura
          </a>
          <Link href="/admin" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </Link>
        </nav>

        {/* CTA Principal */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Acessar Plataforma</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
}
