'use client';

import React, { useState, useEffect } from 'react';
import { EmployeePdi } from './types';
import { INITIAL_PDIS } from './mock-data';
import { PdiDashboard } from './components/PdiDashboard';
import { PdiDetailView } from './components/PdiDetailView';
import { PdiModalForm } from './components/PdiModalForm';

const STORAGE_KEY = 'aptis_pdi_state_v1';

export default function PdiManagerModule() {
  const [pdis, setPdis] = useState<EmployeePdi[]>(INITIAL_PDIS);
  const [selectedPdiId, setSelectedPdiId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Carregar do LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPdis(parsed);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar PDIs do LocalStorage:', e);
    }
  }, []);

  // Salvar no LocalStorage
  const persistPdis = (newPdis: EmployeePdi[]) => {
    setPdis(newPdis);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPdis));
    } catch (e) {
      console.warn('Erro ao salvar PDIs no LocalStorage:', e);
    }
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
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
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
