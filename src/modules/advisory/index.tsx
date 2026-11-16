'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Activity,
  Calculator,
  Eye,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';
import {
  ConsultingClient,
  MaturityPillar,
  ProjectDeliverable,
  FinancialImpactGain,
  GovernanceMeeting,
  DeliverableStatus,
} from './types';
import {
  INITIAL_ADVISORY_CLIENTS,
  INITIAL_MATURITY_PILLARS,
  INITIAL_DELIVERABLES,
  INITIAL_FINANCIAL_GAINS,
  INITIAL_GOVERNANCE_MEETINGS,
} from './mock-data';

import { MaturityRadarModal } from './components/MaturityRadarModal';
import { RoadmapDeliveryKanban } from './components/RoadmapDeliveryKanban';
import { RoiCalculatorPanel } from './components/RoiCalculatorPanel';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { SponsorPortalModal } from './components/SponsorPortalModal';
import { ClientContractModal } from './components/ClientContractModal';

export const AdvisoryModule: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'cockpit' | 'clients' | 'roadmap' | 'radar' | 'roi' | 'reports'
  >('cockpit');
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

  // Multi-tenant synced storage
  const [clients, setClients] = useTenantStorage<ConsultingClient[]>(
    'advisory',
    'clients',
    INITIAL_ADVISORY_CLIENTS
  );

  const [pillars, setPillars] = useTenantStorage<MaturityPillar[]>(
    'advisory',
    'maturity_pillars',
    INITIAL_MATURITY_PILLARS
  );

  const [deliverables, setDeliverables] = useTenantStorage<ProjectDeliverable[]>(
    'advisory',
    'deliverables',
    INITIAL_DELIVERABLES
  );

  const [financialGains, setFinancialGains] = useTenantStorage<FinancialImpactGain[]>(
    'advisory',
    'financial_gains',
    INITIAL_FINANCIAL_GAINS
  );

  const [meetings, setMeetings] = useTenantStorage<GovernanceMeeting[]>(
    'advisory',
    'meetings',
    INITIAL_GOVERNANCE_MEETINGS
  );

  // Active client selector
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || 'cli-adv-1'
  );

  // Modals state
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState(false);
  const [isSponsorPortalOpen, setIsSponsorPortalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ConsultingClient | null>(null);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);

  const handleImportAdvisoryExcel = (rows: Record<string, any>[]) => {
    const updatedClients = [...clients];
    const newDeliverables: ProjectDeliverable[] = rows.map((row, idx) => {
      const clientName = (row.clientName || 'Cliente de Consultoria').trim();
      let client = updatedClients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
      if (!client) {
        client = {
          id: `adv-client-${Date.now()}-${idx}`,
          name: clientName,
          tradeName: clientName,
          cnpj: '00.000.000/0001-00',
          segment: 'Manufatura',
          sponsorName: (row.responsiblePerson || 'Diretor de Operações').trim(),
          sponsorRole: 'Sponsor / CEO',
          sponsorEmail: 'contato@empresa.com.br',
          sponsorPhone: '(11) 98765-4321',
          consultantLead: 'Carlos Silveira',
          contractValueMonthly: 12500,
          totalContractValue: 75000,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          targetEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          inScopeSummary: ['Otimização de Linha', 'Governança WCM'],
          outOfScopeSummary: ['TI Legada'],
          clientTeam: [],
          projectGoal: (row.projectName || 'Programa de Transformação Operacional').trim()
        };
        updatedClients.push(client);
      }

      const rawStatus = (row.status || '').trim().toLowerCase();
      let status: DeliverableStatus = 'in_progress';
      if (rawStatus.includes('bloq') || rawStatus.includes('aguard')) status = 'blocked_by_client';
      else if (rawStatus.includes('conc') || rawStatus.includes('entreg')) status = 'completed';
      else if (rawStatus.includes('revis')) status = 'review';

      return {
        id: `del-imp-${Date.now()}-${idx}`,
        clientId: client.id,
        title: (row.milestoneTitle || 'Marco de Consultoria').trim(),
        phase: 'implantacao',
        status,
        responsibleConsultant: 'Carlos Silveira',
        responsibleClientPeer: (row.responsiblePerson || 'Ponto Focal do Cliente').trim(),
        dueDate: (row.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).trim(),
        deliverableSummary: `Entrega do pilar ${row.dimension || 'Operações'}`,
        clientBlockerReason: status === 'blocked_by_client' ? 'Aguardando validação interna do cliente' : undefined
      };
    });

    setClients(updatedClients);
    setDeliverables(prev => [...newDeliverables, ...prev]);

    return {
      successCount: newDeliverables.length,
      message: `${newDeliverables.length} entregáveis e marcos de consultoria importados com sucesso!`
    };
  };

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Calculations for active client
  const clientDeliverables = deliverables.filter((d) => d.clientId === selectedClientId);
  const clientGains = financialGains.filter((g) => g.clientId === selectedClientId);
  const clientMeetings = meetings.filter((m) => m.clientId === selectedClientId);

  const totalMRR = clients.reduce((acc, c) => acc + (c.contractValueMonthly || 0), 0);
  const totalVerifiedSavings = clientGains.reduce((acc, g) => acc + g.verifiedAmount, 0);

  const completedDeliverables = clientDeliverables.filter((d) => d.status === 'completed').length;
  const blockedDeliverables = clientDeliverables.filter(
    (d) => d.status === 'blocked_by_client'
  ).length;
  const progressPercent =
    clientDeliverables.length > 0
      ? Math.round((completedDeliverables / clientDeliverables.length) * 100)
      : 0;

  const initialMaturityAvg =
    pillars.reduce((a, b) => a + b.initialScore, 0) / (pillars.length || 1);
  const currentMaturityAvg =
    pillars.reduce((a, b) => a + b.currentScore, 0) / (pillars.length || 1);

  // Handlers
  const handleSaveDeliverable = (del: ProjectDeliverable) => {
    setDeliverables((prev) => {
      const idx = prev.findIndex((d) => d.id === del.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = del;
        return updated;
      }
      return [del, ...prev];
    });
  };

  const handleUpdateDeliverableStatus = (
    id: string,
    newStatus: DeliverableStatus,
    blockReason?: string
  ) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        return {
          ...d,
          status: newStatus,
          completionDate:
            newStatus === 'completed'
              ? new Date().toISOString().split('T')[0]
              : d.completionDate,
          blockedSince:
            newStatus === 'blocked_by_client'
              ? new Date().toISOString().split('T')[0]
              : undefined,
          blockReason: newStatus === 'blocked_by_client' ? blockReason : undefined,
        };
      })
    );
  };

  const handleSaveGain = (newGain: FinancialImpactGain) => {
    setFinancialGains((prev) => [newGain, ...prev]);
  };

  const handleSaveClient = (client: ConsultingClient) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      if (exists) {
        return prev.map((c) => (c.id === client.id ? client : c));
      }
      return [client, ...prev];
    });
    setSelectedClientId(client.id);
  };

  const roiMultiplier = (totalVerifiedSavings / (activeClient?.totalContractValue || 1)).toFixed(1);

  return (
    <div id="advisory-root" className="space-y-6 w-full pb-12">
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
                GOVERNANÇA B2B & CONSULTORIA EMPRESARIAL
              </span>
              <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Cliente Ativo: {activeClient?.name || 'Carteira B2B'} • Maturidade: {currentMaturityAvg.toFixed(1)}/5.0
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Aptis Advisory • Cabine de Comando & Gestão de Consultorias
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Governança completa para entregas de consultoria: radares de maturidade (Antes vs Depois), semáforo de gargalos no cliente, rastreamento de ROI financeiro e prestação de contas executiva.
            </p>
          </div>

          {/* Global Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsExcelImporterOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                tintedGlass
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/35'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}
              title="Importar entregáveis e marcos de consultoria do Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Importar Excel
            </button>

            <button
              onClick={() => setIsSponsorPortalOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                tintedGlass
                  ? 'bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              Portal do Sponsor
            </button>

            <button
              onClick={() => setIsExecutiveReportOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                tintedGlass
                  ? 'bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border-white/15'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              <FileText className={`w-4 h-4 ${tintedGlass ? 'text-blue-400' : 'text-blue-600'}`} />
              Relatório Board
            </button>

            <button
              onClick={() => {
                setEditingClient(null);
                setIsClientModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Novo Cliente
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
                MRR Consultoria ({clients.length})
              </span>
              <DollarSign className={`w-4 h-4 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
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
                Progresso Físico ({completedDeliverables}/{clientDeliverables.length})
              </span>
              <Activity className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-500'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {progressPercent}%
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
                ROI Comprovado
              </span>
              <Calculator className={`w-4 h-4 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-500'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {roiMultiplier}x
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
              <span className={`text-xs font-semibold ${
                blockedDeliverables > 0
                  ? (tintedGlass ? 'text-amber-300' : 'text-amber-600')
                  : (tintedGlass ? 'text-slate-300' : 'text-slate-500')
              }`}>
                Bloqueios no Cliente
              </span>
              <AlertTriangle className={`w-4 h-4 ${
                blockedDeliverables > 0 ? 'text-amber-400' : 'text-slate-400'
              }`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${
              blockedDeliverables > 0
                ? (tintedGlass ? 'text-amber-300' : 'text-amber-600')
                : (tintedGlass ? 'text-white' : 'text-slate-900')
            }`}>
              {blockedDeliverables}
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO ÓPTICA (APTIS-MENISCUS-TRACK) + CÁPSULA DE CLIENTE ATIVO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="aptis-meniscus-track inline-flex items-center gap-1 p-1.5 rounded-2xl overflow-x-auto max-w-full">
          {[
            { key: 'cockpit', label: 'Cockpit Geral', icon: Activity },
            { key: 'clients', label: `Clientes (${clients.length})`, icon: Building2 },
            { key: 'roadmap', label: `Roadmap (${clientDeliverables.length})`, icon: Layers },
            { key: 'radar', label: 'Radar de Maturidade', icon: TrendingUp },
            { key: 'roi', label: `ROI Financeiro (${clientGains.length})`, icon: DollarSign },
            { key: 'reports', label: `Governança (${clientMeetings.length})`, icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
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

        {/* Cápsula de Seletor de Cliente em Acompanhamento (Padrão Aptis Routine) */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs transition-all ${
            tintedGlass
              ? 'aptis-glass-dark text-white'
              : 'bg-white border border-slate-200/90 shadow-2xs text-slate-800'
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${tintedGlass ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
            CLIENTE ATIVO:
          </span>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className={`font-bold bg-transparent outline-none cursor-pointer text-xs ${
              tintedGlass ? 'text-cyan-300' : 'text-slate-900'
            }`}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name} ({c.segment})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CORPO PRINCIPAL COM SUPORTE DUAL-MODE */}
      <div className="advisory-body space-y-6">
        {/* Tab 1: Cockpit Geral */}
        {activeTab === 'cockpit' && (
          <div className="space-y-6">
            {/* 3 Action Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setIsRadarModalOpen(true)}
                className={`p-5 rounded-2xl transition cursor-pointer group ${
                  tintedGlass
                    ? 'aptis-glass-dark hover:border-indigo-400/50'
                    : 'aptis-glass-light bg-white border border-slate-200 hover:border-indigo-400 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    tintedGlass ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35' : 'text-indigo-700 bg-indigo-100 border-indigo-200'
                  }`}>
                    DIAGNÓSTICO
                  </span>
                </div>
                <h3 className={`text-sm font-bold transition ${tintedGlass ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-700'}`}>
                  Radar de Maturidade (Antes vs Depois)
                </h3>
                <p className={`text-xs mt-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                  Visualize a evolução da empresa em Governança, Processos, Pessoas e Indicadores. Nota
                  média subiu de {initialMaturityAvg.toFixed(1)} para {currentMaturityAvg.toFixed(1)}.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('roadmap')}
                className={`p-5 rounded-2xl transition cursor-pointer group ${
                  tintedGlass
                    ? 'aptis-glass-dark hover:border-blue-400/50'
                    : 'aptis-glass-light bg-white border border-slate-200 hover:border-blue-400 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    tintedGlass ? 'bg-blue-500/20 text-blue-300 border-blue-500/35' : 'text-blue-700 bg-blue-100 border-blue-200'
                  }`}>
                    CRONOGRAMA
                  </span>
                </div>
                <h3 className={`text-sm font-bold transition ${tintedGlass ? 'text-white group-hover:text-blue-300' : 'text-slate-900 group-hover:text-blue-700'}`}>
                  Roadmap de Entregas & Semáforo de Gargalos
                </h3>
                <p className={`text-xs mt-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                  Acompanhe o andamento das 4 fases da consultoria e identifique entregas travadas
                  aguardando validação do cliente.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('roi')}
                className={`p-5 rounded-2xl transition cursor-pointer group ${
                  tintedGlass
                    ? 'aptis-glass-dark hover:border-emerald-400/50'
                    : 'aptis-glass-light bg-white border border-slate-200 hover:border-emerald-400 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    tintedGlass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35' : 'text-emerald-700 bg-emerald-100 border-emerald-200'
                  }`}>
                    RETORNO
                  </span>
                </div>
                <h3 className={`text-sm font-bold transition ${tintedGlass ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                  Rastreamento de Ganhos Financeiros & ROI
                </h3>
                <p className={`text-xs mt-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                  {totalVerifiedSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}{' '}
                  em economias apuradas e validadas pelo cliente, blindando o contrato contra cancelamentos.
                </p>
              </div>
            </div>

            {/* Grid: Deliverables in Progress vs Client Blockers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Próximas Entregas em Curso */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-900">Entregáveis em Andamento no Mês</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`text-xs font-bold cursor-pointer ${tintedGlass ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    Ver Roadmap Completo →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {clientDeliverables
                    .filter((d) => d.status !== 'completed')
                    .slice(0, 4)
                    .map((del) => (
                      <div
                        key={del.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 transition flex items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{del.title}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Prazo: {del.dueDate} • Resp: {del.responsibleConsultant} /{' '}
                            {del.responsibleClientPeer}
                          </p>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                            del.status === 'blocked_by_client'
                              ? (tintedGlass ? 'bg-amber-500/20 text-amber-300 border-amber-500/35' : 'bg-amber-100 text-amber-800 border-amber-300')
                              : (tintedGlass ? 'bg-blue-500/20 text-blue-300 border-blue-500/35' : 'bg-blue-50 text-blue-700 border-blue-200')
                          }`}
                        >
                          {del.status === 'blocked_by_client' ? 'Aguardando Cliente' : 'Em Curso'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Rituais de Governança Recentes */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-900">Rituais de Governança & Atas</h3>
                  </div>
                  <button
                    onClick={() => setIsExecutiveReportOpen(true)}
                    className={`text-xs font-bold cursor-pointer ${tintedGlass ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-800'}`}
                  >
                    Gerar Laudo Executivo →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {clientMeetings.map((meet) => (
                    <div
                      key={meet.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col gap-1.5 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{meet.title}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {meet.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{meet.executiveSummary}</p>
                      <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{meet.attendees.length} participantes</span>
                        <span className={`font-semibold ${tintedGlass ? 'text-indigo-300' : 'text-indigo-700'}`}>
                          {meet.decisionsNeeded.length} decisões alinhadas
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clientes & Contratos */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Contratos de Consultoria Ativos ({clients.length})
              </h3>
              <button
                onClick={() => {
                  setEditingClient(null);
                  setIsClientModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-600/25 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Cliente Contratante
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((cli) => (
                <div
                  key={cli.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          tintedGlass ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {cli.segment}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1.5">{cli.name}</h4>
                        <span className="text-[11px] font-mono text-slate-500 block">
                          CNPJ: {cli.cnpj}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono block ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {cli.contractValueMonthly.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                          <span className="text-[10px] text-slate-500 font-normal">/mês</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${
                          tintedGlass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          Ativo
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      &quot;{cli.projectGoal}&quot;
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Patrocinador (CEO):
                        </span>
                        <strong className="text-slate-900 block">{cli.sponsorName}</strong>
                        <span className="text-[10px] text-slate-500">{cli.sponsorRole}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Consultor Líder:
                        </span>
                        <strong className={tintedGlass ? 'text-cyan-300 block' : 'text-blue-700 block'}>{cli.consultantLead}</strong>
                        <span className="text-[10px] text-slate-500">
                          Término: {cli.targetEndDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedClientId(cli.id);
                        setIsSponsorPortalOpen(true);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-50 text-slate-700 transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                      Portal do Sponsor
                    </button>

                    <button
                      onClick={() => {
                        setSelectedClientId(cli.id);
                        setActiveTab('roadmap');
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      Abrir Projeto <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Roadmap & Entregas */}
        {activeTab === 'roadmap' && (
          <RoadmapDeliveryKanban
            deliverables={deliverables}
            clients={clients}
            selectedClientId={selectedClientId}
            onSaveDeliverable={handleSaveDeliverable}
            onUpdateStatus={handleUpdateDeliverableStatus}
          />
        )}

        {/* Tab 4: Radar de Maturidade */}
        {activeTab === 'radar' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border mb-2 ${
                  tintedGlass ? 'bg-blue-500/20 text-blue-300 border-blue-500/35' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  Assessment Inicial vs Atual
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Evolução nos Pilares Metodológicos da Consultoria
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Demonstre para o cliente como a organização profissionalizou suas práticas nos eixos
                  estruturantes.
                </p>
              </div>

              <button
                onClick={() => setIsRadarModalOpen(true)}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
              >
                Abrir Radar Interativo & Editar Notas
              </button>
            </div>

            {/* Quick list of pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{pillar.name}</h4>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <span className="text-slate-400">Início: {pillar.initialScore.toFixed(1)}</span>
                      <span className={`px-2 py-0.5 rounded border ${
                        tintedGlass ? 'bg-blue-500/20 text-blue-300 border-blue-500/35' : 'text-blue-700 bg-blue-50 border-blue-200'
                      }`}>
                        Atual: {pillar.currentScore.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{pillar.description}</p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                    <strong className={`font-bold block mb-0.5 ${tintedGlass ? 'text-indigo-300' : 'text-indigo-800'}`}>
                      Evidência / Avanço Comprovado:
                    </strong>
                    {pillar.currentNotes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Impacto & ROI Financeiro */}
        {activeTab === 'roi' && (
          <RoiCalculatorPanel
            gains={financialGains}
            client={activeClient}
            onSaveGain={handleSaveGain}
          />
        )}

        {/* Tab 6: Governança & Rituais */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Rituais de Governança & Reuniões de Conselho
                </h3>
                <p className="text-xs text-slate-500">
                  Atas de alinhamento tático semanal e apresentações formais de resultados para a
                  diretoria.
                </p>
              </div>

              <button
                onClick={() => setIsExecutiveReportOpen(true)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
              >
                Gerar Relatório Executivo Mensal
              </button>
            </div>

            <div className="space-y-3">
              {clientMeetings.map((meet) => (
                <div
                  key={meet.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                        tintedGlass ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {meet.type === 'board_monthly'
                          ? 'Reunião com Conselho / Board'
                          : 'Status Report Semanal'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{meet.title}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {meet.date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {meet.executiveSummary}
                  </p>

                  {meet.decisionsNeeded.length > 0 && (
                    <div className={`p-3 rounded-xl border space-y-1 ${
                      tintedGlass ? 'bg-amber-950/35 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}>
                      <span className={`text-[11px] font-bold block ${tintedGlass ? 'text-amber-300' : 'text-amber-900'}`}>
                        Decisões Estratégicas Acordadas / Pendentes:
                      </span>
                      <ul className="list-disc pl-4 text-xs space-y-0.5">
                        {meet.decisionsNeeded.map((dec, i) => (
                          <li key={i}>{dec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <MaturityRadarModal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        pillars={pillars}
        onSavePillars={(p) => setPillars(p)}
        clientName={activeClient?.name || 'Cliente'}
      />

      {activeClient && (
        <ExecutiveReportModal
          isOpen={isExecutiveReportOpen}
          onClose={() => setIsExecutiveReportOpen(false)}
          client={activeClient}
          deliverables={deliverables}
          gains={financialGains}
          pillars={pillars}
        />
      )}

      <SponsorPortalModal
        isOpen={isSponsorPortalOpen}
        onClose={() => setIsSponsorPortalOpen(false)}
        client={activeClient}
        deliverables={deliverables}
        gains={financialGains}
      />

      <ClientContractModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSaveClient={handleSaveClient}
        editingClient={editingClient}
      />

      {/* Modal de Importação de Excel Inteligente */}
      <SmartExcelImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        toolTitle={EXCEL_IMPORT_CONFIGS['advisory'].toolTitle}
        subtitle={EXCEL_IMPORT_CONFIGS['advisory'].subtitle}
        templateFilename={EXCEL_IMPORT_CONFIGS['advisory'].templateFilename}
        columns={EXCEL_IMPORT_CONFIGS['advisory'].columns}
        sampleRows={EXCEL_IMPORT_CONFIGS['advisory'].sampleRows}
        onImport={handleImportAdvisoryExcel}
      />
    </div>
  );
};

export default AdvisoryModule;
