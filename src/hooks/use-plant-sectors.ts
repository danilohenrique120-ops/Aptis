'use client';

import { useTenantStorage } from './use-tenant-storage';
import { PlantSector, DEFAULT_PLANT_SECTORS } from '@/types/sectors';
import { useCallback } from 'react';

export function usePlantSectors() {
  const [sectors, setSectors, isSynced] = useTenantStorage<PlantSector[]>(
    'plant-core',
    'sectors',
    DEFAULT_PLANT_SECTORS
  );

  const addSector = useCallback((sectorData: Omit<PlantSector, 'id' | 'createdAt'>): PlantSector => {
    const code = sectorData.code.toUpperCase().trim();
    const id = `sec-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    
    const newSector: PlantSector = {
      ...sectorData,
      id,
      code,
      name: sectorData.name.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSectors(prev => [...prev, newSector]);
    return newSector;
  }, [setSectors]);

  const updateSector = useCallback((id: string, updates: Partial<PlantSector>) => {
    setSectors(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [setSectors]);

  const deleteSector = useCallback((id: string): { success: boolean; message?: string } => {
    setSectors(prev => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter(s => s.id !== id);
    });

    return { success: true };
  }, [setSectors]);

  return {
    sectors,
    addSector,
    updateSector,
    deleteSector,
    isSynced
  };
}
