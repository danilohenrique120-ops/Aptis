'use client';

import React, { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const tintedGlass = useSyncExternalStore(
    subscribeGlassMode,
    getGlassModeSnapshot,
    getGlassModeServerSnapshot
  );

  // Todas as rotas do Dashboard operam sob o motor óptico Dual-Mode (Tinted Glass / Light Crystal)
  const isGlassEnabledRoute = pathname.startsWith('/dashboard');
  const useDarkGlassCanvas = isGlassEnabledRoute && tintedGlass;

  return (
    <div
      className={`flex min-h-screen font-sans relative overflow-x-hidden transition-colors duration-500 ${
        useDarkGlassCanvas
          ? 'bg-[#060913] text-slate-100 aptis-mode-dark'
          : 'bg-[#eef2f7] text-slate-900 aptis-mode-light'
      }`}
    >
      {/* ORBES DE LUZ AMBIENTE DIFUSA (Inspirados no Vídeo 1 - Cimel & Vídeo 4 - Halvo) */}
      {useDarkGlassCanvas ? (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Orbe Azul Safira Profundo (Esquerda / Centro - Cimel) */}
          <div
            className="absolute -top-24 left-48 w-[580px] h-[580px] rounded-full opacity-35 blur-[130px] transition-all duration-1000"
            style={{
              background:
                'radial-gradient(circle, rgba(37, 99, 235, 0.85) 0%, rgba(14, 165, 233, 0.35) 50%, transparent 75%)'
            }}
          />
          {/* Orbe Âmbar / Ouro Quente no Topo Direito (Refração do Gauge - Cimel & Ardena) */}
          <div
            className="absolute -top-16 right-8 w-[460px] h-[460px] rounded-full opacity-30 blur-[120px] transition-all duration-1000"
            style={{
              background:
                'radial-gradient(circle, rgba(245, 158, 11, 0.8) 0%, rgba(217, 119, 6, 0.35) 48%, transparent 72%)'
            }}
          />
          {/* Orbe Esmeralda / Ciano Suave na Base (Halvo) */}
          <div
            className="absolute bottom-[-120px] left-1/3 w-[620px] h-[420px] rounded-full opacity-25 blur-[140px]"
            style={{
              background:
                'radial-gradient(circle, rgba(16, 185, 129, 0.65) 0%, rgba(6, 182, 212, 0.25) 55%, transparent 75%)'
            }}
          />
          {/* Malha sutil de profundidade óptica */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        </div>
      ) : (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-24 left-60 w-[520px] h-[520px] rounded-full bg-cyan-400/15 blur-[120px]" />
          <div className="absolute top-10 right-10 w-[420px] h-[420px] rounded-full bg-amber-400/12 blur-[110px]" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] rounded-full bg-indigo-400/10 blur-[130px]" />
        </div>
      )}

      {/* Sidebar Lateral em Vidro Flutuante */}
      <DashboardSidebar />

      {/* Conteúdo Principal — estende automaticamente quando a sidebar minimiza */}
      <div className="flex-1 flex flex-col min-w-0 relative transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-none mx-auto relative transition-all duration-300">
          <div key={pathname} className="aptis-page-transition">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
