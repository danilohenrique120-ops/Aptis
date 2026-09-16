'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, User, License, LeadRequest, UserRole } from '@/types';
import { INITIAL_TENANTS, INITIAL_USERS, INITIAL_LICENSES, INITIAL_LEADS } from '@/lib/mock-data';

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
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => Tenant;
  submitLead: (lead: Omit<LeadRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateLeadStatus: (leadId: string, status: LeadRequest['status']) => void;
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

export function TenantProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [currentTenantId, setCurrentTenantId] = useState<string>(INITIAL_TENANTS[0].id);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>(INITIAL_USERS[0].id);
  const [licenses, setLicenses] = useState<License[]>(INITIAL_LICENSES);
  const [leads, setLeads] = useState<LeadRequest[]>(INITIAL_LEADS);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedTenants = localStorage.getItem(STORAGE_KEYS.TENANTS);
      const savedCurrentTenantId = localStorage.getItem(STORAGE_KEYS.CURRENT_TENANT_ID);
      const savedLicenses = localStorage.getItem(STORAGE_KEYS.LICENSES);
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const savedCurrentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const savedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);

      if (savedTenants) setTenants(JSON.parse(savedTenants));
      if (savedCurrentTenantId) setCurrentTenantId(savedCurrentTenantId);
      if (savedLicenses) setLicenses(JSON.parse(savedLicenses));
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedCurrentUserId) setCurrentUserId(savedCurrentUserId);
      if (savedLeads) setLeads(JSON.parse(savedLeads));
    } catch (e) {
      console.warn('Erro ao carregar dados salvos do localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage on updates
  useEffect(() => {
    if (!isHydrated) return;
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
  }, [tenants, currentTenantId, licenses, users, currentUserId, leads, isHydrated]);

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

  const toggleLicense = (tenantId: string, toolId: string, forceActive?: boolean) => {
    setLicenses(prev => {
      const existing = prev.find(l => l.tenantId === tenantId && l.toolId === toolId);
      if (existing) {
        const nextState = forceActive !== undefined ? forceActive : !existing.isActive;
        return prev.map(l => l.id === existing.id ? { ...l, isActive: nextState } : l);
      } else {
        const newLicense: License = {
          id: `lic-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          tenantId,
          toolId,
          isActive: forceActive !== undefined ? forceActive : true,
          validUntil: '2027-12-31',
          assignedAt: new Date().toISOString().split('T')[0]
        };
        return [...prev, newLicense];
      }
    });
  };

  const hasLicense = (toolId: string): boolean => {
    // Superadmin has access or check currentTenant license
    if (currentUser.role === 'superadmin') {
      // Still show license state accurately, or allow superadmin bypass
      // To properly demonstrate the license guard, let's respect license unless bypass mode
    }
    const lic = licenses.find(l => l.tenantId === currentTenant.id && l.toolId === toolId);
    return !!lic && lic.isActive;
  };

  const getActiveLicensesForTenant = (tenantId?: string): string[] => {
    const targetTenantId = tenantId || currentTenant.id;
    return licenses
      .filter(l => l.tenantId === targetTenantId && l.isActive)
      .map(l => l.toolId);
  };

  const addTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>): Tenant => {
    const newTenant: Tenant = {
      ...tenantData,
      id: `tenant-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTenants(prev => [...prev, newTenant]);
    return newTenant;
  };

  const submitLead = (leadData: Omit<LeadRequest, 'id' | 'createdAt' | 'status'>) => {
    const newLead: LeadRequest = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const updateLeadStatus = (leadId: string, status: LeadRequest['status']) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
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
