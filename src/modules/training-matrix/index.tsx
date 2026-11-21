'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTenant } from '@/context/tenant-context';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { 
  TrainingRecord, 
  TrainingValidityStatus, 
  TrainingType, 
  DocumentAttachment 
} from './types';
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  RefreshCw, 
  FileCheck,
  Paperclip,
  Sparkles,
  BookOpen,
  Users,
  Grid,
  List,
  FolderOpen,
  Trash2,
  FileSpreadsheet,
  Building2
} from 'lucide-react';
import { formatDate, getDaysUntil } from '@/lib/utils';
import { DocumentManagerModal } from './components/DocumentManagerModal';
import { DeepSearchModal } from './components/DeepSearchModal';
import { ComplianceMatrixView } from './components/ComplianceMatrixView';
import { TrainingBatchModal } from './components/TrainingBatchModal';
import { EmployeeDossierModal } from './components/EmployeeDossierModal';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';
import { usePlantEmployees } from '@/hooks/use-plant-employees';
import {
  UnifiedEmployeeSyncModal,
  ComplianceImportConfig
} from '@/components/common/UnifiedEmployeeSyncModal';
import { UnifiedPlantEmployee } from '@/lib/unified-employee-directory';

function buildSyncedTrainingRecord(
  emp: UnifiedPlantEmployee,
  index: number,
  tenantId: string,
  config?: ComplianceImportConfig
): TrainingRecord {
  const now = new Date();
  const completedDate = now.toISOString().split('T')[0];
  const validityMonths = config?.validityMonths || 24;
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + validityMonths);
  const expiryDate = expiry.toISOString().split('T')[0];
  const trainingName = config?.trainingName || 'NR-12 Segurança em Máquinas e Equipamentos';
  const isPop = config?.trainingType === 'POP' || trainingName.toUpperCase().startsWith('POP');
  const codeMatch = trainingName.match(/^(NR-\d+|POP-\d+)/i);
  const code = codeMatch ? codeMatch[1].toUpperCase() : isPop ? 'POP-001' : 'NR-12';

  return {
    id: `tr-sync-${Date.now()}-${index}`,
    tenantId,
    type: isPop ? 'POP' : 'NR',
    code,
    employeeName: emp.name,
    employeeRole: emp.role || 'Operador Industrial',
    department: emp.department || 'Usinagem CNC',
    courseName: trainingName,
    completedDate,
    expiryDate,
    certificateCode: `SYNC-${code}-${(1000 + index).toString()}`,
    validityMonths,
    instructorOrEntity: 'Sincronizado da Base da Planta',
    version: isPop ? 'v1.0' : undefined,
    attachments: []
  };
}

