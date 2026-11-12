'use client';

import React, { useState } from 'react';
import { 
  Sector, 
  EmployeeSkillRecord, 
  SuccessionPlan, 
  SuccessionReadiness, 
  VacancyRisk, 
  PositionCategory 
} from '../types';
import { 
  UserCheck, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Trash2, 
  Search, 
  Filter, 
  Layers, 
  UserPlus, 
  GraduationCap, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface SuccessionMatrixPanelProps {
  sector: Sector;
  employees: EmployeeSkillRecord[];
  successionPlans: SuccessionPlan[];
  onAddSuccessionClick: () => void;
  onUpdateSuccession: (plan: SuccessionPlan) => void;
  onDeleteSuccession: (id: string) => void;
  tintedGlass?: boolean;
}

export function SuccessionMatrixPanel({
  sector,
  employees,
  successionPlans,
  onAddSuccessionClick,
  onUpdateSuccession,
  onDeleteSuccession,
  tintedGlass = false
}: SuccessionMatrixPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PositionCategory>('all');
  const [readinessFilter, setReadinessFilter] = useState<'all' | SuccessionReadiness>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'kanban'>('cards');

  // Planos exclusivos do setor ativo
  const sectorPlans = successionPlans.filter(p => p.sectorId === sector.id);

  // Filtros aplicados
  const filteredPlans = sectorPlans.filter(plan => {
    const matchesSearch = plan.keyPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.currentIncumbent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.successorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || plan.positionCategory === categoryFilter;
    const matchesReadiness = readinessFilter === 'all' || plan.readiness === readinessFilter;
    return matchesSearch && matchesCategory && matchesReadiness;
  });

  // Métricas do Pipeline
  const totalPositions = sectorPlans.length;
  const readyNowCount = sectorPlans.filter(p => p.readiness === 'ready_now').length;
  const mediumTermCount = sectorPlans.filter(p => p.readiness === 'ready_medium').length;
  const inDevCount = sectorPlans.filter(p => p.readiness === 'in_development').length;
  const noSuccessorCount = sectorPlans.filter(p => p.readiness === 'none').length;

  const avgReadinessScore = totalPositions > 0
    ? Math.round(sectorPlans.reduce((acc, p) => acc + p.readinessScore, 0) / totalPositions)
    : 0;

  const successionCoverageRate = totalPositions > 0
    ? Math.round(((totalPositions - noSuccessorCount) / totalPositions) * 100)
    : 0;

  // Helper para rótulos e cores
  const getReadinessBadge = (readiness: SuccessionReadiness) => {
    switch (readiness) {
      case 'ready_now':
        return {
          label: 'Pronto Imediato (0-3 meses)',
          shortLabel: 'Pronto Agora',
          badge: tintedGlass
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'ready_medium':
        return {
          label: 'Médio Prazo (3-12 meses)',
          shortLabel: '3-12 Meses',
          badge: tintedGlass
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'in_development':
        return {
          label: 'Em Formação (1-2 anos)',
          shortLabel: '1-2 Anos',
          badge: tintedGlass
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            : 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'none':
      default:
        return {
          label: 'Sem Sucessor (Risco Imediato)',
          shortLabel: 'Sem Sucessor',
          badge: tintedGlass
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            : 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500'
        };
    }
  };

  const getRiskBadge = (risk: VacancyRisk) => {
    switch (risk) {
      case 'critical':
        return {
          label: 'Risco Crítico',
          badge: tintedGlass
            ? 'bg-rose-500/25 text-rose-300 border-rose-500/40'
            : 'bg-rose-100 text-rose-800 border-rose-300'
        };
      case 'high':
        return {
          label: 'Risco Alto',
          badge: tintedGlass
            ? 'bg-orange-500/25 text-orange-300 border-orange-500/40'
            : 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'medium':
        return {
          label: 'Risco Médio',
          badge: tintedGlass
            ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
            : 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'low':
      default:
        return {
          label: 'Risco Baixo',
          badge: tintedGlass
            ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
    }
  };

  const getCategoryLabel = (category: PositionCategory) => {
    switch (category) {
      case 'leadership': return 'Liderança & Gestão';
      case 'technical_specialist': return 'Especialista Técnico';
      case 'critical_operator': return 'Operador Crítico';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Liderança Industrial & Sucessão */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 border ${
          tintedGlass
            ? 'aptis-glass-dark text-white border-white/10'
            : 'aptis-glass-light text-slate-900 border-slate-200 shadow-sm'
        }`}
      >
        <div
          className="absolute -top-16 -right-12 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.65) 0%, rgba(139, 92, 246, 0.25) 60%, transparent 75%)'
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              tintedGlass
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              <UserCheck className="w-3.5 h-3.5" />
              Governança de Sucessão & Continuidade Operacional
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Matriz de Sucessão: {sector.name}
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              &quot;Todo gestor de excelência mapeia e desenvolve o seu sucessor&quot;. Garanta que nenhuma ausência, promoção ou transição gere paradas na linha de produção.
            </p>
          </div>

          <button
            onClick={onAddSuccessionClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer shrink-0 self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Mapear Novo Sucessor
          </button>
        </div>
      </div>

      {/* KPI Cards do Pipeline de Sucessão */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className={`p-4 rounded-2xl border transition-all ${
          tintedGlass
            ? 'aptis-glass-dark text-white'
            : 'bg-white border-slate-200 shadow-xs text-slate-900'
        }`}>
          <div className={`flex items-center justify-between text-xs font-medium ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
            <span>Posições Mapeadas</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className={`text-2xl font-black mt-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>{totalPositions}</p>
          <span className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Cargos sob governança</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          tintedGlass
            ? 'aptis-glass-dark text-white'
            : 'bg-white border-slate-200 shadow-xs text-slate-900'
        }`}>
          <div className={`flex items-center justify-between text-xs font-medium ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <span>Prontos Imediatos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>{readyNowCount}</p>
          <span className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Prontos em 0 a 3 meses</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          tintedGlass
            ? 'aptis-glass-dark text-white'
            : 'bg-white border-slate-200 shadow-xs text-slate-900'
        }`}>
          <div className={`flex items-center justify-between text-xs font-medium ${tintedGlass ? 'text-amber-400' : 'text-amber-600'}`}>
            <span>Em Preparação</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${tintedGlass ? 'text-amber-400' : 'text-amber-600'}`}>{mediumTermCount + inDevCount}</p>
          <span className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>{mediumTermCount} médio / {inDevCount} longo</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          tintedGlass
            ? 'aptis-glass-dark text-white'
            : 'bg-white border-slate-200 shadow-xs text-slate-900'
        }`}>
          <div className={`flex items-center justify-between text-xs font-medium ${tintedGlass ? 'text-rose-400' : 'text-rose-600'}`}>
            <span>Sem Sucessor</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${tintedGlass ? 'text-rose-400' : 'text-rose-600'}`}>{noSuccessorCount}</p>
          <span className={`text-[11px] font-semibold ${tintedGlass ? 'text-rose-400' : 'text-rose-600'}`}>Gargalo de Liderança</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          tintedGlass
            ? 'aptis-glass-dark text-white'
            : 'bg-white border-slate-200 shadow-xs text-slate-900'
        }`}>
          <div className={`flex items-center justify-between text-xs font-medium ${tintedGlass ? 'text-indigo-400' : 'text-indigo-600'}`}>
            <span>Aptidão de Sucessão</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${tintedGlass ? 'text-indigo-400' : 'text-indigo-600'}`}>{avgReadinessScore}%</p>
          <span className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Cobertura: {successionCoverageRate}%</span>
        </div>
      </div>

      {/* Controles de Busca, Filtros & Alternância de Visualização */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
        tintedGlass
          ? 'aptis-glass-dark text-white'
          : 'bg-white border-slate-200 shadow-xs text-slate-900'
      }`}>
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cargo, gestor ou sucessor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                tintedGlass
                  ? 'aptis-glass-input text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className={`font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Categoria:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className={`px-2.5 py-1.5 rounded-lg text-xs cursor-pointer focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Todas as Categorias</option>
              <option value="leadership">Liderança & Gestão</option>
              <option value="technical_specialist">Especialistas Técnicos</option>
              <option value="critical_operator">Operadores Críticos</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className={`font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Prontidão:</span>
            <select
              value={readinessFilter}
              onChange={e => setReadinessFilter(e.target.value as any)}
              className={`px-2.5 py-1.5 rounded-lg text-xs cursor-pointer focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Todos os Status</option>
              <option value="ready_now">Pronto Imediato (0-3m)</option>
              <option value="ready_medium">Médio Prazo (3-12m)</option>
              <option value="in_development">Em Formação (1-2a)</option>
              <option value="none">Sem Sucessor</option>
            </select>
          </div>
        </div>

        <div className={`flex items-center gap-1 p-1 rounded-xl text-xs self-start md:self-auto ${
          tintedGlass ? 'aptis-meniscus-track' : 'bg-slate-100'
        }`}>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? tintedGlass
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-indigo-700 shadow-xs'
                : tintedGlass
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grade / Cards Detalhados
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? tintedGlass
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-indigo-700 shadow-xs'
                : tintedGlass
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pipeline por Prontidão
          </button>
        </div>
      </div>

      {/* Visualização 1: Cards Detalhados */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPlans.length === 0 ? (
            <div className={`col-span-full rounded-2xl border p-12 text-center ${
              tintedGlass ? 'aptis-glass-dark text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <UserCheck className={`w-12 h-12 mx-auto mb-3 ${tintedGlass ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-bold text-sm ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                Nenhum plano de sucessão encontrado para os filtros aplicados.
              </p>
              <p className="text-slate-400 text-xs mt-1">Cadastre os gestores e seus sucessores para proteger as operações de {sector.name}.</p>
              <button
                onClick={onAddSuccessionClick}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Mapear Primeiro Sucessor
              </button>
            </div>
          ) : (
            filteredPlans.map(plan => {
              const readinessInfo = getReadinessBadge(plan.readiness);
              const riskInfo = getRiskBadge(plan.vacancyRisk);

              return (
                <div 
                  key={plan.id}
                  className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                    tintedGlass
                      ? 'aptis-glass-dark hover:border-indigo-400/40 text-white'
                      : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md text-slate-900'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Cabeçalho do Card */}
                    <div className={`flex items-start justify-between gap-2 border-b pb-3 ${
                      tintedGlass ? 'border-white/10' : 'border-slate-100'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            tintedGlass
                              ? 'bg-white/10 text-slate-300 border-white/15'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {getCategoryLabel(plan.positionCategory)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskInfo.badge}`}>
                            {riskInfo.label}
                          </span>
                        </div>
                        <h3 className={`text-base font-black mt-1.5 flex items-center gap-2 ${
                          tintedGlass ? 'text-white' : 'text-slate-900'
                        }`}>
                          {plan.keyPosition}
                        </h3>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja remover o mapeamento de sucessão para ${plan.keyPosition}?`)) {
                            onDeleteSuccession(plan.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Remover plano de sucessão"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comparativo: Titular Atual vs Sucessor */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border ${
                      tintedGlass
                        ? 'aptis-glass-subcard border-white/10'
                        : 'bg-slate-50/70 border-slate-100'
                    }`}>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Titular / Gestor Atual:</span>
                        <p className={`font-bold text-xs mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                          {plan.currentIncumbent}
                        </p>
                        <span className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          {plan.currentIncumbentRole}
                        </span>
                      </div>

                      <div className={`sm:border-l sm:pl-3 ${tintedGlass ? 'sm:border-white/10' : 'sm:border-slate-200'}`}>
                        <span className={`text-[10px] font-bold uppercase block flex items-center gap-1 ${
                          tintedGlass ? 'text-indigo-400' : 'text-indigo-600'
                        }`}>
                          <UserCheck className="w-3 h-3" />
                          Sucessor Indicado:
                        </span>
                        <p className={`font-bold text-xs mt-0.5 ${
                          plan.readiness === 'none'
                            ? tintedGlass ? 'text-rose-400 italic' : 'text-rose-600 italic'
                            : tintedGlass ? 'text-white' : 'text-slate-900'
                        }`}>
                          {plan.successorName}
                        </p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${readinessInfo.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${readinessInfo.dot}`} />
                            {readinessInfo.shortLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Prontidão Técnica / Score */}
                    {plan.readiness !== 'none' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                            Índice de Aptidão para Assumir:
                          </span>
                          <span className={`font-bold ${tintedGlass ? 'text-indigo-400' : 'text-indigo-700'}`}>
                            {plan.readinessScore}%
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${tintedGlass ? 'bg-white/10' : 'bg-slate-100'}`}>
                          <div
                            className={`h-full rounded-full transition-all ${
                              plan.readinessScore >= 85 ? 'bg-emerald-500' :
                              plan.readinessScore >= 60 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${plan.readinessScore}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Gaps de Competência & PDI */}
                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          Gaps de Competência Identificados:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {plan.competencyGaps.map((gap, i) => (
                            <span 
                              key={i} 
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                                tintedGlass
                                  ? 'bg-white/10 text-slate-200 border-white/15'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              • {gap}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={`p-2.5 rounded-lg border text-[11px] ${
                        tintedGlass
                          ? 'bg-indigo-500/10 border-indigo-500/25 text-slate-200'
                          : 'bg-indigo-50/50 border-indigo-100 text-slate-700'
                      }`}>
                        <strong className={`block mb-0.5 flex items-center gap-1 ${
                          tintedGlass ? 'text-indigo-300' : 'text-indigo-900'
                        }`}>
                          <GraduationCap className={`w-3.5 h-3.5 ${tintedGlass ? 'text-indigo-400' : 'text-indigo-600'}`} />
                          Plano de Ação de Desenvolvimento (PDI):
                        </strong>
                        <p className={`leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                          {plan.developmentPlan}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card com Data e Ação Rápida */}
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                    tintedGlass ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Prontidão prevista: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-800'}>{plan.targetDate}</strong>
                    </span>

                    <button
                      onClick={() => {
                        // Ciclo rápido de prontidão
                        const order: SuccessionReadiness[] = ['none', 'in_development', 'ready_medium', 'ready_now'];
                        const nextIndex = (order.indexOf(plan.readiness) + 1) % order.length;
                        const nextReadiness = order[nextIndex];
                        const nextScore = nextReadiness === 'ready_now' ? 95 : nextReadiness === 'ready_medium' ? 70 : nextReadiness === 'in_development' ? 45 : 0;
                        onUpdateSuccession({
                          ...plan,
                          readiness: nextReadiness,
                          readinessScore: nextScore
                        });
                      }}
                      className={`inline-flex items-center gap-1 font-bold text-[11px] hover:underline cursor-pointer ${
                        tintedGlass ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                      }`}
                      title="Avançar status no pipeline"
                    >
                      <span>Avançar Prontidão</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Visualização 2: Pipeline Kanban por Nível de Prontidão */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Coluna 1: Sem Sucessor (Alerta) */}
          <div className={`rounded-xl p-3 border ${
            tintedGlass
              ? 'bg-rose-500/10 border-rose-500/25'
              : 'bg-rose-50/40 border-rose-200'
          }`}>
            <div className={`flex items-center justify-between mb-3 pb-2 border-b ${
              tintedGlass ? 'border-rose-500/25' : 'border-rose-200'
            }`}>
              <span className={`text-xs font-black flex items-center gap-1.5 ${
                tintedGlass ? 'text-rose-300' : 'text-rose-800'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Sem Sucessor (Risco)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                tintedGlass ? 'bg-rose-500/25 text-rose-200' : 'bg-rose-200 text-rose-900'
              }`}>
                {sectorPlans.filter(p => p.readiness === 'none').length}
              </span>
            </div>
            <div className="space-y-2.5">
              {sectorPlans.filter(p => p.readiness === 'none').map(plan => (
                <div key={plan.id} className={`p-3 rounded-lg border shadow-2xs space-y-1.5 ${
                  tintedGlass
                    ? 'bg-slate-900/70 border-rose-500/30 text-white'
                    : 'bg-white border-rose-200 text-slate-900'
                }`}>
                  <span className={`text-[10px] font-bold uppercase block ${tintedGlass ? 'text-rose-400' : 'text-rose-600'}`}>
                    {plan.keyPosition}
                  </span>
                  <p className={`text-xs font-bold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                    Titular: {plan.currentIncumbent}
                  </p>
                  <p className={`text-[11px] p-1.5 rounded border ${
                    tintedGlass
                      ? 'text-rose-200 bg-rose-500/15 border-rose-500/30'
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    Vulnerabilidade alta para a fábrica. Mapeie um sucessor.
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 2: Em Formação (1-2 anos) */}
          <div className={`rounded-xl p-3 border ${
            tintedGlass
              ? 'bg-blue-500/10 border-blue-500/25'
              : 'bg-blue-50/40 border-blue-200'
          }`}>
            <div className={`flex items-center justify-between mb-3 pb-2 border-b ${
              tintedGlass ? 'border-blue-500/25' : 'border-blue-200'
            }`}>
              <span className={`text-xs font-black flex items-center gap-1.5 ${
                tintedGlass ? 'text-blue-300' : 'text-blue-800'
              }`}>
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Em Formação (1-2a)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                tintedGlass ? 'bg-blue-500/25 text-blue-200' : 'bg-blue-200 text-blue-900'
              }`}>
                {sectorPlans.filter(p => p.readiness === 'in_development').length}
              </span>
            </div>
            <div className="space-y-2.5">
              {sectorPlans.filter(p => p.readiness === 'in_development').map(plan => (
                <div key={plan.id} className={`p-3 rounded-lg border shadow-2xs space-y-1.5 ${
                  tintedGlass
                    ? 'bg-slate-900/70 border-blue-500/30 text-white'
                    : 'bg-white border-blue-200 text-slate-900'
                }`}>
                  <span className={`text-[10px] font-bold uppercase block ${tintedGlass ? 'text-blue-400' : 'text-blue-700'}`}>
                    {plan.keyPosition}
                  </span>
                  <p className={`text-xs font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {plan.successorName}
                  </p>
                  <div className="text-[10px] text-slate-400">Substitui: {plan.currentIncumbent}</div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${tintedGlass ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${plan.readinessScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Médio Prazo (3-12 meses) */}
          <div className={`rounded-xl p-3 border ${
            tintedGlass
              ? 'bg-amber-500/10 border-amber-500/25'
              : 'bg-amber-50/40 border-amber-200'
          }`}>
            <div className={`flex items-center justify-between mb-3 pb-2 border-b ${
              tintedGlass ? 'border-amber-500/25' : 'border-amber-200'
            }`}>
              <span className={`text-xs font-black flex items-center gap-1.5 ${
                tintedGlass ? 'text-amber-300' : 'text-amber-800'
              }`}>
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                Médio Prazo (3-12m)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                tintedGlass ? 'bg-amber-500/25 text-amber-200' : 'bg-amber-200 text-amber-900'
              }`}>
                {sectorPlans.filter(p => p.readiness === 'ready_medium').length}
              </span>
            </div>
            <div className="space-y-2.5">
              {sectorPlans.filter(p => p.readiness === 'ready_medium').map(plan => (
                <div key={plan.id} className={`p-3 rounded-lg border shadow-2xs space-y-1.5 ${
                  tintedGlass
                    ? 'bg-slate-900/70 border-amber-500/30 text-white'
                    : 'bg-white border-amber-200 text-slate-900'
                }`}>
                  <span className={`text-[10px] font-bold uppercase block ${tintedGlass ? 'text-amber-400' : 'text-amber-700'}`}>
                    {plan.keyPosition}
                  </span>
                  <p className={`text-xs font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {plan.successorName}
                  </p>
                  <div className="text-[10px] text-slate-400">Substitui: {plan.currentIncumbent}</div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${tintedGlass ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${plan.readinessScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 4: Pronto Imediato (0-3 meses) */}
          <div className={`rounded-xl p-3 border ${
            tintedGlass
              ? 'bg-emerald-500/10 border-emerald-500/25'
              : 'bg-emerald-50/40 border-emerald-200'
          }`}>
            <div className={`flex items-center justify-between mb-3 pb-2 border-b ${
              tintedGlass ? 'border-emerald-500/25' : 'border-emerald-200'
            }`}>
              <span className={`text-xs font-black flex items-center gap-1.5 ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-800'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Pronto Imediato (0-3m)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                tintedGlass ? 'bg-emerald-500/25 text-emerald-200' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {sectorPlans.filter(p => p.readiness === 'ready_now').length}
              </span>
            </div>
            <div className="space-y-2.5">
              {sectorPlans.filter(p => p.readiness === 'ready_now').map(plan => (
                <div key={plan.id} className={`p-3 rounded-lg border shadow-2xs space-y-1.5 ${
                  tintedGlass
                    ? 'bg-slate-900/70 border-emerald-500/30 text-white'
                    : 'bg-white border-emerald-200 text-slate-900'
                }`}>
                  <span className={`text-[10px] font-bold uppercase block ${tintedGlass ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {plan.keyPosition}
                  </span>
                  <p className={`text-xs font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {plan.successorName}
                  </p>
                  <div className="text-[10px] text-slate-400">Substitui: {plan.currentIncumbent}</div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${tintedGlass ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${plan.readinessScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
