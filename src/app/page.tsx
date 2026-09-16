'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { ToolCard } from '@/components/public/tool-card';
import { LeadModal } from '@/components/public/lead-modal';
import { getAllTools, TOOL_CATEGORIES } from '@/config/tools-registry';
import { ToolDefinition } from '@/types';
import { AptisLogo } from '@/components/ui/aptis-logo';
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
  Clock,
  ChevronRight,
  Shield,
  Layers,
  Cpu
} from 'lucide-react';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedToolForLead, setSelectedToolForLead] = useState<ToolDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allTools = getAllTools();

  const filteredTools = allTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                          tool.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
                          tool.keyFeatures.some(f => f.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenDemoModal = (tool: ToolDefinition) => {
    setSelectedToolForLead(tool);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Público */}
      <PublicHeader />

      <main className="flex-1">
        {/* HERO SECTION MONUMENTAL */}
        <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/80">
          {/* Grid de Fundo & Glow Radial Ciano */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-cyan-500/15 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center space-y-8">
            {/* Logotipo Monumental com Efeito de Luz */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative group inline-flex p-1 rounded-3xl bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-slate-900/80 border border-slate-700/80 shadow-2xl shadow-black/80 backdrop-blur-xl">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative rounded-[22px] overflow-hidden bg-slate-950 px-8 py-6 flex items-center justify-center">
                  <Image
                    src="/brand/aptis-logo.png"
                    alt="Aptis - Logotipo Oficial"
                    width={280}
                    height={100}
                    className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Badge de Posicionamento */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aptis Suite • Prontidão Operacional & Governança Industrial</span>
            </div>

            {/* Headline Oficial */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
                Aptis: <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-200 to-slate-100">
                  A fábrica sempre apta.
                </span>
              </h1>

              <p className="text-sm sm:text-base font-bold text-cyan-300/90 uppercase tracking-wider">
                Prontidão operacional, governança e conformidade para o chão de fábrica
              </p>

              <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
                A plataforma que garante que todo operador, máquina e turno estejam 100% aptos a produzir com segurança, autonomia e sem paradas de linha.
              </p>
            </div>

            {/* Botões Principais com Glow */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-base font-black uppercase tracking-wider rounded-xl shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5"
              >
                Acessar Plataforma Aptis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#score"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 border border-slate-700/80 text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <Activity className="w-5 h-5 text-cyan-400" />
                Conhecer o Aptis Score
              </a>
            </div>

            {/* Selos de Confiança Industrial */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Matriz ILUO & Polivalência
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Compliance NRs & POPs com OCR
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Kamishibai & Passagem de Turno
              </span>
            </div>
          </div>
        </section>

        {/* SEÇÃO THE APTIS SCORE (O CONCEITO DE OURO) */}
        <section id="score" className="py-20 bg-slate-950 text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl shadow-black/80 relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
                <div className="space-y-3 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-500/30">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> Métrica Proprietária da Diretoria Industrial
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    The Aptis Score (Índice de Aptidão da Planta)
                  </h2>
                  <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                    Um indicador único em tempo real que calcula se a sua fábrica possui os operadores certos, capacitados e com rituais de liderança em dia para rodar sem paradas inesperadas ou autuações.
                  </p>
                </div>

                {/* Placar Central do Aptis Score */}
                <div className="flex items-center gap-6 bg-slate-950/80 px-8 py-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Score Global</span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Planta Conforme
                    </span>
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-950 to-emerald-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black text-3xl shadow-inner shadow-cyan-500/20">
                    95%
                  </div>
                </div>
              </div>

              {/* Grid dos 3 Pilares do Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pilar 1: Aptidão Legal */}
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 space-y-4 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-cyan-400">98%</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Aptidão Legal (Compliance)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      Operadores com NRs e POPs vigentes, sem riscos de interdição, autuação do MTE ou reprovação em auditorias ISO.
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full w-[98%]" />
                  </div>
                </div>

                {/* Pilar 2: Aptidão Técnica */}
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 space-y-4 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-emerald-400">92%</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Aptidão Técnica (Skills ILUO)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      Postos críticos cobertos com operadores autônomos níveis 'U' (autônomo) ou 'O' (multiplicador/tutor).
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[92%]" />
                  </div>
                </div>

                {/* Pilar 3: Aptidão de Rotina */}
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 space-y-4 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-indigo-400">95%</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Aptidão de Rotina (Routine)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
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

        {/* SEÇÃO 2: VITRINE DE MÓDULOS (SUÍTE APTIS) */}
        <section id="catalogo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-950">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
              Módulos Integrados
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              A Suíte de Prontidão Operacional
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Soluções modulares para supervisão diária, competências do operador, conformidade legal e melhoria contínua.
            </p>
          </div>

          {/* Barra de Busca e Filtros de Categoria */}
          <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl mb-10 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar por módulo, benefício operacional ou palavra-chave..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* Filtros de Categoria */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
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
                      className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid de Cards das Ferramentas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredTools.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onRequestDemo={handleOpenDemoModal}
              />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="py-16 text-center bg-slate-900 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-sm">Nenhum módulo encontrado com os termos pesquisados.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                className="mt-3 px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </section>

        {/* SEÇÃO 3: OS 4 PILARES DA SUÍTE APTIS */}
        <section id="diferenciais" className="py-20 bg-slate-900/60 border-t border-b border-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3 py-1 rounded-full">
                Excelência Operacional
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Os 4 Pilares da Suíte Aptis
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Cada pilar resolve uma causa-raiz de ineficiência, parada de máquina ou autuação regulatória na manufatura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">1. Aptis Routine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Quadro Kamishibai, matriz Eisenhower e passagem de turno estruturada. Fim dos alinhamentos perdidos no WhatsApp e gargalos não comunicados entre turnos.
                </p>
              </div>

              <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Grid className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">2. Aptis Skills</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Matriz ILUO de polivalência. Identifique postos sem backup qualificado antes do turno começar e trace planos de formação com tutores dedicados.
                </p>
              </div>

              <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-amber-500/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">3. Aptis Compliance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gestão integrada de NRs e POPs com Deep Search em PDFs/DOCs. Semáforo preventivo de vencimento e bloqueio automático de postos críticos.
                </p>
              </div>

              <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">4. Aptis Kaizen</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Melhoria contínua orientada a A3 e Lean Manufacturing. Apontamento rápido de ideias da equipe com cálculo automático de ROI e horas salvas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: ARQUITETURA MODULAR REGISTRY PATTERN */}
        <section id="arquitetura" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
                  Engenharia & Escalabilidade
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  Construído no Padrão Registry Pattern
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Cada módulo da Suíte Aptis opera como um micro-frontend desacoplado (`src/modules/[id]`), gerenciado de forma centralizada pelo `tools-registry.ts`.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Isolamento Modular:</strong> Ativação e desativação granular de módulos por planta ou cliente.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>License Guard:</strong> Proteção de rotas baseada nos módulos licenciados pela organização.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Multi-Tenant Limpo:</strong> Dados segregados por `tenant_id` compatíveis com Supabase RLS e Firebase.</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/20"
                  >
                    Testar Navegação na Plataforma Aptis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Bloco de Código Visual Representativo */}
              <div className="bg-slate-950 rounded-2xl p-5 text-slate-300 font-mono text-xs shadow-2xl border border-slate-800 overflow-x-auto">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-cyan-400 font-bold">src/config/tools-registry.ts</span>
                </div>
                <pre className="mt-4 leading-relaxed text-[11px] text-slate-300">
{`export const TOOLS_REGISTRY: ToolDefinition[] = [
  {
    id: 'manager-tasks',
    name: 'Aptis Routine',
    category: 'Rotina & Tarefas',
    route: '/dashboard/tools/manager-tasks',
    status: 'active'
  },
  {
    id: 'skills-matrix',
    name: 'Aptis Skills',
    category: 'Gestão de Pessoas',
    route: '/dashboard/tools/skills-matrix',
    status: 'active'
  },
  {
    id: 'training-matrix',
    name: 'Aptis Compliance',
    category: 'Capacitação & Compliance',
    route: '/dashboard/tools/training-matrix',
    status: 'active'
  },
  {
    id: 'kaizen-manager',
    name: 'Aptis Kaizen',
    category: 'Melhoria Contínua',
    route: '/dashboard/tools/kaizen-manager',
    status: 'active'
  }
];`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-center px-4 border-t border-slate-800">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Sua fábrica está pronta para operar com 100% de aptidão?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Experimente agora mesmo a suíte integrada da Aptis e meça o Índice de Aptidão da sua planta em tempo real.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Acessar Plataforma Aptis Agora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />

      {/* Modal de Lead */}
      <LeadModal
        tool={selectedToolForLead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
