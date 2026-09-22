export type UserRole = 'superadmin' | 'tenant_admin' | 'member';

export type TenantPlan = 'starter' | 'pro' | 'enterprise';

export type TenantStatus = 'active' | 'suspended' | 'trial';

export interface Tenant {
  id: string;
  name: string;
  document: string; // CNPJ ou documento empresarial
  plan: TenantPlan;
  status: TenantStatus;
  createdAt: string;
  segment?: string;
  employeeCount?: number;
  contactEmail?: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
}

export interface License {
  id: string;
  tenantId: string;
  toolId: string;
  isActive: boolean;
  validUntil: string;
  assignedAt: string;
}

export type ToolCategory = 
  | 'Rotina & Tarefas' 
  | 'Gestão de Pessoas' 
  | 'Capacitação & Compliance' 
  | 'Melhoria Contínua'
  | 'Planejamento & PCP'
  | 'Qualidade & WCM';

export type ToolStatus = 'active' | 'beta' | 'coming_soon';

export interface ToolDefinition {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: ToolCategory;
  route: string;
  iconName: string;
  status: ToolStatus;
  badge?: string;
  keyFeatures: string[];
  recommendedPlan: TenantPlan;
  colorTheme: {
    bg: string;
    text: string;
    border: string;
    hover: string;
    lightBg: string;
  };
}

export interface LeadRequest {
  id: string;
  toolId: string;
  toolName: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  teamSize: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'contacted' | 'converted';
}
