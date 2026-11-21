'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import { EmployeePdi, PdiActionItem } from './types';
import { INITIAL_PDIS } from './mock-data';
import { PdiDashboard } from './components/PdiDashboard';
import { PdiDetailView } from './components/PdiDetailView';
import { PdiModalForm } from './components/PdiModalForm';
import { PdiDossierModal } from './components/PdiDossierModal';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';
import { usePlantEmployees } from '@/hooks/use-plant-employees';
import { UnifiedEmployeeSyncModal } from '@/components/common/UnifiedEmployeeSyncModal';
import { UnifiedPlantEmployee } from '@/lib/unified-employee-directory';

function subscribeGlassMode(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('aptis-glass-mode-change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('aptis-glass-mode-change', callback);
    window.removeEventListener('storage', callback);
  };
}

function getGlassModeSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('aptis_tinted_glass_mode');
  return saved !== null ? saved === 'true' : true;
}

function getGlassModeServerSnapshot(): boolean {
  return true;
}

function buildSyncedEmployeePdi(emp: UnifiedPlantEmployee, index: number): EmployeePdi {
  const nowStr = new Date().toISOString().split('T')[0];
  const targetDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    id: `pdi-sync-${Date.now()}-${index}`,
    tenantId: 'tenant-1',
    employeeId: `emp-sync-${index + 1}`,
    employeeName: emp.name,
    employeeRole: emp.role || 'Operador Industrial',
    department: emp.department || 'Usinagem CNC',
    shift:
      emp.shift === '2º Turno'
        ? 'Turno B'
        : emp.shift === '3º Turno'
        ? 'Turno C'
        : 'Turno A',
    currentLevel: 'N2',
    targetRole: `${emp.role || 'Operador'} Sênior / Multiplicador`,
    targetLevel: 'N3 (Autônomo / Multi-posto)',
    cycleYear: '2026 - 1º Ciclo',
    status: 'in_progress',
    progressPercent: 10,
    startDate: nowStr,
    targetEndDate: targetDate,
    careerGoal: `Desenvolvimento técnico e comportamental no setor ${emp.department || 'Operacional'} seguindo metodologia 70-20-10.`,
    strengths: ['Comprometimento operacional', 'Disciplina de segurança'],
    growthGaps: ['Autonomia em diagnóstico técnico', 'Polivalência entre postos'],
    actions: [
      {
        id: `act-sync-70-${index}`,
        title: `Prática supervisionada em posto crítico do setor ${emp.department || 'Operacional'}`,
        pillar: '70_practice',
        skillCategory: 'Polivalência Técnica',
        status: 'todo',
        deadline: targetDate,
        mentorOrSupport: 'Líder de Turno / Multiplicador N4',
        evidenceCriteria: 'Execução autônoma validada na Matriz ILUO'
      }
    ],
    checkIns: [],
    updatedAt: nowStr
  };
}

