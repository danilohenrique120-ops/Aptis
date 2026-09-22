'use client';

import React, { useState } from 'react';
import { EmployeePdi } from './types';
import { INITIAL_PDIS } from './mock-data';
import { PdiDashboard } from './components/PdiDashboard';
import { PdiDetailView } from './components/PdiDetailView';
import { PdiModalForm } from './components/PdiModalForm';
import { useTenantStorage } from '@/hooks/use-tenant-storage';

export default function PdiManagerModule() {
  const [pdis, setPdis] = useTenantStorage<EmployeePdi[]>('pdi-manager', 'pdis', INITIAL_PDIS);
  const [selectedPdiId, setSelectedPdiId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Salvar no Supabase e LocalStorage via useTenantStorage
  const persistPdis = (newPdis: EmployeePdi[]) => {
    setPdis(newPdis);
  };

  const handleCreateOrUpdatePdi = (pdi: EmployeePdi) => {
    const exists = pdis.some(p => p.id === pdi.id);
    let updated: EmployeePdi[];
    if (exists) {
      updated = pdis.map(p => p.id === pdi.id ? pdi : p);
    } else {
      updated = [pdi, ...pdis];
    }
    persistPdis(updated);
    setSelectedPdiId(pdi.id);
  };

  const handleUpdatePdi = (updatedPdi: EmployeePdi) => {
    const updated = pdis.map(p => p.id === updatedPdi.id ? updatedPdi : p);
    persistPdis(updated);
  };

  const handleDeletePdi = (pdiId: string) => {
    const updated = pdis.filter(p => p.id !== pdiId);
    persistPdis(updated);
    if (selectedPdiId === pdiId) {
      setSelectedPdiId(null);
    }
  };

  const selectedPdi = pdis.find(p => p.id === selectedPdiId) || null;

  return (
    <div className="w-full space-y-6">
      {selectedPdi ? (
        <PdiDetailView
          pdi={selectedPdi}
          onBack={() => setSelectedPdiId(null)}
          onUpdatePdi={handleUpdatePdi}
          onDeletePdi={handleDeletePdi}
        />
      ) : (
        <PdiDashboard
          pdis={pdis}
          onSelectPdi={(pdi) => setSelectedPdiId(pdi.id)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Modal de Criação de PDI */}
      <PdiModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateOrUpdatePdi}
      />
    </div>
  );
}
