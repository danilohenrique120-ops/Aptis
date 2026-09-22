'use client';

import React, { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { formatDate, getDaysUntil } from '@/lib/utils';
import { DocumentManagerModal } from './components/DocumentManagerModal';
import { DeepSearchModal } from './components/DeepSearchModal';
import { ComplianceMatrixView } from './components/ComplianceMatrixView';
import { TrainingBatchModal } from './components/TrainingBatchModal';
import { EmployeeDossierModal } from './components/EmployeeDossierModal';

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

const SECTORS = [
  { id: 'all', label: 'Todos os Setores' },
  { id: 'Usinagem CNC', label: 'Usinagem CNC' },
  { id: 'Estamparia & Prensas', label: 'Estamparia & Prensas' },
  { id: 'Montagem & Solda', label: 'Montagem & Solda' },
  { id: 'Geral', label: 'Geral / Supervisão' }
];

export default function TrainingMatrixModule() {
  const { currentTenant } = useTenant();
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Válido ({days}d)
          </span>
        );
      case 'expiring':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            A Vencer ({days}d)
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            Vencido ({Math.abs(days)}d)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header do Módulo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded">
              Conformidade Legal & Qualidade (SST / EHS & POPs)
            </span>
            <span className="text-xs text-slate-500">Tenant: {currentTenant.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Matriz de Treinamentos de NRs & POPs
          </h1>
          <p className="text-sm text-slate-600">
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
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
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
              className="inline-flex items-center gap-1 px-2.5 py-2 text-slate-400 hover:text-rose-600 text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar Registros
            </button>
          )}
          <button
            onClick={() => setIsDeepSearchOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Busca Inteligente nos Documentos
          </button>

          <button
            onClick={() => setIsDocManagerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-amber-600" />
            Acervo de Arquivos ({documents.length})
          </button>

          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-blue-600" />
            Montar Turma
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Capacitação
          </button>
        </div>
      </div>

      {/* KPI Cards de Conformidade Industrial */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Homologadas</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalRecords}</p>
          <p className="text-[11px] text-slate-400 mt-1">NRs Obrigatórias e POPs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-medium">
            <span>Bloqueados / Vencidos</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{expiredRecords}</p>
          <p className="text-[11px] text-rose-500 mt-1">Interdição preventiva necessária</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Reciclagem &lt; 60 dias</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{expiringRecords}</p>
          <p className="text-[11px] text-amber-600 mt-1">Agendamento de turma recomendado</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
            <span>Aptidão Geral da Fábrica</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{complianceRate}%</p>
          <p className="text-[11px] text-emerald-600 mt-1">Em conformidade com MTE/ISO</p>
        </div>
      </div>

      {/* Abas Principais de Visualização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-amber-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Lista de Registros
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-white text-amber-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Matriz de Aptidão Legal (Pilar 2)
          </button>

          <button
            onClick={() => setIsDocManagerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Acervo Documental ({documents.length})
          </button>
        </div>

        {/* Filtros de Setor e Tipo */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tipo: NRs vs POPs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('NR')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                typeFilter === 'NR' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              NRs (Segurança)
            </button>
            <button
              onClick={() => setTypeFilter('POP')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                typeFilter === 'POP' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              POPs (Operação)
            </button>
          </div>

          {/* Setor */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {SECTORS.map(sec => (
              <button
                key={sec.id}
                onClick={() => setSelectedSector(sec.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedSector === sec.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo Dinâmico Conforme a Aba */}
      {activeTab === 'matrix' ? (
        <ComplianceMatrixView
          trainings={trainings}
          selectedSector={selectedSector}
          onOpenDossier={(empName) => setDossierEmployee(empName)}
          onRenewRecord={handleRenew}
        />
      ) : (
        /* Visualização em Lista Padrão com Filtros Avançados */
        <div className="space-y-4">
          {/* Barra de Busca e Filtro de Status */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por colaborador, norma, código de certificado ou setor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Status de Validade:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs border border-slate-200 bg-slate-50 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="valid">🟢 Apenas Válidos</option>
                <option value="expiring">🟡 A Vencer (&lt; 60 dias)</option>
                <option value="expired">🔴 Vencidos</option>
              </select>
            </div>
          </div>

          {/* Tabela de Registros */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                    <th className="py-3 px-4 font-bold">Colaborador / Função</th>
                    <th className="py-3 px-4 font-bold">Tipo & Código</th>
                    <th className="py-3 px-4 font-bold">Norma / Procedimento Operacional</th>
                    <th className="py-3 px-3 font-bold text-center">Conclusão</th>
                    <th className="py-3 px-3 font-bold text-center">Validade (SLA)</th>
                    <th className="py-3 px-3 font-bold text-center">Status</th>
                    <th className="py-3 px-3 font-bold text-center">Evidências</th>
                    <th className="py-3 px-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTrainings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-slate-500">
                        <p className="text-sm font-semibold mb-1">Nenhum treinamento ou POP cadastrado ainda</p>
                        <p className="text-xs text-slate-400 mb-3">Cadastre certificados de NRs, reciclagens ou procedimentos da sua fábrica.</p>
                        <button
                          onClick={() => setIsNewModalOpen(true)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
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
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          {/* Colaborador */}
                          <td className="py-3 px-4 font-medium">
                            <div 
                              onClick={() => setDossierEmployee(item.employeeName)}
                              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                              title="Ver Dossiê Completo"
                            >
                              {item.employeeName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.employeeRole} • <span className="text-slate-400">{item.department}</span>
                            </div>
                          </td>

                          {/* Tipo & Código */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.type === 'NR' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}>
                              {item.code} {item.version ? `(${item.version})` : ''}
                            </span>
                          </td>

                          {/* Norma / POP */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{item.courseName}</div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <FileCheck className="w-3 h-3 text-slate-400" />
                              {item.certificateCode} • {item.instructorOrEntity || 'Entidade Oficial'}
                            </div>
                          </td>

                          {/* Conclusão */}
                          <td className="py-3 px-3 text-center text-slate-600">
                            {formatDate(item.completedDate)}
                          </td>

                          {/* Validade */}
                          <td className="py-3 px-3 text-center font-semibold text-slate-800">
                            {formatDate(item.expiryDate)}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            {renderStatusBadge(status, days)}
                          </td>

                          {/* Anexos */}
                          <td className="py-3 px-3 text-center">
                            {item.attachments && item.attachments.length > 0 ? (
                              <button
                                onClick={() => setIsDocManagerOpen(true)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer"
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
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setDossierEmployee(item.employeeName)}
                                className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                title="Abrir Dossiê de Auditoria"
                              >
                                Dossiê
                              </button>
                              <button
                                onClick={() => handleRenew(item.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors cursor-pointer"
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
      />

      {/* Modal 2: Repositório & Gestão de Documentos (PDF, Word, TXT) */}
      <DocumentManagerModal
        isOpen={isDocManagerOpen}
        onClose={() => setIsDocManagerOpen(false)}
        documents={documents}
        onAddDocument={handleAddDocument}
        onDeleteDocument={handleDeleteDocument}
      />

      {/* Modal 3: Montar Turma de Reciclagem */}
      <TrainingBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        trainings={trainings}
      />

      {/* Modal 4: Dossiê de Auditoria do Colaborador */}
      <EmployeeDossierModal
        isOpen={!!dossierEmployee}
        onClose={() => setDossierEmployee(null)}
        employeeName={dossierEmployee}
        trainings={trainings}
        onRenewRecord={handleRenew}
      />

      {/* Modal 5: Nova Capacitação / POP */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Cadastrar Capacitação / Procedimento</h3>
            <p className="text-xs text-slate-500 mb-4">
              Registre a homologação de NR de Segurança ou POP Operacional para {currentTenant.name}.
            </p>

            <form onSubmit={handleAddTraining} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Registro</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as TrainingType)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="NR">NR (Norma Regulamentadora SST)</option>
                    <option value="POP">POP (Procedimento Operacional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código Identificador</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: NR-10 ou POP-001"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Norma / POP *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: NR-10 Segurança em Instalações Elétricas"
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Colaborador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Roberto Gomes"
                    value={newEmployee}
                    onChange={e => setNewEmployee(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    placeholder="Ex: Eletricista de Manutenção"
                    value={newEmployeeRole}
                    onChange={e => setNewEmployeeRole(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Setor / Departamento</label>
                  <select
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Usinagem CNC">Usinagem CNC</option>
                    <option value="Estamparia & Prensas">Estamparia & Prensas</option>
                    <option value="Montagem & Solda">Montagem & Solda</option>
                    <option value="Geral">Geral / Supervisão</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {newType === 'POP' ? 'Versão do POP' : 'Validade (Meses)'}
                  </label>
                  {newType === 'POP' ? (
                    <input
                      type="text"
                      placeholder="Ex: v2.0"
                      value={newVersion}
                      onChange={e => setNewVersion(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                    />
                  ) : (
                    <input
                      type="number"
                      value={newValidityMonths}
                      onChange={e => setNewValidityMonths(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Conclusão / Treinamento</label>
                  <input
                    type="date"
                    value={newCompletedDate}
                    onChange={e => setNewCompletedDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Vencimento / Reciclagem</label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={e => setNewExpiryDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Salvar Homologação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