const INITIAL_DOCUMENTS: DocumentAttachment[] = [
  {
    id: 'doc-1',
    fileName: 'Certificado_NR10_Carlos_Silveira.pdf',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    uploadDate: '2025-04-10',
    category: 'certificate',
    associatedName: 'Carlos Silveira (NR-10)',
    content: `CERTIFICADO DE CAPACITAÇÃO PROFISSIONAL - NR-10
Certificamos que CARLOS SILVEIRA concluiu com aproveitamento o treinamento de SEGURANÇA EM INSTALAÇÕES E SERVIÇOS EM ELETRICIDADE (NR-10 BÁSICO), com carga horária de 40 horas.
Conteúdo Programático:
1. Riscos em instalações e serviços com eletricidade (choque elétrico, arcos elétricos e queimaduras).
2. Trabalho em circuitos desenergizados e sob tensão até 1000V.
3. Medidas de controle do risco elétrico: desenergização, aterramento funcional e equipotencialização.
4. Equipamentos de Proteção Coletiva (EPC) e Individual (EPI classe 2, vestimenta anti-chama ATPV 8.4 cal/cm2).
5. Procedimentos de trabalho e rotinas de liberação com bloqueio LOTO.
Instrutor Responsável: Eng. Eletricista Marcelo Dias - CREA 50698124/SP.
Data de Realização: 10/04/2025. Validade legal: 24 meses.`
  },
  {
    id: 'doc-2',
    fileName: 'POP-001_Procedimento_Setup_Torno_CNC.docx',
    fileType: 'docx',
    fileSize: '850 KB',
    uploadDate: '2025-06-01',
    category: 'procedure_pop',
    associatedName: 'POP-001 Usinagem CNC',
    content: `PROCEDIMENTO OPERACIONAL PADRÃO - POP-001 (Rev. 02)
TÍTULO: SETUP, TROCA DE CASTANHAS E CALIBRAÇÃO DE FERRAMENTAL EM TORNO CNC
1. OBJETIVO: Padronizar o processo de preparação das máquinas CNC da Célula 03 para redução de tempo de setup (SMED) e segurança contra colisões.
2. EPIs OBRIGATÓRIOS: Óculos de proteção com proteção lateral, calçado com bico de composite, protetor auricular e luvas nitrílicas durante troca de óleo refrigerante.
3. INSTRUÇÕES PASSO A PASSO:
- Desligar avanço manual e acionar parada de emergência antes de adentrar a cabine.
- Limpar barramento com pincel e coletor magnético (proibido uso de ar comprimido para soprar cavacos).
- Verificar alinhamento da torre de ferramentas com relógio comparador milesimal.
- Calibrar o sensor de toque e carregar o programa de usinagem via rede DNC.
4. HISTÓRICO DE REVISÃO: Atualizado em Junho/2025 por Carlos Silveira com aprovação da Engenharia.`
  },
  {
    id: 'doc-3',
    fileName: 'Certificado_NR35_Mariana_Souza.pdf',
    fileType: 'pdf',
    fileSize: '980 KB',
    uploadDate: '2024-09-20',
    category: 'certificate',
    associatedName: 'Mariana Souza (NR-35)',
    content: `CERTIFICADO DE TREINAMENTO - TRABALHO EM ALTURA (NR-35)
Certificamos que MARIANA SOUZA concluiu o treinamento obrigatório de NR-35 (Trabalho em Altura - Carga horária 8h).
Itens cobertos:
- Análise de Risco (AR) e Permissão de Trabalho (PT) para manutenção acima de 2 metros de desnível.
- Inspeção periódica de EPI: cinto de segurança tipo paraquedista, talabarte duplo com absorvedor de energia e trava-quedas retrátil.
- Pontos de ancoragem certificados e linha de vida horizontal sobre as prensas da Estamparia.
- Condutas em situações de emergência e resgate em altura.
Instrutor Técnico: Roberto Gomes - TST Reg. 44102.
Validade do certificado: 2 anos.`
  },
  {
    id: 'doc-4',
    fileName: 'POP-025_Bloqueio_LOTO_Desenergizacao.docx',
    fileType: 'docx',
    fileSize: '620 KB',
    uploadDate: '2025-05-15',
    category: 'procedure_pop',
    associatedName: 'POP-025 Geral / Manutenção',
    content: `PROCEDIMENTO OPERACIONAL PADRÃO - POP-025 (Rev. 03)
TÍTULO: CONTROLE DE ENERGIAS PERIGOSAS - SISTEMA LOTO (LOCKOUT / TAGOUT)
1. CAMPO DE APLICAÇÃO: Todas as intervenções mecânicas, elétricas e hidráulicas no parque fabril.
2. ETAPAS CRÍTICAS:
- Identificar fontes de energia: elétrica, pneumática residual e acumuladores de óleo hidráulico sob pressão.
- Isolar a chave seccionadora principal com cadeado de bloqueio individual e garra múltipla.
- Afixar a etiqueta de advertência LOTO preenchida com nome do responsável, turno e ramal.
- Aliviar a pressão residual abrindo a válvula de alívio e testar a partida local (teste de energia zero).
3. RESPONSABILIDADE: Nenhum supervisor ou operador está autorizado a remover cadeado de terceiro sem a presença do comitê de segurança.`
  },
  {
    id: 'doc-5',
    fileName: 'Lista_Presenca_Treinamento_Brigada.txt',
    fileType: 'txt',
    fileSize: '45 KB',
    uploadDate: '2024-10-01',
    category: 'attendance_sheet',
    associatedName: 'Aline Ferreira (Brigada)',
    content: `LISTA DE PRESENÇA OFICIAL - TREINAMENTO DE BRIGADA DE INCÊNDIO & PRIMEIROS SOCORROS
Data: 01/10/2024 - Carga horária: 24h - Local: Centro de Treinamento de Bombeiros Civis
Participantes Aprovados:
- Aline Ferreira - Departamento de Qualidade Fabril
- Carlos Silveira - Manutenção Mecânica
- Mariana Souza - Supervisão de Turno
Conteúdo ministrado: Teoria do fogo, classes de extintores (PQS, CO2, Água), combate a princípio de incêndio com mangueiras de hidrante, reanimação cardiopulmonar (RCP) com uso de DEA e imobilização de vítimas.`
  }
];

