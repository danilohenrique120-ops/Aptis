'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/context/tenant-context';
import { getAllTools } from '@/config/tools-registry';
import { ToolIcon } from '@/components/ui/tool-icon';
import { 
  LayoutDashboard, 
  Store, 
  ShieldAlert, 
  Lock, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { currentTenant, currentUser, hasLicense } = useTenant();
  const allTools = getAllTools();

  const licensedTools = allTools.filter(t => hasLicense(t.id));
  const availableTools = allTools.filter(t => !hasLicense(t.id));

  const isCurrentRoute = (route: string) => pathname === route;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-sm">
            A
          </div>
          <div>
            <div className="font-black text-white text-lg leading-tight tracking-tight flex items-center gap-1.5">
              Aptis
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">
                SUITE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">
              A fábrica sempre apta.
            </div>
          </div>
        </Link>

        {/* Tenant Ativo Badge */}
        <div className="mt-4 p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Planta / Organização Ativa
          </div>
          <div className="text-xs font-bold text-white truncate mt-0.5" title={currentTenant.name}>
            {currentTenant.name}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span className="capitalize font-mono text-emerald-400">Plano {currentTenant.plan}</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800 font-semibold">
              {licensedTools.length} módulos
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Menu Principal */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Navegação Geral
          </div>
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              isCurrentRoute('/dashboard')
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Visão Geral & Aptis Score
          </Link>
          <Link
            href="/dashboard/marketplace"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              isCurrentRoute('/dashboard/marketplace')
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            Suíte Aptis & Licenças
          </Link>
        </div>

        {/* Módulos Licenciados (Ativos) */}
        <div className="space-y-1">
          <div className="px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span>Suíte Aptis (Ativos)</span>
            <span className="text-emerald-400 font-mono font-bold">({licensedTools.length})</span>
          </div>

          {licensedTools.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500 italic bg-slate-800/40 rounded-md">
              Nenhuma ferramenta liberada ainda.
            </div>
          ) : (
            licensedTools.map(tool => {
              const active = isCurrentRoute(tool.route);
              return (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600/90 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ToolIcon name={tool.iconName} className="w-4 h-4 shrink-0 text-blue-400" />
                    <span className="truncate font-semibold">{tool.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-slate-600'}`} />
                </Link>
              );
            })
          )}
        </div>

        {/* Módulos Não Licenciados (Com cadeado para incentivar upgrade) */}
        {availableTools.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              <span>Módulos Aptis Disponíveis</span>
              <Lock className="w-3 h-3 text-slate-500" />
            </div>

            {availableTools.map(tool => {
              const active = isCurrentRoute(tool.route);
              return (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors group ${
                    active
                      ? 'bg-slate-800 text-amber-300 font-semibold'
                      : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
                  }`}
                  title="Módulo não contratado. Clique para solicitar ativação."
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ToolIcon name={tool.iconName} className="w-3.5 h-3.5 shrink-0 text-slate-600 group-hover:text-slate-400" />
                    <span className="truncate">{tool.name}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-600 group-hover:text-amber-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}

        {/* Seção SuperAdmin */}
        {currentUser.role === 'superadmin' && (
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Gestão Global
            </div>
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isCurrentRoute('/admin')
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Painel SuperAdmin (Licenças)
            </Link>
          </div>
        )}
      </div>

      {/* Footer da Sidebar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Vitrine Pública
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
            Aptis.io
          </span>
        </Link>
      </div>
    </aside>
  );
}
