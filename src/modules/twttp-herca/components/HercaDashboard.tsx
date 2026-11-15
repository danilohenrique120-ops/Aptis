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
  tintedGlass?: boolean;
}

export function HercaDashboard({
  investigations,
  onSelectInvestigation,
  onNewInvestigation,
  onOpenOpl,
  onOpenPdfReport,
  tintedGlass = false,
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

  const cardClass = tintedGlass
    ? 'aptis-glass-dark p-6 rounded-2xl'
    : 'aptis-glass-light bg-white p-6 rounded-2xl border border-slate-200 shadow-xs';

  const kpiCardClass = tintedGlass
    ? 'aptis-glass-dark p-5 rounded-2xl'
    : 'aptis-glass-light bg-white p-5 rounded-2xl border border-slate-200 shadow-xs';

  return (
    <div className="space-y-6">
      {/* Barra de Apoio Metodológico WCM (Dual-Mode) */}
      <div className={`p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all ${
        tintedGlass
          ? 'aptis-glass-dark text-white'
          : 'aptis-glass-light bg-white border border-slate-200 shadow-xs text-slate-900'
      }`}>
        <div className="space-y-1 max-w-2xl">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
            tintedGlass
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            World Class Manufacturing (WCM) • Causa Raiz de Falha Humana
          </div>
          <p className={`text-xs leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
            Substitui a culpabilização pessoal pelo diagnóstico do método de instrução (<strong className={tintedGlass ? 'text-indigo-300' : 'text-indigo-700'}>TWTTP</strong>) e barreiras físicas robustas à prova de erros (<strong className={tintedGlass ? 'text-purple-300' : 'text-purple-700'}>HERCA + Poka-Yoke</strong>).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowMethodologyHelp(!showMethodologyHelp)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              tintedGlass
                ? 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${tintedGlass ? 'text-indigo-300' : 'text-indigo-600'}`} />
            {showMethodologyHelp ? 'Ocultar Guia WCM' : 'Guia das Metodologias'}
            {showMethodologyHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Methodology Guide */}
      {showMethodologyHelp && (
        <div className={`${cardClass} animate-in fade-in duration-200`}>
          <div className={`flex items-center gap-2 mb-4 font-bold text-xs uppercase tracking-wider ${
            tintedGlass ? 'text-indigo-300' : 'text-indigo-600'
          }`}>
            <Info className="w-4 h-4" />
            <span>Fundamentos WCM: Como aplicar TWTTP & HERCA na Prática</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className={`p-4 rounded-xl border ${
              tintedGlass ? 'aptis-glass-subcard border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-100'
            }`}>
              <h4 className={`font-bold flex items-center gap-2 mb-2 ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[11px]">1</span>
                TWTTP (The Way To Teach People)
              </h4>
              <p className={`leading-relaxed text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                Questiona o Gemba em 4 dimensões essenciais:
              </p>
              <ul className={`mt-2 space-y-1 text-xs list-disc list-inside ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                <li><strong>O Que:</strong> Sabia exatamente o padrão esperado?</li>
                <li><strong>O Como:</strong> Sabia executar com destreza prática?</li>
                <li><strong>O Porquê:</strong> Compreendia os riscos e consequências?</li>
                <li><strong>Condições:</strong> O posto e as ferramentas permitiam?</li>
              </ul>
            </div>

            <div className={`p-4 rounded-xl border ${
              tintedGlass ? 'aptis-glass-subcard border-purple-500/30' : 'bg-purple-50/50 border-purple-100'
            }`}>
              <h4 className={`font-bold flex items-center gap-2 mb-2 ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                <span className="w-5 h-5 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[11px]">2</span>
                HERCA (Human Error Root Cause)
              </h4>
              <p className={`leading-relaxed text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                Classifica cientificamente o mecanismo do erro em Deslize, Lapso, Engano ou Sobrecarga. Investiga os fatores sistêmicos com 5 Porquês para descobrir por que o ambiente permitiu a ocorrência.
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${
              tintedGlass ? 'aptis-glass-subcard border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-100'
            }`}>
              <h4 className={`font-bold flex items-center gap-2 mb-2 ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[11px]">3</span>
                Hierarquia de Soluções WCM
              </h4>
              <p className={`leading-relaxed text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                Auditoria de eficácia contra a falácia do &quot;re-treinamento&quot;:
              </p>
              <div className="mt-2 text-xs font-medium space-y-1">
                <div className={tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}>★ 1. Poka-Yoke Físico (Impossibilita o erro)</div>
                <div className={tintedGlass ? 'text-blue-300' : 'text-blue-700'}>★ 2. Engenharia / Automação / Sensores</div>
                <div className={tintedGlass ? 'text-amber-300' : 'text-amber-700'}>★ 3. Gestão Visual & OPL no Posto</div>
                <div className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>★ 4. Treinamento 4 Passos TWTTP</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investigations */}
        <div className={kpiCardClass}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Investigações
            </span>
            <div className={`p-2 rounded-xl ${
              tintedGlass ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black font-mono ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>{total}</span>
            <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>casos registrados</span>
          </div>
          <div className={`mt-3 pt-3 border-t flex items-center justify-between text-xs ${
            tintedGlass ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-600'
          }`}>
            <span>Ativas: <strong className={tintedGlass ? 'text-amber-300' : 'text-amber-600'}>{inProgress}</strong></span>
            <span>Eficazes: <strong className={tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}>{closedOrValidated}</strong></span>
          </div>
        </div>

        {/* Poka-Yoke & Engineering Ratio */}
        <div className={kpiCardClass}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Robustez Poka-Yoke
            </span>
            <div className={`p-2 rounded-xl ${
              tintedGlass ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-600'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black font-mono ${tintedGlass ? 'text-purple-300' : 'text-purple-600'}`}>{pokaYokeRatio}%</span>
            <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>ações estruturais</span>
          </div>
          <div className={`mt-3 pt-3 border-t flex items-center justify-between text-xs ${
            tintedGlass ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-600'
          }`}>
            <span>Poka-Yoke: <strong>{pokaYokeActions.length}</strong></span>
            <span>Apenas Treino: <strong>{trainingOnlyActions.length}</strong></span>
          </div>
        </div>

        {/* Recurrence Rate */}
        <div className={kpiCardClass}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Taxa de Reincidência
            </span>
            <div className={`p-2 rounded-xl ${
              recurrenceRate > 20
                ? (tintedGlass ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-600')
                : (tintedGlass ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600')
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black font-mono ${
              recurrenceRate > 20
                ? (tintedGlass ? 'text-rose-400' : 'text-rose-600')
                : (tintedGlass ? 'text-emerald-400' : 'text-emerald-600')
            }`}>
              {recurrenceRate}%
            </span>
            <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>reincidentes</span>
          </div>
          <div className={`mt-3 pt-3 border-t flex items-center justify-between text-xs ${
            tintedGlass ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-600'
          }`}>
            <span>Casos com reincidência: <strong>{recurrentInvestigations.length}</strong></span>
            <span className={`font-medium ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>Meta WCM &lt; 5%</span>
          </div>
        </div>

        {/* Loss Avoided / Impact */}
        <div className={kpiCardClass}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Perdas Mapeadas
            </span>
            <div className={`p-2 rounded-xl ${
              tintedGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-600'
            }`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              R$ {totalEstimatedLoss.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className={`mt-3 pt-3 border-t text-xs ${
            tintedGlass ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            Impacto financeiro direto mitigado pelas contra-medidas
          </div>
        </div>
      </div>

      {/* Middle Row: TWTTP Diagnostic Radar & HERCA Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TWTTP Gemba Assessment */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Diagnóstico TWTTP: Os 4 Pilares da Falha Humana
              </h3>
              <p className={`text-xs mt-0.5 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Percentual dos operadores que possuíam o preparo completo antes do evento
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>1. Sabia o Que Fazer? (Instrução do Padrão)</span>
                <span className={`font-bold ${tintedGlass ? 'text-indigo-300' : 'text-indigo-600'}`}>{twttpStats.knewWhat}%</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${tintedGlass ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${twttpStats.knewWhat}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>2. Sabia Como Fazer? (Habilidade Prática Gemba)</span>
                <span className={`font-bold ${twttpStats.knewHow < 50 ? (tintedGlass ? 'text-rose-400' : 'text-rose-600') : (tintedGlass ? 'text-indigo-300' : 'text-indigo-600')}`}>{twttpStats.knewHow}%</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${tintedGlass ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className={`h-full rounded-full transition-all duration-500 ${twttpStats.knewHow < 50 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${twttpStats.knewHow}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>3. Sabia o Porquê? (Consciência do Impacto/Risco)</span>
                <span className={`font-bold ${twttpStats.knewWhy < 50 ? (tintedGlass ? 'text-amber-300' : 'text-amber-600') : (tintedGlass ? 'text-indigo-300' : 'text-indigo-600')}`}>{twttpStats.knewWhy}%</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${tintedGlass ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${twttpStats.knewWhy}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>4. Tinha Condições de Executar? (Máquinas/Ergonomia/Layout)</span>
                <span className={`font-bold ${twttpStats.hadConditions < 50 ? (tintedGlass ? 'text-rose-400' : 'text-rose-600') : (tintedGlass ? 'text-emerald-400' : 'text-emerald-600')}`}>{twttpStats.hadConditions}%</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${tintedGlass ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className={`h-full rounded-full transition-all duration-500 ${twttpStats.hadConditions < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${twttpStats.hadConditions}%` }} />
              </div>
            </div>
          </div>

          <div className={`mt-5 p-3 rounded-xl border text-xs ${
            tintedGlass
              ? 'aptis-glass-subcard border-white/10 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <strong className={tintedGlass ? 'text-indigo-300' : 'text-indigo-600'}>Insight Gerencial TWTTP:</strong> Se o colaborador &quot;sabia o que&quot; mas não &quot;tinha condições&quot; ou não conhecia a prática no Gemba, o problema nunca foi desatenção, e sim deficiência de projeto ou método incompleto do líder.
          </div>
        </div>

        {/* HERCA Error Classification Pareto */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Pareto HERCA: Mecanismos de Falha Humana
              </h3>
              <p className={`text-xs mt-0.5 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
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
                    <span className={`font-medium ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
                    <span className={`font-semibold ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>{count} casos ({percent}%)</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${tintedGlass ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`mt-5 flex items-center justify-between text-xs pt-3 border-t ${
            tintedGlass ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <span>Metodologia: Rasmussen / Reason / WCM HERCA Model</span>
            <span className={`font-semibold ${tintedGlass ? 'text-purple-300' : 'text-purple-600'}`}>Total: {total} eventos</span>
          </div>
        </div>
      </div>

      {/* Sector Breakdown Table & Recent Critical Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Table (2 columns) */}
        <div className={`lg:col-span-2 ${cardClass}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                <Factory className={`w-4 h-4 ${tintedGlass ? 'text-indigo-400' : 'text-indigo-500'}`} />
                Matriz de Desempenho por Área / Setor Industrial
              </h3>
              <p className={`text-xs mt-0.5 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Visão consolidada para gerentes e supervisores de produção
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className={`border-b uppercase tracking-wider font-semibold ${
                  tintedGlass ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-500'
                }`}>
                  <th className="pb-3">Setor / Área</th>
                  <th className="pb-3 text-center">Investigações</th>
                  <th className="pb-3 text-center">Reincidências</th>
                  <th className="pb-3 text-center">Poka-Yokes Criados</th>
                  <th className="pb-3 text-right">Perda Mapeada</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${tintedGlass ? 'divide-white/10' : 'divide-slate-100'}`}>
                {sectors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Nenhum dado setorial registrado até o momento.
                    </td>
                  </tr>
                ) : (
                  sectors.map(([sectorName, data]) => (
                    <tr key={sectorName} className={`transition ${
                      tintedGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/50'
                    }`}>
                      <td className={`py-3 font-semibold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {sectorName}
                      </td>
                      <td className={`py-3 text-center font-bold font-mono ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                        {data.total}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono ${
                          data.recurrent > 0
                            ? (tintedGlass ? 'bg-rose-500/20 text-rose-300 border border-rose-500/35' : 'bg-rose-50 text-rose-600')
                            : (tintedGlass ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35' : 'bg-emerald-50 text-emerald-600')
                        }`}>
                          {data.recurrent}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono ${
                          tintedGlass
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/35'
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          {data.pokaYoke}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-semibold font-mono ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
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
        <div className={`${cardClass} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Casos Críticos Recentes
              </h3>
            </div>
            
            <div className="space-y-3">
              {investigations.slice(0, 3).map((inv) => (
                <div 
                  key={inv.id}
                  onClick={() => onSelectInvestigation(inv)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer group ${
                    tintedGlass
                      ? 'aptis-glass-subcard border-white/10 hover:border-indigo-400/50'
                      : 'border-slate-200 hover:border-indigo-400 hover:shadow-xs bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                      tintedGlass
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {inv.code}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      inv.severity === 'critical'
                        ? (tintedGlass ? 'bg-rose-500/20 text-rose-300 border border-rose-500/35' : 'bg-rose-100 text-rose-700')
                        : inv.severity === 'high'
                        ? (tintedGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35' : 'bg-amber-100 text-amber-700')
                        : (tintedGlass ? 'bg-blue-500/20 text-blue-300 border border-blue-500/35' : 'bg-blue-100 text-blue-700')
                    }`}>
                      {inv.severity}
                    </span>
                  </div>

                  <h4 className={`mt-2 text-xs font-bold transition line-clamp-1 ${
                    tintedGlass
                      ? 'text-white group-hover:text-indigo-300'
                      : 'text-slate-900 group-hover:text-indigo-600'
                  }`}>
                    {inv.title}
                  </h4>
                  
                  <p className={`mt-1 text-[11px] line-clamp-2 leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                    {inv.incidentDescription}
                  </p>

                  <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
                    tintedGlass ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span className="line-clamp-1 max-w-[130px]">{inv.sector}</span>
                    <div className="flex items-center gap-2">
                      {onOpenPdfReport && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPdfReport(inv);
                          }}
                          className={`hover:underline font-semibold flex items-center gap-0.5 cursor-pointer ${
                            tintedGlass ? 'text-purple-300' : 'text-purple-600'
                          }`}
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
                          className={`hover:underline font-semibold flex items-center gap-1 cursor-pointer ${
                            tintedGlass ? 'text-indigo-300' : 'text-indigo-600'
                          }`}
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

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
            tintedGlass ? 'border-white/10' : 'border-slate-100'
          }`}>
            <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>Gerenciamento Ativo</span>
            <button 
              onClick={onNewInvestigation}
              className={`font-bold hover:underline cursor-pointer ${tintedGlass ? 'text-indigo-300' : 'text-indigo-600'}`}
            >
              + Abrir Nova Investigação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