const INITIAL_TRAININGS: TrainingRecord[] = [
  {
    id: 'tr-1',
    tenantId: 'tenant-1',
    type: 'NR',
    code: 'NR-10',
    employeeName: 'Carlos Silveira',
    employeeRole: 'Eletricista de Manutenção',
    department: 'Usinagem CNC',
    courseName: 'NR-10 Segurança em Instalações Elétricas',
    completedDate: '2025-04-10',
    expiryDate: '2027-04-10',
    certificateCode: 'CERT-NR10-9841',
    validityMonths: 24,
    instructorOrEntity: 'Eng. Marcelo Dias (CREA 50698124)',
    attachments: [INITIAL_DOCUMENTS[0]]
  },
  {
    id: 'tr-2',
    tenantId: 'tenant-1',
    type: 'NR',
    code: 'NR-35',
    employeeName: 'Mariana Souza',
    employeeRole: 'Supervisora de Turno',
    department: 'Estamparia & Prensas',
    courseName: 'NR-35 Trabalho em Altura',
    completedDate: '2024-09-20',
    expiryDate: '2026-09-20',
    certificateCode: 'CERT-NR35-4412',
    validityMonths: 24,
    instructorOrEntity: 'Roberto Gomes (TST 44102)',
    attachments: [INITIAL_DOCUMENTS[2]]
  },
  {
    id: 'tr-3',
    tenantId: 'tenant-1',
    type: 'NR',
    code: 'NR-11',
    employeeName: 'João Pedro',
    employeeRole: 'Operador Logístico',
    department: 'Geral',
    courseName: 'NR-11 Operador de Empilhadeira e Pontes Rolantes',
    completedDate: '2025-01-15',
    expiryDate: '2026-01-15',
    certificateCode: 'CERT-NR11-3091',
    validityMonths: 12,
    instructorOrEntity: 'SENAI CETEQ',
    attachments: []
  },
  {
    id: 'tr-4',
    tenantId: 'tenant-1',
    type: 'NR',
    code: 'NR-12',
    employeeName: 'Marcos Vinicius',
    employeeRole: 'Operador de Usinagem CNC',
    department: 'Usinagem CNC',
    courseName: 'NR-12 Segurança no Trabalho em Máquinas',
    completedDate: '2025-06-01',
    expiryDate: '2027-06-01',
    certificateCode: 'CERT-NR12-1055',
    validityMonths: 24,
    instructorOrEntity: 'SESI SST',
    attachments: []
  },
  {
    id: 'tr-5',
    tenantId: 'tenant-1',
    type: 'POP',
    code: 'POP-001',
    employeeName: 'Carlos Silveira',
    employeeRole: 'Eletricista de Manutenção',
    department: 'Usinagem CNC',
    courseName: 'POP-001 Setup e Calibração de Ferramental CNC',
    completedDate: '2025-06-01',
    expiryDate: '2027-06-01',
    certificateCode: 'HOMOL-POP001-08',
    validityMonths: 24,
    version: 'v2.1',
    attachments: [INITIAL_DOCUMENTS[1]]
  },
  {
    id: 'tr-6',
    tenantId: 'tenant-1',
    type: 'POP',
    code: 'POP-025',
    employeeName: 'Mariana Souza',
    employeeRole: 'Supervisora de Turno',
    department: 'Estamparia & Prensas',
    courseName: 'POP-025 Bloqueio LOTO e Desenergização Segura',
    completedDate: '2025-05-15',
    expiryDate: '2027-05-15',
    certificateCode: 'HOMOL-LOTO-92',
    validityMonths: 24,
    version: 'v3.0',
    attachments: [INITIAL_DOCUMENTS[3]]
  },
  {
    id: 'tr-7',
    tenantId: 'tenant-1',
    type: 'POP',
    code: 'POP-012',
    employeeName: 'Rodrigo Santoro',
    employeeRole: 'Soldador Especialista',
    department: 'Montagem & Solda',
    courseName: 'POP-012 Soldagem MIG/MAG em Gabaritos Estruturais',
    completedDate: '2024-08-10',
    expiryDate: '2025-08-10',
    certificateCode: 'HOMOL-POP012-44',
    validityMonths: 12,
    version: 'v1.4',
    attachments: []
  },
  {
    id: 'tr-8',
    tenantId: 'tenant-1',
    type: 'POP',
    code: 'POP-008',
    employeeName: 'Aline Ferreira',
    employeeRole: 'Inspetora de Qualidade',
    department: 'Geral',
    courseName: 'POP-008 Inspeção Visual e Metrológica de Primeira Peça',
    completedDate: '2024-10-01',
    expiryDate: '2026-10-01',
    certificateCode: 'HOMOL-POP008-17',
    validityMonths: 24,
    version: 'v2.0',
    attachments: [INITIAL_DOCUMENTS[4]]
  }
];

