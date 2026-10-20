import { Tenant, User, License } from '@/types';
import { TOOLS_REGISTRY } from './tools-registry';

/**
 * ============================================================================
 * APTIS - REGISTRO CENTRAL DE CLIENTES & LICENÇAS (SOURCE OF TRUTH)
 * ============================================================================
 * 
 * Este arquivo é a ÚNICA fonte da verdade para o provisionamento de clientes
 * e módulos no ecossistema Aptis.
 */

export interface RegisteredClientConfig {
  tenant: Tenant;
  users: User[];
  /** IDs das ferramentas que a empresa tem contratadas. Use 'ALL' para todas. */
  activeTools: string[] | 'ALL';
}

export const REGISTERED_CLIENTS: RegisteredClientConfig[] = [
  // --------------------------------------------------------------------------
  // AMBIENTE MASTER DO FUNDADOR (Uso interno do Admin Aptis)
  // Mantém o ID 'tenant-dhp' para preservar suas tarefas reais do Aptis Routine!
  // --------------------------------------------------------------------------
  {
    tenant: {
      id: 'tenant-dhp',
      name: 'Aptis Tecnologia (Admin Master)',
      document: 'Governança & Diretoria',
      plan: 'enterprise',
      status: 'active',
      createdAt: '2026-01-01',
      segment: 'Administração Central da Plataforma',
      employeeCount: 1,
      contactEmail: 'admin@aptis.com.br'
    },
    users: [],
    activeTools: 'ALL'
  },

  // --------------------------------------------------------------------------
  // CLIENTE 1: Manu Manutenções (Contrato de Manutenção - Módulo Único)
  // --------------------------------------------------------------------------
  {
    tenant: {
      id: 'manu-manutencoes',
      name: 'Manu Manutenções',
      document: '48.912.345/0001-88',
      plan: 'starter',
      status: 'active',
      createdAt: '2026-10-12',
      segment: 'Manutenções Industriais',
      employeeCount: 45,
      contactEmail: 'lucas.pinho@manumanutencao.com.br'
    },
    users: [
      {
        id: 'user-manu-lucas',
        tenantId: 'manu-manutencoes',
        name: 'Lucas Pinho',
        email: 'lucas.pinho@manumanutencao.com.br',
        role: 'tenant_admin',
        department: 'Coordenação de Manutenção'
      }
    ],
    // Contratou exclusivamente o módulo Aptis Service Pro:
    activeTools: ['service-pro']
  }

  // --------------------------------------------------------------------------
  // MODELO PARA NOVO CLIENTE (Descomente e preencha quando fechar novo contrato):
  // --------------------------------------------------------------------------
  /*
  {
    tenant: {
      id: 'novo-cliente-slug',
      name: 'Nome da Empresa Ltda',
      document: '00.000.000/0001-00',
      plan: 'pro',
      status: 'active',
      createdAt: '2026-10-10',
      segment: 'Metalurgia / Alimentos / Autopeças',
      employeeCount: 120,
      contactEmail: 'diretoria@empresa.com.br'
    },
    users: [
      {
        id: 'user-novo-admin',
        tenantId: 'novo-cliente-slug',
        name: 'Diretor de Operações',
        email: 'diretor@empresa.com.br',
        role: 'tenant_admin',
        department: 'Diretoria Industrial'
      }
    ],
    // Módulos contratados especificamente:
    activeTools: ['manager-tasks', 'skills-matrix', 'kaizen-manager']
  }
  */
];

// Superadmins globais da Aptis Tecnologia (você)
export const GLOBAL_SUPERADMIN_USERS: User[] = [
  {
    id: 'user-superadmin',
    tenantId: 'tenant-dhp',
    name: 'Danilo Henrique (Admin Aptis)',
    email: 'admin@aptis.com.br',
    role: 'superadmin',
    department: 'Diretoria Executiva & Governança'
  },
  {
    id: 'user-superadmin-legacy',
    tenantId: 'tenant-dhp',
    name: 'Danilo Henrique (Admin Aptis)',
    email: 'admin@ecossistemalider.com.br',
    role: 'superadmin',
    department: 'Diretoria Executiva & Governança'
  }
];

export const GLOBAL_SUPERADMIN_USER: User = GLOBAL_SUPERADMIN_USERS[0];

// ============================================================================
// GERADORES AUTOMÁTICOS DE TENANTS, USERS E LICENSES (Consumidos pela aplicação)
// ============================================================================

export function getRegisteredTenants(): Tenant[] {
  return REGISTERED_CLIENTS.map(c => c.tenant);
}

export function getRegisteredUsers(): User[] {
  const clientUsers = REGISTERED_CLIENTS.flatMap(c => c.users);
  return [...GLOBAL_SUPERADMIN_USERS, ...clientUsers];
}

export function getRegisteredLicenses(): License[] {
  const allToolIds = TOOLS_REGISTRY.map(t => t.id);
  const licenses: License[] = [];

  for (const client of REGISTERED_CLIENTS) {
    const tenantId = client.tenant.id;
    const allowedTools = client.activeTools === 'ALL' ? allToolIds : client.activeTools;

    for (const toolId of allToolIds) {
      const isActive = allowedTools.includes(toolId);
      licenses.push({
        id: `lic-${tenantId}-${toolId}`,
        tenantId,
        toolId,
        isActive,
        validUntil: '2028-12-31',
        assignedAt: client.tenant.createdAt
      });
    }
  }

  return licenses;
}
