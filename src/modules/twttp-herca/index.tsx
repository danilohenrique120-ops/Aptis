'use client';

import React, { useState } from 'react';
import { 
  BrainCircuit, 
  BarChart3, 
  FileSpreadsheet, 
  CheckSquare, 
  FileText, 
  Plus, 
  Cloud, 
  RefreshCw,
  Sparkles,
  Layers,
  Printer
} from 'lucide-react';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { useTenant } from '@/context/tenant-context';
import { HercaInvestigation, OnePointLesson, HercaAction } from './types';
import { INITIAL_HERCA_INVESTIGATIONS } from './mock-data';
import { HercaDashboard } from './components/HercaDashboard';
import { InvestigationList } from './components/InvestigationList';
import { InvestigationModal } from './components/InvestigationModal';
import { ActionPlanPanel } from './components/ActionPlanPanel';
import { OplModal } from './components/OplModal';
import { InvestigationPdfReportModal } from './components/InvestigationPdfReportModal';

export function TwttpHercaModule() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'investigations' | 'actions' | 'opls'>('dashboard');

  const { currentTenant } = useTenant();

  // Multi-tenant storage hook connected to Supabase + instant local cache
  const [investigations, setInvestigations, isSynced] = useTenantStorage<HercaInvestigation[]>(
    'twttp-herca',
    'investigations',
    INITIAL_HERCA_INVESTIGATIONS
  );

  // Modals state
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState<HercaInvestigation | null>(null);

  const [isOplModalOpen, setIsOplModalOpen] = useState(false);
  const [selectedOplInvestigation, setSelectedOplInvestigation] = useState<HercaInvestigation | null>(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdfInvestigation, setSelectedPdfInvestigation] = useState<HercaInvestigation | null>(null);

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
  const oplInvestigations = investigations.filter((i: HercaInvestigation) => i.opl);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* HEADER DO MÓDULO (Padrão Oficial Aptis) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5" /> Qualidade & WCM
            </span>
            <span className="text-xs text-slate-500 font-medium">Planta: {currentTenant?.name || 'Planta Principal'}</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Cloud className="w-3 h-3" /> Nuvem Ativa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            Aptis TWTTP & HERCA • Investigação de Causa Raiz
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl mt-1">
            Metodologia World Class Manufacturing para eliminação de falhas humanas: diagnóstico do método de instrução do líder (TWTTP), taxonomia científica do erro (HERCA), 5 Porquês, Poka-Yoke e emissão de Dossiê em PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenNewInvestigation}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Investigação
          </button>
        </div>
      </div>

      {/* NAVEGAÇÃO POR ABAS (Padrão Oficial Aptis) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'dashboard', label: 'Dashboard Executivo', icon: BarChart3 },
          { id: 'investigations', label: `Investigações (${investigations.length})`, icon: FileSpreadsheet },
          { id: 'actions', label: `Plano 5W2H (${investigations.flatMap((i: HercaInvestigation) => i.actions).length})`, icon: CheckSquare },
          { id: 'opls', label: `Lições OPL (${oplInvestigations.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="w-full">
        {activeTab === 'dashboard' && (
          <HercaDashboard
            investigations={investigations}
            onSelectInvestigation={handleOpenEditInvestigation}
            onNewInvestigation={handleOpenNewInvestigation}
            onOpenOpl={handleOpenOpl}
            onOpenPdfReport={handleOpenPdfReport}
          />
        )}

        {activeTab === 'investigations' && (
          <InvestigationList
            investigations={investigations}
            onSelectInvestigation={handleOpenEditInvestigation}
            onNewInvestigation={handleOpenNewInvestigation}
            onOpenOpl={handleOpenOpl}
            onOpenPdfReport={handleOpenPdfReport}
            onDeleteInvestigation={handleDeleteInvestigation}
          />
        )}

        {activeTab === 'actions' && (
          <ActionPlanPanel
            investigations={investigations}
            onUpdateActionStatus={handleUpdateActionStatus}
            onSelectInvestigation={handleOpenEditInvestigation}
          />
        )}

        {activeTab === 'opls' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Catálogo de Lições de Ponto Único (OPL / LPU)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Padrões visuais gerados a partir de causas raízes para afixação nas máquinas e Skids
                </p>
              </div>
            </div>

            {oplInvestigations.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700">Nenhuma OPL gerada</h4>
                <p className="text-xs text-slate-500 mt-1">Abra uma investigação e clique no botão &quot;Gerar OPL Automática&quot; na Etapa 4.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oplInvestigations.map((inv: HercaInvestigation) => {
                  const opl = inv.opl!;
                  return (
                    <div
                      key={opl.id}
                      onClick={() => handleOpenOpl(inv)}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-purple-600 px-2 py-0.5 rounded-md bg-purple-50">
                            {opl.code}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            {opl.area}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition line-clamp-2">
                          {opl.title}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {opl.problemScenario}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-semibold">
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
      />

      {/* OPL Visual Viewer / Print Modal */}
      <OplModal
        investigation={selectedOplInvestigation}
        isOpen={isOplModalOpen}
        onClose={() => setIsOplModalOpen(false)}
      />

      {/* Professional PDF Report Dossier Modal */}
      <InvestigationPdfReportModal
        investigation={selectedPdfInvestigation}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        tenantName={currentTenant?.name}
      />
    </div>
  );
}
export default TwttpHercaModule;

