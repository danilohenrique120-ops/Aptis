'use client';

import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/tenant-context';
import { ShieldAlert, ArrowLeft, Building2, Store, Users, ExternalLink } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, switchUserRole } = useTenant();

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
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Painel SuperAdmin: Gestão Global de Licenças
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden md:inline">
            Logado como: <strong className="text-white">{currentUser.name}</strong>
          </span>
          <Link
            href="/"
            target="_blank"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Vitrine Pública
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
