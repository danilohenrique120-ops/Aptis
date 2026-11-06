'use client';

import React, { useState } from 'react';
import { EmployeePdi } from '../types';
import {
  Compass,
  Target,
  Users,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Plus,
  Search,
  ArrowRight,
  Clock,
  FileSpreadsheet,
  Edit3,
  Trash2,
  FileCheck2,
  Building2,
  Sparkles,
  Award,
  Layers
} from 'lucide-react';

interface PdiDashboardProps {
  pdis: EmployeePdi[];
  tintedGlass?: boolean;
  onSelectPdi: (pdi: EmployeePdi) => void;
  onEditPdi: (pdi: EmployeePdi) => void;
  onDeletePdi: (pdiId: string) => void;
  onExportPdiPdf?: (pdi: EmployeePdi) => void;
  onOpenCreateModal: () => void;
  onOpenExcelImporter?: () => void;
}

type PdiStatusFilter = 'all' | 'high_readiness' | 'in_progress' | 'needs_attention';

export function PdiDashboard({
  pdis,
  tintedGlass = true,
  onSelectPdi,
  onEditPdi,
  onDeletePdi,
  onExportPdiPdf,
  onOpenCreateModal,
  onOpenExcelImporter
}: PdiDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState<PdiStatusFilter>('all');

  // Cálculos de KPIs
  const totalPdis = pdis.length;
  const avgProgress =
    totalPdis > 0
      ? Math.round(pdis.reduce((acc, p) => acc + p.progressPercent, 0) / totalPdis)
      : 0;

  const totalActions = pdis.reduce((acc, p) => acc + p.actions.length, 0);
  const completedActions = pdis.reduce(
    (acc, p) => acc + p.actions.filter(a => a.status === 'done').length,
    0
  );

  const totalCheckIns = pdis.reduce((acc, p) => acc + p.checkIns.length, 0);
  const highReadinessCount = pdis.filter(p => p.progressPercent >= 75).length;
  const needsAttentionCount = pdis.filter(p => p.progressPercent < 35).length;

  const departments = Array.from(new Set(pdis.map(p => p.department).filter(Boolean)));

  // Filtragem
  const filteredPdis = pdis.filter(pdi => {
    const matchesSearch =
      pdi.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdi.employeeRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdi.targetRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdi.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShift = selectedShift === 'all' || pdi.shift === selectedShift;
    const matchesDept = selectedDepartment === 'all' || pdi.department === selectedDepartment;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'high_readiness'
        ? pdi.progressPercent >= 75
        : statusFilter === 'needs_attention'
        ? pdi.progressPercent < 35
        : pdi.progressPercent >= 35 && pdi.progressPercent < 75;

    return matchesSearch && matchesShift && matchesDept && matchesStatus;
  });

  const filterTabs: {
    id: PdiStatusFilter;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    beadGradient: string;
    glowColor: string;
  }[] = [
    {
      id: 'all',
      label: 'Todos os PDIs',
      count: totalPdis,
      icon: Layers,
      beadGradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
      glowColor: 'rgba(6, 182, 212, 0.55)'
    },
    {
      id: 'in_progress',
      label: 'Em Evolução Ativa',
      count: pdis.filter(p => p.progressPercent >= 35 && pdiProgressInRange(p.progressPercent)).length,
      icon: TrendingUp,
      beadGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      glowColor: 'rgba(168, 85, 247, 0.55)'
    },
    {
      id: 'high_readiness',
      label: 'Prontos p/ Sucessão (≥75%)',
      count: highReadinessCount,
      icon: Award,
      beadGradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
      glowColor: 'rgba(16, 185, 129, 0.55)'
    },
    {
      id: 'needs_attention',
      label: 'Atenção / Início (<35%)',
      count: needsAttentionCount,
      icon: Sparkles,
      beadGradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      glowColor: 'rgba(245, 158, 11, 0.55)'
    }
  ];

  const activeTabInfo = filterTabs.find(t => t.id === statusFilter) || filterTabs[0];

  return (
    <div className="space-y-6 w-full">
      {/* 1. HEADER EXECUTIVO UNIFICADO COM 4 SUB-CÁPSULAS DE KPI (PADRÃO APTIS ROUTINE & 1:1) */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-500 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        {/* Orbe sutil de refração no canto superior direito */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none blur-[90px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(37, 99, 235, 0.85) 0%, rgba(6, 182, 212, 0.4) 60%, transparent 100%)'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  tintedGlass
                    ? 'bg-blue-500/20 text-cyan-300 border-cyan-400/35 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                Gestão de Pessoas & Carreira
              </span>
              <span
                className={`text-xs font-medium ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Metodologia 70-20-10 • Sucessão e Polivalência
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Compass className={`w-7 h-7 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
              Aptis PDI • Planos de Desenvolvimento Individual
            </h1>

            <p
              className={`text-xs sm:text-sm mt-1 max-w-3xl ${
                tintedGlass ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Estruture diagnósticos de competências, metas práticas de chão de fábrica (70-20-10),
              check-ins de evolução e dossiês executivos em PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenExcelImporter && (
              <button
                onClick={onOpenExcelImporter}
                className={`px-4 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                  tintedGlass
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-400/35 shadow-[0_0_18px_rgba(16,185,129,0.2)]'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-2xs'
                }`}
                title="Importar metas e PDIs de colaboradores do Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Importar Excel
              </button>
            )}

            <button
              onClick={onOpenCreateModal}
              className="px-5 py-2.5 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0 border border-white/25"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow:
                  '0 0 22px rgba(6, 182, 212, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
              }}
            >
              <Plus className="w-4 h-4" />
              Novo PDI de Colaborador
            </button>
          </div>
        </div>

        {/* 4 SUB-CÁPSULAS DE KPI INTEGRADAS AO HEADER */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-5 border-t ${
            tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
          }`}
        >
          {/* KPI 1: PDIs Ativos */}
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-xs font-semibold ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                PDIs Ativos
              </span>
              <Users className={`w-4 h-4 ${tintedGlass ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black font-mono ${
                  tintedGlass ? 'text-white' : 'text-slate-900'
                }`}
              >
                {totalPdis}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  tintedGlass ? 'text-cyan-300' : 'text-blue-600'
                }`}
              >
                {highReadinessCount} prontos p/ sucessão
              </span>
            </div>
          </div>

          {/* KPI 2: Evolução Média */}
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-xs font-semibold ${
                  tintedGlass ? 'text-cyan-300' : 'text-blue-600'
                }`}
              >
                Evolução Média
              </span>
              <TrendingUp
                className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-500'}`}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black font-mono ${
                  tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                }`}
              >
                {avgProgress}%
              </span>
              <span
                className={`text-[11px] font-medium ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                média global do time
              </span>
            </div>
          </div>

          {/* KPI 3: Ações 70-20-10 Concluídas */}
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-xs font-semibold ${
                  tintedGlass ? 'text-emerald-300' : 'text-emerald-600'
                }`}
              >
                Metas 70-20-10 Entregues
              </span>
              <CheckCircle2
                className={`w-4 h-4 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-500'}`}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black font-mono ${
                  tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
                }`}
              >
                {completedActions}
              </span>
              <span
                className={`text-[11px] font-mono ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                / {totalActions} ações práticas
              </span>
            </div>
          </div>

          {/* KPI 4: Check-ins Realizados */}
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-xs font-semibold ${
                  tintedGlass ? 'text-amber-300' : 'text-amber-600'
                }`}
              >
                Check-ins Realizados
              </span>
              <Calendar
                className={`w-4 h-4 ${tintedGlass ? 'text-amber-400' : 'text-amber-500'}`}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black font-mono ${
                  tintedGlass ? 'text-amber-400' : 'text-amber-600'
                }`}
              >
                {totalCheckIns}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                registros de evolução
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGAÇÃO MENISCUS LIQUID BEAD + CÁPSULA DE FILTRO DE SETOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative inline-flex items-center max-w-full">
          {/* Halo cromático atrás da barra Meniscus */}
          <div
            className="absolute -inset-1 rounded-full blur-xl opacity-35 pointer-events-none transition-all duration-500"
            style={{ background: activeTabInfo.beadGradient }}
          />

          <div className="aptis-meniscus-track relative flex items-center gap-1 p-1.5 rounded-full overflow-x-auto max-w-full">
            {filterTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    isActive ? 'text-white scale-[1.02]' : 'text-slate-400 hover:text-white'
                  }`}
                  style={
                    isActive
                      ? {
                          background: tab.beadGradient,
                          boxShadow: `0 0 22px ${tab.glowColor}, inset 0 1.5px 1px rgba(255, 255, 255, 0.65)`
                        }
                      : undefined
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-black/25 text-white' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cápsula Direita: Filtro Global de Área / Setor */}
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs transition-all ${
            tintedGlass
              ? 'aptis-glass-dark border-white/15 text-slate-200'
              : 'bg-white border-slate-200/90 text-slate-700 shadow-2xs'
          }`}
        >
          <Building2 className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span
            className={`text-[11px] font-extrabold uppercase tracking-wider ${
              tintedGlass ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Área / Setor:
          </span>
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className={`bg-transparent font-bold outline-none cursor-pointer pr-1 ${
              tintedGlass ? 'text-cyan-300' : 'text-cyan-700'
            }`}
          >
            <option value="all" className="bg-slate-900 text-white">
              Todos os Setores
            </option>
            {departments.map(dept => (
              <option key={dept} value={dept} className="bg-slate-900 text-white">
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. BARRA FINA DE BUSCA & FILTRO POR TURNO */}
      <div
        className={`rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all ${
          tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light'
        }`}
      >
        <div className="relative flex-1 w-full">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-2.5 ${
              tintedGlass ? 'text-slate-400' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar colaborador por nome, cargo atual, cargo alvo ou setor..."
            className={`w-full rounded-xl pl-10 pr-4 py-2 text-xs transition-all outline-none ${
              tintedGlass
                ? 'aptis-glass-input'
                : 'bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
            }`}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div
            className={`hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-medium border ${
              tintedGlass
                ? 'bg-white/[0.03] border-white/10 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
            <span>Passe o mouse nos cards para elevação óptica ou abra o Dossiê A4</span>
          </div>

          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs ${
              tintedGlass
                ? 'bg-white/[0.04] border-white/12 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>Turno:</span>
            <select
              value={selectedShift}
              onChange={e => setSelectedShift(e.target.value)}
              className={`bg-transparent font-bold outline-none cursor-pointer ${
                tintedGlass ? 'text-cyan-300' : 'text-blue-700'
              }`}
            >
              <option value="all" className="bg-slate-900 text-white">
                Todos os Turnos
              </option>
              <option value="Turno A" className="bg-slate-900 text-white">
                Turno A
              </option>
              <option value="Turno B" className="bg-slate-900 text-white">
                Turno B
              </option>
              <option value="Turno C" className="bg-slate-900 text-white">
                Turno C
              </option>
              <option value="Horário Central" className="bg-slate-900 text-white">
                Horário Central
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. QUADRO PRINCIPAL EM DUPLA CAMADA DE VIDRO COM CARDS INTERATIVOS DOS COLABORADORES */}
      <div
        className={`rounded-3xl p-5 transition-all duration-500 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            <h2
              className={`text-sm font-black uppercase tracking-wider ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              Trilhas Individuais de Carreira & Polivalência (70-20-10)
            </h2>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
              tintedGlass
                ? 'bg-white/10 text-slate-300'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {filteredPdis.length} colaborador(es) listado(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPdis.map(pdi => {
            const totalMetas = pdi.actions.length;
            const metasDone = pdi.actions.filter(a => a.status === 'done').length;
            const count70 = pdi.actions.filter(a => a.pillar === '70_practice').length;
            const count20 = pdi.actions.filter(a => a.pillar === '20_mentoring').length;
            const count10 = pdi.actions.filter(a => a.pillar === '10_courses').length;

            const lastCheckIn = pdi.checkIns.length > 0 ? pdi.checkIns[0] : null;
            const isHighReadiness = pdi.progressPercent >= 75;

            return (
              <div
                key={pdi.id}
                className={`rounded-2xl p-5 flex flex-col justify-between group space-y-4 transition-all duration-300 ${
                  tintedGlass
                    ? 'aptis-glass-subcard aptis-glass-subcard-interactive text-white'
                    : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 text-slate-900'
                }`}
              >
                {/* Topo do Card */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-base font-bold transition-colors ${
                            tintedGlass
                              ? 'text-white group-hover:text-cyan-300'
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                        >
                          {pdi.employeeName}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            tintedGlass
                              ? 'bg-white/10 text-slate-200 border-white/15'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {pdi.shift}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Atual:{' '}
                        <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>
                          {pdi.employeeRole}
                        </strong>{' '}
                        •{' '}
                        <span className={tintedGlass ? 'text-cyan-400 font-semibold' : 'text-blue-600 font-semibold'}>
                          {pdi.department}
                        </span>
                      </p>
                    </div>

                    {/* Evolução + Botões Editar e Excluir PDI */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                          isHighReadiness
                            ? tintedGlass
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tintedGlass
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {pdi.progressPercent}% Evolução
                      </span>
                      <button
                        type="button"
                        onClick={() => onEditPdi(pdi)}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/10'
                            : 'text-slate-400 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                        title="Editar dados gerais do PDI"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePdi(pdi.id)}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Excluir este PDI"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Objetivo Almejado */}
                  <div
                    className={`mt-3.5 p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                      tintedGlass
                        ? 'bg-slate-950/50 border-white/10'
                        : 'bg-slate-50/90 border-slate-200/80'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[10px] uppercase font-bold block ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Objetivo / Próximo Nível de Sucessão
                      </span>
                      <span
                        className={`font-bold flex items-center gap-1.5 mt-0.5 ${
                          tintedGlass ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        <Target
                          className={`w-3.5 h-3.5 ${
                            tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                          }`}
                        />
                        {pdi.targetRole}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                        tintedGlass
                          ? 'bg-white/5 text-cyan-300 border-white/10'
                          : 'bg-white text-blue-700 border-slate-200'
                      }`}
                    >
                      {pdi.cycleYear}
                    </span>
                  </div>

                  {/* Barra de Progresso Visual Halvo */}
                  <div className="mt-3.5 space-y-1.5">
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden ${
                        tintedGlass ? 'bg-slate-950/80 border border-white/5' : 'bg-slate-100'
                      }`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, pdi.progressPercent))}%`,
                          background: isHighReadiness
                            ? 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)'
                            : 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)',
                          boxShadow: isHighReadiness
                            ? '0 0 12px rgba(16, 185, 129, 0.5)'
                            : '0 0 12px rgba(6, 182, 212, 0.5)'
                        }}
                      />
                    </div>
                    <div
                      className={`flex justify-between text-[11px] ${
                        tintedGlass ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <span>
                        <strong className={tintedGlass ? 'text-white' : 'text-slate-800'}>
                          {metasDone}
                        </strong>{' '}
                        de {totalMetas} metas concluídas
                      </span>
                      <span className="font-mono">Prazo: {pdi.targetEndDate}</span>
                    </div>
                  </div>

                  {/* Distribuição 70-20-10 */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[10px]">
                    <span
                      className={`px-2.5 py-0.5 rounded-md border font-medium ${
                        tintedGlass
                          ? 'bg-blue-500/15 text-blue-300 border-blue-400/30'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      70% Prática: <strong>{count70}</strong>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md border font-medium ${
                        tintedGlass
                          ? 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      20% Mentoria: <strong>{count20}</strong>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md border font-medium ${
                        tintedGlass
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      10% Cursos: <strong>{count10}</strong>
                    </span>
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div
                  className={`pt-3.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                    tintedGlass ? 'border-white/10' : 'border-slate-100'
                  }`}
                >
                  <div
                    className={`text-[11px] flex items-center gap-1.5 ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {lastCheckIn ? `Último check-in: ${lastCheckIn.date}` : 'Sem check-in ainda'}
                  </div>

                  <div className="flex items-center gap-2">
                    {onExportPdiPdf && (
                      <button
                        type="button"
                        onClick={() => onExportPdiPdf(pdi)}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          tintedGlass
                            ? 'bg-white/[0.06] hover:bg-white/[0.12] text-cyan-300 border-cyan-400/30'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                        title="Visualizar Dossiê Inteligente e Baixar PDI em PDF"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        Dossiê PDF
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectPdi(pdi)}
                      className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                        boxShadow: '0 0 15px rgba(6, 182, 212, 0.35)'
                      }}
                    >
                      Ver PDI & Evolução
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPdis.length === 0 && (
          <div
            className={`p-12 text-center rounded-2xl border space-y-3 ${
              tintedGlass
                ? 'bg-slate-950/40 border-white/10 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <p className="text-sm">Nenhum colaborador encontrado com os filtros atuais.</p>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/20"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)'
              }}
            >
              Cadastrar Novo PDI
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function pdiProgressInRange(pct: number): boolean {
  return pct >= 35 && pct < 75;
}
