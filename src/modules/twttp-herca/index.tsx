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
  CloudCheck, 
  RefreshCw,
  Sparkles,
  Layers
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
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 text-slate-800 dark:text-slate-100">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Aptis TWTTP & HERCA
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  WCM Root Cause
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                Investigação de Falha Humana • 4 Perguntas Gemba • 5 Porquês • Poka-Yoke & OPL
              </p>
            </div>
          </div>

          {/* Tenant & Cloud Sync Badge */}
          <div className="flex items-center gap-3 text-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Cliente: <strong className="font-bold">{currentTenant?.name || 'Planta Principal'}</strong></span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-100 dark:border-indigo-900">
              {isSynced ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Nuvem Sincronizada</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>Sincronizando Nuvem...</span>
                </>
              )}
            </div>

            <button
              onClick={handleOpenNewInvestigation}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Nova Investigação
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-100 dark:border-slate-800/60 text-xs font-semibold">
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
                className={`py-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <HercaDashboard
            investigations={investigations}
            onSelectInvestigation={handleOpenEditInvestigation}
            onNewInvestigation={handleOpenNewInvestigation}
            onOpenOpl={handleOpenOpl}
          />
        )}

        {activeTab === 'investigations' && (
          <InvestigationList
            investigations={investigations}
            onSelectInvestigation={handleOpenEditInvestigation}
            onNewInvestigation={handleOpenNewInvestigation}
            onOpenOpl={handleOpenOpl}
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
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Catálogo de Lições de Ponto Único (OPL / LPU)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Padrões visuais gerados a partir de causas raízes para afixação nas máquinas e Skids
                </p>
              </div>
            </div>

            {oplInvestigations.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma OPL gerada</h4>
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
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950">
                            {opl.code}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            {opl.area}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
                          {opl.title}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {opl.problemScenario}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
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
      </main>

      {/* Investigation Modal */}
      <InvestigationModal
        investigation={selectedInvestigation}
        isOpen={isInvestigationModalOpen}
        onClose={() => setIsInvestigationModalOpen(false)}
        onSave={handleSaveInvestigation}
        onOpenOpl={handleOpenOpl}
      />

      {/* OPL Visual Viewer / Print Modal */}
      <OplModal
        investigation={selectedOplInvestigation}
        isOpen={isOplModalOpen}
        onClose={() => setIsOplModalOpen(false)}
      />
    </div>
  );
}
export default TwttpHercaModule;

