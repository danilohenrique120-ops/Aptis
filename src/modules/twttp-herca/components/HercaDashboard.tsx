'use client';

import React, { useState } from 'react';
import { 
  BrainCircuit, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Sparkles, 
  Info, 
  Plus, 
  ArrowUpRight,
  Factory,
  ChevronDown,
  ChevronUp,
  Cpu,
  BookOpen,
  Printer
} from 'lucide-react';
import { HercaInvestigation } from '../types';

interface HercaDashboardProps {
  investigations: HercaInvestigation[];
  onSelectInvestigation: (inv: HercaInvestigation) => void;
  onNewInvestigation: () => void;
  onOpenOpl: (inv: HercaInvestigation) => void;
  onOpenPdfReport?: (inv: HercaInvestigation) => void;
}

export function HercaDashboard({
  investigations,
  onSelectInvestigation,
  onNewInvestigation,
  onOpenOpl,
  onOpenPdfReport,
}: HercaDashboardProps) {
  const [showMethodologyHelp, setShowMethodologyHelp] = useState(false);

  // Calculations
  const total = investigations.length;
  const closedOrValidated = investigations.filter(i => i.status === 'effective_validated' || i.status === 'closed').length;
  const inProgress = total - closedOrValidated;
  
  // Total actions & Poka-Yoke ratio
  const allActions = investigations.flatMap(i => i.actions);
  const pokaYokeActions = allActions.filter(a => a.hierarchy === 'poka_yoke');
  const engineeringActions = allActions.filter(a => a.hierarchy === 'engineering');
  const trainingOnlyActions = allActions.filter(a => a.hierarchy === 'training_twttp');
  
  const pokaYokeRatio = allActions.length > 0 
    ? Math.round(((pokaYokeActions.length + engineeringActions.length) / allActions.length) * 100) 
    : 0;

  // Recurrence rate
  const recurrentInvestigations = investigations.filter(i => i.recurrenceCount > 0);
  const recurrenceRate = total > 0 ? Math.round((recurrentInvestigations.length / total) * 100) : 0;

  // Total estimated loss
  const totalEstimatedLoss = investigations.reduce((sum, i) => sum + (i.estimatedLossReais || 0), 0);

  // TWTTP Diagnostic distribution
  const twttpStats = {
    knewWhat: total > 0 ? Math.round((investigations.filter(i => i.twttp.knewWhat).length / total) * 100) : 0,
    knewHow: total > 0 ? Math.round((investigations.filter(i => i.twttp.knewHow).length / total) * 100) : 0,
    knewWhy: total > 0 ? Math.round((investigations.filter(i => i.twttp.knewWhy).length / total) * 100) : 0,
    hadConditions: total > 0 ? Math.round((investigations.filter(i => i.twttp.hadConditions).length / total) * 100) : 0,
  };

  // HERCA Error Type distribution
  const errorTypeLabels: Record<string, string> = {
    slip: 'Deslize (Atenção / Execução)',
    lapse: 'Lapso (Memória / Omissão)',
    mistake_rule: 'Engano de Regra (Aplicação)',
    mistake_knowledge: 'Engano de Conhecimento',
    system_induced_violation: 'Violação Sistêmica (Pressão/Layout)',
    ergonomic_overload: 'Sobrecarga Ergonômica / Fadiga',
  };

  const errorTypeCounts = investigations.reduce((acc, inv) => {
    acc[inv.hercaErrorType] = (acc[inv.hercaErrorType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sector breakdown
  const sectorMap = investigations.reduce((acc, inv) => {
    if (!acc[inv.sector]) {
      acc[inv.sector] = { total: 0, recurrent: 0, pokaYoke: 0, loss: 0 };
    }
    acc[inv.sector].total += 1;
    if (inv.recurrenceCount > 0) acc[inv.sector].recurrent += 1;
    acc[inv.sector].loss += (inv.estimatedLossReais || 0);
    acc[inv.sector].pokaYoke += inv.actions.filter(a => a.hierarchy === 'poka_yoke').length;
    return acc;
  }, {} as Record<string, { total: number; recurrent: number; pokaYoke: number; loss: number }>);

  const sectors = Object.entries(sectorMap).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-400/20 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              World Class Manufacturing (WCM) • Causa Raiz de Falha Humana
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Aptis TWTTP & HERCA
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sistema executivo para eliminação definitiva de falhas humanas industriais. Substitui a culpabilização pessoal 
              pelo diagnóstico do método de instrução (<strong className="text-indigo-200">TWTTP</strong>) e barreiras físicas robustas à prova de erros (<strong className="text-purple-200">HERCA + Poka-Yoke</strong>).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowMethodologyHelp(!showMethodologyHelp)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition border border-white/10 backdrop-blur-xs"
            >
              <BookOpen className="w-4 h-4 text-indigo-300" />
              {showMethodologyHelp ? 'Ocultar Guia WCM' : 'Guia das Metodologias'}
              {showMethodologyHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={onNewInvestigation}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Nova Investigação
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Methodology Guide */}
      {showMethodologyHelp && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400 font-bold">
            <Info className="w-5 h-5" />
            <span>Fundamentos WCM: Como aplicar TWTTP & HERCA na Prática</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                TWTTP (The Way To Teach People)
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                Questiona o Gemba em 4 dimensões essenciais:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                <li><strong>O Que:</strong> Sabia exatamente o padrão esperado?</li>
                <li><strong>O Como:</strong> Sabia executar com destreza prática?</li>
                <li><strong>O Porquê:</strong> Compreendia os riscos e consequências?</li>
                <li><strong>Condições:</strong> O posto e as ferramentas permitiam?</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">2</span>
                HERCA (Human Error Root Cause)
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                Classifica cientificamente o mecanismo do erro em Deslize, Lapso, Engano ou Sobrecarga. Investiga os fatores sistêmicos com 5 Porquês para descobrir por que o ambiente permitiu a ocorrência.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                Hierarquia de Soluções WCM
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                Auditoria de eficácia contra a falácia do &quot;re-treinamento&quot;:
              </p>
              <div className="mt-2 text-xs font-medium space-y-1">
                <div className="text-emerald-700 dark:text-emerald-300">★ 1. Poka-Yoke Físico (Impossibilita o erro)</div>
                <div className="text-blue-700 dark:text-blue-300">★ 2. Engenharia / Automação / Sensores</div>
                <div className="text-amber-700 dark:text-amber-300">★ 3. Gestão Visual & OPL no Posto</div>
                <div className="text-slate-500">★ 4. Treinamento 4 Passos TWTTP</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investigations */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Investigações
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{total}</span>
            <span className="text-xs font-medium text-slate-500">casos registrados</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Ativas: <strong className="text-amber-600">{inProgress}</strong></span>
            <span>Eficazes: <strong className="text-emerald-600">{closedOrValidated}</strong></span>
          </div>
        </div>

        {/* Poka-Yoke & Engineering Ratio */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Robustez Poka-Yoke
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{pokaYokeRatio}%</span>
            <span className="text-xs font-medium text-slate-500">ações estruturais</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Poka-Yoke: <strong>{pokaYokeActions.length}</strong></span>
            <span>Apenas Treino: <strong>{trainingOnlyActions.length}</strong></span>
          </div>
        </div>

        {/* Recurrence Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Taxa de Reincidência
            </span>
            <div className={`p-2 rounded-xl ${recurrenceRate > 20 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${recurrenceRate > 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {recurrenceRate}%
            </span>
            <span className="text-xs font-medium text-slate-500">reincidentes</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Casos com reincidência: <strong>{recurrentInvestigations.length}</strong></span>
            <span className="text-emerald-600 font-medium">Meta WCM &lt; 5%</span>
          </div>
        </div>

        {/* Loss Avoided / Impact */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Perdas Mapeadas
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              R$ {totalEstimatedLoss.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            Impacto financeiro direto mitigado pelas contra-medidas
          </div>
        </div>
      </div>

      {/* Middle Row: TWTTP Diagnostic Radar & HERCA Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TWTTP Gemba Assessment */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Diagnóstico TWTTP: Os 4 Pilares da Falha Humana
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Percentual dos operadores que possuíam o preparo completo antes do evento
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">1. Sabia o Que Fazer? (Instrução do Padrão)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{twttpStats.knewWhat}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${twttpStats.knewWhat}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">2. Sabia Como Fazer? (Habilidade Prática Gemba)</span>
                <span className={`font-bold ${twttpStats.knewHow < 50 ? 'text-rose-600' : 'text-indigo-600'}`}>{twttpStats.knewHow}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${twttpStats.knewHow < 50 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${twttpStats.knewHow}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">3. Sabia o Porquê? (Consciência do Impacto/Risco)</span>
                <span className={`font-bold ${twttpStats.knewWhy < 50 ? 'text-amber-600' : 'text-indigo-600'}`}>{twttpStats.knewWhy}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${twttpStats.knewWhy}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">4. Tinha Condições de Executar? (Máquinas/Ergonomia/Layout)</span>
                <span className={`font-bold ${twttpStats.hadConditions < 50 ? 'text-rose-600' : 'text-emerald-600'}`}>{twttpStats.hadConditions}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${twttpStats.hadConditions < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${twttpStats.hadConditions}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <strong className="text-indigo-600 dark:text-indigo-400">Insight Gerencial TWTTP:</strong> Se o colaborador &quot;sabia o que&quot; mas não &quot;tinha condições&quot; ou não conhecia a prática no Gemba, o problema nunca foi desatenção, e sim deficiência de projeto ou método incompleto do líder.
          </div>
        </div>

        {/* HERCA Error Classification Pareto */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Pareto HERCA: Mecanismos de Falha Humana
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribuição dos tipos de erro identificados nas investigações
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(errorTypeLabels).map(([key, label]) => {
              const count = errorTypeCounts[key] || 0;
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                    <span className="text-slate-500 font-semibold">{count} casos ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500">
            <span>Metodologia: Rasmussen / Reason / WCM HERCA Model</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">Total: {total} eventos</span>
          </div>
        </div>
      </div>

      {/* Sector Breakdown Table & Recent Critical Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Table (2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Factory className="w-4 h-4 text-indigo-500" />
                Matriz de Desempenho por Área / Setor Industrial
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visão consolidada para gerentes e supervisores de produção
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Setor / Área</th>
                  <th className="pb-3 text-center">Investigações</th>
                  <th className="pb-3 text-center">Reincidências</th>
                  <th className="pb-3 text-center">Poka-Yokes Criados</th>
                  <th className="pb-3 text-right">Perda Mapeada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sectors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Nenhum dado setorial registrado até o momento.
                    </td>
                  </tr>
                ) : (
                  sectors.map(([sectorName, data]) => (
                    <tr key={sectorName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {sectorName}
                      </td>
                      <td className="py-3 text-center font-bold text-slate-900 dark:text-white">
                        {data.total}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${data.recurrent > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {data.recurrent}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold">
                          {data.pokaYoke}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                        R$ {data.loss.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Investigations (1 column) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Casos Críticos Recentes
              </h3>
            </div>
            
            <div className="space-y-3">
              {investigations.slice(0, 3).map((inv) => (
                <div 
                  key={inv.id}
                  onClick={() => onSelectInvestigation(inv)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xs transition cursor-pointer group bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                      {inv.code}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      inv.severity === 'critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      inv.severity === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {inv.severity}
                    </span>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">
                    {inv.title}
                  </h4>
                  
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {inv.incidentDescription}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="line-clamp-1 max-w-[130px]">{inv.sector}</span>
                    <div className="flex items-center gap-2">
                      {onOpenPdfReport && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPdfReport(inv);
                          }}
                          className="text-purple-600 hover:underline font-semibold flex items-center gap-0.5"
                          title="Gerar Relatório em PDF"
                        >
                          <Printer className="w-3 h-3" />
                          PDF
                        </button>
                      )}
                      {inv.opl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOpl(inv);
                          }}
                          className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          OPL
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Gerenciamento Ativo</span>
            <button 
              onClick={onNewInvestigation}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              + Abrir Nova Investigação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

