'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/context/tenant-context';
import {
  Building2,
  ExternalLink,
  LogOut,
  Crown
} from 'lucide-react';

export function DashboardHeader() {
  const pathname = usePathname();
  const { currentTenant, currentUser, tenants, switchTenant, logout } = useTenant();
  const [tintedGlass, setTintedGlass] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('aptis_tinted_glass_mode');
    if (saved !== null) {
      setTintedGlass(saved === 'true');
    }

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setTintedGlass(customEvent.detail);
    };

    window.addEventListener('aptis-glass-mode-change', handleModeChange);
    return () => window.removeEventListener('aptis-glass-mode-change', handleModeChange);
  }, []);

  const isMasterWorkspace = currentTenant.id === 'tenant-dhp';
  const isSuperAdmin = currentUser.role === 'superadmin';
  const isGlassEnabledRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/tools/manager-tasks') ||
    pathname.startsWith('/dashboard/tools/one-on-one') ||
    pathname.startsWith('/dashboard/tools/pdi-manager') ||
    pathname.startsWith('/dashboard/tools/service-pro');
  const isDarkGlass = isGlassEnabledRoute && tintedGlass;

  return (
    <header
      className={`h-16 px-6 flex items-center justify-between sticky top-0 z-20 transition-all duration-500 ${
        isDarkGlass
          ? 'border-b border-white/[0.08] text-white'
          : 'bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs text-slate-900'
      }`}
      style={
        isDarkGlass
          ? {
              background:
                'linear-gradient(180deg, rgba(10, 15, 29, 0.72) 0%, rgba(10, 15, 29, 0.45) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: 'inset 0 -1px 0 0 rgba(255, 255, 255, 0.06)'
            }
          : undefined
      }
    >
      {/* Lado Esquerdo: Identidade do Cliente ou Ambiente Master do Admin em Cápsula de Vidro */}
      <div className="flex items-center gap-3.5">
        <div
          className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-1.5 transition-all ${
            isDarkGlass
              ? 'aptis-glass-subcard text-white'
              : 'bg-slate-50/90 border border-slate-200/90 shadow-2xs text-slate-900'
          }`}
        >
          {isMasterWorkspace ? (
            <Crown className={`w-4 h-4 shrink-0 ${isDarkGlass ? 'text-amber-400' : 'text-amber-600'}`} />
          ) : (
            <Building2 className={`w-4 h-4 shrink-0 ${isDarkGlass ? 'text-cyan-400' : 'text-cyan-600'}`} />
          )}
          <div className="flex flex-col text-left">
            <span
              className={`text-[9px] uppercase font-bold leading-none ${
                isDarkGlass ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              {isMasterWorkspace ? 'Administração Central' : 'Unidade Fabril'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isSuperAdmin && tenants.length > 1 ? (
                <select
                  value={currentTenant.id}
                  onChange={e => switchTenant(e.target.value)}
                  className={`text-xs font-black bg-transparent outline-none cursor-pointer pr-1 ${
                    isDarkGlass ? 'text-white' : 'text-slate-900'
                  }`}
                  title="Alternar visualização entre seu Ambiente Master e Empresas Clientes"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.id === 'tenant-dhp' ? 'Aptis Tecnologia (Admin Master)' : t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`text-xs font-black leading-none ${
                    isDarkGlass ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {isMasterWorkspace ? 'Aptis Tecnologia (Admin Master)' : currentTenant.name}
                </span>
              )}

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border leading-tight ${
                  isMasterWorkspace
                    ? isDarkGlass
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                    : isDarkGlass
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                    : 'bg-cyan-100 text-cyan-800 border-cyan-200'
                }`}
              >
                {isMasterWorkspace ? 'MASTER' : currentTenant.plan.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito: Perfil do Gestor & Ações */}
      <div className="flex items-center gap-3">
        {/* Link para Vitrine Pública */}
        <Link
          href="/"
          target="_blank"
          className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            isDarkGlass
              ? 'aptis-glass-subcard text-slate-200 hover:text-white hover:border-cyan-400/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
          title="Abrir Vitrine Pública em nova aba"
        >
          <ExternalLink className={`w-3.5 h-3.5 ${isDarkGlass ? 'text-cyan-400' : 'text-cyan-600'}`} />
          Vitrine
        </Link>

        {/* Avatar e Perfil */}
        <div
          className={`flex items-center gap-2.5 pl-3 border-l ${
            isDarkGlass ? 'border-white/[0.1]' : 'border-slate-200'
          }`}
        >
          <div
            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-xs shadow-md border border-white/20"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)'
            }}
          >
            {currentUser.name
              .split(' ')
              .map(n => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="hidden lg:block text-left">
            <div
              className={`text-xs font-bold leading-tight ${
                isDarkGlass ? 'text-white' : 'text-slate-800'
              }`}
            >
              {currentUser.name}
            </div>
            <div
              className={`text-[10px] leading-tight font-medium ${
                isDarkGlass ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              {currentUser.department ||
                (isMasterWorkspace ? 'Diretoria Aptis' : currentTenant.name)}
            </div>
          </div>

          {/* Botão de Logout */}
          <button
            onClick={() => {
              if (window.confirm('Deseja realmente sair da sua conta?')) {
                logout();
              }
            }}
            title="Encerrar sessão e sair com segurança"
            className={`p-2 rounded-xl transition-colors cursor-pointer border border-transparent ${
              isDarkGlass
                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/30'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
