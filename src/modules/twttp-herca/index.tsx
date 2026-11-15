'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BrainCircuit, 
  BarChart3, 
  FileSpreadsheet, 
  CheckSquare, 
  FileText, 
  Plus, 
  Sparkles,
  Layers,
  Printer,
  Cpu,
  CheckCircle2,
  ShieldAlert,
  Trash2,
  Building2
} from 'lucide-react';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { useTenant } from '@/context/tenant-context';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { HercaInvestigation, OnePointLesson, HercaAction } from './types';
import { INITIAL_HERCA_INVESTIGATIONS } from './mock-data';
import { HercaDashboard } from './components/HercaDashboard';
import { InvestigationList } from './components/InvestigationList';
import { InvestigationModal } from './components/InvestigationModal';
import { ActionPlanPanel } from './components/ActionPlanPanel';
import { OplModal } from './components/OplModal';
import { InvestigationPdfReportModal } from './components/InvestigationPdfReportModal';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';

export function TwttpHercaModule() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'investigations' | 'actions' | 'opls'>('dashboard');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [tintedGlass, setTintedGlass] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('aptis_tinted_glass_mode');
    if (saved !== null) {
      setTintedGlass(saved === 'true');
    }
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setTintedGlass(customEvent.detail);
    };
    window.addEventListener('aptis-glass-mode-change', handleModeChange);
    return () => window.removeEventListener('aptis-glass-mode-change', handleModeChange);
  }, []);

  const { currentTenant } = useTenant();
  const { sectors: plantSectors } = usePlantSectors();

  // Multi-tenant storage hook connected to Supabase + instant local cache
  const [investigations, setInvestigations] = useTenantStorage<HercaInvestigation[]>(
    'twttp-herca',
    'investigations',
    INITIAL_HERCA_INVESTIGATIONS
  );

  const safeInvestigations = Array.isArray(investigations) ? investigations : [];

  const availableSectors = useMemo(() => {
    const set = new Set<string>((plantSectors || []).map(s => s.name));
    safeInvestigations.forEach(i => {
      if (i && i.sector) set.add(i.sector);
    });
    return Array.from(set);
  }, [plantSectors, safeInvestigations]);

  const sectorFilteredInvestigations = useMemo(() => {
    if (selectedSector === 'all') return safeInvestigations;
    return safeInvestigations.filter(i => i && i.sector === selectedSector);
  }, [safeInvestigations, selectedSector]);

  // Modals state
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState<HercaInvestigation | null>(null);

  const [isOplModalOpen, setIsOplModalOpen] = useState(false);
  const [selectedOplInvestigation, setSelectedOplInvestigation] = useState<HercaInvestigation | null>(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdfInvestigation, setSelectedPdfInvestigation] = useState<HercaInvestigation | null>(null);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);

  const handleImportHercaExcel = (rows: Record<string, any>[]) => {
    const newInvs: HercaInvestigation[] = rows.map((row, idx) => {
      const id = `herca-imp-${Date.now()}-${idx}`;
      const code = `WCM-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`;
      const incidentDate = (row.failureDate || new Date().toISOString().split('T')[0]).trim();
      const sector = (row.sector || 'Usinagem CNC').trim();

      const actions: HercaAction[] = [];
      if (row.pokaYokeAction) {
        actions.push({
          id: `act-herca-${idx}`,
          investigationId: id,
          title: `Barreira Poka-Yoke: ${String(row.pokaYokeAction).trim()}`,
          what: String(row.pokaYokeAction).trim(),
          why: 'Eliminar a dependência de atenção humana no posto',
          who: 'Engenharia de Processos',
          where: sector,
          whenDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          how: 'Desenvolvimento e validação de dispositivo físico',
          hierarchy: 'poka_yoke',
          status: 'in_progress'
        });
      }

      return {
        id,
        code,
        title: (row.title || 'Desvio Operacional Investigado').trim(),
        incidentDate,
        shift: 'Turno A',
        sector,
        station: 'Posto de Trabalho',
        operatorName: 'Operador Envolvido',
        operatorExperienceMonths: 12,
        severity: 'medium',
        impactCategory: 'quality',
        estimatedLossReais: 1200,
        incidentDescription: (row.title || 'Desvio Operacional Investigado').trim(),
        immediateContainment: 'Bloqueio do lote e segregação para inspeção 100%.',
        status: 'under_investigation',
        leadInvestigator: 'Carlos Silveira',
        twttp: {
          knewWhat: true,
          knewWhatDetails: 'Treinado no procedimento padrão.',
          knewHow: true,
          knewHowDetails: 'Executava a rotina habitualmente.',
          knewWhy: true,
          knewWhyDetails: 'Ciente dos riscos de desvio.',
          hadConditions: false,
          hadConditionsDetails: 'Condição ergonômica ou ritmo acelerado propiciou distração.',
          leaderInstructionMethod: 3,
          leaderNotes: 'Revisão do método no Gemba realizada.'
        },
        hercaErrorType: 'slip',
        hercaSystemicFactors: ['Falta de barreira física Poka-Yoke', 'Gabarito simétrico'],
        fiveWhys: {
          why1: 'Operador realizou a etapa de forma invertida.',
          why2: 'A peça permite encaixe bidirecional sem bloqueio.',
          why3: 'Ausência de pino guia assimétrico (Poka-Yoke).',
          why4: 'Gabarito legado sem barreira física.',
          why5: 'Foco anterior apenas em instrução de trabalho e não em barreira à prova de tolos.',
          rootCauseCategory: 'Maquina',
          rootCauseStatement: 'Falta de barreira Poka-Yoke permitiu erro humano inadvertido.'
        },
        recurrenceCount: 1,
        createdAt: incidentDate,
        updatedAt: incidentDate,
        actions,
        opl: {
          id: `opl-${idx}`,
          investigationId: id,
          code: `OPL-${code}`,
          title: `Lição de Ponto Único: ${row.title || 'Bloqueio de Inversão'}`,
          area: sector,
          station: 'Operação',
          classification: 'trouble_case',
          problemScenario: (row.title || 'Falha humana na operação').trim(),
          standardPractice: (row.pokaYokeAction || 'Utilizar gabarito com bloqueio físico').trim(),
          keySafetyQualityPoint: 'Nunca forçar a peça sem conferir o batente guia.',
          whyItMatters: 'Zero refugo e garantia de montagem 100% conforme.',
          preparedBy: 'Carlos Silveira',
          approvedBy: 'Coordenação WCM',
          createdAt: incidentDate
        }
      };
    });

    setInvestigations((prev: HercaInvestigation[]) => [...newInvs, ...prev]);

    return {
      successCount: newInvs.length,
      message: `${newInvs.length} investigações e OPLs importadas com sucesso no módulo WCM!`
    };
  };

  // Handlers
  const handleOpenNewInvestigation = () => {
    setSelectedInvestigation(null);
    setIsInvestigationModalOpen(true);
  };

  const handleOpenEditInvestigation = (inv: HercaInvestigation) => {
    setSelectedInvestigation(inv);
    setIsInvestigationModalOpen(true);
  };

  const handleOpenOpl = (inv: HercaInvestigation) => {
    setSelectedOplInvestigation(inv);
    setIsOplModalOpen(true);
  };

  const handleOpenPdfReport = (inv: HercaInvestigation) => {
    setSelectedPdfInvestigation(inv);
    setIsPdfModalOpen(true);
  };

  const handleSaveInvestigation = (savedInv: HercaInvestigation) => {
    setInvestigations((prev: HercaInvestigation[]) => {
      const exists = prev.some((i: HercaInvestigation) => i.id === savedInv.id);
      if (exists) {
        return prev.map((i: HercaInvestigation) => (i.id === savedInv.id ? savedInv : i));
      } else {
        return [savedInv, ...prev];
      }
    });
  };

  const handleDeleteInvestigation = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta investigação de causa raiz?')) {
      setInvestigations((prev: HercaInvestigation[]) => prev.filter((i: HercaInvestigation) => i.id !== id));
    }
  };

  const handleUpdateActionStatus = (
    investigationId: string,
    actionId: string,
    newStatus: HercaAction['status'],
    isEffective?: boolean
  ) => {
    setInvestigations((prev: HercaInvestigation[]) =>
      prev.map((inv: HercaInvestigation) => {
        if (inv.id !== investigationId) return inv;
        const updatedActions = inv.actions.map((act: HercaAction) => {
          if (act.id !== actionId) return act;
          return {
            ...act,
            status: newStatus,
            isEffective: isEffective !== undefined ? isEffective : act.isEffective,
            completedDate: newStatus === 'completed' || newStatus === 'verified_effective' 
              ? act.completedDate || new Date().toISOString().split('T')[0] 
              : undefined,
            effectiveVerificationDate: newStatus === 'verified_effective' 
              ? new Date().toISOString().split('T')[0] 
              : act.effectiveVerificationDate,
          };
        });

        // Auto update investigation status if all actions are verified effective
        const allEffective = updatedActions.every((a: HercaAction) => a.status === 'verified_effective');
        const nextStatus = allEffective ? 'effective_validated' : inv.status;

        return {
          ...inv,
          actions: updatedActions,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Extract all OPLs for the OPLs tab
  const oplInvestigations = sectorFilteredInvestigations.filter((i: HercaInvestigation) => i && i.opl);
  const allActions = sectorFilteredInvestigations.flatMap((i: HercaInvestigation) => (i && Array.isArray(i.actions) ? i.actions : []));
  const pokaYokeActions = allActions.filter(a => a.hierarchy === 'poka_yoke' || a.hierarchy === 'engineering');
  const pokaYokeRatio = allActions.length > 0 ? Math.round((pokaYokeActions.length / allActions.length) * 100) : 0;
  const validatedInvestigations = sectorFilteredInvestigations.filter(i => i.status === 'effective_validated' || i.status === 'closed').length;

  return (
    <div className="space-y-6 w-full pb-12">
      {/* HEADER EXECUTIVO PADRÃO APTIS ROUTINE (4 SUB-CÁPSULAS DE KPIS) */}
      <div
        className={`rounded-3xl p-6 transition-all duration-300 ${
          tintedGlass
            ? 'aptis-glass-dark text-white'
            : 'aptis-glass-light bg-white border border-slate-200/90 shadow-xs text-slate-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                  tintedGlass
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                MÓDULO WCM & QUALIDADE
              </span>
              <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Unidade: {currentTenant?.name || 'Aptis Tecnologia (Admin Master)'}
                {selectedSector !== 'all' ? ` • Setor: ${selectedSector}` : ''}
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Aptis TWTTP & HERCA • Causa Raiz de Falha Humana
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Metodologia World Class Manufacturing para eliminação de falhas humanas: diagnóstico do método de instrução do líder (TWTTP), taxonomia científica do erro (HERCA), 5 Porquês, Poka-Yoke e emissão de Dossiê em PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {safeInvestigations.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Deseja limpar todas as investigações cadastradas nesta planta?')) {
                    setInvestigations([]);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  tintedGlass
                    ? 'text-slate-400 hover:text-rose-300 hover:bg-rose-500/10'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Casos
              </button>
            )}

            <button
              onClick={() => setIsExcelImporterOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                tintedGlass
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/35'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}
              title="Importar investigações de desvios e falhas do Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Importar Excel
            </button>

            <button
              onClick={handleOpenNewInvestigation}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Investigação
            </button>
          </div>
        </div>

        {/* 4 SUB-CÁPSULAS DE KPIS (Padrão Aptis Routine) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Total Investigações
              </span>
              <BrainCircuit className={`w-4 h-4 ${tintedGlass ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {sectorFilteredInvestigations.length}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${tintedGlass ? 'text-purple-300' : 'text-purple-600'}`}>
                Robustez Poka-Yoke
              </span>
              <Cpu className={`w-4 h-4 ${tintedGlass ? 'text-purple-400' : 'text-purple-500'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-purple-300' : 'text-purple-600'}`}>
              {pokaYokeRatio}%
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${tintedGlass ? 'text-cyan-300' : 'text-blue-600'}`}>
                Eficácia Validada
              </span>
              <CheckCircle2 className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-500'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-cyan-300' : 'text-blue-600'}`}>
              {validatedInvestigations}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${tintedGlass ? 'text-emerald-300' : 'text-emerald-600'}`}>
                Lições OPL Emitidas
              </span>
              <FileText className={`w-4 h-4 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-500'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {oplInvestigations.length}
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO ÓPTICA (APTIS-MENISCUS-TRACK) + CÁPSULA DE SETOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="aptis-meniscus-track inline-flex items-center gap-1 p-1.5 rounded-2xl overflow-x-auto max-w-full">
          {[
            { id: 'dashboard', label: 'Dashboard Executivo', icon: BarChart3 },
            { id: 'investigations', label: `Investigações (${sectorFilteredInvestigations.length})`, icon: FileSpreadsheet },
            { id: 'actions', label: `Plano 5W2H (${allActions.length})`, icon: CheckSquare },
            { id: 'opls', label: `Lições OPL (${oplInvestigations.length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'aptis-pill-active text-white font-bold'
                    : 'text-slate-300 hover:text-white font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cápsula de Filtro Global de Setor (Padrão Aptis Routine) */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs transition-all ${
            tintedGlass
              ? 'aptis-glass-dark text-white'
              : 'bg-white border border-slate-200/90 shadow-2xs text-slate-800'
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${tintedGlass ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
            ÁREA / SETOR:
          </span>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className={`font-bold bg-transparent outline-none cursor-pointer text-xs ${
              tintedGlass ? 'text-cyan-300' : 'text-slate-900'
            }`}
          >
            <option value="all" className="bg-slate-900 text-white">Todos os Setores</option>
            {availableSectors.map((sec) => (
              <option key={sec} value={sec} className="bg-slate-900 text-white">
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="w-full">
        {activeTab === 'dashboard' && (
          <HercaDashboard
            investigations={sectorFilteredInvestigations}
            onSelectInvestigation={handleOpenEditInvestigation}
            onNewInvestigation={handleOpenNewInvestigation}
            onOpenOpl={handleOpenOpl}
            onOpenPdfReport={handleOpenPdfReport}
            tintedGlass={tintedGlass}
          />
        )}

        {activeTab === 'investigations' && (
          <InvestigationList
            investigations={sectorFilteredInvestigations}
            onSelectInvestigation={handleOpenEditInvestigation}
            onNewInvestigation={handleOpenNewInvestigation}
            onOpenOpl={handleOpenOpl}
            onOpenPdfReport={handleOpenPdfReport}
            onDeleteInvestigation={handleDeleteInvestigation}
            tintedGlass={tintedGlass}
          />
        )}

        {activeTab === 'actions' && (
          <ActionPlanPanel
            investigations={sectorFilteredInvestigations}
            onUpdateActionStatus={handleUpdateActionStatus}
            onSelectInvestigation={handleOpenEditInvestigation}
            tintedGlass={tintedGlass}
          />
        )}

        {activeTab === 'opls' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-2xl flex items-center justify-between ${
              tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200 shadow-2xs'
            }`}>
              <div>
                <h3 className={`text-base font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                  Catálogo de Lições de Ponto Único (OPL / LPU)
                </h3>
                <p className={`text-xs mt-0.5 ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                  Padrões visuais gerados a partir de causas raízes para afixação nas máquinas e Skids
                </p>
              </div>
            </div>

            {oplInvestigations.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl ${
                tintedGlass ? 'aptis-glass-dark text-slate-400' : 'aptis-glass-light bg-white border border-slate-200 text-slate-400'
              }`}>
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <h4 className={`text-sm font-bold ${tintedGlass ? 'text-white' : 'text-slate-700'}`}>Nenhuma OPL gerada</h4>
                <p className={`text-xs mt-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                  Abra uma investigação e clique no botão &quot;Gerar OPL Automática&quot; na Etapa 4.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oplInvestigations.map((inv: HercaInvestigation) => {
                  const opl = inv.opl!;
                  return (
                    <div
                      key={opl.id}
                      onClick={() => handleOpenOpl(inv)}
                      className={`p-5 rounded-2xl transition cursor-pointer group flex flex-col justify-between ${
                        tintedGlass
                          ? 'aptis-glass-dark hover:border-purple-400/50'
                          : 'aptis-glass-light bg-white border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                            tintedGlass
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/35'
                              : 'text-purple-600 bg-purple-50 border-purple-200'
                          }`}>
                            {opl.code}
                          </span>
                          <span className={`text-[10px] uppercase font-bold ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                            {opl.area}
                          </span>
                        </div>

                        <h4 className={`text-sm font-bold transition line-clamp-2 ${
                          tintedGlass
                            ? 'text-white group-hover:text-purple-300'
                            : 'text-slate-900 group-hover:text-purple-600'
                        }`}>
                          {opl.title}
                        </h4>

                        <p className={`text-xs line-clamp-2 leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                          {opl.problemScenario}
                        </p>
                      </div>

                      <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                        tintedGlass ? 'border-white/10 text-purple-300' : 'border-slate-100 text-purple-600'
                      }`}>
                        <span>Ver e Imprimir Padrão</span>
                        <span>Posto: {opl.station}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Investigation Modal */}
      <InvestigationModal
        investigation={selectedInvestigation}
        isOpen={isInvestigationModalOpen}
        onClose={() => setIsInvestigationModalOpen(false)}
        onSave={handleSaveInvestigation}
        onOpenOpl={handleOpenOpl}
        onOpenPdfReport={handleOpenPdfReport}
        tintedGlass={tintedGlass}
      />

      {/* OPL Visual Viewer / Print Modal */}
      <OplModal
        investigation={selectedOplInvestigation}
        isOpen={isOplModalOpen}
        onClose={() => setIsOplModalOpen(false)}
        tintedGlass={tintedGlass}
      />

      {/* Professional PDF Report Dossier Modal */}
      <InvestigationPdfReportModal
        investigation={selectedPdfInvestigation}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        tenantName={currentTenant?.name}
        tintedGlass={tintedGlass}
      />

      {/* Modal de Importação de Excel Inteligente */}
      <SmartExcelImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        toolTitle={EXCEL_IMPORT_CONFIGS['twttp-herca'].toolTitle}
        subtitle={EXCEL_IMPORT_CONFIGS['twttp-herca'].subtitle}
        templateFilename={EXCEL_IMPORT_CONFIGS['twttp-herca'].templateFilename}
        columns={EXCEL_IMPORT_CONFIGS['twttp-herca'].columns}
        sampleRows={EXCEL_IMPORT_CONFIGS['twttp-herca'].sampleRows}
        onImport={handleImportHercaExcel}
      />
    </div>
  );
}
export default TwttpHercaModule;

