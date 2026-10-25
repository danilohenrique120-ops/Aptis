'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Aptis3DExperience } from '@/components/public/aptis-3d-experience';
import { AptisLogo } from '@/components/ui/aptis-logo';
import { useTenant } from '@/context/tenant-context';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { PerformanceLead, INITIAL_DEMO_LEADS } from '@/modules/performance-pro';
import {
  Flame,
  ArrowRight,
  Target,
  Trophy,
  ClipboardCheck,
  Users,
  Sparkles,
  CheckCircle2,
  Send,
  DollarSign,
  Check,
  Smartphone
} from 'lucide-react';

// ============================================================================
// COMPONENTE DE CARD COM ANIMAÇÃO 3D INTERATIVA AO PASSAR O MOUSE (TILT + GLARE)
// ============================================================================
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  laserGradient?: string;
}

function TiltCard({
  children,
  className = '',
  glowColor = 'rgba(249, 115, 22, 0.18)',
  laserGradient = 'from-transparent via-orange-400/80 to-amber-400/70'
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    active: false
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    setTilt({
      rotateX: -normY * 12,
      rotateY: normX * 14,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      active: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, active: false });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tilt.active
          ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.025, 1.025, 1.025)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: tilt.active
          ? 'transform 75ms ease-out'
          : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)'
      }}
      className={`relative rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 hover:border-orange-400/60 shadow-2xl shadow-black/70 overflow-hidden group ${className}`}
    >
      {/* Luz Dinâmica (Spotlight) que acompanha o cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(360px circle at ${tilt.glareX}% ${tilt.glareY}%, ${glowColor}, transparent 70%)`
        }}
      />

      {/* Linha de Laser Superior */}
      <div
        className={`h-[2px] w-full bg-gradient-to-r ${laserGradient} opacity-50 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export default function PerformanceLandingPage() {
  const { submitLead } = useTenant();
  const [, setStoredLeads] = useTenantStorage<PerformanceLead[]>(
    'performance-pro',
    'leads',
    INITIAL_DEMO_LEADS
  );

  // Scroll & 3D Parallax
  const [scrollProgress, setScrollProgress] = useState(0);
  const [logoTilt, setLogoTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      setScrollProgress(Math.min(Math.max(scrollTop / docHeight, 0), 1));
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setLogoTilt({ rx: -ny * 16, ry: nx * 18 });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  // ============================================================================
  // ESTADOS DO QUIZ INTERATIVO DE PRONTIDÃO FÍSICA (LINK DA BIO)
  // ============================================================================
  const [quizName, setQuizName] = useState('');
  const [quizPhone, setQuizPhone] = useState('');
  const [quizGoal, setQuizGoal] = useState('Hipertrofia & Estética');
  const [quizConsistency, setQuizConsistency] = useState(55);
  const [quizTraining, setQuizTraining] = useState(70);
  const [quizNutrition, setQuizNutrition] = useState(45);
  const [quizRecovery, setQuizRecovery] = useState(65);
  const [quizSubmittedLead, setQuizSubmittedLead] = useState<PerformanceLead | null>(null);

  const liveScore = Math.round(
    (quizConsistency + quizTraining + quizNutrition + quizRecovery) / 4
  );

  const getMainBottleneck = () => {
    const pillars = [
      {
        val: quizConsistency,
        label: 'Falta de constância semanal e quebras frequentes no fim de semana'
      },
      {
        val: quizTraining,
        label: 'Treino sem progressão estruturada de carga e controle de volume'
      },
      {
        val: quizNutrition,
        label: 'Baixa adesão nutricional e descontrole de macronutrientes na rotina'
      },
      {
        val: quizRecovery,
        label: 'Sono irregular e baixa recuperação muscular limitando a resposta estética'
      }
    ].sort((a, b) => a.val - b.val);
    return pillars[0].label;
  };

  const handleCompleteDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizName.trim() || !quizPhone.trim()) return;

    const cleanPhone = quizPhone.replace(/\D/g, '');
    const bottleneck = getMainBottleneck();

    const newLead: PerformanceLead = {
      id: `lead-bio-${Date.now()}`,
      name: quizName.trim(),
      phone: cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`,
      goal: quizGoal,
      readinessScore: liveScore,
      pillarConsistency: quizConsistency,
      pillarTraining: quizTraining,
      pillarNutrition: quizNutrition,
      pillarRecovery: quizRecovery,
      mainBottleneck: bottleneck,
      temperature: liveScore >= 60 ? 'quente' : 'morno',
      status: 'novo',
      createdAt: new Date().toISOString().split('T')[0]
    };

    // 1. Salva direto na fila de Leads do Módulo Aptis Performance Pro (Local + Supabase Cloud)
    setStoredLeads(prev => [newLead, ...(Array.isArray(prev) ? prev : [])]);

    // 2. Registra também no CRM central de Leads da plataforma
    try {
      await submitLead({
        companyName: `Lead Bio Fitness (${quizGoal})`,
        contactName: newLead.name,
        email: 'lead.bio@performance.aptis',
        phone: newLead.phone,
        teamSize: `Score: ${liveScore}%`,
        toolId: 'performance-pro',
        toolName: 'Aptis Performance Pro (Quiz da Bio)',
        notes: `Score de Prontidão: ${liveScore}% | Gargalo: ${bottleneck}`
      });
    } catch {
      // Ignora erro caso offline
    }

    setQuizSubmittedLead(newLead);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-orange-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* EXPERIÊNCIA 3D WEBGL EM TEMPO REAL COM PRISMA APTIS */}
      <Aptis3DExperience scrollProgress={scrollProgress} />

      {/* HEADER DEDICADO APTIS PERFORMANCE PRO COM LOGO OFICIAL */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/performance" className="flex items-center gap-3 group">
              <AptisLogo size="sm" showTagline={false} glow={true} />
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/40 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-black tracking-wider text-orange-400 text-xs uppercase">
                  PERFORMANCE PRO
                </span>
              </div>
            </Link>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 border-l border-slate-800 pl-4">
              Consultoria Fitness, Retenção & Escala High-Ticket
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="#diagnostico"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Target className="w-4 h-4 text-orange-400" />
              Quiz da Bio
            </a>
            <Link
              href="/performance/aluno"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold transition-all"
            >
              <Smartphone className="w-4 h-4 text-orange-400" />
              App do Aluno
            </Link>
            <Link
              href="/performance/painel"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all"
            >
              Painel do Treinador
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* ====================================================================
            HERO SECTION LIMPA: PALCO SUPERIOR 3D DEDICADO AO LOGOTIPO APTIS
            + BLOCO DE CONVERSÃO EQUILIBRADO E QUADRANTES INTERATIVOS 3D
        ==================================================================== */}
        <section className="relative min-h-[92vh] flex flex-col items-center justify-between pt-4 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/70 overflow-hidden">
          {/* PALCO SUPERIOR 3D (100% LIMPO PARA DESTACAR O PRISMA E LOGO APTIS 3D) */}
          <div className="relative w-full h-56 sm:h-64 flex flex-col items-center justify-end pointer-events-none select-none">
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{
                transform: `translate3d(${logoTilt.ry * -0.7}px, ${logoTilt.rx * 0.7}px, 0)`,
                transition: 'transform 120ms ease-out'
              }}
            >
              <span className="text-[19vw] sm:text-[16vw] font-black tracking-[0.22em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-orange-400/20 via-amber-500/10 to-transparent drop-shadow-[0_0_60px_rgba(249,115,22,0.16)] leading-none font-brand pl-[0.22em]">
                APTIS
              </span>
            </div>
          </div>

          {/* BLOCO COMERCIAL CENTRAL (LIMPO, DIRETO E SEM POLUIÇÃO SOBRE O 3D) */}
          <div className="relative max-w-4xl mx-auto text-center space-y-5 z-10 px-4 py-6 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.9)_28%,rgba(2,6,23,0.5)_72%,transparent_100%)]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 border border-orange-500/40 text-orange-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xl shadow-lg shadow-orange-500/10">
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>Aptis Performance Pro • Gestão & Escala para Consultorias Fitness</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
                Saia do caos do WhatsApp.{' '}
                <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
                  Escale sua Consultoria com Alta Performance.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                A plataforma unificada que transforma seguidores em alunos qualificados via{' '}
                <strong className="text-orange-300">Score de Prontidão Física</strong>, blinda sua retenção com{' '}
                <strong className="text-amber-300">Check-ins 1:1 Auditados</strong> e viraliza resultados nos Stories.
              </p>
            </div>

            {/* CTAs Principais */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/performance/painel"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 text-sm sm:text-base font-black uppercase tracking-wider rounded-xl shadow-[0_0_35px_rgba(249,115,22,0.35)] transition-all hover:scale-105 flex items-center justify-center gap-2.5"
              >
                <Flame className="w-5 h-5" />
                Abrir Painel Aptis Performance
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#diagnostico"
                className="w-full sm:w-auto px-8 py-4 bg-slate-950/90 hover:bg-slate-900 text-white border border-orange-500/40 hover:border-orange-400 text-sm sm:text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-xl shadow-lg"
              >
                <Target className="w-5 h-5 text-orange-400" />
                Simular Quiz da Bio
              </a>
            </div>
          </div>

          {/* 4 QUADRANTES COM ANIMAÇÃO 3D AO PASSAR O MOUSE */}
          <div className="w-full max-w-6xl mx-auto pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left relative z-10">
            <TiltCard
              glowColor="rgba(249, 115, 22, 0.22)"
              laserGradient="from-transparent via-orange-400 to-amber-500"
            >
              <div className="p-5 space-y-2">
                <div className="text-xs font-black text-orange-400 uppercase flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-400" />
                  </div>
                  1. Aquisição Bio
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Diagnóstico de Score 0–100% que filtra curiosos e entrega o script comercial pronto para fechar no WhatsApp.
                </p>
              </div>
            </TiltCard>

            <TiltCard
              glowColor="rgba(245, 158, 11, 0.22)"
              laserGradient="from-transparent via-amber-400 to-orange-500"
            >
              <div className="p-5 space-y-2">
                <div className="text-xs font-black text-amber-400 uppercase flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  2. Gestão & MRR
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Carteira de alunos, evolução de peso corporal e alerta automático de renovação em até 15 dias.
                </p>
              </div>
            </TiltCard>

            <TiltCard
              glowColor="rgba(16, 185, 129, 0.22)"
              laserGradient="from-transparent via-emerald-400 to-teal-500"
            >
              <div className="p-5 space-y-2">
                <div className="text-xs font-black text-emerald-400 uppercase flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  3. Semáforo 1:1
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Check-in semanal de 60 segundos com radar Verde, Amarelo e Vermelho contra cancelamentos.
                </p>
              </div>
            </TiltCard>

            <TiltCard
              glowColor="rgba(245, 158, 11, 0.22)"
              laserGradient="from-transparent via-amber-400 to-orange-500"
            >
              <div className="p-5 space-y-2">
                <div className="text-xs font-black text-amber-400 uppercase flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  4. Stories Virais
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Patentes de disciplina (Iniciante a Elite) com Card 9:16 oficial compartilhável no Instagram.
                </p>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* ====================================================================
            SEÇÃO INTERATIVA: CALCULADORA DE SCORE DE PRONTIDÃO FÍSICA (LINK DA BIO)
        ==================================================================== */}
        <section id="diagnostico" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="bg-slate-950/90 backdrop-blur-2xl rounded-3xl border border-orange-500/40 shadow-[0_0_70px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Top Banner da Calculadora */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/40 p-6 sm:p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Experiência Real do Seguidor (Link da Bio)
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Diagnóstico Oficial: Score de Prontidão Física & Constância
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Preencha abaixo exatamente como o seguidor faz no Instagram. O resultado cai na hora dentro da aba <strong>Radar de Leads & Score</strong> do treinador!
                </p>
              </div>
              <div className="bg-slate-950 px-5 py-4 rounded-2xl border border-orange-500/40 text-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  Seu Score em Tempo Real
                </span>
                <span
                  className={`text-4xl font-black ${
                    liveScore >= 75
                      ? 'text-emerald-400'
                      : liveScore >= 55
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {liveScore}%
                </span>
              </div>
            </div>

            {quizSubmittedLead ? (
              /* TELA PÓS-DIAGNÓSTICO (DESBLOQUEADA) */
              <div className="p-8 sm:p-10 space-y-6">
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Diagnóstico Registrado com Sucesso no Aptis Performance Pro!
                      </span>
                      <h3 className="text-xl font-black text-white">
                        {quizSubmittedLead.name}, seu Score de Prontidão é de {quizSubmittedLead.readinessScore}%
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Objetivo: <strong>{quizSubmittedLead.goal}</strong> • Gargalo Detectado: <strong className="text-rose-300">{quizSubmittedLead.mainBottleneck}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setQuizSubmittedLead(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer shrink-0"
                  >
                    Simular Outro Lead
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href={`https://wa.me/${quizSubmittedLead.phone}?text=${encodeURIComponent(
                      `Fala Treinador! Acabei de fazer meu Diagnóstico de Prontidão Física.\n\nMeu nome é ${quizSubmittedLead.name}\nObjetivo: ${quizSubmittedLead.goal}\nMeu Score deu: ${quizSubmittedLead.readinessScore}%\nGargalo principal: ${quizSubmittedLead.mainBottleneck}\n\nQuero saber como funciona o acompanhamento da Consultoria!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    <Send className="w-5 h-5" />
                    1. Visão do Aluno: Enviar Meu Score no WhatsApp do Treinador
                  </a>

                  <Link
                    href="/performance/painel"
                    className="p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 transition-all"
                  >
                    <Flame className="w-5 h-5" />
                    2. Visão do Treinador: Ver {quizSubmittedLead.name} no Painel Agora
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* FORMULÁRIO DO QUIZ INTERATIVO */
              <form onSubmit={handleCompleteDiagnostic} className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coluna Esquerda: Perguntas de Hábitos e Rotina */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
                      1. Qual seu objetivo principal nos próximos 90 dias?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        'Emagrecimento & Definição',
                        'Hipertrofia & Estética',
                        'Recomposição Corporal',
                        'Alta Performance & Força'
                      ].map(goal => (
                        <button
                          type="button"
                          key={goal}
                          onClick={() => setQuizGoal(goal)}
                          className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                            quizGoal === goal
                              ? 'bg-orange-500/20 border-orange-500 text-white shadow-sm'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{goal}</span>
                          {quizGoal === goal && <Check className="w-4 h-4 text-orange-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders dos 4 Pilares */}
                  <div className="space-y-4 bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-200">2. Constância Semanal (Treinos sem falhar no mês)</span>
                        <span className="text-orange-400 font-mono">{quizConsistency}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={quizConsistency}
                        onChange={e => setQuizConsistency(Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-200">3. Intensidade & Técnica de Treino (Progressão de carga)</span>
                        <span className="text-amber-400 font-mono">{quizTraining}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={quizTraining}
                        onChange={e => setQuizTraining(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-200">4. Adesão à Dieta, Proteína & Hidratação Diária</span>
                        <span className="text-orange-400 font-mono">{quizNutrition}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={quizNutrition}
                        onChange={e => setQuizNutrition(Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-200">5. Qualidade do Sono & Recuperação Muscular</span>
                        <span className="text-amber-400 font-mono">{quizRecovery}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={quizRecovery}
                        onChange={e => setQuizRecovery(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Preview do Gargalo + Captura de Lead */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Diagnóstico Preliminar
                      </span>
                      <span className="text-xs font-bold text-orange-400">
                        Aptis Performance Score
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                        Gargalo Principal Detectado:
                      </span>
                      <p className="text-xs text-slate-200 font-medium mt-1 leading-relaxed">
                        {getMainBottleneck()}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Seu Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={quizName}
                          onChange={e => setQuizName(e.target.value)}
                          placeholder="Ex: Lucas Mendes"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Seu WhatsApp com DDD *
                        </label>
                        <input
                          type="text"
                          required
                          value={quizPhone}
                          onChange={e => setQuizPhone(e.target.value)}
                          placeholder="Ex: 11999998888"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    Gerar Meu Relatório & Enviar ao Treinador
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ====================================================================
            SEÇÃO DE PILARES COM QUADRANTES 3D INTERATIVOS
        ==================================================================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 p-8 sm:p-12">
            <div className="max-w-3xl space-y-3 mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400 font-mono">
                Arquitetura Unificada • Tudo em Um Único Cockpit
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Os 4 Motores de Escala da sua Consultoria Fitness
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                O personal trainer e consultor online não tem tempo de abrir diversas planilhas e telas separadas. No <strong>Aptis Performance Pro</strong>, toda a jornada do aluno — da captura no Instagram até a renovação do plano — acontece em um único sistema integrado:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TiltCard
                glowColor="rgba(249, 115, 22, 0.2)"
                laserGradient="from-transparent via-orange-400 to-amber-500"
              >
                <div className="p-6 sm:p-7 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-bold border border-orange-500/30">
                    <Target className="w-4 h-4" /> Motor 1 • Qualificação & Social Selling
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Diagnóstico de Score + Script de Fechamento 1-Click
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Transforma seguidores em leads qualificados. O treinador vê exatamente qual pilar do aluno está falhando (Ex: Nutrição 40%) e dispara em 1 clique uma abordagem cirúrgica no WhatsApp para fechar o plano Trimestral ou Semestral.
                  </p>
                </div>
              </TiltCard>

              <TiltCard
                glowColor="rgba(16, 185, 129, 0.2)"
                laserGradient="from-transparent via-emerald-400 to-teal-500"
              >
                <div className="p-6 sm:p-7 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    <ClipboardCheck className="w-4 h-4" /> Motor 2 • Retenção Blindada
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Check-in Semanal 1:1 & Semáforo Anti-Churn
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Nenhum aluno cancela da noite para o dia; ele dá sinais semanas antes. O sistema calcula automaticamente quem está <strong className="text-emerald-400">Blindado (Verde)</strong>, <strong className="text-amber-400">Oscilando (Amarelo)</strong> ou em <strong className="text-rose-400">Risco de Cancelamento (Vermelho)</strong> para você agir antes de perder a renovação.
                  </p>
                </div>
              </TiltCard>

              <TiltCard
                glowColor="rgba(249, 115, 22, 0.2)"
                laserGradient="from-transparent via-orange-400 to-amber-500"
              >
                <div className="p-6 sm:p-7 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-bold border border-orange-500/30">
                    <DollarSign className="w-4 h-4" /> Motor 3 • Previsibilidade de Caixa
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Radar de Renovações (≤ 15 dias) & Evolução Corporal
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Painel financeiro de MRR (Receita Recorrente Mensal), controle de peso inicial vs. atual vs. meta e script automático de renovação valorizando os resultados já conquistados pelo aluno.
                  </p>
                </div>
              </TiltCard>

              <TiltCard
                glowColor="rgba(245, 158, 11, 0.2)"
                laserGradient="from-transparent via-amber-400 to-orange-500"
              >
                <div className="p-6 sm:p-7 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/30">
                    <Trophy className="w-4 h-4" /> Motor 4 • Prova Social Orgânica
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Matriz de Patentes + Card 9:16 para Instagram Stories
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Classifica a disciplina do time em 4 Patentes (<strong>Iniciante, Constante, Alta Intensidade, Elite</strong>). Ao subir de nível, o treinador gera um Card Oficial 9:16 para o aluno postar nos Stories marcando a consultoria.
                  </p>
                </div>
              </TiltCard>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">
                  Pronto para operar no painel do treinador?
                </h4>
                <p className="text-xs text-slate-400">
                  Acesse agora o cockpit completo já pré-carregado com dados realistas de demonstração.
                </p>
              </div>
              <Link
                href="/performance/painel"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
              >
                Ir para o Aptis Performance Pro
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
