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
                  Melhoria contínua orientada a A3 e Lean Manufacturing. Apontamento rápido de ideias da equipe com cálculo automático de ROI e horas salvas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO DE PLANOS & VALORES DE ASSINATURA */}
        <section id="planos" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Planos Transparentes & Modulares
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Investimento em Prontidão Industrial
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Contrate os módulos essenciais para o momento da sua fábrica ou adote a Suíte Completa 360º com ROI imediato e implantação guiada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* PLANO 1: MÓDULO INDIVIDUAL */}
            <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 p-7 flex flex-col justify-between hover:border-cyan-500/50 transition-all hover:-translate-y-1.5 shadow-2xl">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-slate-300 text-[11px] font-bold uppercase tracking-wider border border-slate-800">
                  Entrada Lean
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Módulo Individual</h3>
                  <p className="text-xs text-slate-400 mt-1">Para plantas que precisam resolver um gargalo crítico imediato.</p>
                </div>

                <div className="pt-2 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400 font-semibold">R$</span>
                    <span className="text-4xl font-black text-white">490</span>
                    <span className="text-xs text-slate-400 font-semibold">/mês</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">por planta • 1 ferramenta à escolha</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>1 Módulo Aptis</strong> à sua escolha (Routine, Skills, Compliance ou Kaizen)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Usuários e operadores ilimitados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Exportação de relatórios em Excel/PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Suporte via e-mail e comunidade</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleOpenDemoModal(undefined, 'Módulo Individual (R$ 490/mês)')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-700/80 hover:border-cyan-500/40 hover:text-white"
                >
                  Solicitar Demonstração
                </button>
              </div>
            </div>

            {/* PLANO 2: APTIS SUITE OPERACIONAL (DESTAQUE) */}
            <div className="bg-gradient-to-b from-slate-950/90 via-cyan-950/35 to-slate-950/90 backdrop-blur-xl rounded-3xl border-2 border-cyan-400 p-7 flex flex-col justify-between shadow-[0_0_45px_rgba(6,182,212,0.2)] relative hover:-translate-y-1.5 transition-all">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                Mais Escolhido pelas Indústrias ⭐
              </div>

              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-bold uppercase tracking-wider border border-cyan-500/30">
                  Operação & Pessoas
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Aptis Suite Operacional</h3>
                  <p className="text-xs text-slate-300 mt-1">O pacote central para garantir a estabilidade do chão de fábrica.</p>
                </div>

                <div className="pt-2 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400 font-semibold">R$</span>
                    <span className="text-4xl font-black text-cyan-400">1.190</span>
                    <span className="text-xs text-slate-400 font-semibold">/mês</span>
                  </div>
                  <span className="text-[11px] text-cyan-300/80 block mt-1">por planta • Economia de 25%</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Aptis Routine</strong> (Kamishibai & Turnos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Aptis Skills</strong> (Matriz ILUO & Sucessor)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Aptis Compliance</strong> (NRs & POPs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Painel Executivo <strong>The Aptis Score</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Treinamento de Onboarding com a Equipe</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleOpenDemoModal(undefined, 'Aptis Suite Operacional (R$ 1.190/mês)')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
                >
                  Solicitar Demonstração & Orçamento
                </button>
              </div>
            </div>

            {/* PLANO 3: FÁBRICA SEMPRE APTA 360º */}
            <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 p-7 flex flex-col justify-between hover:border-indigo-500/50 transition-all hover:-translate-y-1.5 shadow-2xl">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-500/30">
                  Suíte Completa 360º
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Fábrica Sempre Apta</h3>
                  <p className="text-xs text-slate-400 mt-1">Governança total: rotina, pessoas, conformidade e melhoria contínua.</p>
                </div>

                <div className="pt-2 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400 font-semibold">R$</span>
                    <span className="text-4xl font-black text-white">1.590</span>
                    <span className="text-xs text-slate-400 font-semibold">/mês</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">por planta • Acesso irrestrito a todos módulos</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Todos os 4 Módulos Aptis Integrados</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Aptis Kaizen</strong> com Gestor de Ideias & ROI Lean</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>The Aptis Score Completo com Radar Chart</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Auditoria e OCR de POPs & Documentos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Gerente de Contas & Suporte Prioritário VIP</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleOpenDemoModal(undefined, 'Fábrica Sempre Apta 360º (R$ 1.590/mês)')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-700/80 hover:border-indigo-500/40 hover:text-white"
                >
                  Solicitar Demonstração
                </button>
              </div>
            </div>

            {/* PLANO 4: ENTERPRISE MULTI-PLANTAS */}
            <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 p-7 flex flex-col justify-between hover:border-amber-500/50 transition-all hover:-translate-y-1.5 shadow-2xl">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30">
                  Corporativo
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Enterprise & Multi-Plantas</h3>
                  <p className="text-xs text-slate-400 mt-1">Para grupos industriais com 2 ou mais fábricas e integrações dedicadas.</p>
                </div>

                <div className="pt-2 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">Sob Consulta</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">descontos progressivos por volume de plantas</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Visão consolidada Multi-Plantas corporativa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Integração ERP / MES / SAP / TOTVS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Single Sign-On (SSO SAML / Azure AD)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>SLA de 99.9% e Consultoria Técnica Dedicada</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleOpenDemoModal(undefined, 'Enterprise Multi-Plantas (Sob Consulta)')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-700/80 hover:border-amber-500/40 hover:text-white"
                >
                  Falar com Especialista
                </button>
              </div>
            </div>
          </div>

          {/* Banner de Garantia & Confiança */}
          <div className="mt-12 p-6 rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 relative z-10">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0" />
              <span>
                <strong>Sem taxa oculta de implantação:</strong> Todas as assinaturas incluem onboarding assistido, importação das planilhas legadas da sua fábrica e suporte direto aos supervisores.
              </span>
            </div>
            <button
              onClick={() => handleOpenDemoModal()}
              className="shrink-0 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-500/25 transition-colors cursor-pointer"
            >
              Tirar Dúvidas Comerciais
            </button>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24 bg-slate-950/80 backdrop-blur-xl text-white text-center px-4 border-t border-cyan-500/25 relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Sua fábrica está pronta para operar com 100% de aptidão?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Experimente agora mesmo a suíte integrada da Aptis e meça o Índice de Aptidão da sua planta em tempo real.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95"
              >
                Acessar Plataforma Aptis Agora
                <ArrowRight className="w-4 h-4" />
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
