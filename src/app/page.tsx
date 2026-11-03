'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { ToolCard } from '@/components/public/tool-card';
import { LeadModal } from '@/components/public/lead-modal';
import { Aptis3DExperience } from '@/components/public/aptis-3d-experience';
import { getAllTools, TOOL_CATEGORIES } from '@/config/tools-registry';
import { ToolDefinition } from '@/types';
import { 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  GraduationCap, 
  CheckSquare, 
  Grid, 
  Sparkles,
  Activity,
  Award,
  FileCheck2,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedToolForLead, setSelectedToolForLead] = useState<ToolDefinition | null>(null);
  const [selectedPlanForLead, setSelectedPlanForLead] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Scroll & 3D Parallax State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [logoTilt, setLogoTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      setScrollProgress(progress);
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

  const allTools = getAllTools().filter(t => t.id !== 'performance-pro');

  const filteredTools = allTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                          tool.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
                          tool.keyFeatures.some(f => f.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenDemoModal = (tool?: ToolDefinition, plan?: string) => {
    setSelectedToolForLead(tool || null);
    setSelectedPlanForLead(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* EXPERIÊNCIA 3D WEBGL EM TEMPO REAL (INSPIRADA NO REEL ALCHE) */}
      <Aptis3DExperience scrollProgress={scrollProgress} />

      {/* Header Público */}
      <PublicHeader />

      <main className="flex-1 relative z-10">
        {/* HERO SECTION MONUMENTAL 3D (OPÇÃO 1: PALCO 3D LIMPO NO TOPO + BLOCO DE VENDAS ABAIXO) */}
        <section className="relative min-h-[92vh] flex flex-col items-center justify-between text-white pt-6 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/60">
          {/* PALCO SUPERIOR 3D: Espaço dedicado e 100% limpo para o Logotipo 3D Aptis + Portal Circular */}
          <div className="relative w-full h-56 sm:h-64 flex flex-col items-center justify-end pointer-events-none select-none">
            {/* Letreiro Monumental "APTIS" alinhado exatamente no palco do Prisma 3D (como "ALCHE" no vídeo) */}
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{
                transform: `translate3d(${logoTilt.ry * -0.7}px, ${logoTilt.rx * 0.7}px, 0)`,
                transition: 'transform 120ms ease-out',
              }}
            >
              <span className="text-[19vw] sm:text-[16vw] font-black tracking-[0.22em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-cyan-400/20 via-blue-500/10 to-transparent drop-shadow-[0_0_60px_rgba(6,182,212,0.16)] leading-none font-brand pl-[0.22em]">
                APTIS
              </span>
            </div>
          </div>

          {/* BLOCO COMERCIAL DE ALTA CONVERSÃO (100% Legível, sem colisão com o 3D) */}
          <div className="relative max-w-4xl mx-auto text-center space-y-6 z-10 px-4 py-6 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.88)_25%,rgba(2,6,23,0.45)_70%,transparent_100%)]">
            {/* Badge de Posicionamento */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-semibold backdrop-blur-xl shadow-lg shadow-cyan-500/15">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Aptis Suite • Prontidão Operacional & Governança Industrial</span>
            </div>

            {/* Headline Oficial */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight font-brand drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
                <span className="text-white tracking-wide font-extrabold">
                  Aptis:
                </span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 font-extrabold drop-shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                  A fábrica sempre apta.
                </span>
              </h1>

              <p className="text-xs sm:text-sm font-bold text-cyan-300/95 uppercase tracking-widest font-mono">
                Prontidão operacional, governança e conformidade para o chão de fábrica
              </p>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
                A plataforma que garante que todo operador, máquina e turno estejam 100% aptos a produzir com segurança, autonomia e sem paradas de linha.
              </p>
            </div>

            {/* Botões Principais com Glow */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-base font-black uppercase tracking-wider rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5"
              >
                Acessar Plataforma Aptis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#score"
                className="w-full sm:w-auto px-8 py-4 bg-slate-950/90 hover:bg-slate-900 text-slate-100 border border-cyan-500/40 hover:border-cyan-400 text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-xl shadow-lg"
              >
                <Activity className="w-5 h-5 text-cyan-400" />
                Conhecer o Aptis Score
              </a>
            </div>

            {/* Selos de Confiança Industrial */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/90 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Matriz ILUO & Polivalência
              </span>
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/90 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Compliance NRs & POPs com OCR
              </span>
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/90 backdrop-blur-md">
                <Zap className="w-4 h-4 text-amber-400" />
                Kamishibai & Passagem de Turno
              </span>
            </div>
          </div>
        </section>

        {/* SEÇÃO THE APTIS SCORE (O CONCEITO DE OURO) */}
        <section id="score" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="bg-slate-950/75 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-cyan-500/30 shadow-[0_0_70px_rgba(0,0,0,0.85)] relative overflow-hidden">
              {/* Marca d'água cinética estilo ALCHE */}
              <div className="pointer-events-none select-none absolute -top-6 right-6 text-[9rem] font-black text-cyan-500/[0.04] tracking-widest uppercase leading-none font-brand">
                SCORE
              </div>
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 relative z-10">
                <div className="space-y-3 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-500/30 font-mono">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> Métrica Proprietária da Diretoria Industrial
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    The Aptis Score (Índice de Aptidão da Planta)
                  </h2>
                  <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                    Um indicador único em tempo real que calcula se a sua fábrica possui os operadores certos, capacitados e com rituais de liderança em dia para rodar sem paradas inesperadas ou autuações.
                  </p>
                </div>

                {/* Placar Central do Aptis Score */}
                <div className="flex items-center gap-6 bg-slate-900/85 px-8 py-6 rounded-2xl border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.18)] backdrop-blur-xl">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-mono">Score Global</span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Planta Conforme
                    </span>
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-950 to-emerald-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-black text-3xl shadow-inner shadow-cyan-500/30">
                    95%
                  </div>
                </div>
              </div>

              {/* Grid dos 3 Pilares do Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Pilar 1: Aptidão Legal */}
                <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800/90 space-y-4 hover:border-cyan-400/60 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-cyan-400 font-mono">98%</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Aptidão Legal (Compliance)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Operadores com NRs e POPs vigentes, sem riscos de interdição, autuação do MTE ou reprovação em auditorias ISO.
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full w-[98%]" />
                  </div>
                </div>

                {/* Pilar 2: Aptidão Técnica */}
                <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800/90 space-y-4 hover:border-emerald-400/60 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-emerald-400 font-mono">92%</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Aptidão Técnica (Skills ILUO)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Postos críticos cobertos com operadores autônomos níveis 'U' (autônomo) ou 'O' (multiplicador/tutor).
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[92%]" />
                  </div>
                </div>

                {/* Pilar 3: Aptidão de Rotina */}
                <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800/90 space-y-4 hover:border-indigo-400/60 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-indigo-400 font-mono">95%</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Aptidão de Rotina (Routine)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Rituais Kamishibai cumpridos no prazo e passagens de turno auditadas e formalizadas sem gargalos no WhatsApp.
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[95%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: VITRINE DE MÓDULOS (SUÍTE APTIS COM PERSPECTIVA 3D ALCHE) */}
        <section id="catalogo" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-3.5 py-1 rounded-full font-mono">
              Módulos Integrados
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow">
              A Suíte de Prontidão Operacional
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Soluções modulares para supervisão diária, competências do operador, conformidade legal e melhoria contínua.
            </p>
          </div>

          {/* Barra de Busca e Filtros de Categoria */}
          <div className="bg-slate-950/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-2xl mb-10 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por módulo, benefício operacional ou palavra-chave..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* Filtros de Categoria */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-black'
                      : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  Todas ({allTools.length})
                </button>
                {TOOL_CATEGORIES.map(cat => {
                  const count = allTools.filter(t => t.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-black'
                          : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid de Cards das Ferramentas com Inclinação 3D */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredTools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                index={index}
                onRequestDemo={handleOpenDemoModal}
              />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="py-16 text-center bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800">
              <p className="text-slate-300 text-sm">Nenhum módulo encontrado com os termos pesquisados.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                className="mt-3 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </section>

        {/* SEÇÃO 3: OS 4 PILARES DA SUÍTE APTIS (ESTILO "VISION" DO REEL ALCHE 00:07-00:08) */}
        <section id="diferenciais" className="relative py-28 bg-slate-950/65 backdrop-blur-xl border-t border-b border-cyan-500/25 text-white overflow-hidden">
          {/* Barra Diagonal Luminosa inspirada na cena VISION (00:08 do vídeo ALCHE) */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-3 bg-gradient-to-r from-transparent via-amber-400/50 to-cyan-400/50 -rotate-45 blur-sm" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-1 bg-gradient-to-r from-amber-300 via-cyan-300 to-blue-400 -rotate-45 opacity-45" />

          {/* Tipografia Monumental de Fundo "VISION" */}
          <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <span className="text-[19vw] font-black tracking-[0.18em] uppercase text-white/[0.03] font-brand">
              VISION
            </span>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3.5 py-1 rounded-full font-mono">
                Excelência Operacional
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                Os 4 Pilares da Suíte Aptis
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Cada pilar resolve uma causa-raiz de ineficiência, parada de máquina ou autuação regulatória na manufatura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/90 space-y-3 hover:border-cyan-400/60 transition-all hover:-translate-y-1.5 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">1. Aptis Routine</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Quadro Kamishibai, matriz Eisenhower e passagem de turno estruturada. Fim dos alinhamentos perdidos no WhatsApp e gargalos não comunicados entre turnos.
                </p>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/90 space-y-3 hover:border-emerald-400/60 transition-all hover:-translate-y-1.5 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Grid className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">2. Aptis Skills</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Matriz ILUO de polivalência. Identifique postos sem backup qualificado antes do turno começar e trace planos de formação com tutores dedicados.
                </p>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/90 space-y-3 hover:border-amber-400/60 transition-all hover:-translate-y-1.5 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">3. Aptis Compliance</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gestão integrada de NRs e POPs com Deep Search em PDFs/DOCs. Semáforo preventivo de vencimento e bloqueio automático de postos críticos.
                </p>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/90 space-y-3 hover:border-indigo-400/60 transition-all hover:-translate-y-1.5 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">4. Aptis Kaizen</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Melhoria contínua orientada a A3 e Lean Manufacturing. Estruturação das ideias da equipe com acompanhamento de ações, ganhos operacionais e padronização.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO DE ARQUITETURA DE LICENCIAMENTO & ADESÃO SOB MEDIDA (SEM PREÇOS DE TABELA) */}
        <section id="licenciamento" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Licenciamento Corporativo Exclusivo
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Arquitetura Sob Medida para a sua Operação
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Cada indústria e operação de serviços possui uma estrutura única de equipes, ativos e rituais de gestão. Por isso, não trabalhamos com pacotes engessados de prateleira: desenhamos o licenciamento exato para a realidade da sua planta.
            </p>
          </div>

          {/* 3 Formatos de Escopo (Sem Valores Expostos) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 relative z-10">
            {/* ESCOPO 1: MÓDULO ESPECIALISTA DIRECIONADO */}
            <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 p-8 flex flex-col justify-between hover:border-cyan-500/50 transition-all hover:-translate-y-1.5 shadow-2xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-slate-300 text-[11px] font-bold uppercase tracking-wider border border-slate-800 font-mono">
                    Escopo 01 • Foco Tático
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-400 font-mono">
                    Sob Diagnóstico
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">Licença Modular Direcionada</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Para operações que desejam iniciar estruturando uma frente prioritária específica antes de expandir para toda a suíte.
                  </p>
                </div>

                <div className="py-3.5 px-4 rounded-2xl bg-slate-900/90 border border-slate-800/90">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Dimensionamento da Proposta
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    Por módulo selecionado & porte da equipe
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 pt-1">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Ativação individual dos módulos que você precisa agora (ex: <strong>Aptis Service Pro</strong>, <strong>Aptis Skills</strong> ou <strong>Aptis Routine</strong>)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Ambiente exclusivo e isolado da sua empresa (Multi-Tenant seguro)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Exportação de relatórios gerenciais e dossiês de auditoria</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Liberdade para acoplar novos módulos conforme a maturidade da operação evolui</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleOpenDemoModal(undefined, 'Licença Modular Direcionada (Sob Medida)')}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-700/80 hover:border-cyan-500/40 hover:text-white flex items-center justify-center gap-2"
                >
                  <span>Solicitar Proposta Modular</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>

            {/* ESCOPO 2: SUÍTE APTIS 360º (DESTAQUE) */}
            <div className="bg-gradient-to-b from-slate-950/90 via-cyan-950/35 to-slate-950/90 backdrop-blur-xl rounded-3xl border-2 border-cyan-400 p-8 flex flex-col justify-between shadow-[0_0_45px_rgba(6,182,212,0.2)] relative hover:-translate-y-1.5 transition-all">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                Arquitetura Mais Escolhida ⭐
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-bold uppercase tracking-wider border border-cyan-500/30 font-mono">
                    Escopo 02 • Planta Integrada
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-300 font-mono">
                    Condição Especial
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">Suíte Aptis 360º</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Governança completa integrando Rotina de Turno, Pessoas, Conformidade, Manutenção e Liderança em um único ecossistema.
                  </p>
                </div>

                <div className="py-3.5 px-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/90 block font-mono">
                    Dimensionamento da Proposta
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    Licenciamento unificado por planta operacional
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-slate-200 pt-1">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Acesso Integrado à Suíte Aptis</strong> (Routine, Skills, Compliance, Kaizen, 1:1 e Service Pro)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Painel executivo <strong>The Aptis Score</strong> em tempo real para a gestão</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Parametrização inicial assistida (importação de matrizes, ativos e catálogos)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Treinamento de Onboarding ao vivo com supervisores, coordenadores e líderes</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleOpenDemoModal(undefined, 'Suíte Aptis 360º - Planta Integrada')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Agendar Demonstração & Proposta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ESCOPO 3: ENTERPRISE & MULTI-PLANTAS */}
            <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 p-8 flex flex-col justify-between hover:border-amber-500/50 transition-all hover:-translate-y-1.5 shadow-2xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30 font-mono">
                    Escopo 03 • Corporativo
                  </span>
                  <span className="text-[11px] font-semibold text-amber-300 font-mono">
                    Projeto Executivo
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">Enterprise & Multi-Plantas</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Para grupos empresariais com múltiplas unidades fabris ou operações de campo de grande porte que exigem governança centralizada.
                  </p>
                </div>

                <div className="py-3.5 px-4 rounded-2xl bg-slate-900/90 border border-slate-800/90">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Dimensionamento da Proposta
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    Contrato corporativo para múltiplas unidades
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 pt-1">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Visão executiva consolidada entre diferentes plantas, filiais ou contratos</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Padronização corporativa de checklists, normas e catálogos mestres</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Acompanhamento consultivo na implantação e revisão de processos</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Atendimento prioritário dedicado à diretoria e gerência operacional</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleOpenDemoModal(undefined, 'Enterprise & Multi-Plantas (Projeto Executivo)')}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-700/80 hover:border-amber-500/40 hover:text-white flex items-center justify-center gap-2"
                >
                  <span>Falar com Diretor de Contas</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>
          </div>

          {/* RITO DE ADESÃO EXECUTIVA EM 3 ETAPAS */}
          <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
                  Jornada de Implantação Assistida
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Como funciona o processo para receber sua proposta?
                </h3>
              </div>
              <button
                onClick={() => handleOpenDemoModal(undefined, 'Diagnóstico Operacional & Proposta Personalizada')}
                className="shrink-0 px-5 py-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider hover:bg-cyan-500/25 transition-colors cursor-pointer"
              >
                Iniciar Diagnóstico Agora
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <span className="text-xs font-black text-cyan-400 font-mono">ETAPA 01 //</span>
                <h4 className="text-sm font-bold text-white">Diagnóstico da Operação</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Em uma conversa rápida, entendemos a estrutura da sua empresa, o tamanho da equipe e quais rotinas ou controles precisam de maior padronização.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <span className="text-xs font-black text-cyan-400 font-mono">ETAPA 02 //</span>
                <h4 className="text-sm font-bold text-white">Demonstração Guiada na Prática</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apresentamos ao vivo os módulos mais aderentes à necessidade e ao momento da sua operação, simulando o uso real dos seus gestores e equipes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <span className="text-xs font-black text-cyan-400 font-mono">ETAPA 03 //</span>
                <h4 className="text-sm font-bold text-white">Proposta Sob Medida & Go-Live</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Entregamos a proposta comercial ajustada ao porte da sua unidade, com implantação guiada, migração das suas planilhas atuais e treinamento dos líderes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24 bg-slate-950/80 backdrop-blur-xl text-white text-center px-4 border-t border-cyan-500/25 relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Sua fábrica está pronta para operar com 100% de aptidão?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Agende uma demonstração executiva para conhecer a arquitetura ideal para a sua operação ou acesse o ambiente corporativo da suíte.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleOpenDemoModal(undefined, 'Diagnóstico Executivo - CTA Final')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Solicitar Diagnóstico & Proposta
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-cyan-500/40 hover:border-cyan-400 font-bold text-sm uppercase tracking-wider rounded-xl transition-all"
              >
                Acessar Plataforma Aptis
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <PublicFooter />
      </div>

      {/* Modal de Lead */}
      <LeadModal
        tool={selectedToolForLead}
        defaultPlan={selectedPlanForLead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
