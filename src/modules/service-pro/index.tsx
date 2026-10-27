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
  FileSpreadsheet,
  Trash2,
  ClipboardCheck,
} from 'lucide-react';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';
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
import { DigitalOSMobileModal, PreventiveCycleOptions } from './components/DigitalOSMobileModal';
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
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);

  const handleImportServiceProExcel = (rows: Record<string, any>[]) => {
    const updatedClients = [...clients];
    const newEquipments: Equipment[] = rows.map((row, idx) => {
      const clientName = (row.clientName || 'Cliente Industrial').trim();
      let client = updatedClients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
      if (!client) {
        client = {
          id: `client-imp-${Date.now()}-${idx}`,
          name: clientName,
          tradeName: clientName,
          cnpj: '00.000.000/0001-00',
          segment: 'Manufatura / Usinagem',
          slaHours: 4,
          contractValueMonthly: 5500,
          contractStartDate: new Date().toISOString().split('T')[0],
          contractStatus: 'active',
          branches: [
            {
              id: `br-1-${idx}`,
              name: 'Planta Principal',
              address: 'Av. Industrial, 1000',
              city: 'São Paulo',
              state: 'SP'
            }
          ],
          contacts: [
            {
              id: `ct-1-${idx}`,
              name: 'Gestor da Planta',
              role: 'Gerente de Manutenção',
              email: 'manutencao@empresa.com.br',
              phone: '(11) 98765-4321',
              isPrimary: true
            }
          ]
        };
        updatedClients.push(client);
      }

      const rawCrit = (row.criticality || '').trim().toLowerCase();
      let criticality: 'low' | 'medium' | 'high' = 'medium';
      if (rawCrit.includes('crit') || rawCrit.includes('alt')) criticality = 'high';
      else if (rawCrit.includes('baix')) criticality = 'low';

      const branch = client.branches[0];

      return {
        id: `eq-imp-${Date.now()}-${idx}`,
        clientId: client.id,
        clientName: client.name,
        branchId: branch?.id || 'branch-1',
        branchName: branch?.name || 'Planta Principal',
        name: (row.equipmentName || 'Equipamento').trim(),
        tag: (row.tag || `TAG-${Date.now().toString().slice(-4)}-${idx + 1}`).trim(),
        category: (row.sector || 'Geral').trim(),
        brand: (row.manufacturer || 'Industrial').trim(),
        model: 'Standard',
        serialNumber: `SN-${Date.now().toString().slice(-6)}`,
        locationInPlant: (row.sector || 'Chão de Fábrica').trim(),
        criticality,
        status: 'operational',
        nextPreventiveDate: new Date(Date.now() + (Number(row.preventiveIntervalDays) || 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        specs: [],
        maintenancePlan: {
          intervalMonths: Math.round((Number(row.preventiveIntervalDays) || 60) / 30),
          checklistItems: ['Checar lubrificação', 'Inspecionar correias e ruídos anômalos'],
          recommendedParts: []
        },
        qrCodeId: `QR-${Date.now().toString().slice(-6)}`
      };
    });

    setClients(updatedClients);
    setEquipments(prev => [...newEquipments, ...prev]);

    return {
      successCount: newEquipments.length,
      message: `${newEquipments.length} equipamentos e clientes importados com sucesso no catálogo!`
    };
  };

  // Equipment table filters
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentClientFilter, setEquipmentClientFilter] = useState('all');
  const [equipmentCriticalityFilter, setEquipmentCriticalityFilter] = useState('all');
  const [equipmentDueFilter, setEquipmentDueFilter] = useState<
    'all' | 'overdue' | 'due_15' | 'due_30' | 'ok'
  >('all');

  // Helper para calcular dias restantes e semáforo de vencimento da preventiva
  const getPreventiveStatusInfo = (nextDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${nextDateStr}T00:00:00`);
    const diffMs = target.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        daysLeft,
        status: 'overdue' as const,
        label: `Vencida há ${Math.abs(daysLeft)} dia(s)`,
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        dotClass: 'bg-red-600',
      };
    }
    if (daysLeft === 0) {
      return {
        daysLeft,
        status: 'overdue' as const,
        label: 'Vence Hoje!',
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        dotClass: 'bg-red-600',
      };
    }
    if (daysLeft <= 15) {
      return {
        daysLeft,
        status: 'due_15' as const,
        label: `Vence em ${daysLeft} dia(s)`,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        dotClass: 'bg-amber-500',
      };
    }
    if (daysLeft <= 30) {
      return {
        daysLeft,
        status: 'due_30' as const,
        label: `Próxima: faltam ${daysLeft} dias`,
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    }
    return {
      daysLeft,
      status: 'ok' as const,
      label: `Em dia (${daysLeft} dias)`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotClass: 'bg-emerald-500',
    };
  };

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

  const handleSaveWorkOrder = (
    savedOrder: MaintenanceWorkOrder,
    shareToWaze: boolean = true,
    preventiveCycle?: PreventiveCycleOptions
  ) => {
    // Se a OS foi concluída e veio com o cálculo da próxima preventiva, atualiza o equipamento
    // e opcionalmente já agenda a próxima OS no calendário!
    if (savedOrder.status === 'completed' && preventiveCycle) {
      const completedDateStr =
        savedOrder.completedDate || new Date().toISOString().split('T')[0];

      setEquipments((prev) =>
        prev.map((eq) =>
          eq.id === savedOrder.equipmentId
            ? {
                ...eq,
                lastServiceDate: completedDateStr,
                nextPreventiveDate: preventiveCycle.nextPreventiveDate,
                status: 'operational',
                maintenancePlan: {
                  ...eq.maintenancePlan,
                  intervalMonths: preventiveCycle.nextCycleMonths,
                },
              }
            : eq
        )
      );

      if (preventiveCycle.autoCreateNextOS) {
        const nextAutoOrder: MaintenanceWorkOrder = {
          id: `wo-auto-${Date.now()}`,
          orderNumber: `OS-2026-${Math.floor(100 + Math.random() * 899)}`,
          clientId: savedOrder.clientId,
          clientName: savedOrder.clientName,
          branchId: savedOrder.branchId,
          branchName: savedOrder.branchName,
          equipmentId: savedOrder.equipmentId,
          equipmentTag: savedOrder.equipmentTag,
          equipmentName: savedOrder.equipmentName,
          equipmentModel: savedOrder.equipmentModel,
          type: 'preventive',
          status: 'scheduled',
          priority: 'normal',
          scheduledDate: preventiveCycle.nextPreventiveDate,
          scheduledTimeWindow: savedOrder.scheduledTimeWindow || '08:00 - 12:00',
          technicianName: savedOrder.technicianName,
          symptomsReported: `Preventiva programada automaticamente após baixa da ${savedOrder.orderNumber} (Ciclo de ${preventiveCycle.nextCycleMonths} mês/meses).`,
          checklist: savedOrder.checklist.map((item) => ({
            ...item,
            status: 'passed' as const,
          })),
          sparePartsUsed: [],
          laborHours: savedOrder.laborHours || 2.5,
          laborCost: (savedOrder.laborHours || 2.5) * 120,
          totalCost: (savedOrder.laborHours || 2.5) * 120,
          beforePhotos: [],
          afterPhotos: [],
          whatsappConfirmationSent: false,
        };

        setWorkOrders((prev) => {
          const exists = prev.some((o) => o.id === savedOrder.id);
          const updatedList = exists
            ? prev.map((o) => (o.id === savedOrder.id ? savedOrder : o))
            : [savedOrder, ...prev];
          return [nextAutoOrder, ...updatedList];
        });
      } else {
        setWorkOrders((prev) => {
          const exists = prev.some((o) => o.id === savedOrder.id);
          if (exists) {
            return prev.map((o) => (o.id === savedOrder.id ? savedOrder : o));
          }
          return [savedOrder, ...prev];
        });
      }
    } else {
      setWorkOrders((prev) => {
        const exists = prev.some((o) => o.id === savedOrder.id);
        if (exists) {
          return prev.map((o) => (o.id === savedOrder.id ? savedOrder : o));
        }
        return [savedOrder, ...prev];
      });
    }

    // Aprendizado Automático: Se a OS tiver Causa Raiz preenchida e shareToWaze ativo,
    // alimenta ou atualiza a base do Copiloto IA (Waze da Manutenção) automaticamente!
    if (shareToWaze && savedOrder.rootCauseFound && savedOrder.rootCauseFound.trim() !== '') {
      const cleanSymptom = (
        savedOrder.symptomsReported || `Falha em ${savedOrder.equipmentName}`
      )
        .replace(/^\[Sintoma Detectado via Copiloto IA\]:\s*/i, '')
        .trim();

      const partsList =
        savedOrder.sparePartsUsed && savedOrder.sparePartsUsed.length > 0
          ? savedOrder.sparePartsUsed.map((p) =>
              p.partCode ? `${p.description} (${p.partCode})` : p.description
            )
          : ['Kit de Inspeção / Reparo Padrão'];

      const modelName = savedOrder.equipmentModel || savedOrder.equipmentName;
      const eqMatch = equipments.find((e) => e.id === savedOrder.equipmentId);
      const categoryName = eqMatch?.category || 'Manutenção Industrial';

      setDiagnostics((prev) => {
        const existingIdx = prev.findIndex(
          (d) =>
            d.equipmentModel.toLowerCase() === modelName.toLowerCase() &&
            (d.symptomTitle.toLowerCase() === cleanSymptom.toLowerCase() ||
              cleanSymptom.toLowerCase().includes(d.symptomTitle.toLowerCase().slice(0, 18)))
        );

        if (existingIdx > -1) {
          const updated = [...prev];
          const target = { ...updated[existingIdx], causes: [...updated[existingIdx].causes] };

          const causeIdx = target.causes.findIndex(
            (c) => c.cause.toLowerCase() === savedOrder.rootCauseFound!.trim().toLowerCase()
          );

          if (causeIdx > -1) {
            const existingCause = target.causes[causeIdx];
            const updatedClients = Array.from(
              new Set([...existingCause.clientsAffected, savedOrder.clientName])
            );
            const updatedParts = Array.from(
              new Set([...existingCause.recommendedParts, ...partsList])
            );
            target.causes[causeIdx] = {
              ...existingCause,
              resolution: savedOrder.actionsTaken?.trim() || existingCause.resolution,
              recommendedParts: updatedParts,
              casesResolvedCount: (existingCause.casesResolvedCount || 1) + 1,
              confidenceScore: Math.min(99, (existingCause.confidenceScore || 85) + 2),
              clientsAffected: updatedClients,
            };
          } else {
            target.causes.unshift({
              cause: savedOrder.rootCauseFound!.trim(),
              resolution:
                savedOrder.actionsTaken?.trim() ||
                'Intervenção corretiva validada em campo pelo técnico.',
              recommendedParts: partsList,
              confidenceScore: 88,
              casesResolvedCount: 1,
              clientsAffected: [savedOrder.clientName],
            });
          }

          updated[existingIdx] = target;
          return updated;
        }

        // Cria um novo card no Waze da Manutenção
        const newDiagnostic: CrossClientDiagnostic = {
          equipmentModel: modelName,
          equipmentCategory: categoryName,
          symptomTitle: cleanSymptom,
          symptomKeywords: cleanSymptom
            .toLowerCase()
            .replace(/[^\w\sà-ú]/gi, '')
            .split(/\s+/)
            .filter((w) => w.length > 3)
            .slice(0, 5),
          averageRepairTimeHours: savedOrder.laborHours || 2,
          causes: [
            {
              cause: savedOrder.rootCauseFound!.trim(),
              resolution:
                savedOrder.actionsTaken?.trim() ||
                'Intervenção corretiva validada em campo pelo técnico.',
              recommendedParts: partsList,
              confidenceScore: 92,
              casesResolvedCount: 1,
              clientsAffected: [savedOrder.clientName],
            },
          ],
        };

        return [newDiagnostic, ...prev];
      });
    }
  };

  const handleSaveDiagnostic = (diag: CrossClientDiagnostic, editIndex?: number) => {
    setDiagnostics((prev) => {
      if (editIndex !== undefined && editIndex >= 0 && editIndex < prev.length) {
        const updated = [...prev];
        updated[editIndex] = diag;
        return updated;
      }
      return [diag, ...prev];
    });
  };

  const handleDeleteDiagnostic = (index: number) => {
    const target = diagnostics[index];
    if (
      window.confirm(
        `Deseja realmente remover o diagnóstico "${target?.symptomTitle || ''}" do Waze da Manutenção?`
      )
    ) {
      setDiagnostics((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleDeleteEquipment = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o equipamento "${name}"? Esta ação removerá o ativo e seus agendamentos.`)) {
      setEquipments((prev) => prev.filter((eq) => eq.id !== id));
    }
  };

  const handleDeleteWorkOrder = (id: string, orderNumber: string) => {
    if (window.confirm(`Deseja realmente excluir a Ordem de Serviço "${orderNumber}"?`)) {
      setWorkOrders((prev) => prev.filter((wo) => wo.id !== id));
    }
  };

  const handleDeleteClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (window.confirm(`Tem certeza que deseja excluir a empresa contratante "${client?.name || clientId}"?`)) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    }
  };

  const handleSaveCatalogItem = (savedItem: MasterCatalogItem) => {
    setMasterCatalog((prev) => {
      const exists = prev.some(
        (m) =>
          m.id === savedItem.id ||
          (m.brand.toLowerCase() === savedItem.brand.toLowerCase() &&
            m.model.toLowerCase() === savedItem.model.toLowerCase())
      );
      if (exists) {
        return prev.map((m) =>
          m.id === savedItem.id ||
          (m.brand.toLowerCase() === savedItem.brand.toLowerCase() &&
            m.model.toLowerCase() === savedItem.model.toLowerCase())
            ? { ...savedItem, id: m.id }
            : m
        );
      }
      return [savedItem, ...prev];
    });
  };

  const handleDeleteCatalogItem = (itemId: string) => {
    setMasterCatalog((prev) => prev.filter((m) => m.id !== itemId));
  };

  const handleGenerateBatchWorkOrders = (model: MasterCatalogItem): number => {
    const matchingEquipments = equipments.filter(
      (eq) =>
        eq.model.toLowerCase() === model.model.toLowerCase() ||
        eq.brand.toLowerCase() === model.brand.toLowerCase()
    );

    const targets = matchingEquipments.length > 0 ? matchingEquipments : equipments.slice(0, 1);
    const createdOrders: MaintenanceWorkOrder[] = targets.map((eq, idx) => ({
      id: `wo-batch-${Date.now()}-${idx}`,
      orderNumber: `OS-2026-${Math.floor(200 + Math.random() * 790)}`,
      clientId: eq.clientId,
      clientName: eq.clientName || 'Cliente Industrial',
      branchId: eq.branchId,
      branchName: eq.branchName || 'Planta Principal',
      equipmentId: eq.id,
      equipmentTag: eq.tag,
      equipmentName: eq.name,
      equipmentModel: `${model.brand} ${model.model}`,
      type: 'preventive',
      status: 'scheduled',
      priority: 'normal',
      scheduledDate:
        eq.nextPreventiveDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scheduledTimeWindow: '08:00 - 12:00',
      technicianName: 'Carlos Silveira',
      symptomsReported: `Manutenção Preventiva Programada via Catálogo Mestre (${
        model.maintenancePlan.legalNorm || 'Padrão'
      }).`,
      checklist: (model.maintenancePlan.checklistItems || []).map((c, i) => ({
        id: `chk-cat-${i}`,
        description: c,
        status: 'passed' as const,
      })),
      sparePartsUsed: (model.commonSpareParts || []).map((p) => ({
        partCode: p.code,
        description: p.description,
        quantity: 1,
        unitPrice: 220,
      })),
      laborHours: 2.5,
      laborCost: 300,
      totalCost: 300 + (model.commonSpareParts?.length || 1) * 220,
      beforePhotos: [],
      afterPhotos: [],
      whatsappConfirmationSent: false,
    }));

    setWorkOrders((prev) => [...createdOrders, ...prev]);
    return createdOrders.length;
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
    setMasterCatalog((prev) =>
      prev.map((m) =>
        m.id === model.id
          ? { ...m, activeDeploymentsCount: (m.activeDeploymentsCount || 0) + 1 }
          : m
      )
    );
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

    if (equipmentDueFilter !== 'all') {
      const dueInfo = getPreventiveStatusInfo(eq.nextPreventiveDate);
      if (equipmentDueFilter === 'overdue' && dueInfo.status !== 'overdue') return false;
      if (
        equipmentDueFilter === 'due_15' &&
        dueInfo.status !== 'overdue' &&
        dueInfo.status !== 'due_15'
      )
        return false;
      if (
        equipmentDueFilter === 'due_30' &&
        dueInfo.status !== 'overdue' &&
        dueInfo.status !== 'due_15' &&
        dueInfo.status !== 'due_30'
      )
        return false;
      if (equipmentDueFilter === 'ok' && dueInfo.status !== 'ok') return false;
    }

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
    <div className="space-y-6 w-full pb-12">
      {/* HEADER DO MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-blue-600" /> Manutenção & Engenharia de Serviços B2B
            </span>
            <span className="text-xs text-slate-500 font-medium">Plataforma Aptis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            Aptis Service Pro • Gestão de Manutenção & Contratos
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl mt-1">
            Controle centralizado para gestores de manutenção industrial: contratos B2B, inventário de ativos com controle automático de vencimento preventivo, baixa de OS com laudo e inteligência preditiva.
          </p>
        </div>

        {/* Global Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsExcelImporterOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
            title="Importar catálogo de máquinas e clientes do Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Importar Excel
          </button>

          <button
            onClick={() => setIsImporterOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            Importador OCR IA
          </button>

          <button
            onClick={() => {
              setEditingWorkOrder(null);
              setIsWorkOrderModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Ordem de Serviço
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Faturamento (MRR)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-xs text-slate-500 font-medium">{clients.length} clientes ativos</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Parque sob Gestão</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalEquipments} Máquinas</div>
          <span className="text-xs text-slate-500 font-medium">Com TAGs QR Code ativas</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Máquinas Críticas</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{criticalEquipments} Ativos</div>
          <span className="text-xs text-slate-500 font-medium">Linhas de parada severa</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>OSs em Aberto</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{pendingOrders} Agendadas</div>
          <span className="text-xs text-slate-500 font-medium">Visitas para executar</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>OSs Concluídas</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{completedOrders} Laudos</div>
          <span className="text-xs text-slate-500 font-medium">Assinadas digitalmente</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { key: 'cockpit', label: 'Cockpit Geral', icon: Activity },
          { key: 'equipments', label: 'Parque de Máquinas', icon: Cpu, count: equipments.length },
          { key: 'calendar', label: 'Agenda & Visitas', icon: Calendar, count: pendingOrders },
          { key: 'work_orders', label: 'Ordens de Serviço (OS)', icon: FileText, count: workOrders.length },
          { key: 'diagnostics', label: 'Copiloto IA (Waze)', icon: Sparkles, count: diagnostics.length },
          { key: 'catalog', label: 'Catálogo Mestre', icon: Layers, count: masterCatalog.length },
          { key: 'clients', label: 'Clientes & Contratos', icon: Building2, count: clients.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
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
              className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 border border-blue-200/80 hover:border-blue-400 hover:shadow-md transition cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-200">
                  OCR IA
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                Importar Equipamento via Foto ou PDF
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tire foto da plaqueta do motor/compressor ou anexe o manual. A IA cadastra todas as especificações e o plano preventivo.
              </p>
            </div>

            <div
              onClick={() => {
                setEditingWorkOrder(null);
                setIsWorkOrderModalOpen(true);
              }}
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200">
                  PROGRAMAÇÃO
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                Agendar Visita Preventiva / Corretiva
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Selecione o cliente, a máquina e o responsável. O cliente receberá lembretes automáticos no WhatsApp antes da visita.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('diagnostics')}
              className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-800 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200">
                  WAZE DA MANUTENÇÃO
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition">
                Consultar Copiloto Preditivo de Falhas
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Veja o histórico cruzado de falhas em modelos idênticos em outros clientes e saiba quais peças separar antes da visita.
              </p>
            </div>
          </div>

          {/* Next visits & Critical Alert grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próximas Visitas Programadas */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Próximas Ordens de Serviço no Calendário
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Ver Agenda Completa →
                </button>
              </div>

              <div className="space-y-2.5">
                {workOrders.slice(0, 4).map((wo) => (
                  <div
                    key={wo.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600">{wo.orderNumber}</span>
                        <span className="font-bold text-slate-900">[{wo.equipmentTag}]</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {wo.clientName} • {wo.technicianName} ({wo.scheduledDate})
                      </p>
                    </div>

                    <button
                      onClick={() => setMobileOSModalOrder(wo)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 transition text-[11px] shadow-2xs cursor-pointer"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                      Baixar / Laudo OS
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipamentos com Preventiva Próxima ou Crítica */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Radar de Vencimentos Preventivos (Próximas Datas)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('equipments')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Ver Todas as Máquinas →
                </button>
              </div>

              <div className="space-y-2.5">
                {[...equipments]
                  .sort((a, b) => a.nextPreventiveDate.localeCompare(b.nextPreventiveDate))
                  .slice(0, 4)
                  .map((eq) => {
                    const dueInfo = getPreventiveStatusInfo(eq.nextPreventiveDate);
                    return (
                      <div
                        key={eq.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-slate-900">[{eq.tag}]</span>
                            <span className="font-bold text-slate-800 line-clamp-1">{eq.name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${dueInfo.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${dueInfo.dotClass}`} />
                              {dueInfo.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {eq.clientName} • Vencimento:{' '}
                            <strong className="text-blue-700 font-mono">
                              {eq.nextPreventiveDate}
                            </strong>
                            {eq.lastServiceDate && (
                              <span className="ml-2 text-slate-400">
                                (Última: {eq.lastServiceDate})
                              </span>
                            )}
                          </p>
                        </div>

                        <button
                          onClick={() => setQRCodeModalEquipment(eq)}
                          className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition shadow-2xs cursor-pointer"
                          title="Ver Etiqueta QR Code"
                        >
                          <QrCode className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Parque de Máquinas */}
      {activeTab === 'equipments' && (
        <div className="space-y-4">
          {/* Filter & Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                placeholder="Buscar por TAG, modelo, cliente ou número de série..."
                className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={equipmentDueFilter}
                onChange={(e) => setEquipmentDueFilter(e.target.value as any)}
                className="text-xs bg-blue-50/70 border border-blue-300 focus:bg-white rounded-xl px-3 py-2 text-blue-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-bold"
              >
                <option value="all">📅 Todos os Vencimentos</option>
                <option value="overdue">🔴 Vencidas / Atrasadas</option>
                <option value="due_15">🟡 Vencendo em até 15 dias</option>
                <option value="due_30">🔵 Vencendo em até 30 dias</option>
                <option value="ok">🟢 Em dia (&gt; 30 dias)</option>
              </select>

              <select
                value={equipmentClientFilter}
                onChange={(e) => setEquipmentClientFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
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
                className="text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
              >
                <option value="all">Todas as Criticidades</option>
                <option value="high">Alta (Parada Severa)</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>

              <button
                onClick={() => setIsImporterOpen(true)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-600/25 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Importar via OCR IA
              </button>
            </div>
          </div>

          {/* Equipments Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipments.map((eq) => {
              const dueInfo = getPreventiveStatusInfo(eq.nextPreventiveDate);
              return (
                <div
                  key={eq.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {eq.tag}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${dueInfo.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dueInfo.dotClass}`} />
                        {dueInfo.label}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{eq.name}</h3>
                    <p className="text-xs text-slate-500">
                      {eq.brand} • {eq.model} {eq.capacity ? `(${eq.capacity})` : ''}
                    </p>

                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 shadow-2xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Cliente:</span>
                        <strong className="text-slate-900">{eq.clientName}</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Localização:</span>
                        <span className="text-slate-800 truncate max-w-[160px]">
                          {eq.locationInPlant}
                        </span>
                      </div>
                      {eq.lastServiceDate && (
                        <div className="flex justify-between text-slate-500">
                          <span>Última Preventiva:</span>
                          <span className="font-mono font-semibold text-emerald-700">
                            {eq.lastServiceDate}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-500">
                        <span>Próx. Preventiva:</span>
                        <strong className="text-blue-700 font-mono">
                          {eq.nextPreventiveDate} (a cada {eq.maintenancePlan?.intervalMonths || 3}m)
                        </strong>
                      </div>
                    </div>

                    {/* Norm Badge */}
                    {eq.maintenancePlan?.legalNorm && (
                      <div className="mt-2 text-[10px] font-bold text-amber-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        Regulamentado por {eq.maintenancePlan.legalNorm}
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setQRCodeModalEquipment(eq)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center gap-1.5 text-xs transition shadow-2xs cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-600" />
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
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Agendar OS
                    </button>

                    <button
                      onClick={() => handleDeleteEquipment(eq.id, eq.name)}
                      className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition shadow-2xs cursor-pointer"
                      title="Excluir equipamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={woSearch}
                onChange={(e) => setWoSearch(e.target.value)}
                placeholder="Buscar por OS, cliente, equipamento ou responsável..."
                className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={woStatusFilter}
                onChange={(e) => setWoStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
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
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center gap-1.5 cursor-pointer"
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
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-blue-700 shadow-2xs shrink-0">
                    {order.type === 'preventive' ? 'PREV' : 'CORR'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-blue-600 text-xs">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.status === 'completed' ? 'Concluída' : 'Em Aberto'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      [{order.equipmentTag}] • {order.equipmentName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {order.clientName} • Data: {order.scheduledDate} • Responsável: {order.technicianName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  {order.clientSignatureBase64 && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Laudo Assinado
                    </span>
                  )}

                  <button
                    onClick={() => setMobileOSModalOrder(order)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    {order.status === 'completed' ? 'Ver Laudo da OS' : 'Registrar Execução / Baixar OS'}
                  </button>

                  <button
                    onClick={() => handleDeleteWorkOrder(order.id, order.orderNumber)}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition shadow-2xs cursor-pointer"
                    title="Excluir Ordem de Serviço"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
          equipments={equipments}
          masterCatalog={masterCatalog}
          onApplyDiagnosticToOrder={handleApplyDiagnosticToOrder}
          onSaveDiagnostic={handleSaveDiagnostic}
          onDeleteDiagnostic={handleDeleteDiagnostic}
        />
      )}

      {/* Tab 6: Catálogo Mestre */}
      {activeTab === 'catalog' && (
        <MasterCatalogPanel
          catalog={masterCatalog}
          clients={clients}
          equipments={equipments}
          onDeployToClient={handleDeployCatalogModel}
          onSaveCatalogItem={handleSaveCatalogItem}
          onDeleteItem={handleDeleteCatalogItem}
          onGenerateBatchWorkOrders={handleGenerateBatchWorkOrders}
        />
      )}

      {/* Tab 7: Clientes & Contratos */}
      {activeTab === 'clients' && (
        <ClientManager
          clients={clients}
          onAddClient={(newClient) => setClients((prev) => [newClient, ...prev])}
          onOpenPortalSimulation={(client) => setPortalSimulationClient(client)}
          onDeleteClient={handleDeleteClient}
        />
      )}

      {/* Modals */}
      <SmartDocumentImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        clients={clients}
        masterCatalog={masterCatalog}
        onImportEquipment={handleImportEquipment}
        onSaveCatalogItem={handleSaveCatalogItem}
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
        defaultCycleMonths={
          equipments.find((e) => e.id === mobileOSModalOrder?.equipmentId)?.maintenancePlan
            ?.intervalMonths || 3
        }
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

      {/* Modal de Importação de Excel Inteligente */}
      <SmartExcelImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        toolTitle={EXCEL_IMPORT_CONFIGS['service-pro'].toolTitle}
        subtitle={EXCEL_IMPORT_CONFIGS['service-pro'].subtitle}
        templateFilename={EXCEL_IMPORT_CONFIGS['service-pro'].templateFilename}
        columns={EXCEL_IMPORT_CONFIGS['service-pro'].columns}
        sampleRows={EXCEL_IMPORT_CONFIGS['service-pro'].sampleRows}
        onImport={handleImportServiceProExcel}
      />
    </div>
  );
};

export default ServiceProModule;
