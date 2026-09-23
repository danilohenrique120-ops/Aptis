'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ToolErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Aptis Tool Error Boundary]:', error);
  }, [error]);

  const handleClearCacheAndReset = () => {
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
        Recuperação Automática de Módulo
      </div>

      <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Instabilidade Temporária no Módulo
      </h2>

      <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto leading-relaxed">
        Os dados deste módulo estão sendo sincronizados com a nuvem da sua planta. Caso a tela não responda de imediato, você pode recarregar com segurança.
      </p>

      {error?.message && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-mono text-slate-700 mb-6 overflow-x-auto max-h-32">
          {error.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleClearCacheAndReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Recarregar Módulo
        </button>

        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" />
          Painel Geral da Planta
        </Link>
      </div>
    </div>
  );
}
