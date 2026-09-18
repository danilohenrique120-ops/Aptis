'use client';

import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/tenant-context';
import { 
  Building2, 
  ShieldCheck, 
  ExternalLink,
  Activity
} from 'lucide-react';

export function DashboardHeader() {
  const { currentTenant, currentUser, tenants, switchTenant } = useTenant();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Lado Esquerdo: Seletor Multi-Tenant & Status da Planta */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 transition-colors">
          <Building2 className="w-4 h-4 text-cyan-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">
              Planta / Empresa
            </span>
            <select
              value={currentTenant.id}
              onChange={(e) => switchTenant(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.plan.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Planta 100% Operacional
          </span>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-medium border border-slate-200">
            CNPJ: {currentTenant.document}
          </span>
        </div>
      </div>

      {/* Lado Direito: Perfil do Gestor & Ações */}
      <div className="flex items-center gap-3">
        {/* Badge Corporativo de Função */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">
              Nível Operacional
            </span>
            <span className="text-xs font-bold text-slate-800">
              Gestor Industrial (Admin)
            </span>
          </div>
        </div>

        {/* Link para Vitrine Pública */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          title="Abrir Vitrine Pública em nova aba"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />
          Vitrine
        </Link>

        {/* Avatar e Perfil */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center font-black text-xs shadow-xs border border-slate-700">
            {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 leading-tight font-medium">
              {currentUser.department || 'Liderança'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
