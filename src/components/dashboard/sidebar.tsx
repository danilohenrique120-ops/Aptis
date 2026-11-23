'use client';

import React, { useState, useRef, useLayoutEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/context/tenant-context';
import { isPlantAdminUser } from '@/lib/sector-access';
import { getAllTools } from '@/config/tools-registry';
import { ToolIcon } from '@/components/ui/tool-icon';
import { AptisLogo } from '@/components/ui/aptis-logo';
import {
  LayoutDashboard,
  Store,
  Lock,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Building2,
  Layers
} from 'lucide-react';
import { PlantSectorsManagerModal } from '@/components/modals/PlantSectorsManagerModal';

function subscribeGlassMode(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('aptis-glass-mode-change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('aptis-glass-mode-change', callback);
    window.removeEventListener('storage', callback);
  };
}

function getGlassModeSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('aptis_tinted_glass_mode');
  return saved !== null ? saved === 'true' : true;
}

function getGlassModeServerSnapshot(): boolean {
  return true;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { currentTenant, effectiveUser, hasLicense } = useTenant();
  const isPlantAdmin = isPlantAdminUser(effectiveUser);
  const allTools = getAllTools();

  const licensedTools = allTools.filter(t => hasLicense(t.id));
  const availableTools = allTools.filter(t => !hasLicense(t.id));

  const [pendingClick, setPendingClick] = useState<{ fromPath: string; toPath: string } | null>(
    null
  );
  const activeRoute =
    pendingClick && pendingClick.fromPath === pathname ? pendingClick.toPath : pathname;

  const isCurrentRoute = (route: string) => activeRoute === route;
  const [isSectorsModalOpen, setIsSectorsModalOpen] = useState(false);
  const tintedGlass = useSyncExternalStore(
    subscribeGlassMode,
    getGlassModeSnapshot,
    getGlassModeServerSnapshot
  );

  // Refs para o Motor de Mitose / Célula Líquida da Sidebar
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const gooLayerRef = useRef<HTMLDivElement | null>(null);
  const leadCellRef = useRef<HTMLDivElement | null>(null);
  const trailCellRef = useRef<HTMLDivElement | null>(null);
  const budCellRef = useRef<HTMLDivElement | null>(null);
  const rimCellRef = useRef<HTMLDivElement | null>(null);
  const prevRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const animTimersRef = useRef<number[]>([]);

  useLayoutEffect(() => {
    const container = navContainerRef.current;
    const gooLayer = gooLayerRef.current;
    const lead = leadCellRef.current;
    const trail = trailCellRef.current;
    const bud = budCellRef.current;
    const rim = rimCellRef.current;
    if (!container || !gooLayer || !lead || !trail || !bud || !rim) return;

    const clearTimers = () => {
      animTimersRef.current.forEach(t => window.clearTimeout(t));
      animTimersRef.current = [];
    };

    const positionCell = (animate: boolean) => {
      gooLayer.style.height = `${Math.max(container.scrollHeight, container.clientHeight)}px`;
      const targetEl = container.querySelector<HTMLElement>(
        `[data-sidebar-route="${CSS.escape(activeRoute)}"]`
      );
      if (!targetEl) {
        lead.style.opacity = '0';
        trail.style.opacity = '0';
        bud.style.opacity = '0';
        rim.style.opacity = '0';
        return;
      }

      const cRect = container.getBoundingClientRect();
      const tRect = targetEl.getBoundingClientRect();
      const next = {
        x: tRect.left - cRect.left + container.scrollLeft,
        y: tRect.top - cRect.top + container.scrollTop,
        w: tRect.width,
        h: tRect.height
      };

      const prev = prevRectRef.current;
      const shouldAnimate =
        animate &&
        prev !== null &&
        Math.hypot(next.x - prev.x, next.y - prev.y) > 4 &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      clearTimers();

      if (!shouldAnimate || !prev) {
        const instant = 'none';
        lead.style.transition = instant;
        trail.style.transition = instant;
        bud.style.transition = instant;
        rim.style.transition = instant;

        lead.style.opacity = '1';
        lead.style.width = `${next.w}px`;
        lead.style.height = `${next.h}px`;
        lead.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(1, 1)`;

        trail.style.opacity = '0.92';
        trail.style.width = `${next.w * 0.9}px`;
        trail.style.height = `${next.h * 0.88}px`;
        trail.style.transform = `translate3d(${next.x + next.w * 0.05}px, ${
          next.y + next.h * 0.06
        }px, 0) scale(1, 1)`;

        bud.style.opacity = '0';
        bud.style.width = `${next.w * 0.48}px`;
        bud.style.height = `${next.h * 0.65}px`;
        bud.style.transform = `translate3d(${next.x + next.w * 0.26}px, ${
          next.y + next.h * 0.18
        }px, 0) scale(0.7)`;

        rim.style.opacity = '1';
        rim.style.width = `${next.w}px`;
        rim.style.height = `${next.h}px`;
        rim.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(1, 1)`;

        prevRectRef.current = next;
        return;
      }

      // Fase 1: Descolamento e Mitose Vertical (Lead se descola enquanto Trail estica a membrana!)
      const midY = prev.y + (next.y - prev.y) * 0.52;
      const budW = next.w * 0.56;
      const budH = Math.max(22, next.h * 0.72);

      // Posiciona a gota satélite no ponto de origem antes de disparar
      bud.style.transition = 'none';
      bud.style.opacity = '0.95';
      bud.style.width = `${budW}px`;
      bud.style.height = `${budH}px`;
      bud.style.transform = `translate3d(${prev.x + (prev.w - budW) / 2}px, ${
        prev.y + (prev.h - budH) / 2
      }px, 0) scale(0.85)`;
      void bud.offsetWidth;

      lead.style.opacity = '1';
      lead.style.transition =
        'transform 400ms cubic-bezier(0.22, 1.16, 0.36, 1), width 380ms ease, height 380ms ease';
      lead.style.width = `${next.w}px`;
      lead.style.height = `${next.h}px`;
      lead.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(0.91, 1.09)`;

      rim.style.opacity = '1';
      rim.style.transition =
        'transform 400ms cubic-bezier(0.22, 1.16, 0.36, 1), width 380ms ease, height 380ms ease';
      rim.style.width = `${next.w}px`;
      rim.style.height = `${next.h}px`;
      rim.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(0.95, 1.04)`;

      // Gota filha se desprende no meio do caminho (efeito divisão celular / mitose)
      bud.style.transition = 'transform 260ms cubic-bezier(0.18, 0.9, 0.32, 1.1), opacity 240ms ease';
      bud.style.transform = `translate3d(${next.x + (next.w - budW) / 2}px, ${
        midY + (next.h - budH) / 2
      }px, 0) scale(0.76, 1.24)`;

      // Trail segura 65ms na origem e depois puxa atrás do Lead, formando a ponte líquida pelo filtro SVG goo
      trail.style.opacity = '0.96';
      trail.style.transition =
        'transform 520ms cubic-bezier(0.42, 0, 0.2, 1) 65ms, width 460ms ease 65ms, height 460ms ease 65ms';
      trail.style.width = `${next.w * 0.9}px`;
      trail.style.height = `${next.h * 0.88}px`;
      trail.style.transform = `translate3d(${next.x + next.w * 0.05}px, ${
        next.y + next.h * 0.06
      }px, 0) scale(0.84, 1.14)`;

      // Fase 2: Reabsorção orgânica e acomodação elástica no item de destino
      const t1 = window.setTimeout(() => {
        lead.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
        lead.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(1, 1)`;

        rim.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
        rim.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(1, 1)`;

        bud.style.transition = 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease';
        bud.style.transform = `translate3d(${next.x + (next.w - budW) / 2}px, ${
          next.y + (next.h - budH) / 2
        }px, 0) scale(0.7)`;
        bud.style.opacity = '0';
      }, 240);

      const t2 = window.setTimeout(() => {
        trail.style.transition = 'transform 200ms ease-out';
        trail.style.transform = `translate3d(${next.x + next.w * 0.05}px, ${
          next.y + next.h * 0.06
        }px, 0) scale(1, 1)`;
      }, 480);

      animTimersRef.current = [t1, t2];
      prevRectRef.current = next;
    };

    positionCell(true);

    const handleResize = () => positionCell(false);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimers();
      window.removeEventListener('resize', handleResize);
    };
  }, [activeRoute, licensedTools.length, availableTools.length, isPlantAdmin]);

  const handleToggleTintedGlass = () => {
    const next = !tintedGlass;
    localStorage.setItem('aptis_tinted_glass_mode', String(next));
    window.dispatchEvent(new CustomEvent('aptis-glass-mode-change', { detail: next }));
  };

  return (
    <aside
      className="w-64 flex flex-col shrink-0 min-h-screen select-none relative z-20 text-slate-300 border-r border-white/[0.08]"
      style={{
        background:
          'linear-gradient(180deg, rgba(10, 15, 29, 0.88) 0%, rgba(7, 11, 22, 0.94) 100%)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        boxShadow: 'inset -1px 0 0 0 rgba(255, 255, 255, 0.06), 12px 0 40px -10px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Brilho Ambiente no Topo da Sidebar (Estilo Cimel Vídeo 1) */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.7) 0%, transparent 70%)'
        }}
      />

      {/* Brand Header com Logotipo Oficial Aptis */}
      <div className="p-4 border-b border-white/[0.07] relative z-10">
        <Link href="/dashboard" className="block">
          <AptisLogo size="sm" showTagline={true} glow={true} />
        </Link>

        {/* Tenant Ativo Badge em Vidro Especular */}
        <div
          className="mt-3.5 p-3 rounded-2xl border border-white/[0.1] border-t-white/[0.22] relative overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
            boxShadow:
              'inset 0 1px 0 0 rgba(255, 255, 255, 0.16), 0 10px 24px -8px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-cyan-400" />
              {currentTenant.id === 'tenant-dhp' ? 'Ambiente Master' : 'Unidade Fabril'}
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              {currentTenant.id === 'tenant-dhp' ? 'Global' : 'Apta'}
            </span>
          </div>
          <div
            className="text-xs font-bold text-white truncate mt-1"
            title={
              currentTenant.id === 'tenant-dhp'
                ? 'Aptis Tecnologia (Admin Master)'
                : currentTenant.name
            }
          >
            {currentTenant.id === 'tenant-dhp'
              ? 'Aptis Tecnologia (Admin Master)'
              : currentTenant.name}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.07] text-[11px]">
            <span className="capitalize font-mono text-cyan-300 text-[10px]">
              {currentTenant.id === 'tenant-dhp' ? 'Acesso Fundador' : `Plano ${currentTenant.plan}`}
            </span>
            <span className="text-[10px] bg-cyan-500/15 text-cyan-200 px-2 py-0.5 rounded-full border border-cyan-400/30 font-semibold font-mono">
              {licensedTools.length} módulos
            </span>
          </div>
        </div>
      </div>

      {/* Navigation com Motor de Mitose / Célula Líquida */}
      <div
        ref={navContainerRef}
        className="flex-1 overflow-y-auto py-4 px-3 space-y-5 relative z-10"
      >
        {/* Camada Gooey de Mitose Celular (atrás dos links) */}
        <div
          ref={gooLayerRef}
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 pointer-events-none z-0"
          style={{ filter: 'url(#aptis-sidebar-goo)' }}
        >
          <div
            ref={trailCellRef}
            className="absolute top-0 left-0 rounded-xl opacity-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(37, 99, 235, 0.85) 0%, rgba(6, 182, 212, 0.7) 100%)',
              willChange: 'transform, width, height'
            }}
          />
          <div
            ref={budCellRef}
            className="absolute top-0 left-0 rounded-full opacity-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(56, 189, 248, 0.9) 0%, rgba(37, 99, 235, 0.85) 100%)',
              willChange: 'transform, opacity'
            }}
          />
          <div
            ref={leadCellRef}
            className="absolute top-0 left-0 rounded-xl opacity-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(37, 99, 235, 0.88) 0%, rgba(6, 182, 212, 0.72) 100%)',
              willChange: 'transform, width, height'
            }}
          />
        </div>

        {/* Camada Especular Nítida (Borda e Brilho de Vidro acima do filtro goo) */}
        <div
          ref={rimCellRef}
          aria-hidden="true"
          className="absolute top-0 left-0 rounded-xl opacity-0 pointer-events-none z-[1]"
          style={{
            border: '1px solid rgba(56, 189, 248, 0.45)',
            borderTopColor: 'rgba(186, 230, 253, 0.65)',
            boxShadow:
              'inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 8px 22px -4px rgba(37, 99, 235, 0.45)',
            willChange: 'transform, width, height'
          }}
        />

        {/* Menu Principal */}
        <div className="space-y-1.5 relative z-10">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Governança da Planta
          </div>
          <Link
            href="/dashboard"
            data-sidebar-route="/dashboard"
            onClick={() => setPendingClick({ fromPath: pathname, toPath: '/dashboard' })}
            className={`relative z-10 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors duration-300 ${
              isCurrentRoute('/dashboard')
                ? 'text-white font-bold'
                : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-300" />
            Visão Geral & Aptis Score
          </Link>

          <Link
            href="/dashboard/marketplace"
            data-sidebar-route="/dashboard/marketplace"
            onClick={() => setPendingClick({ fromPath: pathname, toPath: '/dashboard/marketplace' })}
            className={`relative z-10 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors duration-300 ${
              isCurrentRoute('/dashboard/marketplace')
                ? 'text-white font-bold'
                : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 text-slate-400" />
            Suíte Aptis & Licenças
          </Link>

          {isPlantAdmin && (
            <button
              onClick={() => setIsSectorsModalOpen(true)}
              className="w-full relative z-10 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/[0.05] hover:text-white transition-all cursor-pointer group text-left"
              title="Gerenciar áreas, setores fabris e gestores com permissão por área"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Áreas &amp; Gestores</span>
              </div>
              <span className="text-[10px] bg-white/[0.06] text-cyan-300 px-2 py-0.5 rounded-full border border-white/[0.12] font-semibold font-mono">
                Central
              </span>
            </button>
          )}
        </div>

        {/* Módulos Licenciados (Ativos) */}
        <div className="space-y-1 relative z-10">
          <div className="px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <span>Suíte Aptis (Ativos)</span>
            <span className="text-cyan-400 font-mono font-bold">({licensedTools.length})</span>
          </div>

          {licensedTools.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500 italic bg-white/[0.03] rounded-lg">
              Nenhuma ferramenta liberada ainda.
            </div>
          ) : (
            licensedTools.map(tool => {
              const active = isCurrentRoute(tool.route);
              return (
                <Link
                  key={tool.id}
                  href={tool.route}
                  data-sidebar-route={tool.route}
                  onClick={() => setPendingClick({ fromPath: pathname, toPath: tool.route })}
                  className={`relative z-10 flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors duration-300 ${
                    active
                      ? 'text-white font-bold'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ToolIcon
                      name={tool.iconName}
                      className={`w-4 h-4 shrink-0 transition-colors duration-300 ${
                        active ? 'text-cyan-300' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{tool.name}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${
                      active ? 'text-cyan-200 translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </Link>
              );
            })
          )}
        </div>

        {/* Módulos Não Licenciados */}
        {availableTools.length > 0 && (
          <div className="space-y-1 relative z-10">
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
                  data-sidebar-route={tool.route}
                  onClick={() => setPendingClick({ fromPath: pathname, toPath: tool.route })}
                  className={`relative z-10 flex items-center justify-between px-3.5 py-1.5 rounded-xl text-xs transition-colors group ${
                    active
                      ? 'text-amber-200 font-semibold'
                      : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                  }`}
                  title="Módulo não contratado. Clique para solicitar ativação."
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ToolIcon
                      name={tool.iconName}
                      className="w-3.5 h-3.5 shrink-0 text-slate-600 group-hover:text-slate-400"
                    />
                    <span className="truncate">{tool.name}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-600 group-hover:text-amber-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer da Sidebar com Toggle "Tinted Glass" (Inspirado nos Vídeos 1 Cimel & 3 Ardena) */}
      <div className="p-3 border-t border-white/[0.08] space-y-2 relative z-10">
        {/* Seletor Tinted Glass / Dark Glass */}
        <button
          type="button"
          onClick={handleToggleTintedGlass}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
          title="Alternar entre o modo Vidro Fumê Imersivo (Tinted Glass) e Vidro Cristal Claro"
        >
          <span className="flex items-center gap-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Tinted Glass
          </span>
          <div
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
              tintedGlass
                ? 'bg-emerald-500/90 shadow-[0_0_12px_rgba(16,185,129,0.5)] justify-end'
                : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-xs block transition-transform" />
          </div>
        </button>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04] transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            Vitrine Pública
          </span>
          <span className="text-[10px] bg-white/[0.06] text-slate-300 px-2 py-0.5 rounded-full border border-white/[0.1] font-mono">
            Aptis.io
          </span>
        </Link>
      </div>

      {/* Modal Central de Áreas e Setores da Planta */}
      <PlantSectorsManagerModal
        isOpen={isSectorsModalOpen}
        onClose={() => setIsSectorsModalOpen(false)}
        tenantName={currentTenant.name}
      />
    </aside>
  );
}
