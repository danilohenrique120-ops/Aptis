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
}

export function SuccessionMatrixPanel({
  sector,
  employees,
  successionPlans,
  onAddSuccessionClick,
  onUpdateSuccession,
  onDeleteSuccession
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
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'ready_medium':
        return {
          label: 'Médio Prazo (3-12 meses)',
          shortLabel: '3-12 Meses',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'in_development':
        return {
          label: 'Em Formação (1-2 anos)',
          shortLabel: '1-2 Anos',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'none':
      default:
        return {
          label: 'Sem Sucessor (Risco Imediato)',
          shortLabel: 'Sem Sucessor',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500'
        };
    }
  };

  const getRiskBadge = (risk: VacancyRisk) => {
    switch (risk) {
      case 'critical':
        return { label: 'Risco Crítico', badge: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'high':
        return { label: 'Risco Alto', badge: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'medium':
        return { label: 'Risco Médio', badge: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'low':
      default:
        return { label: 'Risco Baixo', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              Governança de Sucessão & Continuidade Operacional
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Matriz de Sucessão: {sector.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              "Todo gestor de excelência mapeia e desenvolve o seu sucessor". Garanta que nenhuma ausência, promoção ou transição gere paradas na linha de produção.
            </p>
          </div>

          <button
            onClick={onAddSuccessionClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer shrink-0 self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Mapear Novo Sucessor
          </button>
        </div>
      </div>

      {/* KPI Cards do Pipeline de Sucessão */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Posições Mapeadas</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalPositions}</p>
          <span className="text-[11px] text-slate-500">Cargos sob governança</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
            <span>Prontos Imediatos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{readyNowCount}</p>
          <span className="text-[11px] text-slate-500">Prontos em 0 a 3 meses</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-medium">
            <span>Em Preparação</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{mediumTermCount + inDevCount}</p>
          <span className="text-[11px] text-slate-500">{mediumTermCount} médio / {inDevCount} longo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-medium">
            <span>Sem Sucessor</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{noSuccessorCount}</p>
          <span className="text-[11px] text-rose-600 font-semibold">Gargalo de Liderança</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 text-xs font-medium">
            <span>Aptidão de Sucessão</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">{avgReadinessScore}%</p>
          <span className="text-[11px] text-slate-500">Cobertura: {successionCoverageRate}%</span>
        </div>
      </div>

      {/* Controles de Busca, Filtros & Alternância de Visualização */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cargo, gestor ou sucessor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Categoria:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">Todas as Categorias</option>
              <option value="leadership">Liderança & Gestão</option>
              <option value="technical_specialist">Especialistas Técnicos</option>
              <option value="critical_operator">Operadores Críticos</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Prontidão:</span>
            <select
              value={readinessFilter}
              onChange={e => setReadinessFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="ready_now">Pronto Imediato (0-3m)</option>
              <option value="ready_medium">Médio Prazo (3-12m)</option>
              <option value="in_development">Em Formação (1-2a)</option>
              <option value="none">Sem Sucessor</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grade / Cards Detalhados
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
              viewMode === 'kanban' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-bold text-sm">Nenhum plano de sucessão encontrado para os filtros aplicados.</p>
              <p className="text-slate-400 text-xs mt-1">Cadastre os gestores e seus sucessores para proteger as operações de {sector.name}.</p>
              <button
                onClick={onAddSuccessionClick}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
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
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Cabeçalho do Card */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {getCategoryLabel(plan.positionCategory)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskInfo.badge}`}>
                            {riskInfo.label}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-1.5 flex items-center gap-2">
                          {plan.keyPosition}
                        </h3>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja remover o mapeamento de sucessão para ${plan.keyPosition}?`)) {
                            onDeleteSuccession(plan.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remover plano de sucessão"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comparativo: Titular Atual vs Sucessor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Titular / Gestor Atual:</span>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{plan.currentIncumbent}</p>
                        <span className="text-[11px] text-slate-500">{plan.currentIncumbentRole}</span>
                      </div>

                      <div className="sm:border-l sm:border-slate-200 sm:pl-3">
                        <span className="text-[10px] font-bold uppercase text-indigo-600 block flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Sucessor Indicado:
                        </span>
                        <p className={`font-bold text-xs mt-0.5 ${plan.readiness === 'none' ? 'text-rose-600 italic' : 'text-slate-900'}`}>
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
                          <span className="text-slate-500 font-semibold text-[11px]">
                            Índice de Aptidão para Assumir:
                          </span>
                          <span className="font-bold text-indigo-700">{plan.readinessScore}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Gaps de Competência Identificados:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {plan.competencyGaps.map((gap, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md border border-slate-200"
                            >
                              • {gap}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 text-[11px] text-slate-700">
                        <strong className="text-indigo-900 block mb-0.5 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                          Plano de Ação de Desenvolvimento (PDI):
                        </strong>
                        <p className="text-slate-600 leading-relaxed">{plan.developmentPlan}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card com Data e Ação Rápida */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Prontidão prevista: <strong>{plan.targetDate}</strong>
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
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-[11px] hover:underline cursor-pointer"
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
          <div className="bg-rose-50/40 rounded-xl p-3 border border-rose-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-200">
              <span className="text-xs font-black text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Sem Sucessor (Risco)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-xs font-bold">
                {sectorPlans.filter(p => p.readiness === 'none').length}
              </span>
            </div>
            <div className="space-y-2.5">
              {sectorPlans.filter(p => p.readiness === 'none').map(plan => (
                <div key={plan.id} className="bg-white p-3 rounded-lg border border-rose-200 shadow-2xs space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-600 uppercase block">{plan.keyPosition}</span>
                  <p className="text-xs font-bold text-slate-800">Titular: {plan.currentIncumbent}</p>
                  <p className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200">
                    Vulnerabilidade alta para a fábrica. Mapeie um sucessor.
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 2: Em Formação (1-2 anos) */}
          <div className="bg-blue-50/40 rounded-xl p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200">
              <span className="text-xs font-black text-blue-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Em Formação (1-2a)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 text-xs font-bold">
                {sectorPlans.filter(p => p.readiness === 'in_development').length}
              </span>
            </div>
            <div className="space-y-2.5">
              {sectorPlans.filter(p => p.readiness === 'in_development').map(plan => (
                <div key={plan.id} className="bg-white p-3 rounded-lg border border-blue-200 shadow-2xs space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">{plan.keyPosition}</span>
                  <p className="text-xs font-bold text-slate-900">{plan.successorName}</p>
                  <div className="text-[10px] text-slate-500">Substitui: {plan.currentIncumbent}</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${plan.readinessScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Médio Prazo (3-12 meses) */}
          <div className="bg-amber-50/40 rounded-xl p-3 border border-amber-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-200">
              <span className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Médio Prazo (3-12m)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
                {sectorPlans.filter(p => p.readiness === 'ready_medium').length}
              </span>
            </div>
            <div className="space-y-2.5">
              {sectorPlans.filter(p => p.readiness === 'ready_medium').map(plan => (
                <div key={plan.id} className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">{plan.keyPosition}</span>
                  <p className="text-xs font-bold text-slate-900">{plan.successorName}</p>
                  <div className="text-[10px] text-slate-500">Substitui: {plan.currentIncumbent}</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${plan.readinessScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 4: Pronto Imediato (0-3 meses) */}
          <div className="bg-emerald-50/40 rounded-xl p-3 border border-emerald-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200">
              <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Pronto Imediato (0-3m)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-bold">
                {sectorPlans.filter(p => p.readiness === 'ready_now').length}
              </span>
            </div>
            <div className="space-y-2.5">
              {sectorPlans.filter(p => p.readiness === 'ready_now').map(plan => (
                <div key={plan.id} className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">{plan.keyPosition}</span>
                  <p className="text-xs font-bold text-slate-900">{plan.successorName}</p>
                  <div className="text-[10px] text-slate-500">Substitui: {plan.currentIncumbent}</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
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
