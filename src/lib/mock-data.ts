import { Tenant, User, License, LeadRequest } from '@/types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Alfa Metalúrgica & Indústria S/A',
    document: '12.345.678/0001-90',
    plan: 'pro',
    status: 'active',
    createdAt: '2025-01-15',
    segment: 'Indústria Metalmecânica',
    employeeCount: 320,
    contactEmail: 'operacoes@alfa.ind.br'
  },
  {
    id: 'tenant-2',
    name: 'Beta Logística & Distribuição Ltda',
    document: '98.765.432/0001-11',
    plan: 'enterprise',
    status: 'active',
    createdAt: '2025-03-10',
    segment: 'Transporte e Supply Chain',
    employeeCount: 850,
    contactEmail: 'diretoria@betalog.com.br'
  },
  {
    id: 'tenant-3',
    name: 'Gama Serviços Industriais',
    document: '45.123.789/0001-44',
    plan: 'starter',
    status: 'active',
    createdAt: '2025-06-01',
    segment: 'Manutenção e Montagens',
    employeeCount: 65,
    contactEmail: 'contato@gamaservicos.com'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    tenantId: 'tenant-1',
    name: 'Carlos Silveira',
    email: 'carlos.silveira@alfa.ind.br',
    role: 'tenant_admin',
    department: 'Gerência de Operações'
  },
  {
    id: 'user-2',
    tenantId: 'tenant-1',
    name: 'Mariana Souza',
    email: 'mariana.souza@alfa.ind.br',
    role: 'member',
    department: 'Supervisão de Turno A'
  },
  {
    id: 'user-superadmin',
    tenantId: 'tenant-1', // Superadmin can view and switch to any tenant
    name: 'Roberto Vianna (Admin Global)',
    email: 'admin@ecossistemalider.com.br',
    role: 'superadmin',
    department: 'Gestão da Plataforma'
  }
];

export const INITIAL_LICENSES: License[] = [
  // Tenant 1 (Alfa): tem manager-tasks e skills-matrix
  {
    id: 'lic-1',
    tenantId: 'tenant-1',
    toolId: 'manager-tasks',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-01-15'
  },
  {
    id: 'lic-2',
    tenantId: 'tenant-1',
    toolId: 'skills-matrix',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-01-15'
  },
  {
    id: 'lic-3',
    tenantId: 'tenant-1',
    toolId: 'training-matrix',
    isActive: false, // Não contratado ainda
    validUntil: '2025-12-31',
    assignedAt: '2025-01-15'
  },
  {
    id: 'lic-4',
    tenantId: 'tenant-1',
    toolId: 'kaizen-manager',
    isActive: false, // Não contratado ainda
    validUntil: '2025-12-31',
    assignedAt: '2025-01-15'
  },
  {
    id: 'lic-1-one-on-one',
    tenantId: 'tenant-1',
    toolId: 'one-on-one',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-01-15'
  },
  {
    id: 'lic-1-pdi',
    tenantId: 'tenant-1',
    toolId: 'pdi-manager',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-01-15'
  },

  // Tenant 2 (Beta): tem todas as ferramentas ativas
  {
    id: 'lic-5',
    tenantId: 'tenant-2',
    toolId: 'manager-tasks',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-03-10'
  },
  {
    id: 'lic-6',
    tenantId: 'tenant-2',
    toolId: 'skills-matrix',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-03-10'
  },
  {
    id: 'lic-7',
    tenantId: 'tenant-2',
    toolId: 'training-matrix',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-03-10'
  },
  {
    id: 'lic-8',
    tenantId: 'tenant-2',
    toolId: 'kaizen-manager',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-03-10'
  },
  {
    id: 'lic-2-one-on-one',
    tenantId: 'tenant-2',
    toolId: 'one-on-one',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-03-10'
  },
  {
    id: 'lic-2-pdi',
    tenantId: 'tenant-2',
    toolId: 'pdi-manager',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-03-10'
  },

  // Tenant 3 (Gama): tem apenas manager-tasks
  {
    id: 'lic-9',
    tenantId: 'tenant-3',
    toolId: 'manager-tasks',
    isActive: true,
    validUntil: '2027-12-31',
    assignedAt: '2025-06-01'
  }
];

export const INITIAL_LEADS: LeadRequest[] = [
  {
    id: 'lead-1',
    toolId: 'training-matrix',
    toolName: 'Matriz de Treinamentos e NRs',
    companyName: 'Delta Alimentos S/A',
    contactName: 'Juliana Paes',
    email: 'juliana.paes@deltaalimentos.com.br',
    phone: '(11) 98765-4321',
    teamSize: '150-500 colaboradores',
    notes: 'Precisamos regularizar os vencimentos de NR-12 e NR-33 na fábrica.',
    createdAt: '2026-03-01',
    status: 'pending'
  },
  {
    id: 'lead-2',
    toolId: 'kaizen-manager',
    toolName: 'Gerenciador de Kaizens e Melhorias',
    companyName: 'Omega Manufatura Plástica',
    contactName: 'Fernando Dias',
    email: 'fernando@omegamanufatura.com.br',
    phone: '(47) 99123-8899',
    teamSize: '50-150 colaboradores',
    notes: 'Queremos implantar premiação de ideias de melhoria para os operadores.',
    createdAt: '2026-03-03',
    status: 'contacted'
  }
];
