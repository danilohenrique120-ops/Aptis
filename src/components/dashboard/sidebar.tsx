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

  // Refs para a Bolinha Molecular da Sidebar (pequena esfera luminosa que se separa e se move)
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const gooLayerRef = useRef<HTMLDivElement | null>(null);
  const daughterOrbRef = useRef<HTMLDivElement | null>(null);
  const motherOrbRef = useRef<HTMLDivElement | null>(null);
  const microOrbRef = useRef<HTMLDivElement | null>(null);
  const coreGlowRef = useRef<HTMLDivElement | null>(null);
  const prevAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const animTimersRef = useRef<number[]>([]);

  useLayoutEffect(() => {
    const container = navContainerRef.current;
    const gooLayer = gooLayerRef.current;
    const daughter = daughterOrbRef.current;
    const mother = motherOrbRef.current;
    const micro = microOrbRef.current;
    const coreGlow = coreGlowRef.current;
    if (!container || !gooLayer || !daughter || !mother || !micro || !coreGlow) return;

    const ORB = 11;
    const MOTHER = 10;
    const MICRO = 6;

    const clearTimers = () => {
      animTimersRef.current.forEach(t => window.clearTimeout(t));
      animTimersRef.current = [];
    };

    const positionMolecule = (animate: boolean) => {
      gooLayer.style.height = `${Math.max(container.scrollHeight, container.clientHeight)}px`;
      const targetEl = container.querySelector<HTMLElement>(
        `[data-sidebar-route="${CSS.escape(activeRoute)}"]`
      );
      if (!targetEl) {
        daughter.style.opacity = '0';
        mother.style.opacity = '0';
        micro.style.opacity = '0';
        coreGlow.style.opacity = '0';
        return;
      }

      const cRect = container.getBoundingClientRect();
      const tRect = targetEl.getBoundingClientRect();
      // Pequena bolha/molécula posicionada na borda esquerda, centralizada na altura do item ativo
      const next = {
        x: tRect.left - cRect.left + container.scrollLeft + 3,
        y: tRect.top - cRect.top + container.scrollTop + tRect.height / 2
      };

      const prev = prevAnchorRef.current;
      const dist = prev ? Math.hypot(next.x - prev.x, next.y - prev.y) : 0;
      const shouldAnimate =
        animate &&
        prev !== null &&
        dist > 4 &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      clearTimers();

      if (!shouldAnimate || !prev) {
        daughter.style.transition = 'none';
        mother.style.transition = 'none';
        micro.style.transition = 'none';
        coreGlow.style.transition = 'none';

        daughter.style.opacity = '1';
        daughter.style.transform = `translate3d(${next.x - ORB / 2}px, ${next.y - ORB / 2}px, 0) scale(1)`;

        mother.style.opacity = '0.9';
        mother.style.transform = `translate3d(${next.x - MOTHER / 2}px, ${next.y - MOTHER / 2}px, 0) scale(0.9)`;

        micro.style.opacity = '0';
        micro.style.transform = `translate3d(${next.x - MICRO / 2}px, ${next.y - MICRO / 2}px, 0) scale(0.6)`;

        coreGlow.style.opacity = '1';
        coreGlow.style.transform = `translate3d(${next.x - 2.5}px, ${next.y - 2.5}px, 0) scale(1)`;

        prevAnchorRef.current = next;
        return;
      }

      // Fase 1 (0ms → 130ms): Separação molecular — a bolinha-filha brota 15px em direção ao novo menu
      // enquanto a bolha-mãe segura na origem, formando a ponte líquida de separação!
      const dirY = (next.y - prev.y) / dist;
      const budOffset = Math.min(16, dist * 0.32);

      micro.style.transition = 'none';
      micro.style.opacity = '0.95';
      micro.style.transform = `translate3d(${prev.x - MICRO / 2}px, ${prev.y - MICRO / 2}px, 0) scale(0.8)`;
      void micro.offsetWidth;

      daughter.style.opacity = '1';
      daughter.style.transition = 'transform 130ms cubic-bezier(0.3, 0, 0.2, 1)';
      daughter.style.transform = `translate3d(${prev.x - ORB / 2}px, ${
        prev.y + dirY * budOffset - ORB / 2
      }px, 0) scale(1.12)`;

      coreGlow.style.opacity = '1';
      coreGlow.style.transition = 'transform 130ms cubic-bezier(0.3, 0, 0.2, 1)';
      coreGlow.style.transform = `translate3d(${prev.x - 2.5}px, ${
        prev.y + dirY * budOffset - 2.5
      }px, 0) scale(1.1)`;

      micro.style.transition = 'transform 130ms ease-out';
      micro.style.transform = `translate3d(${prev.x - MICRO / 2}px, ${
        prev.y + dirY * (budOffset * 0.5) - MICRO / 2
      }px, 0) scale(1)`;

      // Fase 2 (125ms): A bolinha se descola por completo e desliza suavemente até o novo item
      const t1 = window.setTimeout(() => {
        daughter.style.transition = 'transform 380ms cubic-bezier(0.22, 1.18, 0.36, 1)';
        daughter.style.transform = `translate3d(${next.x - ORB / 2}px, ${
          next.y - ORB / 2
        }px, 0) scale(1)`;

        coreGlow.style.transition = 'transform 380ms cubic-bezier(0.22, 1.18, 0.36, 1)';
        coreGlow.style.transform = `translate3d(${next.x - 2.5}px, ${next.y - 2.5}px, 0) scale(1)`;

        micro.style.transition =
          'transform 420ms cubic-bezier(0.35, 0, 0.2, 1) 30ms, opacity 200ms ease 290ms';
        micro.style.transform = `translate3d(${next.x - MICRO / 2}px, ${
          next.y - MICRO / 2
        }px, 0) scale(0.6)`;
        micro.style.opacity = '0';

        mother.style.transition = 'transform 440ms cubic-bezier(0.42, 0, 0.2, 1) 55ms';
        mother.style.transform = `translate3d(${next.x - MOTHER / 2}px, ${
          next.y - MOTHER / 2
        }px, 0) scale(0.9)`;
      }, 125);

      animTimersRef.current = [t1];
      prevAnchorRef.current = next;
    };

    positionMolecule(true);

    const handleResize = () => positionMolecule(false);
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

      {/* Navigation com Bolinha Molecular que se Separa e Desliza */}
      <div
        ref={navContainerRef}
        className="flex-1 overflow-y-auto py-4 px-3 space-y-5 relative z-10"
      >
        {/* Camada Gooey de Separação Molecular (pequenas bolhas na borda esquerda) */}
        <div
          ref={gooLayerRef}
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 pointer-events-none z-20"
          style={{ filter: 'url(#aptis-molecule-goo)' }}
        >
          <div
            ref={motherOrbRef}
            className="absolute top-0 left-0 rounded-full opacity-0 pointer-events-none"
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#06b6d4',
              willChange: 'transform, opacity'
            }}
          />
          <div
            ref={microOrbRef}
            className="absolute top-0 left-0 rounded-full opacity-0 pointer-events-none"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#bae6fd',
              willChange: 'transform, opacity'
            }}
          />
          <div
            ref={daughterOrbRef}
            className="absolute top-0 left-0 rounded-full opacity-0 pointer-events-none"
            style={{
              width: '11px',
              height: '11px',
              backgroundColor: '#22d3ee',
              willChange: 'transform, opacity'
            }}
          />
        </div>

        {/* Núcleo luminoso cristalino da bolinha (nítido, acima do filtro goo) */}
        <div
          ref={coreGlowRef}
          aria-hidden="true"
          className="absolute top-0 left-0 rounded-full opacity-0 pointer-events-none z-30"
          style={{
            width: '5px',
            height: '5px',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 12px 3px rgba(34, 211, 238, 0.85)',
            willChange: 'transform, opacity'
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
            className={`relative z-10 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
              isCurrentRoute('/dashboard')
                ? 'text-white font-bold'
                : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
            }`}
            style={
              isCurrentRoute('/dashboard')
                ? {
                    background:
                      'linear-gradient(90deg, rgba(37, 99, 235, 0.45) 0%, rgba(6, 182, 212, 0.2) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderTopColor: 'rgba(186, 230, 253, 0.5)',
                    boxShadow:
                      'inset 0 1px 0 0 rgba(255, 255, 255, 0.24), 0 8px 20px -4px rgba(37, 99, 235, 0.35)'
                  }
                : undefined
            }
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-300" />
            Visão Geral & Aptis Score
          </Link>

          <Link
            href="/dashboard/marketplace"
            data-sidebar-route="/dashboard/marketplace"
            onClick={() => setPendingClick({ fromPath: pathname, toPath: '/dashboard/marketplace' })}
            className={`relative z-10 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
              isCurrentRoute('/dashboard/marketplace')
                ? 'text-white font-bold'
                : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
            }`}
            style={
              isCurrentRoute('/dashboard/marketplace')
                ? {
                    background:
                      'linear-gradient(90deg, rgba(37, 99, 235, 0.45) 0%, rgba(6, 182, 212, 0.2) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderTopColor: 'rgba(186, 230, 253, 0.5)',
                    boxShadow:
                      'inset 0 1px 0 0 rgba(255, 255, 255, 0.24), 0 8px 20px -4px rgba(37, 99, 235, 0.35)'
                  }
                : undefined
            }
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
                  className={`relative z-10 flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                    active
                      ? 'text-white font-bold'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                  style={
                    active
                      ? {
                          background:
                            'linear-gradient(90deg, rgba(37, 99, 235, 0.45) 0%, rgba(6, 182, 212, 0.2) 100%)',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          borderTopColor: 'rgba(186, 230, 253, 0.5)',
                          boxShadow:
                            'inset 0 1px 0 0 rgba(255, 255, 255, 0.24), 0 6px 18px -4px rgba(37, 99, 235, 0.35)'
                        }
                      : undefined
                  }
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
