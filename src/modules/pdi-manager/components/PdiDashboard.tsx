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
  Filter, 
  ArrowRight, 
  Award,
  Clock,
  Sparkles,
  Building2
} from 'lucide-react';

interface PdiDashboardProps {
  pdis: EmployeePdi[];
  onSelectPdi: (pdi: EmployeePdi) => void;
  onOpenCreateModal: () => void;
}

export function PdiDashboard({
  pdis,
  onSelectPdi,
  onOpenCreateModal
}: PdiDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Cálculos de KPIs
  const totalPdis = pdis.length;
  const avgProgress = totalPdis > 0 
    ? Math.round(pdis.reduce((acc, p) => acc + p.progressPercent, 0) / totalPdis) 
    : 0;

  const totalActions = pdis.reduce((acc, p) => acc + p.actions.length, 0);
  const completedActions = pdis.reduce(
    (acc, p) => acc + p.actions.filter(a => a.status === 'done').length, 
    0
  );

  const totalCheckIns = pdis.reduce((acc, p) => acc + p.checkIns.length, 0);

  // Filtragem
  const filteredPdis = pdis.filter(pdi => {
    const matchesSearch = 
      pdi.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdi.employeeRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdi.targetRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdi.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShift = selectedShift === 'all' || pdi.shift === selectedShift;
    const matchesDept = selectedDepartment === 'all' || pdi.department === selectedDepartment;

    return matchesSearch && matchesShift && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              Gestão de Pessoas & Carreira
            </span>
            <span className="text-xs text-slate-400">Metodologia 70-20-10</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-purple-400" />
            Aptis PDI • Planos de Desenvolvimento Individual
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Estruture diagnósticos, metas de chão de fábrica e acompanhe a evolução prática dos seus colaboradores.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xl shadow-purple-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo PDI de Colaborador
        </button>
      </div>

      {/* KPI CARDS EXECUTIVOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de PDIs */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">PDIs Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalPdis}</span>
            <span className="text-[11px] text-purple-400 font-semibold">Colaboradores</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Planos de carreira em andamento</p>
        </div>

        {/* Taxa Média de Evolução */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Evolução Média</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{avgProgress}%</span>
            <span className="text-[11px] text-emerald-300 font-semibold">do time</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Conclusão de competências</p>
        </div>

        {/* Metas 70-20-10 Entregues */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Ações Concluídas</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400 font-mono">{completedActions}</span>
            <span className="text-[11px] text-slate-400 font-mono">/ {totalActions} metas</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Prática, mentoria e cursos</p>
        </div>

        {/* Check-ins de Acompanhamento */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Check-ins Realizados</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-300 font-mono">{totalCheckIns}</span>
            <span className="text-[11px] text-indigo-400 font-semibold">encontros</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Reuniões de feedback e alinhamento</p>
        </div>
      </div>

      {/* BARRA DE FILTROS & BUSCA */}
      <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por colaborador, cargo ou setor..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Todos os Turnos</option>
            <option value="Turno A">Turno A</option>
            <option value="Turno B">Turno B</option>
            <option value="Turno C">Turno C</option>
            <option value="Horário Central">Central</option>
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Todos os Setores</option>
            <option value="Usinagem CNC">Usinagem CNC</option>
            <option value="Estamparia & Prensas">Estamparia & Prensas</option>
            <option value="Linha de Montagem">Linha de Montagem</option>
          </select>
        </div>
      </div>

      {/* GRID DE CARDS DOS COLABORADORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredPdis.map((pdi) => {
          const totalMetas = pdi.actions.length;
          const metasDone = pdi.actions.filter(a => a.status === 'done').length;
          const count70 = pdi.actions.filter(a => a.pillar === '70_practice').length;
          const count20 = pdi.actions.filter(a => a.pillar === '20_mentoring').length;
          const count10 = pdi.actions.filter(a => a.pillar === '10_courses').length;

          const lastCheckIn = pdi.checkIns.length > 0 ? pdi.checkIns[0] : null;

          return (
            <div
              key={pdi.id}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 transition-all duration-200 shadow-md hover:shadow-purple-500/10 flex flex-col justify-between group space-y-4"
            >
              {/* Topo do Card */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                        {pdi.employeeName}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {pdi.shift}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Atual: <strong className="text-slate-300">{pdi.employeeRole}</strong> • {pdi.department}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    {pdi.progressPercent}% Evolução
                  </span>
                </div>

                {/* Objetivo Almejado */}
                <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Objetivo / Próximo Nível</span>
                    <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <Target className="w-3.5 h-3.5 text-purple-400" />
                      {pdi.targetRole}
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-400 font-mono">{pdi.cycleYear}</span>
                </div>

                {/* Barra de Progresso Visual */}
                <div className="mt-3 space-y-1">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, pdi.progressPercent))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{metasDone} de {totalMetas} metas concluídas</span>
                    <span>Prazo: {pdi.targetEndDate}</span>
                  </div>
                </div>

                {/* Distribuição 70-20-10 */}
                <div className="mt-3 flex items-center gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40">
                    70% Prática: <strong>{count70}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                    20% Mentoria: <strong>{count20}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                    10% Cursos: <strong>{count10}</strong>
                  </span>
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {lastCheckIn ? `Último check-in: ${lastCheckIn.date}` : 'Sem check-in ainda'}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPdi(pdi)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  Ver PDI & Evolução
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPdis.length === 0 && (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-slate-400 text-sm">Nenhum colaborador encontrado com os filtros atuais.</p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-colors"
          >
            Cadastrar Novo PDI
          </button>
        </div>
      )}
    </div>
  );
}
