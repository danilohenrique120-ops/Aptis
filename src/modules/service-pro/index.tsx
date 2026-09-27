'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Calendar,
  Building2,
  QrCode,
  Sparkles,
  Smartphone,
  Layers,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  Printer,
  Eye,
  Activity,
  Cpu,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import {
  ClientContractor,
  Equipment,
  MasterCatalogItem,
  MaintenanceWorkOrder,
  CrossClientDiagnostic,
  NotificationRule,
} from './types';
import {
  INITIAL_CLIENTS,
  INITIAL_MASTER_CATALOG,
  INITIAL_EQUIPMENTS,
  INITIAL_WORK_ORDERS,
  INITIAL_CROSS_DIAGNOSTICS,
  DEFAULT_NOTIFICATION_RULES,
} from './mock-data';

import { SmartDocumentImporterModal } from './components/SmartDocumentImporterModal';
import { QRCodeManagerModal } from './components/QRCodeManagerModal';
import { DigitalOSMobileModal } from './components/DigitalOSMobileModal';
import { WorkOrderModal } from './components/WorkOrderModal';
import { ScheduleCalendarView } from './components/ScheduleCalendarView';
import { CrossClientAiDiagnostics } from './components/CrossClientAiDiagnostics';
import { MasterCatalogPanel } from './components/MasterCatalogPanel';
import { ClientManager } from './components/ClientManager';
import { ClientPortalModal } from './components/ClientPortalModal';

