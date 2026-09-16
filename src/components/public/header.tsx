'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            A
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              Aptis
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                SUITE B2B
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide">
              A fábrica sempre apta.
            </div>
          </div>
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#catalogo" className="hover:text-white transition-colors">
            Suíte de Módulos
          </a>
          <a href="#aptis-score" className="hover:text-white transition-colors">
            The Aptis Score
          </a>
          <a href="#diferenciais" className="hover:text-white transition-colors">
            Metodologia Fabril
          </a>
          <Link href="/admin" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            SuperAdmin
          </Link>
        </nav>

        {/* CTA Principal */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Acessar Aptis Suite
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
