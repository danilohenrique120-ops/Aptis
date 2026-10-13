'use client';

import React, { useState } from 'react';
import { EmployeePdi, PdiActionItem } from './types';
import { INITIAL_PDIS } from './mock-data';
import { PdiDashboard } from './components/PdiDashboard';
import { PdiDetailView } from './components/PdiDetailView';
import { PdiModalForm } from './components/PdiModalForm';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';

export default function PdiManagerModule() {
  const [pdis, setPdis] = useTenantStorage<EmployeePdi[]>('pdi-manager', 'pdis', INITIAL_PDIS);
  const [selectedPdiId, setSelectedPdiId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);

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

  const handleImportPdiExcel = (rows: Record<string, any>[]) => {
    const newPdis: EmployeePdi[] = rows.map((row, idx) => {
      const nowStr = new Date().toISOString().split('T')[0];
      const targetDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const actions: PdiActionItem[] = [];

      if (row.action70) {
        actions.push({
          id: `act-70-${idx}`,
          title: String(row.action70).trim(),
          pillar: '70_practice',
          skillCategory: (row.focusSkill || 'Operação Prática').trim(),
          status: 'todo',
          deadline: targetDate,
          mentorOrSupport: 'Líder de Turno',
          evidenceCriteria: 'Autonomia no posto comprovada'
        });
      }

      if (row.action20) {
        actions.push({
          id: `act-20-${idx}`,
          title: String(row.action20).trim(),
          pillar: '20_mentoring',
          skillCategory: (row.focusSkill || 'Mentoria').trim(),
          status: 'todo',
          deadline: targetDate,
          mentorOrSupport: 'Especialista da Célula',
          evidenceCriteria: 'Sessão periódica de alinhamento'
        });
      }

      if (row.action10) {
        actions.push({
          id: `act-10-${idx}`,
          title: String(row.action10).trim(),
          pillar: '10_courses',
          skillCategory: (row.focusSkill || 'Formação Técnica').trim(),
          status: 'todo',
          deadline: targetDate,
          mentorOrSupport: 'RH / Treinamento',
          evidenceCriteria: 'Certificado de conclusão'
        });
      }

      return {
        id: `pdi-imp-${Date.now()}-${idx}`,
        tenantId: 'tenant-1',
        employeeId: `emp-pdi-${idx + 1}`,
        employeeName: (row.employeeName || 'Colaborador').trim(),
        employeeRole: (row.role || 'Operador').trim(),
        department: (row.sector || 'Usinagem CNC').trim(),
        shift: 'Turno A',
        currentLevel: 'N2',
        targetRole: (row.targetRole || 'Especialista').trim(),
        targetLevel: 'N3',
        cycleYear: '2026',
        status: 'in_progress',
        progressPercent: 15,
        startDate: nowStr,
        targetEndDate: targetDate,
        careerGoal: `Evolução para ${row.targetRole || 'próximo nível'} com foco em ${row.focusSkill || 'excelência operacional'}`,
        strengths: ['Comprometimento', 'Segurança'],
        growthGaps: [row.focusSkill || 'Polivalência'],
        actions,
        checkIns: [],
        updatedAt: nowStr
      };
    });

    persistPdis([...newPdis, ...pdis]);

    return {
      successCount: newPdis.length,
      message: `${newPdis.length} PDIs importados e estruturados com sucesso na metodologia 70-20-10!`
    };
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
          onOpenExcelImporter={() => setIsExcelImporterOpen(true)}
        />
      )}

      {/* Modal de Criação de PDI */}
      <PdiModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateOrUpdatePdi}
      />

      {/* Modal de Importação de Excel Inteligente */}
      <SmartExcelImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        toolTitle={EXCEL_IMPORT_CONFIGS['pdi-manager'].toolTitle}
        subtitle={EXCEL_IMPORT_CONFIGS['pdi-manager'].subtitle}
        templateFilename={EXCEL_IMPORT_CONFIGS['pdi-manager'].templateFilename}
        columns={EXCEL_IMPORT_CONFIGS['pdi-manager'].columns}
        sampleRows={EXCEL_IMPORT_CONFIGS['pdi-manager'].sampleRows}
        onImport={handleImportPdiExcel}
      />
    </div>
  );
}