export default function PdiManagerModule() {
  const [pdis, setPdis] = useTenantStorage<EmployeePdi[]>('pdi-manager', 'pdis', INITIAL_PDIS);
  const [selectedPdiId, setSelectedPdiId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPdi, setEditingPdi] = useState<EmployeePdi | null>(null);
  const [dossierPdi, setDossierPdi] = useState<EmployeePdi | null>(null);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);
  const [isSyncEmployeesModalOpen, setIsSyncEmployeesModalOpen] = useState(false);
  const tintedGlass = useSyncExternalStore(
    subscribeGlassMode,
    getGlassModeSnapshot,
    getGlassModeServerSnapshot
  );

  const safePdis = useMemo(() => (Array.isArray(pdis) ? pdis : []), [pdis]);
  const existingPdiNames = useMemo(() => safePdis.map(p => p.employeeName), [safePdis]);
  const {
    directory: plantEmployeeDirectory,
    missingForModule: missingPlantEmployees
  } = usePlantEmployees({
    currentModule: 'pdi-manager',
    existingNamesInModule: existingPdiNames,
    livePdiRecords: safePdis
  });

  const handleSyncImportToPdi = (selected: UnifiedPlantEmployee[]) => {
    if (selected.length === 0) return;
    const created = selected.map((emp, idx) => buildSyncedEmployeePdi(emp, idx));
    setPdis(prev => [...created, ...(Array.isArray(prev) ? prev : [])]);
  };

  const persistPdis = (newPdis: EmployeePdi[]) => {
    setPdis(newPdis);
  };

  const handleCreateOrUpdatePdi = (pdi: EmployeePdi) => {
    const exists = pdis.some(p => p.id === pdi.id);
    let updated: EmployeePdi[];
    if (exists) {
      updated = pdis.map(p => (p.id === pdi.id ? pdi : p));
    } else {
      updated = [pdi, ...pdis];
    }
    persistPdis(updated);
    setSelectedPdiId(pdi.id);
    setEditingPdi(null);
  };

  const handleUpdatePdi = (updatedPdi: EmployeePdi) => {
    const updated = pdis.map(p => (p.id === updatedPdi.id ? updatedPdi : p));
    persistPdis(updated);
  };

  const handleOpenEditPdi = (pdi: EmployeePdi) => {
    setEditingPdi(pdi);
    setIsCreateModalOpen(true);
  };

  const handleDeletePdi = (pdiId: string) => {
    const target = pdis.find(p => p.id === pdiId);
    if (!target) return;
    if (
      !window.confirm(
        `Deseja realmente excluir o PDI do colaborador "${target.employeeName}" (${target.targetRole})?`
      )
    ) {
      return;
    }
    const updated = pdis.filter(p => p.id !== pdiId);
    persistPdis(updated);
    if (selectedPdiId === pdiId) {
      setSelectedPdiId(null);
    }
  };

  const handleImportPdiExcel = (rows: Record<string, unknown>[]) => {
    const newPdis: EmployeePdi[] = rows.map((row, idx) => {
      const nowStr = new Date().toISOString().split('T')[0];
      const targetDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const actions: PdiActionItem[] = [];
      const focusSkillStr = String(row.focusSkill || '').trim();

      if (row.action70) {
        actions.push({
          id: `act-70-${idx}`,
          title: String(row.action70).trim(),
          pillar: '70_practice',
          skillCategory: focusSkillStr || 'Operação Prática',
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
          skillCategory: focusSkillStr || 'Mentoria',
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
          skillCategory: focusSkillStr || 'Formação Técnica',
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
        employeeName: String(row.employeeName || 'Colaborador').trim(),
        employeeRole: String(row.role || 'Operador').trim(),
        department: String(row.sector || 'Usinagem CNC').trim(),
        shift: 'Turno A',
        currentLevel: 'N2',
        targetRole: String(row.targetRole || 'Especialista').trim(),
        targetLevel: 'N3',
        cycleYear: '2026',
        status: 'in_progress',
        progressPercent: 15,
        startDate: nowStr,
        targetEndDate: targetDate,
        careerGoal: `Evolução para ${String(row.targetRole || 'próximo nível')} com foco em ${
          focusSkillStr || 'excelência operacional'
        }`,
        strengths: ['Comprometimento', 'Segurança'],
        growthGaps: [focusSkillStr || 'Polivalência'],
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
          tintedGlass={tintedGlass}
          onBack={() => setSelectedPdiId(null)}
          onUpdatePdi={handleUpdatePdi}
          onEditPdi={handleOpenEditPdi}
          onDeletePdi={handleDeletePdi}
          onExportPdiPdf={pdi => setDossierPdi(pdi)}
        />
      ) : (
        <PdiDashboard
          pdis={pdis}
          tintedGlass={tintedGlass}
          onSelectPdi={pdi => setSelectedPdiId(pdi.id)}
          onEditPdi={handleOpenEditPdi}
          onDeletePdi={handleDeletePdi}
          onExportPdiPdf={pdi => setDossierPdi(pdi)}
          onOpenCreateModal={() => {
            setEditingPdi(null);
            setIsCreateModalOpen(true);
          }}
          onOpenExcelImporter={() => setIsExcelImporterOpen(true)}
          onOpenSyncEmployees={() => setIsSyncEmployeesModalOpen(true)}
          missingSyncCount={missingPlantEmployees.length}
        />
      )}

      {/* Modal de Dossiê Inteligente & Exportação PDF */}
      <PdiDossierModal
        pdi={dossierPdi}
        isOpen={!!dossierPdi}
        onClose={() => setDossierPdi(null)}
      />

      {/* Modal de Criação / Edição de PDI */}
      <PdiModalForm
        key={`${editingPdi?.id || 'new'}-${isCreateModalOpen ? 'open' : 'closed'}`}
        isOpen={isCreateModalOpen}
        existingPdi={editingPdi}
        plantDirectory={missingPlantEmployees}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPdi(null);
        }}
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

      <UnifiedEmployeeSyncModal
        isOpen={isSyncEmployeesModalOpen}
        onClose={() => setIsSyncEmployeesModalOpen(false)}
        targetModule="pdi-manager"
        directory={plantEmployeeDirectory}
        missingEmployees={missingPlantEmployees}
        onImportEmployees={handleSyncImportToPdi}
        tintedGlass={tintedGlass}
      />
    </div>
  );
}
