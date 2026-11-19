'use client';

import { useCallback } from 'react';
import { useTenantStorage } from './use-tenant-storage';
import { useTenant } from '@/context/tenant-context';
import { AreaManagerAccount } from '@/types';

/**
 * Hook multi-tenant para gerenciar Gestores de Área e suas permissões por setor.
 * Os cadastros ficam persistidos no Supabase (`tenant_tool_data`) e no cache local do tenant.
 */
export function useAreaManagers() {
  const { currentTenant } = useTenant();
  const [rawManagers, setManagers, isSynced] = useTenantStorage<AreaManagerAccount[]>(
    'plant-core',
    'area_managers',
    []
  );

  const managers: AreaManagerAccount[] = Array.isArray(rawManagers) ? rawManagers : [];

  const addManager = useCallback(
    (
      data: Omit<AreaManagerAccount, 'id' | 'tenantId' | 'createdAt'>
    ): AreaManagerAccount => {
      const newManager: AreaManagerAccount = {
        ...data,
        id: `mgr-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`,
        tenantId: currentTenant.id,
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
        createdAt: new Date().toISOString().split('T')[0]
      };

      setManagers(prev => [newManager, ...(Array.isArray(prev) ? prev : [])]);
      return newManager;
    },
    [currentTenant.id, setManagers]
  );

  const updateManager = useCallback(
    (id: string, updates: Partial<AreaManagerAccount>) => {
      setManagers(prev =>
        (Array.isArray(prev) ? prev : []).map(m =>
          m.id === id
            ? {
                ...m,
                ...updates,
                email: updates.email ? updates.email.trim().toLowerCase() : m.email,
                name: updates.name ? updates.name.trim() : m.name
              }
            : m
        )
      );
    },
    [setManagers]
  );

  const deleteManager = useCallback(
    (id: string) => {
      setManagers(prev => (Array.isArray(prev) ? prev : []).filter(m => m.id !== id));
    },
    [setManagers]
  );

  return {
    managers,
    addManager,
    updateManager,
    deleteManager,
    isSynced
  };
}
