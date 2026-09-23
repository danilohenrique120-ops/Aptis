'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, User, License, LeadRequest, UserRole } from '@/types';
import { INITIAL_TENANTS, INITIAL_USERS, INITIAL_LICENSES, INITIAL_LEADS } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';

interface TenantContextType {
  currentTenant: Tenant;
  currentUser: User;
  tenants: Tenant[];
  licenses: License[];
  leads: LeadRequest[];
  isHydrated: boolean;
  switchTenant: (tenantId: string) => void;
  switchUserRole: (role: UserRole) => void;
  toggleLicense: (tenantId: string, toolId: string, forceActive?: boolean) => void;
  hasLicense: (toolId: string) => boolean;
  getActiveLicensesForTenant: (tenantId?: string) => string[];
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => Promise<Tenant>;
  submitLead: (lead: Omit<LeadRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateLeadStatus: (leadId: string, status: LeadRequest['status']) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TENANTS: 'ecossistema_lider_tenants',
  CURRENT_TENANT_ID: 'ecossistema_lider_current_tenant_id',
  LICENSES: 'ecossistema_lider_licenses',
  USERS: 'ecossistema_lider_users',
  CURRENT_USER_ID: 'ecossistema_lider_current_user_id',
  LEADS: 'ecossistema_lider_leads'
};

function getLocalInitial<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function getLocalString(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>(() => getLocalInitial(STORAGE_KEYS.TENANTS, INITIAL_TENANTS));
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => getLocalString(STORAGE_KEYS.CURRENT_TENANT_ID, INITIAL_TENANTS[0].id));
  const [users, setUsers] = useState<User[]>(() => getLocalInitial(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [currentUserId, setCurrentUserId] = useState<string>(() => getLocalString(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id));
  const [licenses, setLicenses] = useState<License[]>(() => getLocalInitial(STORAGE_KEYS.LICENSES, INITIAL_LICENSES));
  const [leads, setLeads] = useState<LeadRequest[]>(() => getLocalInitial(STORAGE_KEYS.LEADS, INITIAL_LEADS));

  // 1. Carrega dados do Supabase e mescla inteligentemente com LocalStorage
  useEffect(() => {
    async function loadCloudData() {
      try {
        // Carregar Tenants do Supabase
        const { data: cloudTenants, error: tErr } = await supabase.from('tenants').select('*');
        if (!tErr && cloudTenants && cloudTenants.length > 0) {
          const mappedTenants: Tenant[] = cloudTenants.map((t: any) => ({
            id: t.id,
            name: t.name,
            document: t.document,
            plan: t.plan,
            status: t.status,
            segment: t.segment,
            employeeCount: t.employee_count,
            contactEmail: t.contact_email,
            createdAt: t.created_at ? t.created_at.split('T')[0] : '2026-01-01'
          }));
          
          setTenants(prev => {
            // Preserva tenants adicionados localmente que ainda não foram para a nuvem
            const cloudIds = new Set(mappedTenants.map(m => m.id));
            const localOnly = prev.filter(p => !cloudIds.has(p.id));
            return [...mappedTenants, ...localOnly];
          });
        }

        // Carregar Licenças do Supabase
        const { data: cloudLicenses, error: lErr } = await supabase.from('licenses').select('*');
        if (!lErr && cloudLicenses && cloudLicenses.length > 0) {
          const mappedLicenses: License[] = cloudLicenses.map((l: any) => ({
            id: l.id,
            tenantId: l.tenant_id,
            toolId: l.tool_id,
            isActive: l.is_active,
            validUntil: l.valid_until,
            assignedAt: l.assigned_at ? l.assigned_at.split('T')[0] : '2026-01-01'
          }));

          setLicenses(prev => {
            // Mescla sem perder licenças ativadas localmente
            const cloudMap = new Map(mappedLicenses.map(l => [`${l.tenantId}:${l.toolId}`, l]));
            const localOnly = prev.filter(p => !cloudMap.has(`${p.tenantId}:${p.toolId}`));
            return [...mappedLicenses, ...localOnly];
          });
        }

        // Carregar Leads do Supabase
        const { data: cloudLeads, error: ldErr } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (!ldErr && cloudLeads && cloudLeads.length > 0) {
          const mappedLeads: LeadRequest[] = cloudLeads.map((ld: any) => ({
            id: ld.id,
            companyName: ld.company_name,
            contactName: ld.contact_name,
            email: ld.email,
            phone: ld.phone,
            teamSize: ld.team_size,
            toolId: ld.tool_id,
            toolName: ld.tool_name,
            notes: ld.notes,
            status: ld.status,
            createdAt: ld.created_at ? ld.created_at.split('T')[0] : '2026-01-01'
          }));
          setLeads(mappedLeads);
        }
      } catch (err) {
        console.warn('Supabase offline ou sem conexão, utilizando fallback local:', err);
      } finally {
        setIsHydrated(true);
      }
    }

    loadCloudData();
  }, []);

  // Salva no localStorage em toda atualização
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
      localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT_ID, currentTenantId);
      localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch (e) {
      console.warn('Erro ao persistir dados no localStorage:', e);
    }
  }, [tenants, currentTenantId, licenses, users, currentUserId, leads]);

  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0] || INITIAL_TENANTS[0];
  const currentUser = users.find(u => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  const switchTenant = (tenantId: string) => {
    const exists = tenants.some(t => t.id === tenantId);
    if (exists) {
      setCurrentTenantId(tenantId);
    }
  };

  const switchUserRole = (role: UserRole) => {
    setUsers(prev => prev.map(user => {
      if (user.id === currentUser.id) {
        return { ...user, role };
      }
      return user;
    }));
  };

  const toggleLicense = async (tenantId: string, toolId: string, forceActive?: boolean) => {
    let nextState = true;
    let targetLicenseId = '';

    setLicenses(prev => {
      const existing = prev.find(l => l.tenantId === tenantId && l.toolId === toolId);
      if (existing) {
        nextState = forceActive !== undefined ? forceActive : !existing.isActive;
        targetLicenseId = existing.id;
        return prev.map(l => l.id === existing.id ? { ...l, isActive: nextState } : l);
      } else {
        targetLicenseId = `lic-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        const newLicense: License = {
          id: targetLicenseId,
          tenantId,
          toolId,
          isActive: forceActive !== undefined ? forceActive : true,
          validUntil: '2028-12-31',
          assignedAt: new Date().toISOString().split('T')[0]
        };
        return [...prev, newLicense];
      }
    });

    try {
      await supabase.from('licenses').upsert(
        {
          id: targetLicenseId,
          tenant_id: tenantId,
          tool_id: toolId,
          is_active: nextState,
          valid_until: '2028-12-31'
        },
        { onConflict: 'tenant_id,tool_id' }
      );
    } catch (e) {
      console.warn('Erro ao persistir licença no Supabase:', e);
    }
  };

  const hasLicense = (toolId: string): boolean => {
    const lic = licenses.find(l => l.tenantId === currentTenant.id && l.toolId === toolId);
    return !!lic && lic.isActive;
  };

  const getActiveLicensesForTenant = (tenantId?: string): string[] => {
    const targetTenantId = tenantId || currentTenant.id;
    return licenses
      .filter(l => l.tenantId === targetTenantId && l.isActive)
      .map(l => l.toolId);
  };

  const addTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt'>): Promise<Tenant> => {
    const newTenant: Tenant = {
      ...tenantData,
      id: `tenant-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTenants(prev => [...prev, newTenant]);

    try {
      await supabase.from('tenants').insert({
        id: newTenant.id,
        name: newTenant.name,
        document: newTenant.document,
        plan: newTenant.plan,
        status: newTenant.status,
        segment: newTenant.segment,
        employee_count: newTenant.employeeCount,
        contact_email: newTenant.contactEmail
      });
    } catch (e) {
      console.warn('Erro ao salvar tenant no Supabase:', e);
    }

    return newTenant;
  };

  const submitLead = async (leadData: Omit<LeadRequest, 'id' | 'createdAt' | 'status'>) => {
    const newLead: LeadRequest = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setLeads(prev => [newLead, ...prev]);

    try {
      await supabase.from('leads').insert({
        id: newLead.id,
        company_name: newLead.companyName,
        contact_name: newLead.contactName,
        email: newLead.email,
        phone: newLead.phone,
        team_size: newLead.teamSize,
        tool_id: newLead.toolId,
        tool_name: newLead.toolName,
        notes: newLead.notes,
        status: 'pending'
      });
    } catch (e) {
      console.warn('Erro ao salvar lead no Supabase:', e);
    }
  };

  const updateLeadStatus = async (leadId: string, status: LeadRequest['status']) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));

    try {
      await supabase.from('leads').update({ status }).eq('id', leadId);
    } catch (e) {
      console.warn('Erro ao atualizar status do lead no Supabase:', e);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        currentUser,
        tenants,
        licenses,
        leads,
        isHydrated,
        switchTenant,
        switchUserRole,
        toggleLicense,
        hasLicense,
        getActiveLicensesForTenant,
        addTenant,
        submitLead,
        updateLeadStatus
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant deve ser utilizado dentro de um TenantProvider');
  }
  return context;
}
