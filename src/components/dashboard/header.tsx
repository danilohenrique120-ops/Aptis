'use client';

import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/tenant-context';
import { UserRole } from '@/types';
import { 
  Building2, 
  User, 
  ShieldCheck, 
  ChevronDown, 
  Layers, 
  ExternalLink,
  Store,
  Sparkles
} from 'lucide-react';

export function DashboardHeader() {
  const { currentTenant, currentUser, tenants, switchTenant, switchUserRole } = useTenant();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Lado Esquerdo: Simulador Multi-Tenant */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">
              Empresa Selecionada (Multi-Tenant)
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

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-medium border border-blue-100">
            CNPJ: {currentTenant.document}
          </span>
        </div>
      </div>

      {/* Lado Direito: Seletor de Perfil do Usuário + Atalhos */}
      <div className="flex items-center gap-3">
        {/* Seletor de Papel / Role Simulator */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">
              Papel do Usuário
            </span>
            <select
              value={currentUser.role}
              onChange={(e) => switchUserRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="superadmin">👑 SuperAdmin Global</option>
              <option value="tenant_admin">👔 Gestor da Empresa (Admin)</option>
              <option value="member">👤 Membro / Supervisor</option>
            </select>
          </div>
        </div>

        {/* Link para Vitrine Pública */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          title="Abrir Vitrine Pública em nova aba"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Vitrine
        </Link>

        {/* Avatar e Perfil */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              {currentUser.department || 'Gestor'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
