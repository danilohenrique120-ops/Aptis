'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/tenant-context';
import { getAllTools } from '@/config/tools-registry';
import { ToolIcon } from '@/components/ui/tool-icon';
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  Lock,
  Store,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  ChevronRight,
  Layers,
  Globe,
  Cpu,
  Users,
  ShieldCheck
} from 'lucide-react';
import { PlantSectorsManagerModal } from '@/components/modals/PlantSectorsManagerModal';
import { usePlantSectors } from '@/hooks/use-plant-sectors';

type SuiteFilterTab = 'all' | 'operations' | 'leadership' | 'compliance';

export default function DashboardHomePage() {
  const { currentTenant, currentUser, hasLicense } = useTenant();
  const allTools = getAllTools();
  const { sectors } = usePlantSectors();
  const [isSectorsModalOpen, setIsSectorsModalOpen] = useState(false);
  const [tintedGlass, setTintedGlass] = useState(true);
  const [activeSuiteTab, setActiveSuiteTab] = useState<SuiteFilterTab>('all');

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

  const activeTools = allTools.filter(tool => hasLicense(tool.id));
  const lockedTools = allTools.filter(tool => !hasLicense(tool.id));

  // Dynamic stats from localStorage (100% preservado)
  const [stats, setStats] = useState({
    totalTasks: 0,
    totalEmployees: 0,
    totalTrainings: 0,
    totalKaizens: 0,
    isLoaded: false
  });

  useEffect(() => {
    try {
      const tenantId = currentTenant?.id || 'dhp-enterprise';

      const savedTasks =
        localStorage.getItem(`aptis_${tenantId}_manager-tasks_tasks`) ||
        localStorage.getItem('aptis_routine_tasks');
      const savedEmployees =
        localStorage.getItem(`aptis_${tenantId}_skills-matrix_operators`) ||
        localStorage.getItem('aptis_skills_employees');
      const savedTrainings =
        localStorage.getItem(`aptis_${tenantId}_training-matrix_records`) ||
        localStorage.getItem('aptis_compliance_trainings');
      const savedKaizens =
        localStorage.getItem(`aptis_${tenantId}_kaizen-manager_kaizens`) ||
        localStorage.getItem('aptis_kaizen_ideas');

      setStats({
        totalTasks: savedTasks ? JSON.parse(savedTasks).length : 0,
        totalEmployees: savedEmployees ? JSON.parse(savedEmployees).length : 0,
        totalTrainings: savedTrainings ? JSON.parse(savedTrainings).length : 0,
        totalKaizens: savedKaizens ? JSON.parse(savedKaizens).length : 0,
        isLoaded: true
      });
    } catch (e) {
      console.error(e);
      setStats(prev => ({ ...prev, isLoaded: true }));
    }
  }, [currentTenant?.id]);

  const hasAnyData =
    stats.totalTasks > 0 ||
    stats.totalEmployees > 0 ||
    stats.totalTrainings > 0 ||
    stats.totalKaizens > 0;

  // The Aptis Score calculation (Conceito de Ouro)
  const aptisScore = hasAnyData ? 95 : 100;
  const aptisCompliance = hasAnyData ? 98 : 100; // Aptidão Legal (NRs e POPs)
  const aptisSkills = hasAnyData ? 92 : 100; // Aptidão Técnica (ILUO)
  const aptisRoutine = hasAnyData ? 95 : 100; // Aptidão de Rotina (Kamishibai & Handover)

  // Configuração das abas do Seletor Meniscus (Inspirado no Vídeo 2 - Meniscus)
  const meniscusTabs: Array<{
    id: SuiteFilterTab;
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    glowColor: string;
    beadGradient: string;
    textColor: string;
    matchIds: string[];
  }> = [
    {
      id: 'all',
      label: 'Todos os Módulos',
      subtitle: 'Visão integrada de toda a suíte contratada',
      icon: Globe,
      glowColor: 'rgba(34, 211, 238, 0.55)',
      beadGradient: 'linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)',
      textColor: 'text-cyan-300',
      matchIds: []
    },
    {
      id: 'operations',
      label: 'Rotina & Operação',
      subtitle: 'Kamishibai, Passagem de Turno, Kaizen e Manutenção',
      icon: Cpu,
      glowColor: 'rgba(59, 130, 246, 0.58)',
      beadGradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      textColor: 'text-blue-300',
      matchIds: ['manager-tasks', 'kaizen-manager', 'service-pro']
    },
    {
      id: 'leadership',
      label: 'Liderança & Pessoas',
      subtitle: 'Reuniões 1:1, Feedback, PDI 70-20-10 e Sucessão',
      icon: Users,
      glowColor: 'rgba(168, 85, 247, 0.58)',
      beadGradient: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)',
      textColor: 'text-purple-300',
      matchIds: ['one-on-one', 'pdi-manager', 'performance-evaluation']
    },
    {
      id: 'compliance',
      label: 'Aptidão & Qualidade',
      subtitle: 'Matriz ILUO de Polivalência e NRs/POPs de Segurança',
      icon: ShieldCheck,
      glowColor: 'rgba(16, 185, 129, 0.58)',
      beadGradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
      textColor: 'text-emerald-300',
      matchIds: ['skills-matrix', 'training-matrix']
    }
  ];

  const currentMeniscus =
    meniscusTabs.find(t => t.id === activeSuiteTab) || meniscusTabs[0];

  const filteredActiveTools =
    activeSuiteTab === 'all'
      ? activeTools
      : activeTools.filter(tool => currentMeniscus.matchIds.includes(tool.id));

  // Cálculo do arco SVG semicircular para o Gauge do Aptis Score (Estilo Vídeo 1 Cimel & Vídeo 4 Halvo)
  const arcRadius = 58;
  const arcCircumference = Math.PI * arcRadius;
  const arcStrokeDashoffset =
    arcCircumference - (aptisScore / 100) * arcCircumference;

  return (
    <div className="space-y-7 w-full relative">
      {/* =====================================================================
          1. COCKPIT HERO & ESTRUTURA DA PLANTA EM VIDRO ESPECULAR (Cimel + Halvo)
         ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Card Principal (8 Colunas): Centro de Comando da Planta */}
        <div
          className={`xl:col-span-8 rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-500 ${
            tintedGlass
              ? 'aptis-glass-dark text-white'
              : 'aptis-glass-light text-slate-900'
          }`}
        >
          {/* Reflexo de Luz Ambiente Interna (Estilo Cimel Vídeo 1) */}
          <div
            className="absolute -right-12 -top-16 w-80 h-80 rounded-full pointer-events-none opacity-35 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(34, 211, 238, 0.55) 0%, rgba(37, 99, 235, 0.2) 60%, transparent 75%)'
            }}
          />
          <div
            className="absolute left-1/4 -bottom-20 w-72 h-56 rounded-full pointer-events-none opacity-25 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, transparent 70%)'
            }}
          />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    tintedGlass
                      ? 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                      : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Planta: {currentTenant.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    tintedGlass
                      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  Aptis Suite • Plano {currentTenant.plan.toUpperCase()}
                </span>
              </div>

              <h1
                className={`text-2xl sm:text-3xl font-black tracking-tight mb-2 ${
                  tintedGlass ? 'text-white' : 'text-slate-900'
                }`}
              >
                Centro de Comando da Planta
              </h1>
              <p
                className={`text-sm sm:text-base max-w-2xl leading-relaxed ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Olá, <strong>{currentUser.name}</strong>. Monitore a prontidão operacional em tempo real: operadores capacitados, conformidade regulatória sem risco de interdição e passagens de turno sem falhas.
              </p>
            </div>

            {/* Mini KPIs em Sub-cápsulas de Vidro (Estilo Ardena Vídeo 3 & Cimel Vídeo 1) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div
                className={`p-3.5 rounded-2xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-white/80 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <span
                  className={`text-[11px] font-medium block ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Módulos Aptis Ativos
                </span>
                <span
                  className={`text-xl sm:text-2xl font-black mt-1 block font-mono ${
                    tintedGlass ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {activeTools.length}{' '}
                  <span className="text-xs font-normal opacity-60">de {allTools.length}</span>
                </span>
              </div>

              <div
                className={`p-3.5 rounded-2xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-white/80 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <span
                  className={`text-[11px] font-medium block ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Segmento Fabril
                </span>
                <span
                  className={`text-sm sm:text-base font-bold mt-1.5 block truncate ${
                    tintedGlass ? 'text-slate-100' : 'text-slate-800'
                  }`}
                >
                  {currentTenant.segment || 'Manufatura / Usinagem'}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-2xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-white/80 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <span
                  className={`text-[11px] font-medium block ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Efetivo Operacional
                </span>
                <span
                  className={`text-xl sm:text-2xl font-black mt-1 block font-mono ${
                    tintedGlass ? 'text-cyan-300' : 'text-cyan-700'
                  }`}
                >
                  {stats.totalEmployees > 0
                    ? stats.totalEmployees
                    : currentTenant.employeeCount || 120}{' '}
                  <span className="text-xs font-normal opacity-75">op.</span>
                </span>
              </div>

              <div
                className={`p-3.5 rounded-2xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-white/80 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <span
                  className={`text-[11px] font-medium block ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Status de Prontidão
                </span>
                <span
                  className={`text-sm font-bold mt-2 flex items-center gap-1.5 ${
                    tintedGlass ? 'text-emerald-300' : 'text-emerald-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                  Sempre Apta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Lateral (4 Colunas): Gauge Semicircular Luminoso "The Aptis Score" (Inspirado no Card "November goal 78%" do Vídeo 1 Cimel) */}
        <div
          className={`xl:col-span-4 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
            tintedGlass
              ? 'aptis-glass-dark text-white'
              : 'aptis-glass-light text-slate-900'
          }`}
        >
          {/* Halo Quente Âmbar/Ciano atrás do Gauge (Idêntico ao Vídeo 1 - Cimel) */}
          <div
            className="absolute -top-10 -right-10 w-56 h-56 rounded-full pointer-events-none opacity-40 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(245, 158, 11, 0.65) 0%, rgba(6, 182, 212, 0.3) 60%, transparent 75%)'
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                Aptis Index
              </span>
              <h2
                className={`text-base font-black mt-1.5 flex items-center gap-1.5 ${
                  tintedGlass ? 'text-white' : 'text-slate-900'
                }`}
              >
                <Activity className="w-4 h-4 text-amber-400" />
                The Aptis Score
              </h2>
            </div>

            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                tintedGlass
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              Planta Apta
            </span>
          </div>

          {/* Semicircular Luminous Gauge + Métricas Laterais (Layout Cimel Vídeo 1) */}
          <div className="relative z-10 my-3 flex items-center justify-between gap-4">
            <div className="relative w-36 h-24 flex items-end justify-center shrink-0">
              <svg className="w-36 h-24 overflow-visible" viewBox="0 0 140 80">
                <defs>
                  <linearGradient id="aptisGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="55%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <filter id="aptisGaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Trilho de Fundo em Vidro */}
                <path
                  d="M 12 70 A 58 58 0 0 1 128 70"
                  fill="none"
                  stroke={tintedGlass ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Arco Luminoso de Progresso */}
                <path
                  d="M 12 70 A 58 58 0 0 1 128 70"
                  fill="none"
                  stroke="url(#aptisGaugeGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={arcCircumference}
                  strokeDashoffset={arcStrokeDashoffset}
                  filter="url(#aptisGaugeGlow)"
                />
              </svg>
              <div className="absolute bottom-0 text-center">
                <div
                  className={`text-2xl font-black font-mono leading-none ${
                    tintedGlass ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {aptisScore}%
                </div>
                <div
                  className={`text-[10px] font-semibold mt-0.5 ${
                    tintedGlass ? 'text-amber-300/90' : 'text-amber-700'
                  }`}
                >
                  Índice Global
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                  Aptidão Legal
                </span>
                <span className="font-mono font-bold text-amber-400">{aptisCompliance}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                  Polivalência ILUO
                </span>
                <span className="font-mono font-bold text-emerald-400">{aptisSkills}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                  Rituais de Turno
                </span>
                <span className="font-mono font-bold text-cyan-400">{aptisRoutine}%</span>
              </div>
            </div>
          </div>

          {/* Rodapé do Card: Áreas & Setores Fabris */}
          <div
            className={`relative z-10 pt-3 border-t flex items-center justify-between gap-2 ${
              tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
            }`}
          >
            <div className="text-xs">
              <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                Estrutura Fabril:{' '}
              </span>
              <strong className={tintedGlass ? 'text-cyan-300 font-mono' : 'text-cyan-700 font-mono'}>
                {sectors.length} áreas ativas
              </strong>
            </div>

            <button
              onClick={() => setIsSectorsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-white"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.85) 0%, rgba(37, 99, 235, 0.85) 100%)',
                border: '1px solid rgba(165, 243, 252, 0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 16px -3px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Layers className="w-3.5 h-3.5" />
              Gerenciar Áreas
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. OS 3 PILARES DO APTIS SCORE COM BARRAS LUMINOSAS (Estilo Halvo Vídeo 4)
         ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pilar 1: Aptidão Legal */}
        <Link
          href="/dashboard/tools/training-matrix"
          className={`p-5 rounded-3xl block group relative overflow-hidden ${
            tintedGlass
              ? 'aptis-glass-dark aptis-glass-dark-interactive text-white'
              : 'aptis-glass-light hover:shadow-lg transition-all text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-base border border-amber-400/35"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.1) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 18px rgba(245, 158, 11, 0.2)'
                }}
              >
                ⚖️
              </div>
              <div>
                <h3 className="text-sm font-bold group-hover:text-amber-300 transition-colors">
                  1. Aptidão Legal
                </h3>
                <span
                  className={`text-[11px] ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Aptis Compliance
                </span>
              </div>
            </div>
            <span
              className={`text-xl font-black font-mono ${
                tintedGlass ? 'text-amber-300' : 'text-amber-700'
              }`}
            >
              {aptisCompliance}%
            </span>
          </div>

          <p
            className={`text-xs leading-relaxed mb-4 ${
              tintedGlass ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Operadores com <strong>NRs e POPs vigentes</strong>. Zero bloqueios operacionais preventivos na linha de produção.
          </p>

          {/* Barra Luminosa com Glow (Halvo Vídeo 4) */}
          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              tintedGlass ? 'bg-white/[0.08]' : 'bg-slate-200'
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${aptisCompliance}%`,
                background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.7)'
              }}
            />
          </div>

          <div
            className={`flex items-center justify-between text-[11px] mt-3 font-medium ${
              tintedGlass ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>Auditoria MTE / ISO</span>
            <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              Verificar <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Pilar 2: Aptidão Técnica */}
        <Link
          href="/dashboard/tools/skills-matrix"
          className={`p-5 rounded-3xl block group relative overflow-hidden ${
            tintedGlass
              ? 'aptis-glass-dark aptis-glass-dark-interactive text-white'
              : 'aptis-glass-light hover:shadow-lg transition-all text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-base border border-emerald-400/35"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 18px rgba(16, 185, 129, 0.2)'
                }}
              >
                🎯
              </div>
              <div>
                <h3 className="text-sm font-bold group-hover:text-emerald-300 transition-colors">
                  2. Aptidão Técnica
                </h3>
                <span
                  className={`text-[11px] ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Aptis Skills (ILUO)
                </span>
              </div>
            </div>
            <span
              className={`text-xl font-black font-mono ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-700'
              }`}
            >
              {aptisSkills}%
            </span>
          </div>

          <p
            className={`text-xs leading-relaxed mb-4 ${
              tintedGlass ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Postos críticos cobertos por operadores autônomos nível{' '}
            <strong>&apos;U&apos; ou tutores &apos;O&apos; (ILUO)</strong>.
          </p>

          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              tintedGlass ? 'bg-white/[0.08]' : 'bg-slate-200'
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${aptisSkills}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.7)'
              }}
            />
          </div>

          <div
            className={`flex items-center justify-between text-[11px] mt-3 font-medium ${
              tintedGlass ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>Flexibilidade de Linha</span>
            <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              Verificar <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Pilar 3: Aptidão de Rotina */}
        <Link
          href="/dashboard/tools/manager-tasks"
          className={`p-5 rounded-3xl block group relative overflow-hidden ${
            tintedGlass
              ? 'aptis-glass-dark aptis-glass-dark-interactive text-white'
              : 'aptis-glass-light hover:shadow-lg transition-all text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-base border border-cyan-400/35"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 18px rgba(6, 182, 212, 0.2)'
                }}
              >
                📋
              </div>
              <div>
                <h3 className="text-sm font-bold group-hover:text-cyan-300 transition-colors">
                  3. Aptidão de Rotina
                </h3>
                <span
                  className={`text-[11px] ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Aptis Routine
                </span>
              </div>
            </div>
            <span
              className={`text-xl font-black font-mono ${
                tintedGlass ? 'text-cyan-300' : 'text-cyan-700'
              }`}
            >
              {aptisRoutine}%
            </span>
          </div>

          <p
            className={`text-xs leading-relaxed mb-4 ${
              tintedGlass ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Adesão aos <strong>rituais Kamishibai de turno</strong> e passagens de bastão formalizadas sem ruído de comunicação.
          </p>

          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              tintedGlass ? 'bg-white/[0.08]' : 'bg-slate-200'
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${aptisRoutine}%`,
                background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
                boxShadow: '0 0 12px rgba(6, 182, 212, 0.7)'
              }}
            />
          </div>

          <div
            className={`flex items-center justify-between text-[11px] mt-3 font-medium ${
              tintedGlass ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>Governança do Líder</span>
            <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              Verificar <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* =====================================================================
          3. BARRA DE NAVEGAÇÃO MENISCUS LIQUID BEAD & SUÍTE APTIS (Vídeo 2 - Meniscus)
         ===================================================================== */}
      <section className="space-y-5 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2
                className={`text-lg sm:text-xl font-black tracking-tight ${
                  tintedGlass ? 'text-white' : 'text-slate-900'
                }`}
              >
                Suíte Aptis Operacional
              </h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {activeTools.length} ativos
              </span>
            </div>
            <p
              className={`text-xs mt-1 ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {currentMeniscus.subtitle}
            </p>
          </div>

          {/* CÁPSULA DE VIDRO MENISCUS COM ESFERA LUMINOSA E REFRAÇÃO CROMÁTICA (Vídeo 2 - Meniscus) */}
          <div className="relative inline-flex self-start lg:self-auto">
            {/* Aura de Menisco Projetada Abaixo da Cápsula (Idêntico ao Vídeo 2) */}
            <div
              className="absolute -inset-2 rounded-full blur-2xl opacity-45 pointer-events-none transition-all duration-500"
              style={{
                background: `radial-gradient(circle, ${currentMeniscus.glowColor} 0%, transparent 70%)`
              }}
            />

            <div className="aptis-meniscus-track rounded-full p-1.5 flex items-center gap-1 relative z-10 overflow-x-auto max-w-full">
              {meniscusTabs.map(tab => {
                const Icon = tab.icon;
                const isSelected = activeSuiteTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSuiteTab(tab.id)}
                    className={`relative px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-500 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'text-white scale-[1.03]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    style={
                      isSelected
                        ? {
                            background: tab.beadGradient,
                            boxShadow: `0 0 22px ${tab.glowColor}, inset 0 1.5px 1px rgba(255,255,255,0.65)`
                          }
                        : undefined
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* GRID DE MÓDULOS ATIVOS EM VIDRO ESPECULAR (Estilo Cimel Vídeo 1 & Ardena Vídeo 3) */}
        {filteredActiveTools.length === 0 ? (
          <div
            className={`p-8 rounded-3xl text-center ${
              tintedGlass ? 'aptis-glass-dark text-slate-300' : 'aptis-glass-light text-slate-600'
            }`}
          >
            <p className="text-sm mb-4">
              Nenhum módulo ativo nesta categoria para esta unidade.
            </p>
            <button
              type="button"
              onClick={() => setActiveSuiteTab('all')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              Mostrar Todos os Módulos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredActiveTools.map(tool => (
              <div
                key={tool.id}
                className={`rounded-3xl p-6 flex flex-col justify-between group relative overflow-hidden ${
                  tintedGlass
                    ? 'aptis-glass-dark aptis-glass-dark-interactive text-white'
                    : 'aptis-glass-light hover:shadow-lg transition-all text-slate-900'
                }`}
              >
                {/* Brilho suave no canto superior direito do Card */}
                <div
                  className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 group-hover:opacity-40 blur-2xl pointer-events-none transition-opacity duration-500"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(56, 189, 248, 0.65) 0%, transparent 70%)'
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                          tintedGlass
                            ? 'aptis-glass-subcard text-cyan-300 border-white/20'
                            : `${tool.colorTheme.lightBg} border ${tool.colorTheme.border} ${tool.colorTheme.text}`
                        }`}
                      >
                        <ToolIcon name={tool.iconName} className="w-6 h-6" />
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            tintedGlass ? 'text-cyan-300/80' : 'text-slate-400'
                          }`}
                        >
                          {tool.category}
                        </span>
                        <h3
                          className={`text-base sm:text-lg font-black transition-colors ${
                            tintedGlass
                              ? 'text-white group-hover:text-cyan-300'
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                        >
                          {tool.name}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        tintedGlass
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Ativo
                    </span>
                  </div>

                  <p
                    className={`text-xs leading-relaxed line-clamp-2 mb-4 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {tool.shortDescription}
                  </p>

                  {/* Sub-card em Vidro Aninhado com Funcionalidades (Estilo Ardena Vídeo 3) */}
                  <div
                    className={`space-y-1.5 mb-5 p-3 rounded-2xl ${
                      tintedGlass
                        ? 'aptis-glass-subcard'
                        : 'bg-slate-50/90 border border-slate-200/70'
                    }`}
                  >
                    {tool.keyFeatures.slice(0, 2).map((feat, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-[11px] ${
                          tintedGlass ? 'text-slate-200' : 'text-slate-600'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={tool.route}
                  className="relative z-10 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-2xl transition-all text-white"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(37, 99, 235, 0.85) 0%, rgba(6, 182, 212, 0.85) 100%)',
                    border: '1px solid rgba(165, 243, 252, 0.35)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.45)'
                  }}
                >
                  Acessar {tool.name}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================================
          4. EXPANDIR COM NOVOS MÓDULOS APTIS (SE HOUVER MÓDULOS BLOQUEADOS)
         ===================================================================== */}
      {lockedTools.length > 0 && (
        <section
          className={`space-y-4 pt-6 border-t ${
            tintedGlass ? 'border-white/[0.08]' : 'border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2
                className={`text-lg font-bold flex items-center gap-2 ${
                  tintedGlass ? 'text-white' : 'text-slate-900'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                Expandir com Novos Módulos Aptis
              </h2>
              <p
                className={`text-xs ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Contrate módulos especializados para elevar o Aptis Score e a maturidade de gestão da sua planta.
              </p>
            </div>
            <Link
              href="/dashboard/marketplace"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              Ver Todos os Módulos Aptis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedTools.map(tool => (
              <div
                key={tool.id}
                className={`rounded-3xl p-5 flex flex-col justify-between transition-all ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-slate-300 hover:border-white/25'
                    : 'bg-slate-50/80 border border-dashed border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tintedGlass
                            ? 'bg-white/[0.06] text-slate-400 border border-white/[0.1]'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <ToolIcon name={tool.iconName} className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {tool.category}
                        </span>
                        <h3
                          className={`text-sm font-bold ${
                            tintedGlass ? 'text-white' : 'text-slate-800'
                          }`}
                        >
                          {tool.name}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        tintedGlass
                          ? 'bg-white/[0.06] text-slate-400 border border-white/[0.1]'
                          : 'text-slate-500 bg-slate-200/80'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      Disponível
                    </span>
                  </div>

                  <p
                    className={`text-xs mb-4 ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={tool.route}
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                      tintedGlass
                        ? 'bg-white/[0.07] hover:bg-white/[0.14] text-white border border-white/[0.12]'
                        : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-700'
                    }`}
                  >
                    Conhecer Módulo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal Central de Áreas & Setores Fabris */}
      <PlantSectorsManagerModal
        isOpen={isSectorsModalOpen}
        onClose={() => setIsSectorsModalOpen(false)}
        tenantName={currentTenant.name}
      />
    </div>
  );
}
