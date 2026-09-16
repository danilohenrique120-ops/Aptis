'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sector, 
  SkillStation, 
  EmployeeSkillRecord, 
  SuccessionPlan, 
  SkillLevel,
  TrainingAction 
} from '../types';
import { IluoCircle } from './IluoCircle';
import { 
  Users, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Filter, 
  RefreshCw, 
  Layers, 
  UserCheck, 
  Sparkles, 
  Search,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Zap,
  Target
} from 'lucide-react';

interface SkillsDashboardPanelProps {
  sectors: Sector[];
  activeSector: Sector;
  stations: SkillStation[];
  employees: EmployeeSkillRecord[];
  successionPlans: SuccessionPlan[];
  trainingActions: TrainingAction[];
  onSelectSector: (sectorId: string) => void;
  onNavigateTab: (tab: 'matrix' | 'succession' | 'gap_analysis') => void;
}

export function SkillsDashboardPanel({
  sectors,
  activeSector,
  stations,
  employees,
  successionPlans,
  trainingActions,
  onSelectSector,
  onNavigateTab
}: SkillsDashboardPanelProps) {
  // Filtros múltiplos dinâmicos
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('current');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('all');
  const [selectedIluoFilter, setSelectedIluoFilter] = useState<string>('all');
  const [selectedStationRiskFilter, setSelectedStationRiskFilter] = useState<string>('all');
  const [selectedSuccessionFilter, setSelectedSuccessionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Escopo de Setores filtrado
  const scopedSectors = useMemo(() => {
    if (selectedSectorFilter === 'current') return [activeSector];
    if (selectedSectorFilter === 'all') return sectors;
    return sectors.filter(s => s.id === selectedSectorFilter);
  }, [selectedSectorFilter, activeSector, sectors]);

  const scopedSectorIds = useMemo(() => scopedSectors.map(s => s.id), [scopedSectors]);

  // 2. Operadores e Postos dentro do escopo
  const baseEmployees = useMemo(() => {
    return employees.filter(e => scopedSectorIds.includes(e.sectorId));
  }, [employees, scopedSectorIds]);

  const baseStations = useMemo(() => {
    return stations.filter(s => scopedSectorIds.includes(s.sectorId));
  }, [stations, scopedSectorIds]);

  const baseSuccessionPlans = useMemo(() => {
    return successionPlans.filter(p => scopedSectorIds.includes(p.sectorId));
  }, [successionPlans, scopedSectorIds]);

  // 3. Aplicação dos filtros dinâmicos cruzados
  const filteredEmployees = useMemo(() => {
    return baseEmployees.filter(emp => {
      // Filtro Turno
      if (selectedShiftFilter !== 'all' && emp.shift !== selectedShiftFilter) return false;

      // Filtro Busca
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = emp.employeeName.toLowerCase().includes(term) ||
          emp.role.toLowerCase().includes(term);
        if (!matches) return false;
      }

      // Filtro Nível ILUO dominante
      if (selectedIluoFilter !== 'all') {
        const targetLvl = Number(selectedIluoFilter);
        const hasSkillOfLevel = Object.values(emp.skills).some(lvl => lvl === targetLvl);
        if (!hasSkillOfLevel) return false;
      }

      return true;
    });
  }, [baseEmployees, selectedShiftFilter, searchTerm, selectedIluoFilter]);

  // 4. Cálculos e KPIs Dinâmicos
  const totalEmployeesCount = filteredEmployees.length;

  // Postos críticos analisados
  const stationAnalysis = useMemo(() => {
    return baseStations.map(st => {
      const qualifiedEmps = baseEmployees.filter(emp => (emp.skills[st.id] || 0) >= 3);
      const isUnderStaffed = qualifiedEmps.length < st.minOperatorsRequired;
      const deficit = Math.max(0, st.minOperatorsRequired - qualifiedEmps.length);
      return {
        station: st,
        qualifiedCount: qualifiedEmps.length,
        isUnderStaffed,
        deficit
      };
    });
  }, [baseStations, baseEmployees]);

  const filteredStations = useMemo(() => {
    if (selectedStationRiskFilter === 'critical') {
      return stationAnalysis.filter(s => s.isUnderStaffed);
    }
    if (selectedStationRiskFilter === 'healthy') {
      return stationAnalysis.filter(s => !s.isUnderStaffed);
    }
    return stationAnalysis;
  }, [stationAnalysis, selectedStationRiskFilter]);

  const criticalStationsCount = stationAnalysis.filter(s => s.isUnderStaffed).length;
  const stationsCoverageRate = baseStations.length > 0
    ? Math.round(((baseStations.length - criticalStationsCount) / baseStations.length) * 100)
    : 100;

  // Polivalência multifuncional (operadores aptos em 2 ou mais postos com nível >= 3)
  const polyvalentEmployees = useMemo(() => {
    return filteredEmployees.filter(emp => {
      const qualified = Object.values(emp.skills).filter(lvl => lvl >= 3).length;
      return qualified >= 2;
    });
  }, [filteredEmployees]);

  const polyvalenceRate = totalEmployeesCount > 0
    ? Math.round((polyvalentEmployees.length / totalEmployeesCount) * 100)
    : 0;

  // Distribuição ILUO Geral
  const iluoDistribution = useMemo(() => {
    let n1 = 0;
    let n2 = 0;
    let n3 = 0;
    let n4 = 0;

    filteredEmployees.forEach(emp => {
      Object.values(emp.skills).forEach(lvl => {
        if (lvl === 1) n1++;
        if (lvl === 2) n2++;
        if (lvl === 3) n3++;
        if (lvl === 4) n4++;
      });
    });

    const total = n1 + n2 + n3 + n4;
    return {
      n1: { count: n1, pct: total > 0 ? Math.round((n1 / total) * 100) : 0 },
      n2: { count: n2, pct: total > 0 ? Math.round((n2 / total) * 100) : 0 },
      n3: { count: n3, pct: total > 0 ? Math.round((n3 / total) * 100) : 0 },
      n4: { count: n4, pct: total > 0 ? Math.round((n4 / total) * 100) : 0 },
      total
    };
  }, [filteredEmployees]);

  // Métricas de Sucessão
  const successionMetrics = useMemo(() => {
    const plans = baseSuccessionPlans;
    const total = plans.length;
    const readyNow = plans.filter(p => p.readiness === 'ready_now').length;
    const developing = plans.filter(p => p.readiness === 'ready_medium' || p.readiness === 'in_development').length;
    const unassigned = plans.filter(p => p.readiness === 'none').length;
    const coverage = total > 0 ? Math.round(((total - unassigned) / total) * 100) : 0;
    return { total, readyNow, developing, unassigned, coverage };
  }, [baseSuccessionPlans]);

  // Aptis Skills Score Geral (0 a 100)
  const aptisSkillsScore = useMemo(() => {
    if (baseStations.length === 0 && totalEmployeesCount === 0) return 100;
    // Ponderação: 40% Cobertura de Postos, 35% Polivalência, 25% Cobertura de Sucessão
    const score = Math.round(
      (stationsCoverageRate * 0.40) +
      (polyvalenceRate * 0.35) +
      (successionMetrics.coverage * 0.25)
    );
    return Math.min(100, Math.max(0, score));
  }, [stationsCoverageRate, polyvalenceRate, successionMetrics.coverage, baseStations.length, totalEmployeesCount]);

  // Reset de Filtros
  const handleResetFilters = () => {
    setSelectedSectorFilter('current');
    setSelectedShiftFilter('all');
    setSelectedIluoFilter('all');
    setSelectedStationRiskFilter('all');
    setSelectedSuccessionFilter('all');
    setSearchTerm('');
  };

  const isFiltered = selectedSectorFilter !== 'current' ||
    selectedShiftFilter !== 'all' ||
    selectedIluoFilter !== 'all' ||
    selectedStationRiskFilter !== 'all' ||
    selectedSuccessionFilter !== 'all' ||
    searchTerm !== '';

  return (
    <div className="space-y-6">
      {/* 1. BARRA DE FILTROS DINÂMICOS DO GESTOR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Filtros Dinâmicos de Gestão & Inteligência
              </h3>
              <p className="text-[11px] text-slate-500">
                Cruze dados de polivalência, turnos, gargalos de linha e plano de sucessão em tempo real.
              </p>
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3 h-3" />
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Filtro Setor */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Setor / Linha</label>
            <select
              value={selectedSectorFilter}
              onChange={e => setSelectedSectorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="current">Setor Ativo: {activeSector.code}</option>
              <option value="all">🏭 Fábrica Inteira (Todos os Setores)</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          {/* Filtro Turno */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Turno de Trabalho</label>
            <select
              value={selectedShiftFilter}
              onChange={e => setSelectedShiftFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Todos os Turnos</option>
              <option value="Turno A">Turno A (Manhã)</option>
              <option value="Turno B">Turno B (Tarde/Noite)</option>
              <option value="Turno C">Turno C (Madrugada)</option>
            </select>
          </div>

          {/* Filtro Nível ILUO */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Competência Dominante</label>
            <select
              value={selectedIluoFilter}
              onChange={e => setSelectedIluoFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Todas as Competências</option>
              <option value="4">N4 - Multiplicadores (O)</option>
              <option value="3">N3 - Autônomos (U)</option>
              <option value="2">N2 - Praticantes (L)</option>
              <option value="1">N1 - Aprendizes (I)</option>
            </select>
          </div>

          {/* Filtro Risco de Posto */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Risco dos Postos</label>
            <select
              value={selectedStationRiskFilter}
              onChange={e => setSelectedStationRiskFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Todos os Postos</option>
              <option value="critical">🔴 Apenas Gargalos (Abaixo do Mínimo)</option>
              <option value="healthy">🟢 Apenas Postos Cobertos</option>
            </select>
          </div>

          {/* Busca Rápida */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Busca Operador / Cargo</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por nome..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. PLACAR CENTRAL DO COCKPIT (APTIS SKILLS SCORE & METRICAS DE IMPACTO) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Score Principal de Aptidão Técnica */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Aptis Skills Score
              </span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {aptisSkillsScore}%
              </span>
              <span className="text-xs text-cyan-300 font-semibold">Índice Geral</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Prontidão técnica ponderada por cobertura de postos, índice de polivalência e pipeline de sucessão.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
            <span>Classificação:</span>
            <span className={`font-bold ${
              aptisSkillsScore >= 85 ? 'text-emerald-400' :
              aptisSkillsScore >= 70 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {aptisSkillsScore >= 85 ? '🟢 Fábrica Apta (Excelente)' :
               aptisSkillsScore >= 70 ? '🟡 Operação em Alerta' : '🔴 Risco de Parada'}
            </span>
          </div>
        </div>

        {/* Cobertura de Postos Críticos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Cobertura de Postos Críticos</span>
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stationsCoverageRate}%</span>
              <span className="text-xs text-slate-500">dos postos atendidos</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  stationsCoverageRate >= 90 ? 'bg-emerald-500' :
                  stationsCoverageRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${stationsCoverageRate}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Postos em Gargalo:</span>
            <span className={`font-bold ${criticalStationsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {criticalStationsCount} posto(s)
            </span>
          </div>
        </div>

        {/* Taxa de Polivalência Multifuncional */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
              <span>Taxa de Polivalência (2+ Postos)</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{polyvalenceRate}%</span>
              <span className="text-xs text-slate-500">do quadro ativo</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${polyvalenceRate}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Operadores Multifuncionais:</span>
            <span className="font-bold text-slate-900">{polyvalentEmployees.length} de {totalEmployeesCount}</span>
          </div>
        </div>

        {/* Governança de Sucessão */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-indigo-700 text-xs font-semibold">
              <span>Pipeline de Sucessão de Gestão</span>
              <UserCheck className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600">{successionMetrics.coverage}%</span>
              <span className="text-xs text-slate-500">de cobertura</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${successionMetrics.coverage}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Prontos Imediatos:</span>
            <span className="font-bold text-emerald-600">{successionMetrics.readyNow} liderança(s)</span>
          </div>
        </div>
      </div>

      {/* 3. DIAGNÓSTICO ILUO & GARGALOS OPERACIONAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Distribuição ILUO */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Distribuição da Força de Trabalho (ILUO)
              </h4>
              <span className="text-[11px] text-slate-500">Mapeamento em {iluoDistribution.total} avaliações</span>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {/* N4 Multiplicador */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <IluoCircle level={4} size={16} />
                  N4 - Multiplicador (Especialista Lean)
                </span>
                <span className="font-bold text-emerald-700">{iluoDistribution.n4.count} ({iluoDistribution.n4.pct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${iluoDistribution.n4.pct}%` }} />
              </div>
            </div>

            {/* N3 Autônomo */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-800 flex items-center gap-1.5">
                  <IluoCircle level={3} size={16} />
                  N3 - Autônomo (Pleno / Apto a Rodar)
                </span>
                <span className="font-bold text-blue-700">{iluoDistribution.n3.count} ({iluoDistribution.n3.pct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${iluoDistribution.n3.pct}%` }} />
              </div>
            </div>

            {/* N2 Praticante */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-800 flex items-center gap-1.5">
                  <IluoCircle level={2} size={16} />
                  N2 - Praticante (Sob Supervisão)
                </span>
                <span className="font-bold text-amber-700">{iluoDistribution.n2.count} ({iluoDistribution.n2.pct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${iluoDistribution.n2.pct}%` }} />
              </div>
            </div>

            {/* N1 Aprendiz */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <IluoCircle level={1} size={16} />
                  N1 - Aprendiz (Teoria / Em Integração)
                </span>
                <span className="font-bold text-slate-600">{iluoDistribution.n1.count} ({iluoDistribution.n1.pct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: `${iluoDistribution.n1.pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Postos em Alerta / Gargalos de Operação */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Gargalos de Linha & Postos Abaixo do Mínimo
                </h4>
                <span className="text-[11px] text-slate-500">
                  Postos sem operadores autônomos suficientes para garantir o plano de produção
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('gap_analysis')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Abrir Plano de Ação</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {stationAnalysis.filter(s => s.isUnderStaffed).length === 0 ? (
              <div className="p-6 text-center bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                <p className="font-bold text-xs">Todos os postos possuem operadores autônomos suficientes!</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">A linha está protegida contra paradas por falta de qualificação.</p>
              </div>
            ) : (
              stationAnalysis.filter(s => s.isUnderStaffed).map(item => (
                <div 
                  key={item.station.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-200 hover:bg-rose-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.station.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                        Déficit: -{item.deficit} operador(es)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Disponíveis: <strong>{item.qualifiedCount}</strong> autônomos / Mínimo exigido: <strong>{item.station.minOperatorsRequired}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateTab('gap_analysis')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Treinar Suporte
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. RESUMO DINÂMICO DOS OPERADORES FILTRADOS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              Quadro de Operadores Filtrados ({filteredEmployees.length} colaboradores)
            </h4>
            <span className="text-[11px] text-slate-500">Visão consolidada para tomada de decisão do gestor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('matrix')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Matriz Operacional Completa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Operador / Função</th>
                <th className="py-2.5 px-3">Setor</th>
                <th className="py-2.5 px-3">Turno</th>
                <th className="py-2.5 px-3">Postos Autônomos (N3+)</th>
                <th className="py-2.5 px-3">Status de Polivalência</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum colaborador encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredEmployees.slice(0, 10).map(emp => {
                  const autonomousCount = Object.values(emp.skills).filter(l => l >= 3).length;
                  const isMulti = autonomousCount >= 2;
                  const empSector = sectors.find(s => s.id === emp.sectorId);

                  return (
                    <tr key={emp.employeeId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{emp.employeeName}</div>
                        <span className="text-[11px] text-slate-400 font-normal">{emp.role}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {empSector?.code || 'Geral'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {emp.shift}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {autonomousCount} postos aptos
                      </td>
                      <td className="py-3 px-3">
                        {isMulti ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Multifuncional
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Especialista Único
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigateTab('matrix')}
                          className="text-blue-600 hover:text-blue-800 font-bold text-[11px] hover:underline cursor-pointer"
                        >
                          Ver na Matriz →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
