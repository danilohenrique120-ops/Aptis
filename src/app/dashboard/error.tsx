'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Aptis Dashboard Error Boundary]:', error);
  }, [error]);

  const handleReset = () => {
    try {
      window.location.reload();
    } catch {
      reset();
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-md text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3 font-mono">
        Recuperação Automática da Plataforma
      </div>

      <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Sincronização em Andamento
      </h2>

      <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto leading-relaxed">
        Houve uma divergência temporária no carregamento dos dados da sua fábrica. Clique abaixo para recarregar a visualização.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Recarregar Painel
        </button>

        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" />
          Início
        </Link>
      </div>
    </div>
  );
}
