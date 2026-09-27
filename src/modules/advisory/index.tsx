'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
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

  return (
    <div className="space-y-6 w-full pb-12">
      {/* HEADER DO MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Consultoria Empresarial & Governança B2B
            </span>
            <span className="text-xs text-slate-500 font-medium">Plataforma Aptis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            Aptis Advisory • Cabine de Comando & Gestão de Consultorias
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl mt-1">
            Governança completa para entregas de consultoria: radares de maturidade (Antes vs Depois), semáforo de gargalos no cliente, rastreamento de ROI financeiro e prestação de contas executiva.
          </p>
        </div>

        {/* Global Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsExecutiveReportOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            Relatório do Board (1-Click)
          </button>

          <button
            onClick={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente de Consultoria
          </button>
        </div>
      </div>

      {/* Client Active Selector Strip */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block leading-none">
              Cliente em Acompanhamento Ativo:
            </span>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.segment})
                  </option>
                ))}
              </select>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                {activeClient?.status === 'active' ? 'Contrato Ativo' : 'Concluído'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSponsorPortalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Simular Visão do Sponsor (CEO)
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>MRR Consultoria</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-xs text-slate-500 font-medium">{clients.length} clientes na carteira</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Progresso Físico</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{progressPercent}%</div>
          <span className="text-xs text-slate-500 font-medium">
            {completedDeliverables} de {clientDeliverables.length} entregas feitas
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>ROI Comprovado</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {(totalVerifiedSavings / (activeClient?.totalContractValue || 1)).toFixed(1)}x
          </div>
          <span className="text-xs text-slate-500 font-medium">Retorno sobre honorários</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Maturidade Atual</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-2">
            {currentMaturityAvg.toFixed(1)}{' '}
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Iniciou em {initialMaturityAvg.toFixed(1)} pts
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Bloqueios no Cliente</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              blockedDeliverables > 0 ? 'text-amber-600' : 'text-slate-800'
            }`}
          >
            {blockedDeliverables} {blockedDeliverables === 1 ? 'Ação' : 'Ações'}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {blockedDeliverables > 0 ? 'Aguardando validação interna' : 'Tudo fluindo no prazo'}
          </span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { key: 'cockpit', label: 'Cockpit Geral', icon: Activity },
          { key: 'clients', label: 'Clientes & Contratos', icon: Building2, count: clients.length },
          {
            key: 'roadmap',
            label: 'Roadmap & Entregáveis',
            icon: Layers,
            count: clientDeliverables.length,
          },
          { key: 'radar', label: 'Radar de Maturidade', icon: TrendingUp },
          { key: 'roi', label: 'Impacto & ROI Financeiro', icon: DollarSign, count: clientGains.length },
          { key: 'reports', label: 'Governança & Rituais', icon: FileCheck, count: clientMeetings.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Cockpit Geral */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          {/* 3 Action Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setIsRadarModalOpen(true)}
              className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 border border-indigo-200/80 hover:border-indigo-400 hover:shadow-md transition cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-indigo-700 px-2.5 py-0.5 rounded-full bg-indigo-100 border border-indigo-200">
                  DIAGNÓSTICO
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition">
                Radar de Maturidade (Antes vs Depois)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visualize a evolução da empresa em Governança, Processos, Pessoas e Indicadores. Nota
                média subiu de {initialMaturityAvg.toFixed(1)} para {currentMaturityAvg.toFixed(1)}.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('roadmap')}
              className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-teal-50/40 border border-blue-200/80 hover:border-blue-400 hover:shadow-md transition cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-200">
                  CRONOGRAMA
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                Roadmap de Entregas & Semáforo de Gargalos
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Acompanhe o andamento das 4 fases da consultoria e identifique entregas travadas
                aguardando validação do cliente.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('roi')}
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200">
                  RETORNO
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                Rastreamento de Ganhos Financeiros & ROI
              </h3>
              <p className="text-xs text-slate-500 mt-1">
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
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Entregáveis em Andamento no Mês</h3>
                </div>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
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
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs shadow-2xs"
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
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
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
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Rituais de Governança & Atas</h3>
                </div>
                <button
                  onClick={() => setIsExecutiveReportOpen(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
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
                      <span className="text-indigo-700 font-semibold">
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
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {cli.segment}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1.5">{cli.name}</h4>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        CNPJ: {cli.cnpj}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 font-mono block">
                        {cli.contractValueMonthly.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                        <span className="text-[10px] text-slate-500 font-normal">/mês</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mt-1">
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
                      <strong className="text-blue-700 block">{cli.consultantLead}</strong>
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
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
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
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
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
                    <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Atual: {pillar.currentScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">{pillar.description}</p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                  <strong className="text-indigo-800 font-bold block mb-0.5">
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
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
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
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                    <span className="text-[11px] font-bold text-amber-900 block">
                      Decisões Estratégicas Acordadas / Pendentes:
                    </span>
                    <ul className="list-disc pl-4 text-xs text-amber-950 space-y-0.5">
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
    </div>
  );
};

export default AdvisoryModule;
