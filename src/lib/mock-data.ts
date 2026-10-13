import { Tenant, User, License, LeadRequest } from '@/types';
import { 
  getRegisteredTenants, 
  getRegisteredUsers, 
  getRegisteredLicenses 
} from '@/config/tenants-registry';

/**
 * Dados iniciais derivados diretamente do registro oficial de clientes em código.
 * Não utiliza empresas fictícias antigas (Alfa, Beta, Gama).
 */
export const INITIAL_TENANTS: Tenant[] = getRegisteredTenants();

export const INITIAL_USERS: User[] = getRegisteredUsers();

export const INITIAL_LICENSES: License[] = getRegisteredLicenses();

export const INITIAL_LEADS: LeadRequest[] = [];
