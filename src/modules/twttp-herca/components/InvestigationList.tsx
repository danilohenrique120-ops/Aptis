'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText, 
  Cpu, 
  ShieldAlert, 
  Printer, 
  ExternalLink,
  ChevronRight,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { HercaInvestigation, InvestigationStatus, SeverityLevel, ErrorClassificationType } from '../types';
import { usePlantSectors } from '@/hooks/use-plant-sectors';

interface InvestigationListProps {
  investigations: HercaInvestigation[];
  onSelectInvestigation: (inv: HercaInvestigation) => void;
  onNewInvestigation: () => void;
  onOpenOpl: (inv: HercaInvestigation) => void;
  onOpenPdfReport?: (inv: HercaInvestigation) => void;
  onDeleteInvestigation?: (id: string) => void;
}

const statusConfig: Record<InvestigationStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  under_investigation: { label: 'Em Investigação', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  actions_pending: { label: 'Ações em Execução', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  effective_validated: { label: 'Eficácia Comprovada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  closed: { label: 'Encerrada', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
};

const severityConfig: Record<SeverityLevel, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800' },
  medium: { label: 'Média', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950' },
  high: { label: 'Alta', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950' },
  critical: { label: 'Crítica', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950' },
};

const errorTypeLabels: Record<ErrorClassificationType, string> = {
  slip: 'Deslize (Atenção)',
  lapse: 'Lapso (Memória)',
  mistake_rule: 'Engano (Regra)',
  mistake_knowledge: 'Engano (Conhecimento)',
  system_induced_violation: 'Violação Sistêmica',
  ergonomic_overload: 'Sobrecarga Ergonômica',
};

export function InvestigationList({
  investigations,
  onSelectInvestigation,
  onNewInvestigation,
  onOpenOpl,
  onOpenPdfReport,
}: InvestigationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const { sectors: plantSectors } = usePlantSectors();
  // Setores unificados da planta e de casos cadastrados
  const sectors = Array.from(new Set([
    ...plantSectors.map(s => s.name),
    ...investigations.map(i => i.sector)
  ]));

  const filteredInvestigations = investigations.filter((inv) => {
    const matchesSearch = 
      inv.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.leadInvestigator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || inv.severity === severityFilter;
    const matchesSector = sectorFilter === 'all' || inv.sector === sectorFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesSector;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código (ex: INV-2026-001), título, setor, operador ou investigador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* New Investigation Button */}
          <button
            onClick={onNewInvestigation}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nova Investigação
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="under_investigation">Em Investigação</option>
            <option value="actions_pending">Ações em Execução</option>
            <option value="effective_validated">Eficácia Comprovada</option>
            <option value="closed">Encerrada</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">Todas as Severidades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>

          {/* Sector Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">Todos os Setores</option>
            {sectors.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          {(statusFilter !== 'all' || severityFilter !== 'all' || sectorFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setSeverityFilter('all');
                setSectorFilter('all');
                setSearchTerm('');
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline ml-auto"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Investigations Table / Cards */}
      <div className="space-y-3">
        {filteredInvestigations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Nenhuma investigação encontrada
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tente alterar os termos de busca ou filtros aplicados, ou registre uma nova investigação de causa raiz.
            </p>
            <button
              onClick={onNewInvestigation}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Abrir Investigação
            </button>
          </div>
        ) : (
          filteredInvestigations.map((inv) => {
            const pokaCount = inv.actions.filter(a => a.hierarchy === 'poka_yoke').length;
            const completedActions = inv.actions.filter(a => a.status === 'completed' || a.status === 'verified_effective').length;

            return (
              <div
                key={inv.id}
                onClick={() => onSelectInvestigation(inv)}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900">
                        {inv.code}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px] ${statusConfig[inv.status].color}`}>
                        {statusConfig[inv.status].label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${severityConfig[inv.severity].color}`}>
                        Severidade {severityConfig[inv.severity].label}
                      </span>
                      {inv.recurrenceCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Reincidência ({inv.recurrenceCount})
                        </span>
                      )}
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(inv.incidentDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {inv.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {inv.incidentDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {inv.sector} • <strong className="text-slate-700 dark:text-slate-300">{inv.station}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Operador: {inv.operatorName} ({inv.operatorExperienceMonths}m exp.)
                      </span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        HERCA: {errorTypeLabels[inv.hercaErrorType]}
                      </span>
                    </div>
                  </div>

                  {/* Right Badges & Actions */}
                  <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {pokaCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                          <Cpu className="w-3.5 h-3.5" />
                          {pokaCount} Poka-Yoke
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        Ações: {completedActions}/{inv.actions.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenPdfReport && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPdfReport(inv);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold transition flex items-center gap-1"
                          title="Emitir Dossiê em PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      )}
                      {inv.opl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOpl(inv);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Ver OPL
                        </button>
                      )}
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

