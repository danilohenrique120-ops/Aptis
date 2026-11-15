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
  tintedGlass?: boolean;
}

const statusConfig: Record<InvestigationStatus, { label: string; light: string; dark: string }> = {
  draft: { label: 'Rascunho', light: 'bg-slate-100 text-slate-700', dark: 'bg-slate-800 text-slate-300 border border-white/10' },
  under_investigation: { label: 'Em Investigação', light: 'bg-amber-100 text-amber-700', dark: 'bg-amber-500/20 text-amber-300 border border-amber-500/35' },
  actions_pending: { label: 'Ações em Execução', light: 'bg-blue-100 text-blue-700', dark: 'bg-blue-500/20 text-blue-300 border border-blue-500/35' },
  effective_validated: { label: 'Eficácia Comprovada', light: 'bg-emerald-100 text-emerald-700', dark: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35' },
  closed: { label: 'Encerrada', light: 'bg-purple-100 text-purple-700', dark: 'bg-purple-500/20 text-purple-300 border border-purple-500/35' },
};

const severityConfig: Record<SeverityLevel, { label: string; light: string; dark: string }> = {
  low: { label: 'Baixa', light: 'bg-slate-100 text-slate-700', dark: 'bg-slate-800 text-slate-300 border border-white/10' },
  medium: { label: 'Média', light: 'bg-blue-100 text-blue-700', dark: 'bg-blue-500/20 text-blue-300 border border-blue-500/35' },
  high: { label: 'Alta', light: 'bg-amber-100 text-amber-700', dark: 'bg-amber-500/20 text-amber-300 border border-amber-500/35' },
  critical: { label: 'Crítica', light: 'bg-rose-100 text-rose-700', dark: 'bg-rose-500/20 text-rose-300 border border-rose-500/35' },
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
  tintedGlass = false,
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

  const selectClass = tintedGlass
    ? 'px-2.5 py-1.5 aptis-glass-input rounded-lg text-white text-xs focus:outline-none'
    : 'px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none';

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className={`p-4 rounded-2xl space-y-4 ${
        tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código (ex: INV-2026-001), título, setor, operador ou investigador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl transition focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white placeholder-slate-400'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* New Investigation Button */}
          <button
            onClick={onNewInvestigation}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Investigação
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className={`flex flex-wrap items-center gap-3 pt-2 border-t text-xs ${
          tintedGlass ? 'border-white/10' : 'border-slate-100'
        }`}>
          <div className={`flex items-center gap-1.5 font-medium ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all" className="bg-slate-900 text-white">Todos os Status</option>
            <option value="draft" className="bg-slate-900 text-white">Rascunho</option>
            <option value="under_investigation" className="bg-slate-900 text-white">Em Investigação</option>
            <option value="actions_pending" className="bg-slate-900 text-white">Ações em Execução</option>
            <option value="effective_validated" className="bg-slate-900 text-white">Eficácia Comprovada</option>
            <option value="closed" className="bg-slate-900 text-white">Encerrada</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all" className="bg-slate-900 text-white">Todas as Severidades</option>
            <option value="low" className="bg-slate-900 text-white">Baixa</option>
            <option value="medium" className="bg-slate-900 text-white">Média</option>
            <option value="high" className="bg-slate-900 text-white">Alta</option>
            <option value="critical" className="bg-slate-900 text-white">Crítica</option>
          </select>

          {/* Sector Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all" className="bg-slate-900 text-white">Todos os Setores</option>
            {sectors.map(sec => (
              <option key={sec} value={sec} className="bg-slate-900 text-white">{sec}</option>
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
              className={`font-semibold hover:underline ml-auto cursor-pointer ${
                tintedGlass ? 'text-indigo-300' : 'text-indigo-600'
              }`}
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Investigations Table / Cards */}
      <div className="space-y-3">
        {filteredInvestigations.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl ${
            tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200'
          }`}>
            <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className={`text-base font-bold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
              Nenhuma investigação encontrada
            </h3>
            <p className={`text-xs mt-1 max-w-md mx-auto ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Tente alterar os termos de busca ou filtros aplicados, ou registre uma nova investigação de causa raiz.
            </p>
            <button
              onClick={onNewInvestigation}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Abrir Investigação
            </button>
          </div>
        ) : (
          filteredInvestigations.map((inv) => {
            const pokaCount = inv.actions.filter(a => a.hierarchy === 'poka_yoke').length;
            const completedActions = inv.actions.filter(a => a.status === 'completed' || a.status === 'verified_effective').length;
            const sCfg = statusConfig[inv.status] || statusConfig.under_investigation;
            const sevCfg = severityConfig[inv.severity] || severityConfig.medium;

            return (
              <div
                key={inv.id}
                onClick={() => onSelectInvestigation(inv)}
                className={`p-5 rounded-2xl transition cursor-pointer group ${
                  tintedGlass
                    ? 'aptis-glass-dark hover:border-indigo-400/50'
                    : 'aptis-glass-light bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                        tintedGlass
                          ? 'text-indigo-300 bg-indigo-500/20 border-indigo-500/35'
                          : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                      }`}>
                        {inv.code}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                        tintedGlass ? sCfg.dark : sCfg.light
                      }`}>
                        {sCfg.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                        tintedGlass ? sevCfg.dark : sevCfg.light
                      }`}>
                        Severidade {sevCfg.label}
                      </span>
                      {inv.recurrenceCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                          tintedGlass ? 'bg-rose-500/20 text-rose-300 border border-rose-500/35' : 'bg-rose-100 text-rose-700'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          Reincidência ({inv.recurrenceCount})
                        </span>
                      )}
                      <span className="text-slate-400">•</span>
                      <span className={`font-medium flex items-center gap-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(inv.incidentDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold transition ${
                      tintedGlass
                        ? 'text-white group-hover:text-indigo-300'
                        : 'text-slate-900 group-hover:text-indigo-600'
                    }`}>
                      {inv.title}
                    </h3>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                      {inv.incidentDescription}
                    </p>

                    <div className={`flex flex-wrap items-center gap-4 text-xs pt-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {inv.sector} • <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{inv.station}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Operador: {inv.operatorName} ({inv.operatorExperienceMonths}m exp.)
                      </span>
                      <span className={`font-semibold ${tintedGlass ? 'text-purple-300' : 'text-purple-600'}`}>
                        HERCA: {errorTypeLabels[inv.hercaErrorType]}
                      </span>
                    </div>
                  </div>

                  {/* Right Badges & Actions */}
                  <div className={`flex md:flex-col items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 ${
                    tintedGlass ? 'border-white/10' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      {pokaCount > 0 && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          tintedGlass
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/35'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          <Cpu className="w-3.5 h-3.5" />
                          {pokaCount} Poka-Yoke
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        tintedGlass ? 'bg-slate-800/80 text-slate-200 border border-white/10' : 'bg-slate-100 text-slate-700'
                      }`}>
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            tintedGlass
                              ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/35'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                          }`}
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            tintedGlass
                              ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/35'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Ver OPL
                        </button>
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                        tintedGlass
                          ? 'bg-white/10 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}>
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

