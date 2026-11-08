'use client';

import React, { useState, useEffect } from 'react';
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
  Edit3,
} from 'lucide-react';
import { useTenant } from '@/context/tenant-context';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';
import {
  ClientContractor,
  Equipment,
  EquipmentServiceItem,
  ServiceItemStatus,
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
  const { currentTenant } = useTenant();

  // Sincronia com o motor óptico Tinted Glass / Light Crystal
  const [tintedGlass, setTintedGlass] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('aptis_tinted_glass_mode');
    if (saved !== null) {
      setTintedGlass(saved === 'true');
    }
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setTintedGlass(customEvent.detail);
      }
    };
    window.addEventListener('aptis-glass-mode-change', handleModeChange);
    return () => window.removeEventListener('aptis-glass-mode-change', handleModeChange);
  }, []);

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
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [qrCodeModalEquipment, setQRCodeModalEquipment] = useState<Equipment | null>(null);
  const [mobileOSModalOrder, setMobileOSModalOrder] = useState<MaintenanceWorkOrder | null>(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<MaintenanceWorkOrder | null>(null);
  const [portalSimulationClient, setPortalSimulationClient] = useState<ClientContractor | null>(
    null
  );
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);
  const [expandedServiceTableIds, setExpandedServiceTableIds] = useState<Record<string, boolean>>({
    'eq-maq-01': true,
  });

  // Garante que o exemplo real "Máquina 01 (Linha de Envase)" e o modelo no Catálogo Mestre estejam disponíveis mesmo se o localStorage já tiver dados antigos salvos
  useEffect(() => {
    const maq01Template = INITIAL_EQUIPMENTS.find((e) => e.id === 'eq-maq-01');
    if (maq01Template && equipments.length > 0 && !equipments.some((e) => e.id === 'eq-maq-01' || e.tag === 'MAQ-01')) {
      setEquipments((prev) => [maq01Template, ...prev]);
    }
    const catMaq01 = INITIAL_MASTER_CATALOG.find((c) => c.id === 'cat-envasadora-maq01');
    if (catMaq01 && masterCatalog.length > 0 && !masterCatalog.some((c) => c.id === 'cat-envasadora-maq01')) {
      setMasterCatalog((prev) => [catMaq01, ...prev]);
    }
  }, [equipments.length, masterCatalog.length]);

  const formatDateBR = (dateStr?: string): string => {
    if (!dateStr || dateStr.trim() === '' || dateStr.trim().toUpperCase() === 'N/A') {
      return 'N/A';
    }
    const clean = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [yyyy, mm, dd] = clean.split('-');
      return `${dd}/${mm}/${yyyy}`;
    }
    return clean;
  };

  const formatIntervalLabel = (months?: number): string => {
    if (months === undefined || months === null) return '3m';
    if (months === 0) return 'Sob Demanda';
    if (months === 0.25) return '7 dias';
    if (months === 0.5) return '15 dias';
    return `${months}m`;
  };

  const normalizeImportedDate = (rawVal: any): string => {
    if (rawVal === undefined || rawVal === null) return 'N/A';
    const str = String(rawVal).trim();
    if (!str || str.toUpperCase() === 'N/A' || str === '-') return 'N/A';
    // DD/MM/YYYY -> YYYY-MM-DD
    const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const dd = brMatch[1].padStart(2, '0');
      const mm = brMatch[2].padStart(2, '0');
      const yyyy = brMatch[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    return str;
  };

  const normalizeImportedServiceStatus = (rawStatus: any): ServiceItemStatus => {
    const str = String(rawStatus || '').trim().toLowerCase();
    if (str.includes('agend')) return 'Agendada';
    if (str.includes('manut')) return 'Em manutenção';
    if (str.includes('venc') || str.includes('atras')) return 'Vencida';
    return 'Em operação';
  };

  const handleCycleServiceItemStatus = (equipmentId: string, itemId: string) => {
    const statusOrder: ServiceItemStatus[] = [
      'Em operação',
      'Agendada',
      'Em manutenção',
      'Vencida',
    ];
    setEquipments((prev) =>
      prev.map((eq) => {
        if (eq.id !== equipmentId || !eq.serviceItems) return eq;
        const updatedItems = eq.serviceItems.map((si) => {
          if (si.id !== itemId) return si;
          const nextIdx = (statusOrder.indexOf(si.status) + 1) % statusOrder.length;
          return { ...si, status: statusOrder[nextIdx] };
        });
        return { ...eq, serviceItems: updatedItems };
      })
    );
  };

  const handleImportServiceProExcel = (rows: Record<string, any>[]) => {
    const updatedClients = [...clients];
    const groupedMap = new Map<string, { baseRow: Record<string, any>; items: EquipmentServiceItem[] }>();

    rows.forEach((row, idx) => {
      const eqName = (row.equipmentName || 'Máquina 01').trim();
      const clientName = (row.clientName || clients[0]?.name || 'Cliente Industrial').trim();
      const groupKey = `${clientName.toLowerCase()}::${eqName.toLowerCase()}`;

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, { baseRow: row, items: [] });
      }

      const partName = (row.serviceOrPartName || '').trim();
      if (partName) {
        groupedMap.get(groupKey)!.items.push({
          id: `si-imp-${Date.now()}-${idx}`,
          serviceOrPartName: partName,
          lastRevisionDate: normalizeImportedDate(row.lastRevisionDate),
          nextRevisionDate: normalizeImportedDate(row.nextRevisionDate),
          status: normalizeImportedServiceStatus(row.itemStatus),
          intervalDays: Number(row.preventiveIntervalDays) || undefined,
        });
      }
    });

    const newEquipments: Equipment[] = [];
    let groupIdx = 0;

    groupedMap.forEach(({ baseRow, items }) => {
      groupIdx += 1;
      const clientName = (baseRow.clientName || clients[0]?.name || 'Cliente Industrial').trim();
      let client = updatedClients.find((c) => c.name.toLowerCase() === clientName.toLowerCase());
      if (!client) {
        client = {
          id: `client-imp-${Date.now()}-${groupIdx}`,
          name: clientName,
          tradeName: clientName,
          cnpj: '00.000.000/0001-00',
          segment: 'Manufatura / Industrial',
          slaHours: 4,
          contractValueMonthly: 5500,
          contractStartDate: new Date().toISOString().split('T')[0],
          contractStatus: 'active',
          branches: [
            {
              id: `br-1-${groupIdx}`,
              name: 'Planta Principal',
              address: 'Av. Industrial, 1000',
              city: 'São Paulo',
              state: 'SP',
            },
          ],
          contacts: [
            {
              id: `ct-1-${groupIdx}`,
              name: 'Gestor da Planta',
              role: 'Gerente de Manutenção',
              email: 'manutencao@empresa.com.br',
              phone: '(11) 98765-4321',
              isPrimary: true,
            },
          ],
        };
        updatedClients.push(client);
      }

      const rawCrit = (baseRow.criticality || '').trim().toLowerCase();
      let criticality: 'low' | 'medium' | 'high' = 'medium';
      if (rawCrit.includes('crit') || rawCrit.includes('alt')) criticality = 'high';
      else if (rawCrit.includes('baix')) criticality = 'low';

      const branch = client.branches[0];
      const days = Number(baseRow.preventiveIntervalDays) || 15;
      const intervalMonths =
        days <= 7 ? 0.25 : days <= 15 ? 0.5 : Math.max(1, Math.round(days / 30));

      const validNextDates = items
        .map((i) => i.nextRevisionDate)
        .filter((d) => d && d !== 'N/A' && /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort();
      const validLastDates = items
        .map((i) => i.lastRevisionDate)
        .filter((d) => d && d !== 'N/A' && /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort();

      const computedNext =
        validNextDates[0] ||
        (items.length > 0
          ? 'N/A'
          : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const computedLast = validLastDates[validLastDates.length - 1] || 'N/A';

      newEquipments.push({
        id: `eq-imp-${Date.now()}-${groupIdx}`,
        clientId: client.id,
        clientName: client.name,
        branchId: branch?.id || 'branch-1',
        branchName: branch?.name || 'Planta Principal',
        name: (baseRow.equipmentName || 'Máquina 01').trim(),
        tag: (baseRow.tag || `MAQ-0${groupIdx}`).trim().toUpperCase(),
        category: (baseRow.sector || 'Geral').trim(),
        brand: (baseRow.manufacturer || 'Industrial').trim(),
        model: 'Standard',
        serialNumber: `SN-${Date.now().toString().slice(-6)}`,
        locationInPlant: (baseRow.sector || 'Chão de Fábrica').trim(),
        criticality,
        status: 'operational',
        lastServiceDate: computedLast,
        nextPreventiveDate: computedNext,
        specs: [],
        serviceItems: items,
        maintenancePlan: {
          intervalMonths,
          intervalDays: days,
          checklistItems:
            items.length > 0
              ? items.map((i) => i.serviceOrPartName)
              : ['Checar lubrificação', 'Inspecionar correias e ruídos anômalos'],
          recommendedParts: [],
        },
        qrCodeId: `QR-${Date.now().toString().slice(-6)}-${groupIdx}`,
      });
    });

    setClients(updatedClients);
    setEquipments((prev) => [...newEquipments, ...prev]);

    const totalServicesCount = newEquipments.reduce(
      (acc, eq) => acc + (eq.serviceItems?.length || 0),
      0
    );

    return {
      successCount: newEquipments.length,
      message: `${newEquipments.length} máquina(s) e ${totalServicesCount} serviço(s)/peça(s) importados com sucesso!`,
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
    if (!nextDateStr || nextDateStr.trim().toUpperCase() === 'N/A') {
      return {
        daysLeft: 9999,
        status: 'ok' as const,
        label: 'Sob Demanda (N/A)',
        badgeClass: tintedGlass
          ? 'bg-slate-500/20 text-slate-300 border-slate-400/35'
          : 'bg-slate-100 text-slate-700 border-slate-300',
        dotClass: 'bg-slate-400',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${nextDateStr}T00:00:00`);
    if (isNaN(target.getTime())) {
      return {
        daysLeft: 9999,
        status: 'ok' as const,
        label: nextDateStr,
        badgeClass: tintedGlass
          ? 'bg-slate-500/20 text-slate-300 border-slate-400/35'
          : 'bg-slate-100 text-slate-700 border-slate-300',
        dotClass: 'bg-slate-400',
      };
    }
    const diffMs = target.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        daysLeft,
        status: 'overdue' as const,
        label: `Vencida há ${Math.abs(daysLeft)} dia(s)`,
        badgeClass: tintedGlass
          ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
          : 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    }
    if (daysLeft === 0) {
      return {
        daysLeft,
        status: 'overdue' as const,
        label: 'Vence Hoje!',
        badgeClass: tintedGlass
          ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
          : 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    }
    if (daysLeft <= 15) {
      return {
        daysLeft,
        status: 'due_15' as const,
        label: `Vence em ${daysLeft} dia(s)`,
        badgeClass: tintedGlass
          ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
          : 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-400',
      };
    }
    if (daysLeft <= 30) {
      return {
        daysLeft,
        status: 'due_30' as const,
        label: `Próxima: faltam ${daysLeft} dias`,
        badgeClass: tintedGlass
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
          : 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-cyan-400',
      };
    }
    return {
      daysLeft,
      status: 'ok' as const,
      label: `Em dia (${daysLeft} dias)`,
      badgeClass: tintedGlass
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-400',
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
    setEquipments((prev) => {
      const exists = prev.some((e) => e.id === newEquipment.id);
      if (exists) {
        return prev.map((e) => (e.id === newEquipment.id ? newEquipment : e));
      }
      return [newEquipment, ...prev];
    });
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
      serviceItems: model.serviceItems ? model.serviceItems.map((s) => ({ ...s })) : undefined,
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
      {/* =====================================================================
          HEADER EXECUTIVO INTEGRADO EM LIQUID GLASS + 5 SUB-CÁPSULAS KPI
      ===================================================================== */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-500 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        {/* Reflexo de Luz Safira / Ciano no Topo Direito */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-25 pointer-events-none blur-[95px]"
          style={{
            background:
              'radial-gradient(circle, rgba(37, 99, 235, 0.75) 0%, rgba(6, 182, 212, 0.35) 55%, transparent 75%)',
          }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                  tintedGlass
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" /> Manutenção & Engenharia de Serviços B2B
              </span>
              <span
                className={`text-xs font-medium ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Unidade: {currentTenant?.name || 'Aptis Tecnologia (Admin Master)'}
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 ${
                tintedGlass ? 'text-white drop-shadow-sm' : 'text-slate-900'
              }`}
            >
              Aptis Service Pro • Gestão de Manutenção & Contratos
            </h1>
            <p
              className={`text-sm max-w-3xl mt-1 ${
                tintedGlass ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Controle centralizado para gestores de manutenção industrial: contratos B2B, inventário de ativos com controle automático de vencimento preventivo, baixa de OS com laudo e inteligência preditiva.
            </p>
          </div>

          {/* Global Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsExcelImporterOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition cursor-pointer ${
                tintedGlass
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/35 shadow-[0_0_16px_rgba(16,185,129,0.2)]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-2xs'
              }`}
              title="Importar catálogo de máquinas e clientes do Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Importar Excel
            </button>

            <button
              onClick={() => {
                setEditingEquipment(null);
                setIsImporterOpen(true);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-subcard text-slate-200 hover:text-white hover:border-cyan-400/40'
                  : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs'
              }`}
            >
              <Cpu className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
              + Cadastrar Máquina
            </button>

            <button
              onClick={() => {
                setEditingWorkOrder(null);
                setIsWorkOrderModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-cyan-300/35 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow:
                  '0 0 22px rgba(6, 182, 212, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
              }}
            >
              <Plus className="w-4 h-4" />
              Nova Ordem de Serviço
            </button>
          </div>
        </div>

        {/* 5 SUB-CÁPSULAS KPI INTEGRADAS AO HEADER */}
        <div
          className={`grid grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6 pt-5 border-t relative z-10 ${
            tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
          }`}
        >
          {/* KPI 1: Faturamento (MRR) */}
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className={tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}>
                Faturamento (MRR)
              </span>
              <DollarSign
                className={`w-4 h-4 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}
              />
            </div>
            <div
              className={`text-2xl font-black tracking-tight ${
                tintedGlass
                  ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-emerald-600'
              }`}
            >
              {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <span
              className={`text-[11px] font-medium ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {clients.length} clientes ativos
            </span>
          </div>

          {/* KPI 2: Parque sob Gestão */}
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className={tintedGlass ? 'text-slate-300' : 'text-slate-600'}>
                Parque sob Gestão
              </span>
              <Cpu className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
            </div>
            <div
              className={`text-2xl font-black tracking-tight ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              {totalEquipments} Máquinas
            </div>
            <span
              className={`text-[11px] font-medium ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Com TAGs QR Code ativas
            </span>
          </div>

          {/* KPI 3: Máquinas Críticas */}
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className={tintedGlass ? 'text-amber-300' : 'text-amber-700'}>
                Máquinas Críticas
              </span>
              <AlertTriangle
                className={`w-4 h-4 ${tintedGlass ? 'text-amber-400' : 'text-amber-600'}`}
              />
            </div>
            <div
              className={`text-2xl font-black tracking-tight ${
                tintedGlass
                  ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-amber-600'
              }`}
            >
              {criticalEquipments} Ativos
            </div>
            <span
              className={`text-[11px] font-medium ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Linhas de parada severa
            </span>
          </div>

          {/* KPI 4: OSs em Aberto */}
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className={tintedGlass ? 'text-cyan-300' : 'text-blue-600'}>
                OSs em Aberto
              </span>
              <Clock className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
            </div>
            <div
              className={`text-2xl font-black tracking-tight ${
                tintedGlass
                  ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-blue-600'
              }`}
            >
              {pendingOrders} Agendadas
            </div>
            <span
              className={`text-[11px] font-medium ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Visitas para executar
            </span>
          </div>

          {/* KPI 5: OSs Concluídas */}
          <div
            className={`col-span-2 lg:col-span-1 p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className={tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}>
                OSs Concluídas
              </span>
              <CheckCircle2
                className={`w-4 h-4 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}
              />
            </div>
            <div
              className={`text-2xl font-black tracking-tight ${
                tintedGlass
                  ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-emerald-600'
              }`}
            >
              {completedOrders} Laudos
            </div>
            <span
              className={`text-[11px] font-medium ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Assinadas digitalmente
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          NAVEGAÇÃO POR ABAS EM MENISCUS LIQUID BEAD PILL BAR
      ===================================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="aptis-meniscus-track inline-flex items-center p-1.5 rounded-full gap-1 max-w-full overflow-x-auto">
          {[
            {
              key: 'cockpit',
              label: 'Cockpit Geral',
              icon: Activity,
              beadGradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              glowColor: 'rgba(6, 182, 212, 0.55)',
            },
            {
              key: 'equipments',
              label: 'Parque de Máquinas',
              icon: Cpu,
              count: equipments.length,
              beadGradient: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)',
              glowColor: 'rgba(59, 130, 246, 0.55)',
            },
            {
              key: 'calendar',
              label: 'Agenda & Visitas',
              icon: Calendar,
              count: pendingOrders,
              beadGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              glowColor: 'rgba(16, 185, 129, 0.55)',
            },
            {
              key: 'work_orders',
              label: 'Ordens de Serviço (OS)',
              icon: FileText,
              count: workOrders.length,
              beadGradient: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              glowColor: 'rgba(79, 70, 229, 0.55)',
            },
            {
              key: 'diagnostics',
              label: 'Copiloto IA (Waze)',
              icon: Sparkles,
              count: diagnostics.length,
              beadGradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
              glowColor: 'rgba(245, 158, 11, 0.55)',
            },
            {
              key: 'catalog',
              label: 'Catálogo Mestre',
              icon: Layers,
              count: masterCatalog.length,
              beadGradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
              glowColor: 'rgba(139, 92, 246, 0.55)',
            },
            {
              key: 'clients',
              label: 'Clientes & Contratos',
              icon: Building2,
              count: clients.length,
              beadGradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
              glowColor: 'rgba(20, 184, 166, 0.55)',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isActive ? 'text-white scale-[1.02]' : 'text-slate-300 hover:text-white'
                }`}
                style={
                  isActive
                    ? {
                        background: tab.beadGradient,
                        boxShadow: `0 0 22px ${tab.glowColor}, inset 0 1.5px 1px rgba(255, 255, 255, 0.65), inset 0 -2px 4px rgba(0, 0, 0, 0.25)`,
                      }
                    : undefined
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-black/25 text-white border border-white/25'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cápsula de Filtro Rápido por Cliente */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border shrink-0 transition-all ${
            tintedGlass
              ? 'aptis-glass-subcard text-white border-white/15'
              : 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${
              tintedGlass ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Cliente B2B:
          </span>
          <select
            value={equipmentClientFilter}
            onChange={(e) => setEquipmentClientFilter(e.target.value)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer ${
              tintedGlass ? 'text-cyan-300' : 'text-slate-900'
            }`}
          >
            <option value="all" className="bg-slate-900 text-white">
              Todos os Clientes ({clients.length})
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: COCKPIT GERAL
      ===================================================================== */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          {/* Quick Action Shortcuts Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => {
                setEditingEquipment(null);
                setIsImporterOpen(true);
              }}
              className={`p-5 rounded-3xl transition-all duration-300 cursor-pointer group ${
                tintedGlass
                  ? 'aptis-glass-dark aptis-glass-subcard-interactive text-white'
                  : 'aptis-glass-light hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md border border-white/25"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    boxShadow: '0 0 18px rgba(6, 182, 212, 0.35)',
                  }}
                >
                  <Cpu className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    tintedGlass
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  NOVO ATIVO
                </span>
              </div>
              <h3
                className={`text-sm font-black transition ${
                  tintedGlass
                    ? 'text-white group-hover:text-cyan-300'
                    : 'text-slate-900 group-hover:text-blue-700'
                }`}
              >
                Cadastrar Nova Máquina no Parque
              </h3>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Cadastre máquinas por formulário direto, herde dados do Catálogo Mestre ou anexe foto/PDF opcional.
              </p>
            </div>

            <div
              onClick={() => {
                setEditingWorkOrder(null);
                setIsWorkOrderModalOpen(true);
              }}
              className={`p-5 rounded-3xl transition-all duration-300 cursor-pointer group ${
                tintedGlass
                  ? 'aptis-glass-dark aptis-glass-subcard-interactive text-white'
                  : 'aptis-glass-light hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md border border-white/25"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    boxShadow: '0 0 18px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    tintedGlass
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                >
                  PROGRAMAÇÃO
                </span>
              </div>
              <h3
                className={`text-sm font-black transition ${
                  tintedGlass
                    ? 'text-white group-hover:text-emerald-300'
                    : 'text-slate-900 group-hover:text-emerald-700'
                }`}
              >
                Agendar Visita Preventiva / Corretiva
              </h3>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Selecione o cliente, a máquina e o responsável. O cliente receberá lembretes automáticos no WhatsApp antes da visita.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('diagnostics')}
              className={`p-5 rounded-3xl transition-all duration-300 cursor-pointer group ${
                tintedGlass
                  ? 'aptis-glass-dark aptis-glass-subcard-interactive text-white'
                  : 'aptis-glass-light hover:shadow-lg hover:-translate-y-1 hover:border-amber-300 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md border border-white/25"
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    boxShadow: '0 0 18px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  <Wrench className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    tintedGlass
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  WAZE DA MANUTENÇÃO
                </span>
              </div>
              <h3
                className={`text-sm font-black transition ${
                  tintedGlass
                    ? 'text-white group-hover:text-amber-300'
                    : 'text-slate-900 group-hover:text-amber-700'
                }`}
              >
                Consultar Copiloto Preditivo de Falhas
              </h3>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Veja o histórico cruzado de falhas em modelos idênticos em outros clientes e saiba quais peças separar antes da visita.
              </p>
            </div>
          </div>

          {/* Next visits & Critical Alert grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próximas Visitas Programadas */}
            <div
              className={`p-5 rounded-3xl space-y-4 transition-all ${
                tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar
                    className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`}
                  />
                  <h3 className={`text-sm font-black ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    Próximas Ordens de Serviço no Calendário
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`text-xs font-bold cursor-pointer transition ${
                    tintedGlass
                      ? 'text-cyan-400 hover:text-cyan-300'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  Ver Agenda Completa →
                </button>
              </div>

              <div className="space-y-2.5">
                {workOrders
                  .filter(
                    (wo) =>
                      equipmentClientFilter === 'all' || wo.clientId === equipmentClientFilter
                  )
                  .slice(0, 4)
                  .map((wo) => (
                    <div
                      key={wo.id}
                      className={`p-3.5 rounded-2xl transition-all flex items-center justify-between gap-3 text-xs ${
                        tintedGlass
                          ? 'aptis-glass-subcard aptis-glass-subcard-interactive text-white'
                          : 'bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md text-slate-900 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-black ${
                              tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                            }`}
                          >
                            {wo.orderNumber}
                          </span>
                          <span
                            className={`font-bold ${
                              tintedGlass ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            [{wo.equipmentTag}]
                          </span>
                        </div>
                        <p
                          className={`text-[11px] mt-0.5 ${
                            tintedGlass ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {wo.clientName} • {wo.technicianName} ({wo.scheduledDate})
                        </p>
                      </div>

                      <button
                        onClick={() => setMobileOSModalOrder(wo)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition text-[11px] cursor-pointer shrink-0 ${
                          tintedGlass
                            ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/35'
                            : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shadow-2xs'
                        }`}
                      >
                        <ClipboardCheck
                          className={`w-3.5 h-3.5 ${
                            tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                          }`}
                        />
                        Baixar / Laudo OS
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Equipamentos com Preventiva Próxima ou Crítica */}
            <div
              className={`p-5 rounded-3xl space-y-4 transition-all ${
                tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 ${tintedGlass ? 'text-amber-400' : 'text-amber-600'}`}
                  />
                  <h3 className={`text-sm font-black ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    Radar de Vencimentos Preventivos (Próximas Datas)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('equipments')}
                  className={`text-xs font-bold cursor-pointer transition ${
                    tintedGlass
                      ? 'text-cyan-400 hover:text-cyan-300'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  Ver Todas as Máquinas →
                </button>
              </div>

              <div className="space-y-2.5">
                {[...equipments]
                  .filter(
                    (eq) =>
                      equipmentClientFilter === 'all' || eq.clientId === equipmentClientFilter
                  )
                  .sort((a, b) => a.nextPreventiveDate.localeCompare(b.nextPreventiveDate))
                  .slice(0, 4)
                  .map((eq) => {
                    const dueInfo = getPreventiveStatusInfo(eq.nextPreventiveDate);
                    return (
                      <div
                        key={eq.id}
                        className={`p-3.5 rounded-2xl transition-all flex items-center justify-between gap-3 text-xs ${
                          tintedGlass
                            ? 'aptis-glass-subcard aptis-glass-subcard-interactive text-white'
                            : 'bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md text-slate-900 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-mono font-black ${
                                tintedGlass ? 'text-cyan-300' : 'text-slate-900'
                              }`}
                            >
                              [{eq.tag}]
                            </span>
                            <span
                              className={`font-bold line-clamp-1 ${
                                tintedGlass ? 'text-white' : 'text-slate-800'
                              }`}
                            >
                              {eq.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${dueInfo.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${dueInfo.dotClass}`} />
                              {dueInfo.label}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              tintedGlass ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {eq.clientName} • Vencimento:{' '}
                            <strong
                              className={`font-mono ${
                                tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                              }`}
                            >
                              {eq.nextPreventiveDate}
                            </strong>
                            {eq.lastServiceDate && (
                              <span
                                className={`ml-2 ${
                                  tintedGlass ? 'text-slate-400' : 'text-slate-400'
                                }`}
                              >
                                (Última: {eq.lastServiceDate})
                              </span>
                            )}
                          </p>
                        </div>

                        <button
                          onClick={() => setQRCodeModalEquipment(eq)}
                          className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                            tintedGlass
                              ? 'aptis-glass-subcard text-cyan-300 hover:text-white hover:border-cyan-400/40'
                              : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shadow-2xs'
                          }`}
                          title="Ver Etiqueta QR Code"
                        >
                          <QrCode
                            className={`w-4 h-4 ${
                              tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PARQUE DE MÁQUINAS
      ===================================================================== */}
      {activeTab === 'equipments' && (
        <div className="space-y-4">
          {/* Filter & Action Bar */}
          <div
            className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl transition-all ${
              tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="relative flex-1">
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                placeholder="Buscar por TAG, modelo, cliente ou número de série..."
                className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none font-medium transition ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-400'
                    : 'bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-2xs'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={equipmentDueFilter}
                onChange={(e) => setEquipmentDueFilter(e.target.value as any)}
                className={`text-xs rounded-xl px-3 py-2.5 outline-none font-bold cursor-pointer transition ${
                  tintedGlass
                    ? 'aptis-glass-input text-cyan-300 border-cyan-400/35'
                    : 'bg-blue-50/80 border border-blue-300 text-blue-900 shadow-2xs'
                }`}
              >
                <option value="all" className="bg-slate-900 text-white">
                  📅 Todos os Vencimentos
                </option>
                <option value="overdue" className="bg-slate-900 text-white">
                  🔴 Vencidas / Atrasadas
                </option>
                <option value="due_15" className="bg-slate-900 text-white">
                  🟡 Vencendo em até 15 dias
                </option>
                <option value="due_30" className="bg-slate-900 text-white">
                  🔵 Vencendo em até 30 dias
                </option>
                <option value="ok" className="bg-slate-900 text-white">
                  🟢 Em dia (&gt; 30 dias)
                </option>
              </select>

              <select
                value={equipmentClientFilter}
                onChange={(e) => setEquipmentClientFilter(e.target.value)}
                className={`text-xs rounded-xl px-3 py-2.5 outline-none font-medium cursor-pointer transition ${
                  tintedGlass
                    ? 'aptis-glass-input text-white'
                    : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
                }`}
              >
                <option value="all" className="bg-slate-900 text-white">
                  Todos os Clientes
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={equipmentCriticalityFilter}
                onChange={(e) => setEquipmentCriticalityFilter(e.target.value)}
                className={`text-xs rounded-xl px-3 py-2.5 outline-none font-medium cursor-pointer transition ${
                  tintedGlass
                    ? 'aptis-glass-input text-white'
                    : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
                }`}
              >
                <option value="all" className="bg-slate-900 text-white">
                  Todas as Criticidades
                </option>
                <option value="high" className="bg-slate-900 text-white">
                  Alta (Parada Severa)
                </option>
                <option value="medium" className="bg-slate-900 text-white">
                  Média
                </option>
                <option value="low" className="bg-slate-900 text-white">
                  Baixa
                </option>
              </select>

              <button
                onClick={() => {
                  setEditingEquipment(null);
                  setIsImporterOpen(true);
                }}
                className="px-4 py-2.5 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-cyan-300/35 hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  boxShadow:
                    '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Máquina
              </button>
            </div>
          </div>

          {/* Equipments Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipments.map((eq) => {
              const dueInfo = getPreventiveStatusInfo(eq.nextPreventiveDate);
              const hasServiceItems = !!(eq.serviceItems && eq.serviceItems.length > 0);
              const isTableExpanded = !!expandedServiceTableIds[eq.id];

              return (
                <div
                  key={eq.id}
                  className={`p-5 rounded-3xl transition-all duration-300 space-y-3 flex flex-col justify-between ${
                    hasServiceItems && isTableExpanded ? 'md:col-span-2 lg:col-span-3' : ''
                  } ${
                    tintedGlass
                      ? 'aptis-glass-dark aptis-glass-subcard-interactive text-white'
                      : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
                            tintedGlass
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {eq.tag}
                        </span>
                        {hasServiceItems && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedServiceTableIds((prev) => ({
                                ...prev,
                                [eq.id]: !prev[eq.id],
                              }))
                            }
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 cursor-pointer transition ${
                              tintedGlass
                                ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-400/35'
                                : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                            }`}
                          >
                            <Wrench className="w-3 h-3" />
                            {eq.serviceItems!.length} Serviços/Peças{' '}
                            {isTableExpanded ? '▲ Ocultar Tabela' : '▼ Ver Tabela'}
                          </button>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${dueInfo.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dueInfo.dotClass}`} />
                        {dueInfo.label}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-black mt-2.5 line-clamp-1 ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {eq.name}
                    </h3>
                    <p
                      className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}
                    >
                      {eq.brand} • {eq.model} {eq.capacity ? `(${eq.capacity})` : ''}
                    </p>

                    <div
                      className={`mt-3 p-3.5 rounded-2xl text-xs space-y-1.5 ${
                        tintedGlass
                          ? 'aptis-glass-subcard text-slate-200'
                          : 'bg-slate-50 border border-slate-200/90 text-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                          Cliente:
                        </span>
                        <strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>
                          {eq.clientName}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                          Localização:
                        </span>
                        <span
                          className={`truncate max-w-[200px] ${
                            tintedGlass ? 'text-slate-200' : 'text-slate-800'
                          }`}
                        >
                          {eq.locationInPlant}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                          Última Revisão:
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            tintedGlass ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          {formatDateBR(eq.lastServiceDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                          Próx. Preventiva:
                        </span>
                        <strong
                          className={`font-mono ${
                            tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                          }`}
                        >
                          {formatDateBR(eq.nextPreventiveDate)} (a cada{' '}
                          {formatIntervalLabel(eq.maintenancePlan?.intervalMonths)})
                        </strong>
                      </div>
                    </div>

                    {/* MATRIZ DE SERVIÇOS / PEÇAS DA MÁQUINA (ESTILO PLANILHA MÁQUINA 01) */}
                    {hasServiceItems && (
                      <div className="mt-3">
                        {!isTableExpanded ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedServiceTableIds((prev) => ({
                                ...prev,
                                [eq.id]: true,
                              }))
                            }
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between border transition cursor-pointer ${
                              tintedGlass
                                ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border-cyan-400/30'
                                : 'bg-sky-50/90 hover:bg-sky-100 text-sky-900 border-sky-200'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5" />
                              Matriz de Serviços / Peças ({eq.serviceItems!.length} itens)
                            </span>
                            <span className="text-[11px] underline">Abrir Tabela ▼</span>
                          </button>
                        ) : (
                          <div
                            className={`rounded-2xl border overflow-hidden ${
                              tintedGlass
                                ? 'bg-slate-950/55 border-cyan-400/30'
                                : 'bg-white border-sky-200 shadow-xs'
                            }`}
                          >
                            {/* Header estilo Planilha Máquina 01 */}
                            <div
                              className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
                                tintedGlass
                                  ? 'bg-cyan-500/15 border-cyan-400/25'
                                  : 'bg-sky-100/90 border-sky-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-black uppercase tracking-wider ${
                                    tintedGlass ? 'text-white' : 'text-slate-900'
                                  }`}
                                >
                                  {eq.name} — Controle de Serviços / Peças
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    tintedGlass
                                      ? 'bg-white/10 text-cyan-200'
                                      : 'bg-white text-sky-800 border border-sky-200'
                                  }`}
                                >
                                  Clique no Status para alternar ou em Editar para alterar datas
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingEquipment(eq);
                                    setIsImporterOpen(true);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                                    tintedGlass
                                      ? 'bg-cyan-500/25 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-400/40'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}
                                >
                                  <Edit3 className="w-3 h-3" /> Editar / Adicionar Peças
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedServiceTableIds((prev) => ({
                                      ...prev,
                                      [eq.id]: false,
                                    }))
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                    tintedGlass
                                      ? 'text-slate-300 hover:bg-white/10'
                                      : 'text-slate-600 hover:bg-white'
                                  }`}
                                >
                                  Recolher ▲
                                </button>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr
                                    className={`border-b font-black text-[11px] ${
                                      tintedGlass
                                        ? 'bg-white/[0.04] border-white/10 text-cyan-200'
                                        : 'bg-sky-50/90 border-sky-200 text-slate-800'
                                    }`}
                                  >
                                    <th className="py-2 px-3 text-left border-r border-slate-300/20">
                                      Serviços / Peças
                                    </th>
                                    <th className="py-2 px-3 text-center w-36 border-r border-slate-300/20">
                                      Última revisão
                                    </th>
                                    <th className="py-2 px-3 text-center w-36 border-r border-slate-300/20">
                                      Próxima revisão
                                    </th>
                                    <th className="py-2 px-3 text-center w-44">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-300/20">
                                  {eq.serviceItems!.map((item, idx) => (
                                    <tr
                                      key={item.id || idx}
                                      className={
                                        tintedGlass
                                          ? idx % 2 === 0
                                            ? 'bg-white/[0.01] hover:bg-white/[0.05]'
                                            : 'bg-cyan-500/[0.04] hover:bg-white/[0.06]'
                                          : idx % 2 === 0
                                          ? 'bg-white hover:bg-sky-50/60'
                                          : 'bg-sky-50/40 hover:bg-sky-100/50'
                                      }
                                    >
                                      <td
                                        className={`py-2 px-3 font-semibold border-r border-slate-300/20 ${
                                          tintedGlass ? 'text-white' : 'text-slate-900'
                                        }`}
                                      >
                                        {item.serviceOrPartName}
                                      </td>
                                      <td
                                        className={`py-2 px-3 text-center font-mono font-bold border-r border-slate-300/20 ${
                                          item.lastRevisionDate === 'N/A'
                                            ? tintedGlass
                                              ? 'text-slate-400'
                                              : 'text-slate-500'
                                            : tintedGlass
                                            ? 'text-slate-200'
                                            : 'text-slate-800'
                                        }`}
                                      >
                                        {formatDateBR(item.lastRevisionDate)}
                                      </td>
                                      <td
                                        className={`py-2 px-3 text-center font-mono font-bold border-r border-slate-300/20 ${
                                          item.nextRevisionDate === 'N/A'
                                            ? tintedGlass
                                              ? 'text-slate-400'
                                              : 'text-slate-500'
                                            : tintedGlass
                                            ? 'text-cyan-300'
                                            : 'text-blue-700'
                                        }`}
                                      >
                                        {formatDateBR(item.nextRevisionDate)}
                                      </td>
                                      <td className="py-1.5 px-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleCycleServiceItemStatus(eq.id, item.id)
                                          }
                                          title="Clique para alternar o status"
                                          className={`px-3 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer transition ${
                                            item.status === 'Em operação'
                                              ? tintedGlass
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35 hover:bg-emerald-500/30'
                                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                              : item.status === 'Agendada'
                                              ? tintedGlass
                                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35 hover:bg-cyan-500/30'
                                                : 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                                              : item.status === 'Em manutenção'
                                              ? tintedGlass
                                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/35 hover:bg-amber-500/30'
                                                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                              : tintedGlass
                                              ? 'bg-rose-500/20 text-rose-300 border-rose-400/35 hover:bg-rose-500/30'
                                              : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                                          }`}
                                        >
                                          {item.status}
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Norm Badge */}
                    {eq.maintenancePlan?.legalNorm && (
                      <div
                        className={`mt-2.5 text-[10px] font-bold flex items-center gap-1 ${
                          tintedGlass ? 'text-amber-300' : 'text-amber-700'
                        }`}
                      >
                        <ShieldCheck
                          className={`w-3.5 h-3.5 ${
                            tintedGlass ? 'text-amber-400' : 'text-amber-600'
                          }`}
                        />
                        Regulamentado por {eq.maintenancePlan.legalNorm}
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div
                    className={`pt-3 border-t flex items-center justify-between gap-2 ${
                      tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => setQRCodeModalEquipment(eq)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition cursor-pointer ${
                        tintedGlass
                          ? 'aptis-glass-subcard text-slate-200 hover:text-white hover:border-cyan-400/40'
                          : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs'
                      }`}
                    >
                      <QrCode
                        className={`w-3.5 h-3.5 ${
                          tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                        }`}
                      />
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
                      className="flex-1 py-2 px-3 rounded-xl text-white font-bold flex items-center justify-center gap-1.5 text-xs transition cursor-pointer border border-cyan-300/35 hover:brightness-110"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                        boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
                      }}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Agendar OS
                    </button>

                    <button
                      onClick={() => {
                        setEditingEquipment(eq);
                        setIsImporterOpen(true);
                      }}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        tintedGlass
                          ? 'aptis-glass-subcard text-slate-300 hover:text-cyan-300'
                          : 'border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 shadow-2xs'
                      }`}
                      title="Editar equipamento"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteEquipment(eq.id, eq.name)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        tintedGlass
                          ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30'
                          : 'border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 shadow-2xs'
                      }`}
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

      {/* =====================================================================
          TAB 3: AGENDA & VISITAS
      ===================================================================== */}
      {activeTab === 'calendar' && (
        <ScheduleCalendarView
          tintedGlass={tintedGlass}
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

      {/* =====================================================================
          TAB 4: ORDENS DE SERVIÇO (OS)
      ===================================================================== */}
      {activeTab === 'work_orders' && (
        <div className="space-y-4">
          <div
            className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl transition-all ${
              tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="relative flex-1">
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                value={woSearch}
                onChange={(e) => setWoSearch(e.target.value)}
                placeholder="Buscar por OS, cliente, equipamento ou responsável..."
                className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none font-medium transition ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-400'
                    : 'bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-2xs'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={woStatusFilter}
                onChange={(e) => setWoStatusFilter(e.target.value)}
                className={`text-xs rounded-xl px-3 py-2.5 outline-none font-medium cursor-pointer transition ${
                  tintedGlass
                    ? 'aptis-glass-input text-white'
                    : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
                }`}
              >
                <option value="all" className="bg-slate-900 text-white">
                  Todos os Status
                </option>
                <option value="scheduled" className="bg-slate-900 text-white">
                  Agendadas
                </option>
                <option value="in_progress" className="bg-slate-900 text-white">
                  Em Andamento
                </option>
                <option value="completed" className="bg-slate-900 text-white">
                  Concluídas
                </option>
              </select>

              <button
                onClick={() => {
                  setEditingWorkOrder(null);
                  setIsWorkOrderModalOpen(true);
                }}
                className="px-5 py-2.5 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-cyan-300/35 hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  boxShadow:
                    '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                }}
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
                className={`p-4 rounded-2xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  tintedGlass
                    ? 'aptis-glass-dark aptis-glass-subcard-interactive text-white'
                    : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-300 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                      tintedGlass
                        ? 'aptis-glass-subcard text-cyan-300 border-cyan-400/35'
                        : 'bg-slate-100 border-slate-200 text-blue-700 shadow-2xs'
                    }`}
                  >
                    {order.type === 'preventive' ? 'PREV' : 'CORR'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-black text-xs ${
                          tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                        }`}
                      >
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          order.status === 'completed'
                            ? tintedGlass
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tintedGlass
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {order.status === 'completed' ? 'Concluída' : 'Em Aberto'}
                      </span>
                    </div>
                    <h4
                      className={`text-sm font-black mt-0.5 ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      [{order.equipmentTag}] • {order.equipmentName}
                    </h4>
                    <p
                      className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}
                    >
                      {order.clientName} • Data: {order.scheduledDate} • Responsável:{' '}
                      {order.technicianName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  {order.clientSignatureBase64 && (
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                        tintedGlass
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Laudo Assinado
                    </span>
                  )}

                  <button
                    onClick={() => setMobileOSModalOrder(order)}
                    className="px-4 py-2 text-xs font-bold rounded-xl text-white transition flex items-center gap-1.5 cursor-pointer border border-cyan-300/35 hover:brightness-110"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                      boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
                    }}
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    {order.status === 'completed'
                      ? 'Ver Laudo da OS'
                      : 'Registrar Execução / Baixar OS'}
                  </button>

                  <button
                    onClick={() => handleDeleteWorkOrder(order.id, order.orderNumber)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      tintedGlass
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30'
                        : 'border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 shadow-2xs'
                    }`}
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

      {/* =====================================================================
          TAB 5: COPILOTO IA (WAZE DA MANUTENÇÃO)
      ===================================================================== */}
      {activeTab === 'diagnostics' && (
        <CrossClientAiDiagnostics
          tintedGlass={tintedGlass}
          diagnostics={diagnostics}
          equipments={equipments}
          masterCatalog={masterCatalog}
          onApplyDiagnosticToOrder={handleApplyDiagnosticToOrder}
          onSaveDiagnostic={handleSaveDiagnostic}
          onDeleteDiagnostic={handleDeleteDiagnostic}
        />
      )}

      {/* =====================================================================
          TAB 6: CATÁLOGO MESTRE
      ===================================================================== */}
      {activeTab === 'catalog' && (
        <MasterCatalogPanel
          tintedGlass={tintedGlass}
          catalog={masterCatalog}
          clients={clients}
          equipments={equipments}
          onDeployToClient={handleDeployCatalogModel}
          onSaveCatalogItem={handleSaveCatalogItem}
          onDeleteItem={handleDeleteCatalogItem}
          onGenerateBatchWorkOrders={handleGenerateBatchWorkOrders}
        />
      )}

      {/* =====================================================================
          TAB 7: CLIENTES & CONTRATOS
      ===================================================================== */}
      {activeTab === 'clients' && (
        <ClientManager
          tintedGlass={tintedGlass}
          clients={clients}
          onAddClient={(newClient) => setClients((prev) => [newClient, ...prev])}
          onOpenPortalSimulation={(client) => setPortalSimulationClient(client)}
          onDeleteClient={handleDeleteClient}
        />
      )}

      {/* Modals */}
      <SmartDocumentImporterModal
        tintedGlass={tintedGlass}
        isOpen={isImporterOpen}
        onClose={() => {
          setIsImporterOpen(false);
          setEditingEquipment(null);
        }}
        clients={clients}
        masterCatalog={masterCatalog}
        onImportEquipment={handleImportEquipment}
        onSaveCatalogItem={handleSaveCatalogItem}
        editingEquipment={editingEquipment}
      />

      <QRCodeManagerModal
        tintedGlass={tintedGlass}
        isOpen={!!qrCodeModalEquipment}
        onClose={() => setQRCodeModalEquipment(null)}
        equipment={qrCodeModalEquipment}
      />

      <DigitalOSMobileModal
        tintedGlass={tintedGlass}
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
        tintedGlass={tintedGlass}
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        clients={clients}
        equipments={equipments}
        onSave={handleSaveWorkOrder}
        editingOrder={editingWorkOrder}
      />

      <ClientPortalModal
        tintedGlass={tintedGlass}
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
