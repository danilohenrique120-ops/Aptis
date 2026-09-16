'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { ToolCard } from '@/components/public/tool-card';
import { LeadModal } from '@/components/public/lead-modal';
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header Público */}
      <PublicHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Aptis Suite • Prontidão Operacional & Governança Industrial
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
              Aptis: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
                A fábrica sempre apta.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
              Prontidão operacional, governança e conformidade para o chão de fábrica. A plataforma que garante que todo operador, máquina e turno estejam 100% aptos a produzir com segurança e sem paradas de linha.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5"
              >
                Acessar Plataforma Aptis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#score"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Conhecer o Aptis Score
              </a>
            </div>

            {/* Selos de Confiança */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Matriz ILUO & Polivalência
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Compliance NRs & POPs com OCR
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Kamishibai & Passagem de Turno
              </span>
            </div>
          </div>
        </section>

        {/* SEÇÃO APTIS SCORE (CONCEITO DE OURO) */}
        <section id="score" className="py-16 bg-slate-900 border-t border-b border-slate-800 text-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 p-8 sm:p-12 rounded-3xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
                <div className="space-y-2 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                    <Activity className="w-3.5 h-3.5" /> Métrica Proprietária de Governança
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    The Aptis Score (Índice de Aptidão da Planta)
                  </h2>
                  <p className="text-slate-400 text-sm max-w-xl">
                    Um indicador único e em tempo real que mede se a sua fábrica possui os operadores certos, capacitados e com rituais em dia para rodar a produção sem paradas inesperadas.
                  </p>
                </div>

                <div className="flex items-center gap-5 bg-slate-800/80 px-7 py-5 rounded-2xl border border-slate-700 backdrop-blur-xs">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Score Geral</span>
                    <span className="text-xs text-emerald-400 font-bold">Planta Conforme</span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-inner">
                    95%
                  </div>
                </div>
              </div>

              {/* Grid dos 3 Pilares do Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-white">98%</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Aptidão Legal (Compliance)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Operadores com NRs e POPs vigentes, sem riscos de interdição, autuação trabalhista ou auditoria reprovada.
                  </p>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full w-[98%]" />
                  </div>
                </div>

                <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-white">92%</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Aptidão Técnica (Skills ILUO)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Postos críticos cobertos com operadores autônomos níveis 'U' (autônomo) ou 'O' (multiplicador/tutor).
                  </p>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[92%]" />
                  </div>
                </div>

                <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-white">95%</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Aptidão de Rotina (Routine)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rituais Kamishibai cumpridos no prazo e passagens de turno auditadas e formalizadas sem gargalos.
                  </p>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full w-[95%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: CATÁLOGO DE FERRAMENTAS / MÓDULOS APTIS SUITE */}
        <section id="catalogo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Suíte Integrada
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Módulos da Suíte Aptis
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Explore os módulos desenvolvidos para governança diária de chão de fábrica, polivalência operacional, conformidade técnica e melhoria contínua.
            </p>
          </div>

          {/* Barra de Busca e Filtros de Categoria */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-10 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por módulo, benefício operacional ou palavra-chave..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Filtros de Categoria */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-sm">Nenhum módulo encontrado com os termos pesquisados.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                className="mt-3 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </section>

        {/* SEÇÃO 3: OS 4 PILARES DA SUÍTE APTIS */}
        <section id="diferenciais" className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800 px-3 py-1 rounded-full">
                Prontidão de Ponta a Ponta
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Os 4 Pilares da Suíte Aptis
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Cada pilar resolve uma causa-raiz de ineficiência, parada de máquina ou autuação regulatória na manufatura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">1. Aptis Routine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Quadro Kamishibai, matriz Eisenhower e passagem de turno estruturada. Fim dos alinhamentos perdidos no WhatsApp e gargalos não comunicados entre turnos.
                </p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Grid className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">2. Aptis Skills</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Matriz ILUO de polivalência. Identifique postos sem backup qualificado antes do turno começar e trace planos de formação com tutores dedicados.
                </p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">3. Aptis Compliance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gestão integrada de NRs e POPs com Deep Search em PDFs/DOCs. Semáforo preventivo de vencimento e bloqueio automático de postos críticos.
                </p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
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
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Engenharia & Escalabilidade
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  Construído no Padrão Registry Pattern
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cada módulo da Suíte Aptis opera como um micro-frontend desacoplado (`src/modules/[id]`), gerenciado de forma centralizada pelo `tools-registry.ts`.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Isolamento Modular:</strong> Ativação e desativação granular de módulos por planta ou cliente.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>License Guard:</strong> Proteção de rotas baseada nos módulos licenciados pela organização.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Multi-Tenant Limpo:</strong> Dados segregados por `tenant_id` compatíveis com Supabase RLS e Firebase.</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Testar Navegação na Plataforma Aptis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Bloco de Código Visual Representativo */}
              <div className="bg-slate-900 rounded-2xl p-5 text-slate-300 font-mono text-xs shadow-lg border border-slate-800 overflow-x-auto">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-slate-400">src/config/tools-registry.ts</span>
                </div>
                <pre className="mt-4 leading-relaxed text-[11px]">
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
        <section className="py-20 bg-gradient-to-r from-blue-700 to-indigo-900 text-white text-center px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Sua fábrica está pronta para operar com 100% de aptidão?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
              Experimente agora mesmo o hub interativo da Aptis e conheça o Índice de Aptidão da sua planta em tempo real.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95"
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