export const ServiceProModule: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'cockpit' | 'equipments' | 'calendar' | 'work_orders' | 'diagnostics' | 'catalog' | 'clients'
  >('cockpit');

  // Multi-tenant synced states
  const [clients, setClients] = useTenantStorage<ClientContractor[]>(
    'service-pro',
    'clients',
    INITIAL_CLIENTS
  );

  const [equipments, setEquipments] = useTenantStorage<Equipment[]>(
    'service-pro',
    'equipments',
    INITIAL_EQUIPMENTS
  );

  const [workOrders, setWorkOrders] = useTenantStorage<MaintenanceWorkOrder[]>(
    'service-pro',
    'work_orders',
    INITIAL_WORK_ORDERS
  );

  const [masterCatalog, setMasterCatalog] = useTenantStorage<MasterCatalogItem[]>(
    'service-pro',
    'master_catalog',
    INITIAL_MASTER_CATALOG
  );

  const [diagnostics, setDiagnostics] = useTenantStorage<CrossClientDiagnostic[]>(
    'service-pro',
    'diagnostics',
    INITIAL_CROSS_DIAGNOSTICS
  );

  const [notificationRules] = useTenantStorage<NotificationRule[]>(
    'service-pro',
    'notification_rules',
    DEFAULT_NOTIFICATION_RULES
  );

  // Modals state
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [qrCodeModalEquipment, setQRCodeModalEquipment] = useState<Equipment | null>(null);
  const [mobileOSModalOrder, setMobileOSModalOrder] = useState<MaintenanceWorkOrder | null>(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<MaintenanceWorkOrder | null>(null);
  const [portalSimulationClient, setPortalSimulationClient] = useState<ClientContractor | null>(
    null
  );

  // Equipment table filters
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentClientFilter, setEquipmentClientFilter] = useState('all');
  const [equipmentCriticalityFilter, setEquipmentCriticalityFilter] = useState('all');

  // Work order filters
  const [woSearch, setWoSearch] = useState('');
  const [woStatusFilter, setWoStatusFilter] = useState('all');

  // Quick stats calculations
  const totalMRR = clients.reduce((sum, c) => sum + (c.contractValueMonthly || 0), 0);
  const totalEquipments = equipments.length;
  const criticalEquipments = equipments.filter((e) => e.criticality === 'high').length;
  const completedOrders = workOrders.filter((o) => o.status === 'completed').length;
  const pendingOrders = workOrders.filter((o) => o.status !== 'completed').length;

  // Handlers
  const handleImportEquipment = (newEquipment: Equipment) => {
    setEquipments((prev) => [newEquipment, ...prev]);
  };

  const handleSaveWorkOrder = (savedOrder: MaintenanceWorkOrder) => {
    setWorkOrders((prev) => {
      const exists = prev.some((o) => o.id === savedOrder.id);
      if (exists) {
        return prev.map((o) => (o.id === savedOrder.id ? savedOrder : o));
      }
      return [savedOrder, ...prev];
    });
  };

  const handleDeployCatalogModel = (
    model: MasterCatalogItem,
    clientId: string,
    tag: string
  ) => {
    const client = clients.find((c) => c.id === clientId) || clients[0];
    const branch = client?.branches[0];

    const newEquip: Equipment = {
      id: `eq-${Date.now()}`,
      clientId: client?.id || 'cli-1',
      clientName: client?.name || 'Cliente',
      branchId: branch?.id || 'branch-1',
      branchName: branch?.name || 'Matriz',
      tag,
      name: `${model.category} ${model.capacity}`,
      category: model.category,
      brand: model.brand,
      model: model.model,
      serialNumber: `SN-${Date.now().toString().slice(-6)}`,
      capacity: model.capacity,
      locationInPlant: 'Sala de Utilidades / Produção',
      criticality: 'high',
      status: 'operational',
      nextPreventiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      specs: [...model.specs],
      maintenancePlan: { ...model.maintenancePlan },
      qrCodeId: `QR-${tag}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `Herdado do Catálogo Mestre Industrial (${model.brand} ${model.model})`,
    };

    setEquipments((prev) => [newEquip, ...prev]);
    setActiveTab('equipments');
  };

  const handleApplyDiagnosticToOrder = (diag: CrossClientDiagnostic) => {
    const matchingEquip = equipments.find((e) =>
      e.model.toLowerCase().includes(diag.equipmentModel.toLowerCase())
    );

    const newOrder: MaintenanceWorkOrder = {
      id: `wo-${Date.now()}`,
      orderNumber: `OS-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId: matchingEquip?.clientId || clients[0]?.id || 'cli-1',
      clientName: matchingEquip?.clientName || clients[0]?.name || 'Cliente',
      branchId: matchingEquip?.branchId || 'branch-1',
      branchName: matchingEquip?.branchName || 'Matriz',
      equipmentId: matchingEquip?.id || equipments[0]?.id || 'eq-1',
      equipmentTag: matchingEquip?.tag || 'EQ-01',
      equipmentName: matchingEquip?.name || 'Equipamento',
      equipmentModel: diag.equipmentModel,
      type: 'corrective',
      status: 'scheduled',
      priority: 'urgent',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTimeWindow: 'Atendimento Emergencial Imediato',
      technicianName: 'Carlos Silveira',
      technicianPhone: '(11) 98765-1122',
      symptomsReported: `[Sintoma Detectado via Copiloto IA]: ${diag.symptomTitle}`,
      rootCauseFound: diag.causes[0]?.cause,
      actionsTaken: `Ação recomendada pela IA: ${diag.causes[0]?.resolution}`,
      checklist: [
        { id: 'c1', description: 'Inspeção e teste do sintoma identificado', status: 'passed' },
        { id: 'c2', description: 'Aplicação da causa raiz recomendada pelo Waze', status: 'passed' },
        { id: 'c3', description: 'Medição pós-reparo e teste de carga', status: 'passed' },
      ],
      sparePartsUsed: diag.causes[0]?.recommendedParts.map((p, i) => ({
        partCode: `PEC-IA-${i + 1}`,
        description: p,
        quantity: 1,
        unitPrice: 280,
      })) || [],
      laborHours: diag.averageRepairTimeHours || 2,
      laborCost: (diag.averageRepairTimeHours || 2) * 120,
      totalCost: (diag.averageRepairTimeHours || 2) * 120 + 350,
      beforePhotos: [],
      afterPhotos: [],
      whatsappConfirmationSent: false,
    };

    setEditingWorkOrder(newOrder);
    setIsWorkOrderModalOpen(true);
  };

  // Filtered equipments
  const filteredEquipments = equipments.filter((eq) => {
    if (equipmentClientFilter !== 'all' && eq.clientId !== equipmentClientFilter) return false;
    if (equipmentCriticalityFilter !== 'all' && eq.criticality !== equipmentCriticalityFilter)
      return false;
    if (!equipmentSearch.trim()) return true;

    const term = equipmentSearch.toLowerCase();
    return (
      eq.tag.toLowerCase().includes(term) ||
      eq.name.toLowerCase().includes(term) ||
      eq.brand.toLowerCase().includes(term) ||
      eq.model.toLowerCase().includes(term) ||
      (eq.clientName && eq.clientName.toLowerCase().includes(term))
    );
  });

  // Filtered work orders
  const filteredWorkOrders = workOrders.filter((wo) => {
    if (woStatusFilter !== 'all' && wo.status !== woStatusFilter) return false;
    if (!woSearch.trim()) return true;

    const term = woSearch.toLowerCase();
    return (
      wo.orderNumber.toLowerCase().includes(term) ||
      wo.equipmentTag.toLowerCase().includes(term) ||
      wo.clientName.toLowerCase().includes(term) ||
      wo.technicianName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Aptis Service Pro
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                INDUSTRIAL ERP & MOBILE OS
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gestão de Manutenção Terceirizada • Clientes B2B, Agenda Preventiva, QR Code & IA Preditiva
            </p>
          </div>
        </div>

        {/* Global Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsImporterOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Importador OCR / IA
          </button>

          <button
            onClick={() => {
              setEditingWorkOrder(null);
              setIsWorkOrderModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nova Ordem de Serviço
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Faturamento Mensal (MRR)
          </span>
          <div className="text-xl font-black text-emerald-500 mt-1">
            {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[11px] text-muted-foreground">{clients.length} clientes ativos</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Parque sob Gestão
          </span>
          <div className="text-xl font-black text-foreground mt-1">{totalEquipments} Máquinas</div>
          <span className="text-[11px] text-muted-foreground">Com TAGs QR Code ativas</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Máquinas Críticas
          </span>
          <div className="text-xl font-black text-amber-500 mt-1">{criticalEquipments} Ativos</div>
          <span className="text-[11px] text-muted-foreground">Linhas de parada severa</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            OSs em Aberto
          </span>
          <div className="text-xl font-black text-primary mt-1">{pendingOrders} Agendadas</div>
          <span className="text-[11px] text-muted-foreground">Visitas para executar</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            OSs Concluídas
          </span>
          <div className="text-xl font-black text-emerald-500 mt-1">{completedOrders} Laudos</div>
          <span className="text-[11px] text-muted-foreground">Assinadas digitalmente</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-border overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { key: 'cockpit', label: 'Cockpit Geral', icon: Activity },
          { key: 'equipments', label: 'Parque de Máquinas', icon: Cpu, count: equipments.length },
          { key: 'calendar', label: 'Agenda & Visitas', icon: Calendar, count: pendingOrders },
          { key: 'work_orders', label: 'Ordens de Serviço (OS)', icon: FileText, count: workOrders.length },
          { key: 'diagnostics', label: 'Copiloto IA (Waze)', icon: Sparkles },
          { key: 'catalog', label: 'Catálogo Mestre', icon: Layers, count: masterCatalog.length },
          { key: 'clients', label: 'Clientes & Contratos', icon: Building2, count: clients.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
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
          {/* Quick Action Shortcuts Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setIsImporterOpen(true)}
              className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 transition cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/20">
                  OCR IA
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition">
                Importar Equipamento via Foto ou PDF
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Tire foto da plaqueta do motor/compressor ou anexe o manual. A IA cadastra todas as
                especificações e o plano preventivo.
              </p>
            </div>

            <div
              onClick={() => {
                setEditingWorkOrder(null);
                setIsWorkOrderModalOpen(true);
              }}
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/50 transition cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/20">
                  PROGRAMAÇÃO
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition">
                Agendar Visita Preventiva / Corretiva
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione o cliente, a máquina e o técnico. O cliente receberá lembretes automáticos
                no WhatsApp antes da visita.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('diagnostics')}
              className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/50 transition cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/20">
                  WAZE DA MANUTENÇÃO
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground group-hover:text-amber-500 transition">
                Consultar Copiloto Preditivo de Falhas
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Veja o histórico cruzado de falhas em modelos idênticos em outros clientes e saiba
                quais peças levar na van.
              </p>
            </div>
          </div>

          {/* Next visits & Critical Alert grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próximas Visitas Programadas */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    Próximas Visitas Técnicas no Calendário
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Ver Agenda Completa →
                </button>
              </div>

              <div className="space-y-2.5">
                {workOrders.slice(0, 4).map((wo) => (
                  <div
                    key={wo.id}
                    className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{wo.orderNumber}</span>
                        <span className="font-bold text-foreground">{wo.equipmentTag}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {wo.clientName} • {wo.technicianName} ({wo.scheduledDate})
                      </p>
                    </div>

                    <button
                      onClick={() => setMobileOSModalOrder(wo)}
                      className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-muted text-foreground font-semibold flex items-center gap-1.5 transition text-[11px]"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-primary" />
                      OS Digital
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipamentos com Preventiva Próxima ou Crítica */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-foreground">
                    Vencimentos Preventivos & Criticidade
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('equipments')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Ver Todas as Máquinas →
                </button>
              </div>

              <div className="space-y-2.5">
                {equipments.slice(0, 4).map((eq) => (
                  <div
                    key={eq.id}
                    className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">[{eq.tag}]</span>
                        <span className="font-semibold text-foreground line-clamp-1">{eq.name}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {eq.clientName} • Próx: {eq.nextPreventiveDate}
                      </p>
                    </div>

                    <button
                      onClick={() => setQRCodeModalEquipment(eq)}
                      className="p-1.5 rounded-lg bg-card border border-border hover:bg-muted text-foreground transition"
                      title="Ver Etiqueta QR Code"
                    >
                      <QrCode className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Parque de Máquinas */}
      {activeTab === 'equipments' && (
        <div className="space-y-4">
          {/* Filter & Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-card border border-border rounded-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                placeholder="Buscar por TAG, modelo, cliente ou número de série..."
                className="w-full text-xs pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={equipmentClientFilter}
                onChange={(e) => setEquipmentClientFilter(e.target.value)}
                className="text-xs bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Todos os Clientes</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={equipmentCriticalityFilter}
                onChange={(e) => setEquipmentCriticalityFilter(e.target.value)}
                className="text-xs bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Todas as Criticidades</option>
                <option value="high">Alta (Parada Severa)</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>

              <button
                onClick={() => setIsImporterOpen(true)}
                className="px-3 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Importar via OCR IA
              </button>
            </div>
          </div>

          {/* Equipments Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipments.map((eq) => (
              <div
                key={eq.id}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {eq.tag}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        eq.criticality === 'high'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {eq.criticality === 'high' ? 'Crítico (Parada)' : 'Produção Regular'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground mt-2 line-clamp-1">{eq.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {eq.brand} • {eq.model} {eq.capacity ? `(${eq.capacity})` : ''}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Cliente:</span>
                      <strong className="text-foreground">{eq.clientName}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Localização:</span>
                      <span className="text-foreground truncate max-w-[160px]">
                        {eq.locationInPlant}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Série:</span>
                      <span className="font-mono text-foreground">{eq.serialNumber}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Próx. Preventiva:</span>
                      <strong className="text-primary font-mono">{eq.nextPreventiveDate}</strong>
                    </div>
                  </div>

                  {/* Norm Badge */}
                  {eq.maintenancePlan?.legalNorm && (
                    <div className="mt-2 text-[10px] font-bold text-amber-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Regulamentado por {eq.maintenancePlan.legalNorm}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => setQRCodeModalEquipment(eq)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-card border border-border hover:bg-muted text-foreground font-semibold flex items-center justify-center gap-1.5 text-xs transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-primary" />
                    Etiqueta QR
                  </button>

                  <button
                    onClick={() => {
                      const newOrder: MaintenanceWorkOrder = {
                        id: `wo-${Date.now()}`,
                        orderNumber: `OS-2026-${Math.floor(100 + Math.random() * 900)}`,
                        clientId: eq.clientId,
                        clientName: eq.clientName || 'Cliente',
                        branchId: eq.branchId,
                        branchName: eq.branchName || 'Matriz',
                        equipmentId: eq.id,
                        equipmentTag: eq.tag,
                        equipmentName: eq.name,
                        equipmentModel: `${eq.brand} ${eq.model}`,
                        type: 'preventive',
                        status: 'scheduled',
                        priority: 'normal',
                        scheduledDate: eq.nextPreventiveDate,
                        scheduledTimeWindow: '08:00 - 12:00',
                        technicianName: 'Carlos Silveira',
                        symptomsReported: `Manutenção preventiva periódica baseada no plano ${eq.maintenancePlan?.legalNorm || 'industrial'}.`,
                        checklist:
                          eq.maintenancePlan?.checklistItems.map((c, i) => ({
                            id: `chk-${i}`,
                            description: c,
                            status: 'passed' as const,
                          })) || [],
                        sparePartsUsed: [],
                        laborHours: 2.5,
                        laborCost: 300,
                        totalCost: 450,
                        beforePhotos: [],
                        afterPhotos: [],
                        whatsappConfirmationSent: false,
                      };
                      setEditingWorkOrder(newOrder);
                      setIsWorkOrderModalOpen(true);
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold flex items-center justify-center gap-1.5 text-xs shadow-sm transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Agendar OS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Agenda & Visitas */}
      {activeTab === 'calendar' && (
        <ScheduleCalendarView
          workOrders={workOrders}
          clients={clients}
          equipments={equipments}
          notificationRules={notificationRules}
          onOpenOrder={(order) => setMobileOSModalOrder(order)}
          onNewOrder={() => {
            setEditingWorkOrder(null);
            setIsWorkOrderModalOpen(true);
          }}
        />
      )}

      {/* Tab 4: Ordens de Serviço (OS) */}
      {activeTab === 'work_orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-card border border-border rounded-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={woSearch}
                onChange={(e) => setWoSearch(e.target.value)}
                placeholder="Buscar por OS, cliente, equipamento ou técnico..."
                className="w-full text-xs pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={woStatusFilter}
                onChange={(e) => setWoStatusFilter(e.target.value)}
                className="text-xs bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Todos os Status</option>
                <option value="scheduled">Agendadas</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluídas</option>
              </select>

              <button
                onClick={() => {
                  setEditingWorkOrder(null);
                  setIsWorkOrderModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova OS
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredWorkOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/60 border border-border flex items-center justify-center font-mono font-bold text-xs text-foreground shrink-0">
                    {order.type === 'preventive' ? 'PREV' : 'CORR'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-primary text-xs">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {order.status === 'completed' ? 'Concluída' : 'Em Aberto'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mt-0.5">
                      {order.equipmentTag} • {order.equipmentName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {order.clientName} • Data: {order.scheduledDate} • Técnico: {order.technicianName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  {order.clientSignatureBase64 && (
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Assinado Digitalmente
                    </span>
                  )}

                  <button
                    onClick={() => setMobileOSModalOrder(order)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Abrir App do Técnico
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Copiloto IA (Waze da Manutenção) */}
      {activeTab === 'diagnostics' && (
        <CrossClientAiDiagnostics
          diagnostics={diagnostics}
          onApplyDiagnosticToOrder={handleApplyDiagnosticToOrder}
        />
      )}

      {/* Tab 6: Catálogo Mestre */}
      {activeTab === 'catalog' && (
        <MasterCatalogPanel
          catalog={masterCatalog}
          clients={clients}
          onDeployToClient={handleDeployCatalogModel}
        />
      )}

      {/* Tab 7: Clientes & Contratos */}
      {activeTab === 'clients' && (
        <ClientManager
          clients={clients}
          onAddClient={(newClient) => setClients((prev) => [newClient, ...prev])}
          onOpenPortalSimulation={(client) => setPortalSimulationClient(client)}
        />
      )}

      {/* Modals */}
      <SmartDocumentImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        clients={clients}
        masterCatalog={masterCatalog}
        onImportEquipment={handleImportEquipment}
      />

      <QRCodeManagerModal
        isOpen={!!qrCodeModalEquipment}
        onClose={() => setQRCodeModalEquipment(null)}
        equipment={qrCodeModalEquipment}
      />

      <DigitalOSMobileModal
        isOpen={!!mobileOSModalOrder}
        onClose={() => setMobileOSModalOrder(null)}
        workOrder={mobileOSModalOrder}
        onSaveWorkOrder={handleSaveWorkOrder}
      />

      <WorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        clients={clients}
        equipments={equipments}
        onSave={handleSaveWorkOrder}
        editingOrder={editingWorkOrder}
      />

      <ClientPortalModal
        isOpen={!!portalSimulationClient}
        onClose={() => setPortalSimulationClient(null)}
        client={portalSimulationClient}
        equipments={equipments}
        workOrders={workOrders}
      />
    </div>
  );
};

export default ServiceProModule;
