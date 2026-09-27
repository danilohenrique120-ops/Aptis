export type EquipmentStatus = 'operational' | 'warning' | 'critical' | 'maintenance';
export type WorkOrderStatus = 'scheduled' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';
export type WorkOrderType = 'preventive' | 'corrective' | 'predictive' | 'installation';

export interface ClientContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface ClientBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contactPerson?: string;
  contactPhone?: string;
}

export interface ClientContractor {
  id: string;
  name: string;
  tradeName?: string;
  cnpj: string;
  segment: string;
  slaHours: number; // Ex: 4 horas para emergências
  contractValueMonthly: number;
  contractStartDate: string;
  contractStatus: 'active' | 'pending' | 'suspended';
  branches: ClientBranch[];
  contacts: ClientContact[];
  notes?: string;
  totalEquipmentsCount?: number;
}

export interface EquipmentSpec {
  key: string;
  label: string;
  value: string;
}

export interface EquipmentMaintenancePlan {
  intervalMonths: number;
  intervalHours?: number;
  checklistItems: string[];
  recommendedParts: string[];
  legalNorm?: 'PMOC' | 'NR-10' | 'NR-12' | 'NR-13' | 'Outro';
}

export interface Equipment {
  id: string;
  clientId: string;
  clientName?: string;
  branchId: string;
  branchName?: string;
  tag: string; // Ex: COMP-01, CHILL-02
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufacturingYear?: number;
  capacity?: string; // Ex: 40 HP, 150 TR, 10 Ton
  locationInPlant: string; // Ex: Galpão 02 - Sala de Máquinas
  criticality: 'high' | 'medium' | 'low';
  status: EquipmentStatus;
  lastServiceDate?: string;
  nextPreventiveDate: string;
  specs: EquipmentSpec[];
  maintenancePlan: EquipmentMaintenancePlan;
  manualUrl?: string;
  qrCodeId: string;
  qrCodeUrl?: string;
  notes?: string;
}

export interface MasterCatalogItem {
  id: string;
  category: string;
  brand: string;
  model: string;
  capacity: string;
  specs: EquipmentSpec[];
  maintenancePlan: EquipmentMaintenancePlan;
  commonSpareParts: {
    code: string;
    description: string;
    suggestedReplacementInterval: string;
  }[];
  manualPdfName?: string;
  activeDeploymentsCount: number;
}

export interface ChecklistItemState {
  id: string;
  description: string;
  status: 'passed' | 'failed' | 'not_applicable';
  notes?: string;
}

export interface SparePartUsed {
  partCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface MaintenanceWorkOrder {
  id: string;
  orderNumber: string; // Ex: OS-2026-084
  clientId: string;
  clientName: string;
  branchId: string;
  branchName: string;
  equipmentId: string;
  equipmentTag: string;
  equipmentName: string;
  equipmentModel: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  scheduledDate: string;
  scheduledTimeWindow?: string;
  completedDate?: string;
  technicianName: string;
  technicianPhone?: string;
  symptomsReported: string;
  rootCauseFound?: string;
  actionsTaken?: string;
  checklist: ChecklistItemState[];
  sparePartsUsed: SparePartUsed[];
  laborHours: number;
  laborCost: number;
  totalCost: number;
  beforePhotos: string[];
  afterPhotos: string[];
  clientSignatureBase64?: string;
  signedByName?: string;
  signedAt?: string;
  whatsappConfirmationSent: boolean;
  technicalReportSummary?: string;
}

export interface HistoricalCauseOccurrence {
  cause: string;
  resolution: string;
  recommendedParts: string[];
  confidenceScore: number; // 0 a 100
  casesResolvedCount: number;
  clientsAffected: string[];
}

export interface CrossClientDiagnostic {
  equipmentModel: string;
  equipmentCategory: string;
  symptomTitle: string;
  symptomKeywords: string[];
  causes: HistoricalCauseOccurrence[];
  averageRepairTimeHours: number;
}

export interface NotificationRule {
  id: string;
  type: '30_days_before' | '7_days_before' | '1_day_before' | 'post_service';
  title: string;
  channel: 'whatsapp' | 'email' | 'both';
  templateMessage: string;
  isEnabled: boolean;
}
