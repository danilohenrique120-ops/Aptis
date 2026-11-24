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
import {
  drawWaterSphere,
  renderWaterDropletTransitionFrame,
  WATER_DROPLET_PALETTES
} from '@/lib/water-droplet-renderer';

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

  // Refs para a Gota de Água 3D da Sidebar (separa com pescoço líquido e 3 gotinhas o O o)
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const dropletCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const container = navContainerRef.current;
    const canvas = dropletCanvasRef.current;
    if (!container || !canvas) return;

    const REST_RADIUS = 5.5;
    const TRAVEL_RADIUS = 7.5;
    const DURATION_MS = 780;

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const syncAndRender = (animate: boolean) => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.scrollHeight, container.clientHeight, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const targetEl = container.querySelector<HTMLElement>(
        `[data-sidebar-route="${CSS.escape(activeRoute)}"]`
      );
      if (!targetEl) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        return;
      }

      const cRect = container.getBoundingClientRect();
      const tRect = targetEl.getBoundingClientRect();
      const next = {
        x: tRect.left - cRect.left + container.scrollLeft + 9,
        y: tRect.top - cRect.top + container.scrollTop + tRect.height / 2
      };

      const prev = prevAnchorRef.current;
      const dist = prev ? Math.hypot(next.x - prev.x, next.y - prev.y) : 0;
      const shouldAnimate =
        animate &&
        prev !== null &&
        dist > 4 &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      prevAnchorRef.current = next;

      if (!shouldAnimate || !prev) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        drawWaterSphere(
          ctx,
          next.x,
          next.y,
          REST_RADIUS,
          REST_RADIUS,
          0,
          WATER_DROPLET_PALETTES.cyan,
          1
        );
        return;
      }

      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        if (elapsed < DURATION_MS) {
          const p = Math.min(1, elapsed / DURATION_MS);
          renderWaterDropletTransitionFrame(ctx, {
            fromX: prev.x,
            fromY: prev.y,
            toX: next.x,
            toY: next.y,
            progress: p,
            baseRadius: TRAVEL_RADIUS,
            palette: WATER_DROPLET_PALETTES.cyan
          });
          rafRef.current = window.requestAnimationFrame(tick);
          return;
        }

        // Volta suavemente ao raio de repouso na nova ferramenta
        drawWaterSphere(
          ctx,
          next.x,
          next.y,
          REST_RADIUS,
          REST_RADIUS,
          0,
          WATER_DROPLET_PALETTES.cyan,
          1
        );
        rafRef.current = null;
      };

      rafRef.current = window.requestAnimationFrame(tick);
    };

    syncAndRender(true);

    const handleResize = () => syncAndRender(false);
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
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

      {/* Navigation com Gota de Água 3D que se Separa e Desliza */}
      <div
        ref={navContainerRef}
        className="flex-1 overflow-y-auto py-4 px-3 space-y-5 relative z-10"
      >
        {/* Canvas 60fps para física de Gota de Água 3D (pescoço líquido + 3 micro-gotinhas) */}
        <canvas
          ref={dropletCanvasRef}
          aria-hidden="true"
          className="absolute top-0 left-0 pointer-events-none z-30"
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
            className={`relative z-10 flex items-center gap-2.5 pl-6 pr-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
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
            className={`relative z-10 flex items-center gap-2.5 pl-6 pr-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
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
                  className={`relative z-10 flex items-center justify-between pl-6 pr-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
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
                  className={`relative z-10 flex items-center justify-between pl-6 pr-3.5 py-1.5 rounded-xl text-xs transition-colors group ${
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
