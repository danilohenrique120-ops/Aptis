'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/context/tenant-context';
import { getAllTools } from '@/config/tools-registry';
import { ToolIcon } from '@/components/ui/tool-icon';
import { AptisLogo } from '@/components/ui/aptis-logo';
import { 
  LayoutDashboard, 
  Store, 
  ShieldAlert, 
  Lock, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  Activity,
  Building2
} from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { currentTenant, currentUser, hasLicense } = useTenant();
  const allTools = getAllTools();

  const licensedTools = allTools.filter(t => hasLicense(t.id));
  const availableTools = allTools.filter(t => !hasLicense(t.id));

  const isCurrentRoute = (route: string) => pathname === route;

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 min-h-screen select-none">
      {/* Brand Header com Logotipo Oficial Aptis */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/70">
        <Link href="/dashboard" className="block">
          <AptisLogo size="sm" showTagline={true} glow={true} />
        </Link>

        {/* Tenant Ativo Badge Industrial */}
        <div className="mt-3.5 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/90 shadow-inner">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-cyan-400" />
              Unidade Fabril
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Apta
            </span>
          </div>
          <div className="text-xs font-bold text-white truncate mt-1" title={currentTenant.name}>
            {currentTenant.name}
          </div>
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-800/60 text-[11px]">
            <span className="capitalize font-mono text-cyan-400 text-[10px]">Plano {currentTenant.plan}</span>
            <span className="text-[10px] bg-cyan-950/60 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/40 font-semibold font-mono">
              {licensedTools.length} módulos
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {/* Menu Principal */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Governança da Planta
          </div>
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isCurrentRoute('/dashboard')
                ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 text-cyan-300 border-l-2 border-cyan-400 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            Visão Geral & Aptis Score
          </Link>
          <Link
            href="/dashboard/marketplace"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isCurrentRoute('/dashboard/marketplace')
                ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 text-cyan-300 border-l-2 border-cyan-400 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 text-slate-400" />
            Suíte Aptis & Licenças
          </Link>
        </div>

        {/* Módulos Licenciados (Ativos) */}
        <div className="space-y-1">
          <div className="px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <span>Suíte Aptis (Ativos)</span>
            <span className="text-cyan-400 font-mono font-bold">({licensedTools.length})</span>
          </div>

          {licensedTools.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500 italic bg-slate-900/40 rounded-lg">
              Nenhuma ferramenta liberada ainda.
            </div>
          ) : (
            licensedTools.map(tool => {
              const active = isCurrentRoute(tool.route);
              return (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/60 text-cyan-200 border-l-2 border-cyan-400 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ToolIcon name={tool.iconName} className={`w-4 h-4 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{tool.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-cyan-300' : 'text-slate-600'}`} />
                </Link>
              );
            })
          )}
        </div>

        {/* Módulos Não Licenciados (Com cadeado para incentivar upgrade) */}
        {availableTools.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <span>Módulos Disponíveis</span>
              <Lock className="w-3 h-3 text-slate-500" />
            </div>

            {availableTools.map(tool => {
              const active = isCurrentRoute(tool.route);
              return (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors group ${
                    active
                      ? 'bg-slate-900 text-amber-300 font-semibold'
                      : 'text-slate-500 hover:bg-slate-900/60 hover:text-slate-300'
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
          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Gestão Global
            </div>
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isCurrentRoute('/admin')
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-300 bg-amber-950/30 hover:bg-amber-900/50 border border-amber-800/40'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Painel SuperAdmin (Licenças)
            </Link>
          </div>
        )}
      </div>

      {/* Footer da Sidebar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            Vitrine Pública
          </span>
          <span className="text-[10px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 font-mono">
            Aptis.io
          </span>
        </Link>
      </div>
    </aside>
  );
}