export default function TrainingMatrixModule() {
  const { currentTenant } = useTenant();
  const { sectors: plantSectors } = usePlantSectors();
  const safePlantSectors = Array.isArray(plantSectors) ? plantSectors : [];
  const sectorsList = [
    { id: 'all', label: 'Todos os Setores' },
    ...safePlantSectors.map(s => ({ id: s.name, label: s.name }))
  ];
  const [trainings, setTrainings] = useTenantStorage<TrainingRecord[]>('training-matrix', 'trainings', INITIAL_TRAININGS);
  const [documents, setDocuments] = useTenantStorage<DocumentAttachment[]>('training-matrix', 'documents', INITIAL_DOCUMENTS);
  const [isLoaded, setIsLoaded] = useState(true);

  // View tabs
  const [activeTab, setActiveTab] = useState<'list' | 'matrix'>('list');
  const [typeFilter, setTypeFilter] = useState<'all' | 'NR' | 'POP'>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TrainingValidityStatus>('all');

  // Modals state
  const [isDeepSearchOpen, setIsDeepSearchOpen] = useState(false);
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [dossierEmployee, setDossierEmployee] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);
  const [isSyncEmployeesModalOpen, setIsSyncEmployeesModalOpen] = useState(false);
  const [tintedGlass, setTintedGlass] = useState<boolean>(true);

  const safeTrainings = useMemo(() => (Array.isArray(trainings) ? trainings : []), [trainings]);
  const existingTrainingEmployeeNames = useMemo(
    () => safeTrainings.map(t => t.employeeName),
    [safeTrainings]
  );
  const {
    directory: plantEmployeeDirectory,
    missingForModule: missingPlantEmployees
  } = usePlantEmployees({
    currentModule: 'training-matrix',
    existingNamesInModule: existingTrainingEmployeeNames,
    liveTrainingRecords: safeTrainings
  });

  const handleSyncImportToCompliance = (
    selected: UnifiedPlantEmployee[],
    complianceConfig?: ComplianceImportConfig
  ) => {
    if (selected.length === 0) return;
    const created = selected.map((emp, idx) =>
      buildSyncedTrainingRecord(emp, idx, currentTenant.id, complianceConfig)
    );
    setTrainings(prev => [...created, ...(Array.isArray(prev) ? prev : [])]);
  };

  useEffect(() => {
    const syncGlassMode = () => {
      try {
        const saved = localStorage.getItem('aptis_tinted_glass_mode');
        setTintedGlass(saved === null ? true : saved === 'true');
      } catch {
        setTintedGlass(true);
      }
    };
    syncGlassMode();
    window.addEventListener('aptis-glass-mode-change', syncGlassMode);
    return () => window.removeEventListener('aptis-glass-mode-change', syncGlassMode);
  }, []);

  const handleImportTrainingExcel = (rows: Record<string, any>[]) => {
    const newRecords: TrainingRecord[] = rows.map((row, idx) => {
      const code = (row.code || 'NR-12').trim().toUpperCase();
      const rawType = (row.type || '').trim().toUpperCase();
      const type: TrainingType = rawType.includes('POP') ? 'POP' : 'NR';
      const completedDate = (row.completedDate || new Date().toISOString().split('T')[0]).trim();
      const validityMonths = Number(row.validityMonths) || 24;

      let expiryDate = '';
      try {
        const d = new Date(completedDate);
        d.setMonth(d.getMonth() + validityMonths);
        expiryDate = d.toISOString().split('T')[0];
      } catch {
        expiryDate = new Date(Date.now() + validityMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      return {
        id: `tr-imp-${Date.now()}-${idx}`,
        tenantId: currentTenant.id,
        type,
        code,
        employeeName: (row.employeeName || 'Colaborador').trim(),
        employeeRole: (row.employeeRole || 'Operador').trim(),
        department: (row.department || 'Usinagem CNC').trim(),
        courseName: `${code} - Capacitação Operacional`,
        completedDate,
        expiryDate,
        certificateCode: `CERT-${code}-${Date.now().toString().slice(-4)}`,
        validityMonths,
        instructorOrEntity: (row.instructorOrEntity || 'Treinamento e Capacitação Técnica').trim(),
        attachments: []
      };
    });

    setTrainings(prev => [...newRecords, ...prev]);

    return {
      successCount: newRecords.length,
      message: `${newRecords.length} registros de treinamento importados com sucesso na matriz legal!`
    };
  };

  // New Record Form State
  const [newType, setNewType] = useState<TrainingType>('NR');
  const [newCode, setNewCode] = useState('NR-10');
  const [newCourseName, setNewCourseName] = useState('');
  const [newEmployee, setNewEmployee] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('Operador Especialista');
  const [newDepartment, setNewDepartment] = useState('Usinagem CNC');
  const [newCompletedDate, setNewCompletedDate] = useState('2026-09-01');
  const [newExpiryDate, setNewExpiryDate] = useState('2028-09-01');
  const [newValidityMonths, setNewValidityMonths] = useState(24);
  const [newVersion, setNewVersion] = useState('v1.0');

  const getRecordStatus = (expiryDate: string): TrainingValidityStatus => {
    const days = getDaysUntil(expiryDate);
    if (days < 0) return 'expired';
    if (days <= 60) return 'expiring';
    return 'valid';
  };

  const filteredTrainings = trainings.filter(item => {
    const status = getRecordStatus(item.expiryDate);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSector = selectedSector === 'all' || 
      item.department.toLowerCase().includes(selectedSector.toLowerCase()) ||
      selectedSector.toLowerCase().includes(item.department.toLowerCase());

    const matchesSearch = 
      item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      item.courseName.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesType && matchesSector && matchesSearch;
  });

  const handleRenew = (recordId: string) => {
    setTrainings(prev => prev.map(t => {
      if (t.id === recordId) {
        const now = new Date();
        const completed = now.toISOString().split('T')[0];
        const months = t.validityMonths || 24;
        const nextDate = new Date(now);
        nextDate.setMonth(nextDate.getMonth() + months);
        const expiry = nextDate.toISOString().split('T')[0];
        return {
          ...t,
          completedDate: completed,
          expiryDate: expiry,
          certificateCode: `RENOV-${Math.floor(1000 + Math.random() * 9000)}`
        };
      }
      return t;
    }));
  };

  const handleAddTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.trim() || !newCourseName.trim()) return;

    const record: TrainingRecord = {
      id: `tr-${Date.now()}`,
      tenantId: currentTenant.id,
      type: newType,
      code: newCode || (newType === 'NR' ? 'NR-10' : 'POP-001'),
      employeeName: newEmployee.trim(),
      employeeRole: newEmployeeRole.trim(),
      department: newDepartment,
      courseName: newCourseName.trim(),
      completedDate: newCompletedDate,
      expiryDate: newExpiryDate,
      certificateCode: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      validityMonths: newValidityMonths,
      version: newType === 'POP' ? newVersion : undefined,
      attachments: []
    };

    setTrainings(prev => [record, ...prev]);
    setIsNewModalOpen(false);
    setNewEmployee('');
    setNewCourseName('');
  };

  const handleAddDocument = (newDoc: DocumentAttachment) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // KPIs
  const totalRecords = trainings.length;
  const expiredRecords = trainings.filter(t => getRecordStatus(t.expiryDate) === 'expired').length;
  const expiringRecords = trainings.filter(t => getRecordStatus(t.expiryDate) === 'expiring').length;
  const validRecords = trainings.filter(t => getRecordStatus(t.expiryDate) === 'valid').length;
  const complianceRate = totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 100;

  const renderStatusBadge = (status: TrainingValidityStatus, days: number) => {
    switch (status) {
      case 'valid':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            tintedGlass
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Válido ({days}d)
          </span>
        );
      case 'expiring':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            tintedGlass
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${tintedGlass ? 'text-amber-400' : 'text-amber-600'}`} />
            A Vencer ({days}d)
          </span>
        );
      case 'expired':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border animate-pulse ${
            tintedGlass
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-rose-100 text-rose-800 border-rose-200'
          }`}>
            <AlertOctagon className={`w-3.5 h-3.5 ${tintedGlass ? 'text-rose-400' : 'text-rose-600'}`} />
            Vencido ({Math.abs(days)}d)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full pb-10">
      {/* =====================================================================
          1. CABEÇALHO EXECUTIVO COM SUB-CÁPSULAS DE KPIS (PADRÃO APTIS ROUTINE)
         ===================================================================== */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-500 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className="absolute -top-16 -right-12 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.65) 0%, rgba(6, 182, 212, 0.25) 60%, transparent 75%)'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'bg-blue-500/20 text-blue-200 border-blue-400/35'
                    : 'text-blue-700 bg-blue-50 border-blue-200'
                }`}
              >
                Conformidade Legal & Qualidade (SST / EHS & POPs)
              </span>
              <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Unidade: {currentTenant.name}
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              Aptis Compliance • Matriz de Treinamentos & POPs
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              Governança de Normas Regulamentadoras do MTE, Procedimentos Operacionais Padrão e acervo documental com busca inteligente profunda.
            </p>
          </div>

          {/* Barra de Ações Principais */}
          <div className="flex flex-wrap items-center gap-2.5">
            {trainings.length === 0 && documents.length === 0 ? (
              <button
                onClick={() => {
                  setTrainings(INITIAL_TRAININGS);
                  setDocuments(INITIAL_DOCUMENTS);
                }}
                title="Carregar registros e documentos de exemplo para teste"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Carregar Exemplos
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja zerar todos os treinamentos e documentos?')) {
                    setTrainings([]);
                    setDocuments([]);
                  }
                }}
                title="Limpar todos os registros de conformidade"
                className={`inline-flex items-center gap-1 px-2.5 py-2 text-xs transition-colors cursor-pointer rounded-xl ${
                  tintedGlass
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                    : 'text-slate-400 hover:text-rose-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Registros
              </button>
            )}

            <button
              onClick={() => setIsSyncEmployeesModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-300'
              }`}
              title="Sincronizar colaboradores cadastrados em outros módulos da Suíte Aptis (Skills, 1:1 e PDI)"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              Sincronizar Base
              {missingPlantEmployees.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950">
                  +{missingPlantEmployees.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsExcelImporterOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}
              title="Importar registros de treinamentos de NRs e POPs do Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Importar Excel
            </button>

            <button
              onClick={() => setIsDeepSearchOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border-amber-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Busca Inteligente
            </button>

            <button
              onClick={() => setIsDocManagerOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              Acervo ({documents.length})
            </button>

            <button
              onClick={() => setIsBatchModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              <Users className="w-4 h-4 text-cyan-400" />
              Montar Turma
            </button>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                border: '1px solid rgba(165, 243, 252, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
              }}
            >
              <Plus className="w-4 h-4" />
              Nova Capacitação
            </button>
          </div>
        </div>

        {/* KPI Cards Rápidos em Sub-cápsulas de Vidro */}
        <div
          className={`relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-5 border-t ${
            tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
          }`}
        >
          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>Total Homologadas</span>
              <GraduationCap className="w-4 h-4 text-slate-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              {totalRecords}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-rose-300' : 'text-rose-600'
              }`}
            >
              <span>Bloqueados / Vencidos</span>
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-rose-400' : 'text-rose-600'
              }`}
            >
              {expiredRecords}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-amber-300' : 'text-amber-700'
              }`}
            >
              <span>Reciclagem &lt; 60 dias</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-amber-400' : 'text-amber-600'
              }`}
            >
              {expiringRecords}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-600'
              }`}
            >
              <span>Aptidão Geral da Fábrica</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            >
              {complianceRate}%
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. TRILHO DE MENISCO & CÁPSULA SETORIAL (PADRÃO APTIS ROUTINE)
         ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="overflow-x-auto pb-1 lg:pb-0">
          <div className="aptis-meniscus-track inline-flex items-center gap-1 p-1.5">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'list'
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                activeTab === 'list'
                  ? {
                      background:
                        'linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #06b6d4 100%)',
                      border: '1px solid rgba(147, 197, 253, 0.5)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px -3px rgba(37, 99, 235, 0.55)'
                    }
                  : undefined
              }
            >
              <List className="w-3.5 h-3.5" />
              Lista de Registros
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'matrix'
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                activeTab === 'matrix'
                  ? {
                      background:
                        'linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #06b6d4 100%)',
                      border: '1px solid rgba(147, 197, 253, 0.5)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px -3px rgba(37, 99, 235, 0.55)'
                    }
                  : undefined
              }
            >
              <Grid className="w-3.5 h-3.5" />
              Matriz de Aptidão Legal (Pilar 2)
            </button>

            <button
              onClick={() => setIsDocManagerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full text-slate-400 hover:text-white transition-all whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Acervo Documental ({documents.length})
            </button>
          </div>
        </div>

        {/* Cápsula Setorial à Direita */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl ${
            tintedGlass
              ? 'aptis-glass-subcard text-white'
              : 'bg-white border border-slate-200 shadow-2xs text-slate-800'
          }`}
        >
          <label
            htmlFor="compliance-sector-select"
            className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
              tintedGlass ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Área / Setor:</span>
          </label>
          <select
            id="compliance-sector-select"
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer min-w-[180px] ${
              tintedGlass
                ? 'text-cyan-300 [&>option]:bg-slate-900 [&>option]:text-white'
                : 'text-slate-900 [&>option]:bg-white [&>option]:text-slate-900'
            }`}
          >
            {sectorsList.map(sec => (
              <option key={sec.id} value={sec.id} className="py-1">
                {sec.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================================
          3. CONTEÚDO DINÂMICO CONFORME A ABA
         ===================================================================== */}
      {activeTab === 'matrix' ? (
        <ComplianceMatrixView
          trainings={trainings}
          selectedSector={selectedSector}
          onOpenDossier={(empName) => setDossierEmployee(empName)}
          onRenewRecord={handleRenew}
          tintedGlass={tintedGlass}
        />
      ) : (
        /* Visualização em Lista Padrão com Filtros Avançados */
        <div className="space-y-4">
          {/* Barra de Busca, Filtro de Tipo e Status */}
          <div
            className={`flex flex-col lg:flex-row lg:items-center gap-3 p-3.5 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-dark text-white'
                : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por colaborador, norma, código de certificado ou setor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-400'
                    : 'bg-slate-50 border border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filtro Tipo: NRs vs POPs */}
              <div
                className={`flex items-center p-1 rounded-xl border text-xs ${
                  tintedGlass
                    ? 'bg-slate-950/60 border-white/10'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    typeFilter === 'all'
                      ? tintedGlass
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-900 shadow-2xs'
                      : tintedGlass
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTypeFilter('NR')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    typeFilter === 'NR'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : tintedGlass
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  NRs (Segurança)
                </button>
                <button
                  onClick={() => setTypeFilter('POP')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    typeFilter === 'POP'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : tintedGlass
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  POPs (Operação)
                </button>
              </div>

              {/* Status de Validade */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`text-xs font-bold bg-transparent focus:outline-none cursor-pointer ${
                    tintedGlass
                      ? 'text-cyan-300 [&>option]:bg-slate-900 [&>option]:text-white'
                      : 'text-slate-900 [&>option]:bg-white [&>option]:text-slate-900'
                  }`}
                >
                  <option value="all">Todos os Status</option>
                  <option value="valid">🟢 Apenas Válidos</option>
                  <option value="expiring">🟡 A Vencer (&lt; 60 dias)</option>
                  <option value="expired">🔴 Vencidos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabela de Registros */}
          <div
            className={`rounded-3xl border overflow-hidden transition-all duration-500 ${
              tintedGlass
                ? 'aptis-glass-dark border-white/10 text-white'
                : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    className={
                      tintedGlass
                        ? 'bg-slate-950/70 border-b border-white/10 text-slate-300'
                        : 'bg-slate-100/80 border-b border-slate-200 text-slate-700'
                    }
                  >
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Colaborador / Função</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Tipo & Código</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Norma / Procedimento Operacional</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-center">Conclusão</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-center">Validade (SLA)</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-center">Status</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-center">Evidências</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tintedGlass ? 'divide-white/[0.06]' : 'divide-slate-200'}`}>
                  {filteredTrainings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-slate-400">
                        <p className={`text-sm font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                          Nenhum treinamento ou POP cadastrado ainda
                        </p>
                        <p className="text-xs text-slate-400 mb-3">
                          Cadastre certificados de NRs, reciclagens ou procedimentos da sua fábrica.
                        </p>
                        <button
                          onClick={() => setIsNewModalOpen(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Cadastrar Primeiro Treinamento
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredTrainings.map(item => {
                      const days = getDaysUntil(item.expiryDate);
                      const status = getRecordStatus(item.expiryDate);

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            tintedGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Colaborador */}
                          <td className="py-3.5 px-4 font-medium">
                            <div 
                              onClick={() => setDossierEmployee(item.employeeName)}
                              className={`font-bold cursor-pointer transition-colors ${
                                tintedGlass
                                  ? 'text-white hover:text-cyan-400'
                                  : 'text-slate-900 hover:text-blue-600'
                              }`}
                              title="Ver Dossiê Completo"
                            >
                              {item.employeeName}
                            </div>
                            <div className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                              {item.employeeRole} • <span className="text-slate-400">{item.department}</span>
                            </div>
                          </td>

                          {/* Tipo & Código */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              item.type === 'NR' 
                                ? tintedGlass
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                  : 'bg-blue-100 text-blue-800 border-blue-200' 
                                : tintedGlass
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-amber-100 text-amber-900 border-amber-200'
                            }`}>
                              {item.code} {item.version ? `(${item.version})` : ''}
                            </span>
                          </td>

                          {/* Norma / POP */}
                          <td className="py-3.5 px-4">
                            <div className={`font-semibold ${tintedGlass ? 'text-slate-100' : 'text-slate-800'}`}>
                              {item.courseName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <FileCheck className="w-3 h-3 text-slate-400" />
                              {item.certificateCode} • {item.instructorOrEntity || 'Entidade Oficial'}
                            </div>
                          </td>

                          {/* Conclusão */}
                          <td className={`py-3.5 px-3 text-center ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                            {formatDate(item.completedDate)}
                          </td>

                          {/* Validade */}
                          <td className={`py-3.5 px-3 text-center font-semibold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                            {formatDate(item.expiryDate)}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 text-center">
                            {renderStatusBadge(status, days)}
                          </td>

                          {/* Anexos */}
                          <td className="py-3.5 px-3 text-center">
                            {item.attachments && item.attachments.length > 0 ? (
                              <button
                                onClick={() => setIsDocManagerOpen(true)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                                  tintedGlass
                                    ? 'bg-blue-500/20 text-cyan-300 border-blue-500/30 hover:bg-blue-500/30'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                }`}
                                title="Ver arquivos anexados"
                              >
                                <Paperclip className="w-3 h-3" />
                                {item.attachments.length} arquivo(s)
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Sem anexo</span>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setDossierEmployee(item.employeeName)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                  tintedGlass
                                    ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                                }`}
                                title="Abrir Dossiê de Auditoria"
                              >
                                Dossiê
                              </button>
                              <button
                                onClick={() => handleRenew(item.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                                  tintedGlass
                                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30'
                                    : 'text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                }`}
                                title="Registrar Renovação / Reciclagem"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Renovar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Deep Search (Busca Inteligente no Conteúdo) */}
      <DeepSearchModal
        isOpen={isDeepSearchOpen}
        onClose={() => setIsDeepSearchOpen(false)}
        documents={documents}
        tintedGlass={tintedGlass}
      />

      {/* Modal 2: Repositório & Gestão de Documentos (PDF, Word, TXT) */}
      <DocumentManagerModal
        isOpen={isDocManagerOpen}
        onClose={() => setIsDocManagerOpen(false)}
        documents={documents}
        onAddDocument={handleAddDocument}
        onDeleteDocument={handleDeleteDocument}
        tintedGlass={tintedGlass}
      />

      {/* Modal 3: Montar Turma de Reciclagem */}
      <TrainingBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        trainings={trainings}
        tintedGlass={tintedGlass}
      />

      {/* Modal 4: Dossiê de Auditoria do Colaborador */}
      <EmployeeDossierModal
        isOpen={!!dossierEmployee}
        onClose={() => setDossierEmployee(null)}
        employeeName={dossierEmployee}
        trainings={trainings}
        onRenewRecord={handleRenew}
        tintedGlass={tintedGlass}
      />

      {/* Modal 5: Nova Capacitação / POP */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl shadow-2xl max-w-lg w-full p-6 border my-8 transition-all ${
              tintedGlass
                ? 'aptis-glass-modal text-white border-white/10'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-1 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Cadastrar Capacitação / Procedimento
            </h3>
            <p className={`text-xs mb-4 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Registre a homologação de NR de Segurança ou POP Operacional para {currentTenant.name}.
            </p>

            <form onSubmit={handleAddTraining} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Tipo de Registro
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as TrainingType)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold ${
                      tintedGlass
                        ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                        : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="NR">NR (Norma Regulamentadora SST)</option>
                    <option value="POP">POP (Procedimento Operacional)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Código Identificador
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: NR-10 ou POP-001"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nome da Norma / POP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: NR-10 Segurança em Instalações Elétricas"
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    tintedGlass
                      ? 'aptis-glass-input text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {plantEmployeeDirectory.length > 0 && (
                <div
                  className={`p-3 rounded-2xl border space-y-1.5 ${
                    tintedGlass
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-cyan-50/70 border-cyan-200'
                  }`}
                >
                  <label
                    className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${
                      tintedGlass ? 'text-cyan-300' : 'text-cyan-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Puxar Colaborador da Base Unificada da Planta (Opcional)
                  </label>
                  <select
                    defaultValue=""
                    onChange={e => {
                      const found = plantEmployeeDirectory.find(emp => emp.key === e.target.value);
                      if (found) {
                        setNewEmployee(found.name);
                        setNewEmployeeRole(found.role || 'Operador Especialista');
                        if (found.department) {
                          setNewDepartment(found.department);
                        }
                      }
                    }}
                    className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none cursor-pointer ${
                      tintedGlass
                        ? 'bg-slate-950 border-white/15 text-white [&>option]:bg-slate-900'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="">-- Selecionar colaborador já cadastrado na planta --</option>
                    {plantEmployeeDirectory.map(emp => (
                      <option key={emp.key} value={emp.key}>
                        {emp.name} ({emp.role} • {emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nome do Colaborador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Roberto Gomes"
                    value={newEmployee}
                    onChange={e => setNewEmployee(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Eletricista de Manutenção"
                    value={newEmployeeRole}
                    onChange={e => setNewEmployeeRole(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Setor / Departamento
                  </label>
                  <select
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      tintedGlass
                        ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                        : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  >
                    {plantSectors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="Geral">Geral / Supervisão</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    {newType === 'POP' ? 'Versão do POP' : 'Validade (Meses)'}
                  </label>
                  {newType === 'POP' ? (
                    <input
                      type="text"
                      placeholder="Ex: v2.0"
                      value={newVersion}
                      onChange={e => setNewVersion(e.target.value)}
                      className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        tintedGlass
                          ? 'aptis-glass-input text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  ) : (
                    <input
                      type="number"
                      value={newValidityMonths}
                      onChange={e => setNewValidityMonths(Number(e.target.value))}
                      className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        tintedGlass
                          ? 'aptis-glass-input text-white'
                          : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Data Conclusão / Treinamento
                  </label>
                  <input
                    type="date"
                    value={newCompletedDate}
                    onChange={e => setNewCompletedDate(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      tintedGlass
                        ? 'aptis-glass-input text-white'
                        : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Data Vencimento / Reciclagem
                  </label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={e => setNewExpiryDate(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      tintedGlass
                        ? 'aptis-glass-input text-white'
                        : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${tintedGlass ? 'border-white/10' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                    tintedGlass
                      ? 'text-slate-300 hover:bg-white/10'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Salvar Homologação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Importação de Excel Inteligente */}
      <SmartExcelImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        toolTitle={EXCEL_IMPORT_CONFIGS['training-matrix'].toolTitle}
        subtitle={EXCEL_IMPORT_CONFIGS['training-matrix'].subtitle}
        templateFilename={EXCEL_IMPORT_CONFIGS['training-matrix'].templateFilename}
        columns={EXCEL_IMPORT_CONFIGS['training-matrix'].columns}
        sampleRows={EXCEL_IMPORT_CONFIGS['training-matrix'].sampleRows}
        onImport={handleImportTrainingExcel}
      />

      <UnifiedEmployeeSyncModal
        isOpen={isSyncEmployeesModalOpen}
        onClose={() => setIsSyncEmployeesModalOpen(false)}
        targetModule="training-matrix"
        directory={plantEmployeeDirectory}
        missingEmployees={missingPlantEmployees}
        onImportEmployees={handleSyncImportToCompliance}
        tintedGlass={tintedGlass}
      />
    </div>
  );
}
