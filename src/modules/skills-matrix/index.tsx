'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/tenant-context';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { 
  SkillLevel, 
  SkillStation, 
  EmployeeSkillRecord, 
  SkillLevelInfo, 
  Sector, 
  TrainingAction, 
  SuccessionPlan,
  ViewTab, 
  DisplayFormat 
} from './types';
import { IluoCircle } from './components/IluoCircle';
import { PlantSectorsManagerModal } from '@/components/modals/PlantSectorsManagerModal';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { DEFAULT_PLANT_SECTORS, PlantSector } from '@/types/sectors';
import { AddOperatorModal } from './components/AddOperatorModal';
import { AddStationModal } from './components/AddStationModal';
import { GapAnalysisPanel } from './components/GapAnalysisPanel';
import { SuccessionMatrixPanel } from './components/SuccessionMatrixPanel';
import { AddSuccessionModal } from './components/AddSuccessionModal';
import { SkillsDashboardPanel } from './components/SkillsDashboardPanel';
import { 
  Users, 
  Award, 
  AlertTriangle, 
  Search, 
  HelpCircle, 
  UserPlus, 
  Building2, 
  PlusCircle, 
  Sparkles, 
  Download, 
  Maximize2, 
  Minimize2, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Radio, 
  Check, 
  Lock,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Trash2,
  LayoutDashboard,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';

export const SKILL_LEVEL_DEFINITIONS: Record<SkillLevel, SkillLevelInfo> = {
  1: {
    level: 1,
    code: 'N1',
    name: 'Aprendiz (Teoria)',
    description: 'Possui conhecimento teórico, executa sob supervisão integral.',
    color: 'bg-slate-200 border-slate-300 text-slate-700',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    iluoLabel: '1/4 preenchido (I)'
  },
  2: {
    level: 2,
    code: 'N2',
    name: 'Praticante (Supervisão)',
    description: 'Executa rotinas básicas com assistência periódica do líder.',
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    iluoLabel: '2/4 preenchido (L)'
  },
  3: {
    level: 3,
    code: 'N3',
    name: 'Autônomo (Pleno)',
    description: 'Opera com total independência e atinge os padrões de ciclo e qualidade.',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    iluoLabel: '3/4 preenchido (U)'
  },
  4: {
    level: 4,
    code: 'N4',
    name: 'Multiplicador (Especialista)',
    description: 'Capacita novos operadores, audita processos e lidera melhorias Kaizen.',
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    iluoLabel: '4/4 completo (O)'
  }
};

// ==========================================
// DADOS INICIAIS MULTI-SETOR ISOLADOS
// ==========================================
const INITIAL_SECTORS: Sector[] = [
  {
    id: 'sec-usinagem',
    code: 'USI',
    name: 'Usinagem CNC & Precisão',
    description: 'Tornos CNC, centros de usinagem e retíficas cilíndricas.',
    managerName: 'Carlos Silveira',
    managerRole: 'Supervisor de Usinagem',
    authorizedRoles: ['superadmin', 'tenant_admin', 'sec-usinagem-supervisor'],
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'sec-estampagem',
    code: 'EST',
    name: 'Estamparia & Prensas',
    description: 'Prensas hidráulicas de 200T a 500T, corte e repuxo de chapas.',
    managerName: 'Mariana Souza',
    managerRole: 'Supervisora de Estamparia',
    authorizedRoles: ['superadmin', 'tenant_admin', 'sec-estampagem-supervisor'],
    color: 'from-amber-600 to-orange-600'
  },
  {
    id: 'sec-montagem',
    code: 'MON',
    name: 'Montagem & Solda Robotizada',
    description: 'Células de solda MIG/MAG, montagem mecânica e testes finais.',
    managerName: 'Rodrigo Santoro',
    managerRole: 'Coordenador de Montagem',
    authorizedRoles: ['superadmin', 'tenant_admin', 'sec-montagem-supervisor'],
    color: 'from-emerald-600 to-teal-600'
  }
];

const INITIAL_STATIONS: SkillStation[] = [
  // Usinagem
  { id: 'st-cnc-4e', sectorId: 'sec-usinagem', name: 'Torno CNC 4 Eixos', category: 'Torneamento', minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-cnc-cent', sectorId: 'sec-usinagem', name: 'Centro de Usinagem Vertical', category: 'Fresamento', minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-retifica', sectorId: 'sec-usinagem', name: 'Retífica Cilíndrica CNC', category: 'Acabamento', minOperatorsRequired: 1, targetLevel: 3 },
  { id: 'st-metrologia', sectorId: 'sec-usinagem', name: 'Controle Tridimensional (MMC)', category: 'Qualidade', minOperatorsRequired: 2, targetLevel: 3 },
  
  // Estamparia
  { id: 'st-prensa-200', sectorId: 'sec-estampagem', name: 'Prensa Hidráulica 200T', category: 'Estamparia', minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-prensa-500', sectorId: 'sec-estampagem', name: 'Prensa Mecânica Excêntrica 500T', category: 'Estamparia Pesada', minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-corte-laser', sectorId: 'sec-estampagem', name: 'Corte a Laser Fibra Óptica', category: 'Corte', minOperatorsRequired: 1, targetLevel: 3 },

  // Montagem
  { id: 'st-solda-mig', sectorId: 'sec-montagem', name: 'Célula de Solda Robotizada MIG', category: 'Soldagem', minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-bancada-mont', sectorId: 'sec-montagem', name: 'Bancada Montagem Eletromecânica', category: 'Montagem', minOperatorsRequired: 3, targetLevel: 3 },
  { id: 'st-teste-estanc', sectorId: 'sec-montagem', name: 'Teste de Estanqueidade & Pressão', category: 'Qualidade Final', minOperatorsRequired: 2, targetLevel: 3 }
];

const INITIAL_EMPLOYEES: EmployeeSkillRecord[] = [
  // Usinagem
  {
    employeeId: 'emp-1',
    sectorId: 'sec-usinagem',
    employeeName: 'Marcos Vinicius',
    role: 'Operador Especialista CNC',
    shift: 'Turno A',
    skills: { 'st-cnc-4e': 4, 'st-cnc-cent': 4, 'st-retifica': 3, 'st-metrologia': 4 }
  },
  {
    employeeId: 'emp-2',
    sectorId: 'sec-usinagem',
    employeeName: 'Aline Ferreira',
    role: 'Operadora de Usinagem Pleno',
    shift: 'Turno A',
    skills: { 'st-cnc-4e': 3, 'st-cnc-cent': 2, 'st-retifica': 1, 'st-metrologia': 3 }
  },
  {
    employeeId: 'emp-3',
    sectorId: 'sec-usinagem',
    employeeName: 'Felipe Alencar',
    role: 'Operador CNC Júnior',
    shift: 'Turno B',
    skills: { 'st-cnc-4e': 2, 'st-cnc-cent': 1, 'st-retifica': 2, 'st-metrologia': 1 }
  },
  {
    employeeId: 'emp-4',
    sectorId: 'sec-usinagem',
    employeeName: 'Lucas Andrade',
    role: 'Auxiliar de Usinagem',
    shift: 'Turno B',
    skills: { 'st-cnc-4e': 1, 'st-cnc-cent': 1, 'st-retifica': 1, 'st-metrologia': 1 }
  },

  // Estamparia
  {
    employeeId: 'emp-5',
    sectorId: 'sec-estampagem',
    employeeName: 'Beatriz Lima',
    role: 'Operadora Líder de Prensas',
    shift: 'Turno A',
    skills: { 'st-prensa-200': 4, 'st-prensa-500': 4, 'st-corte-laser': 3 }
  },
  {
    employeeId: 'emp-6',
    sectorId: 'sec-estampagem',
    employeeName: 'Rodrigo Santoro',
    role: 'Operador de Prensa',
    shift: 'Turno A',
    skills: { 'st-prensa-200': 3, 'st-prensa-500': 2, 'st-corte-laser': 1 }
  },
  {
    employeeId: 'emp-7',
    sectorId: 'sec-estampagem',
    employeeName: 'Claudio Roberto',
    role: 'Operador de Corte',
    shift: 'Turno B',
    skills: { 'st-prensa-200': 1, 'st-prensa-500': 1, 'st-corte-laser': 4 }
  },

  // Montagem
  {
    employeeId: 'emp-8',
    sectorId: 'sec-montagem',
    employeeName: 'Daniel Silveira',
    role: 'Soldador Especialista',
    shift: 'Turno A',
    skills: { 'st-solda-mig': 4, 'st-bancada-mont': 3, 'st-teste-estanc': 3 }
  },
  {
    employeeId: 'emp-9',
    sectorId: 'sec-montagem',
    employeeName: 'Vanessa Castro',
    role: 'Montadora Eletromecânica',
    shift: 'Turno A',
    skills: { 'st-solda-mig': 1, 'st-bancada-mont': 4, 'st-teste-estanc': 3 }
  }
];

const INITIAL_ACTIONS: TrainingAction[] = [
  {
    id: 'act-1',
    sectorId: 'sec-usinagem',
    stationId: 'st-cnc-cent',
    stationName: 'Centro de Usinagem Vertical',
    operatorId: 'emp-2',
    operatorName: 'Aline Ferreira',
    mentorId: 'emp-1',
    mentorName: 'Marcos Vinicius',
    currentLevel: 2,
    targetLevel: 3,
    status: 'in_progress',
    scheduledDate: '2026-09-25',
    notes: 'Treinamento prático em programação de fresamento.'
  }
];

const INITIAL_SUCCESSION_PLANS: SuccessionPlan[] = [
  // Usinagem
  {
    id: 'succ-1',
    sectorId: 'sec-usinagem',
    keyPosition: 'Supervisor de Usinagem CNC & Precisão',
    positionCategory: 'leadership',
    currentIncumbent: 'Carlos Silveira',
    currentIncumbentRole: 'Supervisor de Usinagem',
    successorId: 'emp-1',
    successorName: 'Marcos Vinicius',
    readiness: 'ready_now',
    readinessScore: 92,
    vacancyRisk: 'low',
    developmentPlan: 'Mentoria semanal em gestão de indicadores OEE, gestão de conflitos de equipe e alinhamento orçamentário.',
    competencyGaps: ['Orçamento Fabril', 'Gestão de Pessoas', 'Planejamento PCP'],
    targetDate: '2026-11-30',
    mentorName: 'Carlos Silveira'
  },
  {
    id: 'succ-2',
    sectorId: 'sec-usinagem',
    keyPosition: 'Especialista em Torneamento 4 Eixos (N4)',
    positionCategory: 'technical_specialist',
    currentIncumbent: 'Marcos Vinicius',
    currentIncumbentRole: 'Operador Especialista CNC',
    successorId: 'emp-2',
    successorName: 'Aline Ferreira',
    readiness: 'ready_medium',
    readinessScore: 75,
    vacancyRisk: 'medium',
    developmentPlan: 'Capacitação prática em programação CAM Mastercam e parametrização de ferramentas de corte de titânio.',
    competencyGaps: ['Programação CAM Avançada', 'Setup Rápido SMED'],
    targetDate: '2027-03-31',
    mentorName: 'Marcos Vinicius'
  },
  {
    id: 'succ-3',
    sectorId: 'sec-usinagem',
    keyPosition: 'Líder Operacional de Turno B',
    positionCategory: 'leadership',
    currentIncumbent: 'Carlos Silveira',
    currentIncumbentRole: 'Supervisor Geral Interino',
    successorId: 'emp-3',
    successorName: 'Felipe Alencar',
    readiness: 'in_development',
    readinessScore: 50,
    vacancyRisk: 'high',
    developmentPlan: 'Job rotation de 30 dias no Turno A para vivência das rotinas de passagem de turno estruturada e Kamishibai.',
    competencyGaps: ['Passagem de Turno', 'Matriz de Escalabilidade', 'Segurança do Trabalho'],
    targetDate: '2027-08-30',
    mentorName: 'Carlos Silveira'
  },
  // Estamparia
  {
    id: 'succ-4',
    sectorId: 'sec-estampagem',
    keyPosition: 'Supervisora de Linha de Prensas',
    positionCategory: 'leadership',
    currentIncumbent: 'Mariana Souza',
    currentIncumbentRole: 'Supervisora de Estamparia',
    successorId: 'emp-5',
    successorName: 'Beatriz Lima',
    readiness: 'ready_now',
    readinessScore: 90,
    vacancyRisk: 'low',
    developmentPlan: 'Imersão em auditorias de processo da NR-12 e coordenação de reuniões diárias de melhoria contínua.',
    competencyGaps: ['Auditoria NR-12', 'Relatórios Gerenciais'],
    targetDate: '2026-10-31',
    mentorName: 'Mariana Souza'
  },
  {
    id: 'succ-5',
    sectorId: 'sec-estampagem',
    keyPosition: 'Especialista em Prensas Excêntricas 500T',
    positionCategory: 'technical_specialist',
    currentIncumbent: 'Beatriz Lima',
    currentIncumbentRole: 'Operadora Líder',
    successorId: 'emp-6',
    successorName: 'Rodrigo Santoro',
    readiness: 'ready_medium',
    readinessScore: 65,
    vacancyRisk: 'medium',
    developmentPlan: 'Treinamento intensivo de manutenção autônoma nível 2 e troca rápida de ferramentas (TRF).',
    competencyGaps: ['Troca Rápida de Matriz', 'Setup Seguro'],
    targetDate: '2027-04-30',
    mentorName: 'Beatriz Lima'
  },
  // Montagem
  {
    id: 'succ-6',
    sectorId: 'sec-montagem',
    keyPosition: 'Coordenador de Montagem & Robótica',
    positionCategory: 'leadership',
    currentIncumbent: 'Rodrigo Santoro',
    currentIncumbentRole: 'Coordenador de Montagem',
    successorId: 'emp-8',
    successorName: 'Daniel Silveira',
    readiness: 'ready_medium',
    readinessScore: 78,
    vacancyRisk: 'medium',
    developmentPlan: 'Desenvolvimento em gestão de balanceamento de linha e ciclo takt time.',
    competencyGaps: ['Takt Time & Balanceamento', 'Gestão de Pessoas'],
    targetDate: '2027-02-28',
    mentorName: 'Rodrigo Santoro'
  },
  {
    id: 'succ-7',
    sectorId: 'sec-montagem',
    keyPosition: 'Programador de Solda Robotizada MIG',
    positionCategory: 'technical_specialist',
    currentIncumbent: 'Daniel Silveira',
    currentIncumbentRole: 'Soldador Especialista',
    successorName: 'Nenhum Sucessor Mapeado',
    readiness: 'none',
    readinessScore: 0,
    vacancyRisk: 'critical',
    developmentPlan: 'Urgente: Recrutar ou selecionar operador interno para iniciar formação imediata como backup.',
    competencyGaps: ['Programação Robótica Fanuc/Kuka', 'Parâmetros de Penetração MIG'],
    targetDate: '2027-06-30',
    mentorName: 'Daniel Silveira'
  }
];

export default function SkillsMatrixModule() {
  const { currentTenant, currentUser } = useTenant();

  // Multi-Sector State unificado da planta
  const { sectors: plantSectors, addSector } = usePlantSectors();
  const safePlantSectors = Array.isArray(plantSectors) && plantSectors.length > 0 
    ? plantSectors 
    : DEFAULT_PLANT_SECTORS;

  const sectors: Sector[] = safePlantSectors.map((ps: PlantSector) => ({
    id: ps.id,
    code: ps.code,
    name: ps.name,
    description: ps.description || `Matriz de Habilidades do setor ${ps.name}`,
    managerName: ps.managerName || 'Supervisor Responsável',
    managerRole: ps.managerRole || 'Supervisor de Operações',
    authorizedRoles: ['superadmin', 'tenant_admin', `${ps.id}-supervisor`],
    color: ps.color || 'from-blue-600 to-indigo-600'
  }));

  const defaultFallbackSector: Sector = sectors[0] || {
    id: 'sec-usinagem',
    code: 'USI',
    name: 'Usinagem CNC & Precisão',
    description: 'Matriz de Habilidades padrão',
    managerName: 'Supervisor Responsável',
    managerRole: 'Supervisor de Operações',
    authorizedRoles: ['superadmin', 'tenant_admin'],
    color: 'from-blue-600 to-indigo-600'
  };

  const [selectedSectorId, setSelectedSectorId] = useState<string>(safePlantSectors[0]?.id || 'sec-usinagem');
  const [stations, setStations] = useTenantStorage<SkillStation[]>('skills-matrix', 'stations', INITIAL_STATIONS);
  const [employees, setEmployees] = useTenantStorage<EmployeeSkillRecord[]>('skills-matrix', 'employees', INITIAL_EMPLOYEES);
  const [trainingActions, setTrainingActions] = useTenantStorage<TrainingAction[]>('skills-matrix', 'actions', INITIAL_ACTIONS);
  const [successionPlans, setSuccessionPlans] = useTenantStorage<SuccessionPlan[]>('skills-matrix', 'succession', INITIAL_SUCCESSION_PLANS);
  const [isLoaded, setIsLoaded] = useState(true);

  // View & Presentation State - Default to 'dashboard' for dynamic management overview
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('iluo_circles');
  const [highlightGaps, setHighlightGaps] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [selectedShift, setSelectedShift] = useState('all');
  const [tintedGlass, setTintedGlass] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('aptis_tinted_glass_mode');
    if (saved !== null) {
      setTintedGlass(saved === 'true');
    }
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setTintedGlass(customEvent.detail);
    };
    window.addEventListener('aptis-glass-mode-change', handleModeChange);
    return () => window.removeEventListener('aptis-glass-mode-change', handleModeChange);
  }, []);

  // Modals
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);
  const [isSuccessionModalOpen, setIsSuccessionModalOpen] = useState(false);

  // Importação de Excel Inteligente
  const handleImportSkillsExcel = (rows: Record<string, any>[]) => {
    const updatedStations = [...stations];
    const updatedEmployees = [...employees];

    rows.forEach((row, idx) => {
      const name = (row.employeeName || '').trim();
      if (!name) return;

      const rowSectorName = (row.sector || '').trim().toLowerCase();
      const matchedSector = sectors.find(s => s.name.toLowerCase() === rowSectorName || s.code.toLowerCase() === rowSectorName) || activeSector;
      const targetSectorId = matchedSector.id;

      const stationName = (row.station || '').trim();
      let targetStationId = '';
      if (stationName) {
        let foundStation = updatedStations.find(st => st.sectorId === targetSectorId && st.name.toLowerCase() === stationName.toLowerCase());
        if (!foundStation) {
          targetStationId = `st-import-${Date.now()}-${idx}`;
          foundStation = {
            id: targetStationId,
            sectorId: targetSectorId,
            name: stationName,
            category: 'Operacional',
            minOperatorsRequired: 1,
            targetLevel: 3
          };
          updatedStations.push(foundStation);
        } else {
          targetStationId = foundStation.id;
        }
      }

      let parsedLevel: SkillLevel = 1;
      const rawLvl = String(row.level || '').trim().toUpperCase();
      if (rawLvl === '4' || rawLvl === 'O') parsedLevel = 4;
      else if (rawLvl === '3' || rawLvl === 'U') parsedLevel = 3;
      else if (rawLvl === '2' || rawLvl === 'L') parsedLevel = 2;
      else parsedLevel = 1;

      const empId = row.employeeId ? String(row.employeeId).trim() : `emp-imp-${Date.now()}-${idx}`;
      const existingIdx = updatedEmployees.findIndex(e => 
        (e.employeeId && e.employeeId === empId) || 
        e.employeeName.toLowerCase() === name.toLowerCase()
      );

      if (existingIdx >= 0) {
        if (targetStationId) {
          updatedEmployees[existingIdx] = {
            ...updatedEmployees[existingIdx],
            role: row.role ? String(row.role).trim() : updatedEmployees[existingIdx].role,
            shift: row.shift ? String(row.shift).trim() : updatedEmployees[existingIdx].shift,
            skills: {
              ...updatedEmployees[existingIdx].skills,
              [targetStationId]: parsedLevel
            }
          };
        }
      } else {
        const newRecord: EmployeeSkillRecord = {
          employeeId: empId,
          sectorId: targetSectorId,
          employeeName: name,
          role: row.role ? String(row.role).trim() : 'Operador',
          shift: row.shift ? String(row.shift).trim() : 'Turno A',
          skills: targetStationId ? { [targetStationId]: parsedLevel } : {}
        };
        updatedEmployees.push(newRecord);
      }
    });

    setStations(updatedStations);
    setEmployees(updatedEmployees);

    return {
      successCount: rows.length,
      message: `${rows.length} registros processados! Base de operadores e competências ILUO atualizada.`
    };
  };

  const activeSector: Sector = sectors.find(s => s.id === selectedSectorId) || sectors[0] || defaultFallbackSector;

  // Postos e colaboradores isolados do setor ativo (com fallback de array)
  const safeStations = Array.isArray(stations) ? stations : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const sectorStations = safeStations.filter(s => s && s.sectorId === activeSector.id);
  const sectorEmployees = safeEmployees.filter(e => e && e.sectorId === activeSector.id);

  const filteredEmployees = sectorEmployees.filter(emp => {
    if (!emp) return false;
    const name = emp.employeeName || '';
    const role = emp.role || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                          role.toLowerCase().includes(search.toLowerCase());
    const matchesShift = selectedShift === 'all' || emp.shift === selectedShift;
    return matchesSearch && matchesShift;
  });

  // Level cycle click (1 -> 2 -> 3 -> 4 -> 1)
  const handleCycleLevel = (empId: string, stationId: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.employeeId === empId) {
        const currentLvl = emp.skills[stationId] || 1;
        const nextLvl = (currentLvl % 4 + 1) as SkillLevel;
        return {
          ...emp,
          skills: {
            ...emp.skills,
            [stationId]: nextLvl
          }
        };
      }
      return emp;
    }));
  };

  // Handlers da Matriz de Sucessão
  const handleAddSuccession = (newPlan: SuccessionPlan) => {
    setSuccessionPlans(prev => [newPlan, ...prev]);
  };

  const handleUpdateSuccession = (updatedPlan: SuccessionPlan) => {
    setSuccessionPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const handleDeleteSuccession = (id: string) => {
    setSuccessionPlans(prev => prev.filter(p => p.id !== id));
  };

  // Criação Dinâmica
  const handleAddOperator = (newOperator: EmployeeSkillRecord) => {
    setEmployees(prev => [newOperator, ...prev]);
  };

  const handleAddStation = (newStation: SkillStation) => {
    setStations(prev => [...prev, newStation]);
  };

  const handleAddTrainingAction = (newAction: TrainingAction) => {
    setTrainingActions(prev => [newAction, ...prev]);
  };

  const handleUpdateActionStatus = (actionId: string, status: TrainingAction['status']) => {
    setTrainingActions(prev => prev.map(a => a.id === actionId ? { ...a, status } : a));
  };

  const handleDeleteTrainingAction = (actionId: string) => {
    setTrainingActions(prev => prev.filter(a => a.id !== actionId));
  };

  // KPIs do Setor Ativo
  const totalSectorEmployees = sectorEmployees.length;
  const polyvalentCount = sectorEmployees.filter(emp => {
    const qualified = Object.values(emp.skills).filter(lvl => lvl >= 3).length;
    return qualified >= 2;
  }).length;
  const polyvalentRate = totalSectorEmployees > 0 
    ? Math.round((polyvalentCount / totalSectorEmployees) * 100) 
    : 0;

  const criticalStationsCount = sectorStations.filter(st => {
    const qualified = sectorEmployees.filter(emp => (emp.skills[st.id] || 0) >= 3).length;
    return qualified < st.minOperatorsRequired;
  }).length;

  // Exportação CSV
  const handleExportCSV = () => {
    if (sectorStations.length === 0 || sectorEmployees.length === 0) return;

    const headers = ['Colaborador', 'Cargo', 'Turno', ...sectorStations.map(s => s.name), 'Postos Autônomos', 'Taxa Polivalência'];
    const rows = sectorEmployees.map(emp => {
      const scores = sectorStations.map(st => `N${emp.skills[st.id] || 1}`);
      const autonomous = Object.values(emp.skills).filter(l => l >= 3).length;
      const rate = `${Math.round((autonomous / sectorStations.length) * 100)}%`;
      return [emp.employeeName, emp.role, emp.shift, ...scores, autonomous, rate];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `matriz-habilidades-${activeSector.code.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isDemoActive = Boolean(typeof window !== 'undefined' && 
    (new URLSearchParams(window.location.search).get('demo') === 'true' || 
     new URLSearchParams(window.location.search).get('demo') === '1'));

  // Configuração da Barra de Abas Meniscus Liquid Bead (Padrão Aptis Routine / Cimel Vídeo 2)
  const skillsTabs: Array<{
    id: ViewTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    glowColor: string;
    beadGradient: string;
    badgeAlert?: boolean;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard Executivo',
      icon: LayoutDashboard,
      glowColor: 'rgba(59, 130, 246, 0.58)',
      beadGradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)'
    },
    {
      id: 'matrix',
      label: 'Matriz Operacional ILUO',
      icon: Layers,
      glowColor: 'rgba(6, 182, 212, 0.58)',
      beadGradient: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)'
    },
    {
      id: 'succession',
      label: 'Matriz de Sucessão',
      icon: UserCheck,
      glowColor: 'rgba(139, 92, 246, 0.58)',
      beadGradient: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)',
      badgeAlert: successionPlans.filter(p => p.sectorId === activeSector.id && p.readiness === 'none').length > 0
    },
    {
      id: 'gap_analysis',
      label: 'Diagnóstico de Gaps',
      icon: Sparkles,
      glowColor: 'rgba(245, 158, 11, 0.58)',
      beadGradient: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
      badgeAlert: criticalStationsCount > 0
    },
    {
      id: 'gestao_a_vista',
      label: 'Modo TV Chão de Fábrica',
      icon: Maximize2,
      glowColor: 'rgba(16, 185, 129, 0.58)',
      beadGradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)'
    }
  ];

  const activeMeniscusTab = skillsTabs.find(t => t.id === activeTab) || skillsTabs[0];

  return (
    <div className="space-y-6 w-full">
      {/* Banner Informativo de Demonstração (Ativo apenas no Localhost via ?demo=true) */}
      {isDemoActive && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 rounded-2xl border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                  Modo Demonstração Ativo no Localhost
                </span>
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                  Exemplos Preenchidos
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Os dados industriais de teste estão salvos exclusivamente neste navegador local. A sua versão online em produção permanece 100% limpa para uso real.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setStations([]);
              setEmployees([]);
              setTrainingActions([]);
              setSuccessionPlans([]);
              window.history.replaceState({}, '', window.location.pathname);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            title="Limpar todos os dados e visualizar o modo em branco de produção"
          >
            Ver Modo em Branco
          </button>
        </div>
      )}

      {/* =====================================================================
          1. HEADER EXECUTIVO EM VIDRO ESPECULAR (Estilo Aptis Routine / Cimel Vídeo 1)
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
                Módulo Operacional de Liderança
              </span>
              <span
                className={`text-xs ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Unidade: {currentTenant.name} • Setor: {activeSector.name} ({activeSector.code})
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              Aptis Skills • Matriz de Habilidades & Sucessão
            </h1>
            <p
              className={`text-xs sm:text-sm mt-1 ${
                tintedGlass ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Governança de polivalência técnica (ILUO), diagnóstico preditivo de gaps de linha, benchmarking por radar e matriz de sucessão de liderança.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {employees.length === 0 && stations.length === 0 ? (
              <button
                onClick={() => {
                  setStations(INITIAL_STATIONS);
                  setEmployees(INITIAL_EMPLOYEES);
                  setTrainingActions(INITIAL_ACTIONS);
                  setSuccessionPlans(INITIAL_SUCCESSION_PLANS);
                }}
                title="Carregar dados de demonstração para teste"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Carregar Exemplos
              </button>
            ) : (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Tem certeza que deseja zerar a matriz de habilidades, operadores e plano de sucessão?'
                    )
                  ) {
                    setStations([]);
                    setEmployees([]);
                    setTrainingActions([]);
                    setSuccessionPlans([]);
                  }
                }}
                title="Limpar matriz de competências e sucessão"
                className={`inline-flex items-center gap-1 px-2.5 py-2 text-xs transition-colors cursor-pointer rounded-xl ${
                  tintedGlass
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                    : 'text-slate-400 hover:text-rose-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Matriz
              </button>
            )}

            <button
              onClick={() => setIsExcelImporterOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}
              title="Importar operadores e notas ILUO a partir do Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Importar Excel
            </button>

            <button
              onClick={() => setIsSuccessionModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-subcard text-indigo-300 hover:text-white hover:border-indigo-400/40'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
              title="Mapear plano de sucessão de liderança"
            >
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Mapear Sucessor
            </button>

            <button
              onClick={() => setIsOperatorModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                border: '1px solid rgba(110, 231, 183, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(5, 150, 105, 0.5)'
              }}
            >
              <UserPlus className="w-4 h-4" />
              Novo Operador
            </button>

            <button
              onClick={() => setIsStationModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                border: '1px solid rgba(165, 243, 252, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
              }}
            >
              <PlusCircle className="w-4 h-4" />
              Novo Posto
            </button>

            <button
              onClick={handleExportCSV}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer border ${
                tintedGlass
                  ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
              }`}
              title="Exportar dados da matriz em CSV / Excel"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              CSV
            </button>
          </div>
        </div>

        {/* KPI Cards Rápidos em Sub-cápsulas de Vidro */}
        <div className={`relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-5 border-t ${
          tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
        }`}>
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
              <span>Total Operadores</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              {totalSectorEmployees}
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
                tintedGlass ? 'text-cyan-300' : 'text-blue-600'
              }`}
            >
              <span>Postos Mapeados</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-cyan-300' : 'text-blue-600'
              }`}
            >
              {sectorStations.length}
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
              <span>Postos em Gargalo</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-rose-400' : 'text-rose-600'
              }`}
            >
              {criticalStationsCount}
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
              <span>Polivalência Ativa</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-600'
              }`}
            >
              {polyvalentRate}%
              <span className={`text-xs ml-2 font-normal font-sans ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                ({polyvalentCount} op.)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. BARRA DE ABAS MENISCUS LIQUID BEAD + FILTRO SETORIAL (Vídeo 2 - Meniscus)
         ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative inline-flex self-start">
          {/* Halo Cromático Meniscus projetado sob a cápsula */}
          <div
            className="absolute -inset-2 rounded-full blur-2xl opacity-45 pointer-events-none transition-all duration-500"
            style={{
              background: `radial-gradient(circle, ${activeMeniscusTab.glowColor} 0%, transparent 70%)`
            }}
          />

          <div className="aptis-meniscus-track rounded-full p-1.5 flex flex-wrap items-center gap-1 relative z-10">
            {skillsTabs.map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-500 cursor-pointer ${
                    isSelected
                      ? 'text-white scale-[1.03]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={
                    isSelected
                      ? {
                          background: tab.beadGradient,
                          boxShadow: `0 0 22px ${tab.glowColor}, inset 0 1.5px 1px rgba(255,255,255,0.65)`
                        }
                      : undefined
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badgeAlert && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#fb7185]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro Setorial em Cápsula de Vidro */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl ${
            tintedGlass
              ? 'aptis-glass-subcard text-white'
              : 'bg-white border border-slate-200 shadow-2xs text-slate-800'
          }`}
        >
          <label
            htmlFor="sector-select"
            className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
              tintedGlass ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Área / Setor:</span>
          </label>
          <select
            id="sector-select"
            value={selectedSectorId}
            onChange={e => setSelectedSectorId(e.target.value)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer min-w-[180px] ${
              tintedGlass
                ? 'text-cyan-300 [&>option]:bg-slate-900 [&>option]:text-white'
                : 'text-slate-900 [&>option]:bg-white [&>option]:text-slate-900'
            }`}
          >
            {sectors.map(sec => (
              <option key={sec.id} value={sec.id} className="py-1">
                {sec.name} ({sec.code})
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsSectorModalOpen(true)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tintedGlass ? 'hover:bg-white/10 text-cyan-400' : 'hover:bg-slate-100 text-blue-600'
            }`}
            title="Gerenciar Setores da Planta"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          3. CONTEÚDO DINÂMICO CONFORME A ABA ATIVA
         ===================================================================== */}
      {activeTab === 'dashboard' ? (
        <SkillsDashboardPanel
          sectors={sectors}
          activeSector={activeSector}
          stations={stations}
          employees={employees}
          successionPlans={successionPlans}
          trainingActions={trainingActions}
          onSelectSector={(sectorId) => setSelectedSectorId(sectorId)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          tintedGlass={tintedGlass}
        />
      ) : activeTab === 'succession' ? (
        <SuccessionMatrixPanel
          sector={activeSector}
          employees={sectorEmployees}
          successionPlans={successionPlans}
          onAddSuccessionClick={() => setIsSuccessionModalOpen(true)}
          onUpdateSuccession={handleUpdateSuccession}
          onDeleteSuccession={handleDeleteSuccession}
          tintedGlass={tintedGlass}
        />
      ) : activeTab === 'gap_analysis' ? (
        <GapAnalysisPanel
          sector={activeSector}
          stations={sectorStations}
          employees={sectorEmployees}
          trainingActions={trainingActions}
          onAddTrainingAction={handleAddTrainingAction}
          onUpdateActionStatus={handleUpdateActionStatus}
          onDeleteTrainingAction={handleDeleteTrainingAction}
          onCycleLevel={handleCycleLevel}
          tintedGlass={tintedGlass}
        />
      ) : (
        /* Matriz Operacional ILUO / Gestão à Vista */
        <div className="space-y-4">
          {/* Barra de Busca, Filtro de Turno e Controles Visuais */}
          <div
            className={`p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 ${
              tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Buscar operadores em ${activeSector.name}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-400'
                    : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Filtro de Turno */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  tintedGlass ? 'aptis-glass-subcard text-white' : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>Turno:</span>
                <select
                  value={selectedShift}
                  onChange={e => setSelectedShift(e.target.value)}
                  className={`bg-transparent outline-none cursor-pointer font-bold ${
                    tintedGlass ? 'text-cyan-300 [&>option]:bg-slate-900' : 'text-slate-900'
                  }`}
                >
                  <option value="all">Todos os Turnos</option>
                  <option value="Turno A">Turno A</option>
                  <option value="Turno B">Turno B</option>
                  <option value="Turno C">Turno C</option>
                </select>
              </div>

              {/* Formato de Exibição */}
              <div
                className={`flex items-center gap-1 p-1 rounded-xl text-xs ${
                  tintedGlass ? 'aptis-meniscus-track' : 'bg-slate-100 border border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setDisplayFormat('iluo_circles')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    displayFormat === 'iluo_circles'
                      ? tintedGlass
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-blue-700 shadow-xs'
                      : tintedGlass
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <IluoCircle level={3} size={15} />
                  Círculos ILUO
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayFormat('badges')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    displayFormat === 'badges'
                      ? tintedGlass
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-blue-700 shadow-xs'
                      : tintedGlass
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Badges (N1..N4)
                </button>
              </div>

              {/* Destacar Gaps Toggle */}
              <button
                type="button"
                onClick={() => setHighlightGaps(!highlightGaps)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  highlightGaps
                    ? tintedGlass
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                    : tintedGlass
                      ? 'aptis-glass-subcard text-slate-300 hover:text-white'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Destacar células onde a nota está abaixo do nível desejado (N3)"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${highlightGaps ? 'text-amber-400' : 'text-slate-400'}`} />
                {highlightGaps ? 'Gaps Destacados' : 'Destacar Gaps'}
              </button>
            </div>
          </div>

          {/* Legenda dos Níveis ILUO */}
          <div
            className={`p-4 rounded-3xl relative overflow-hidden transition-all ${
              tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  tintedGlass ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                Escala de Competência Lean (ILUO) • Clique em qualquer nota na tabela para avançar o nível (1 a 4)
              </h3>
              <span className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Nível de autonomia pleno: <strong className={tintedGlass ? 'text-cyan-300' : 'text-blue-700'}>N3 (3/4)</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {Object.values(SKILL_LEVEL_DEFINITIONS).map(info => (
                <div
                  key={info.level}
                  className={`p-3 rounded-2xl flex items-center gap-3 ${
                    tintedGlass
                      ? 'aptis-glass-subcard'
                      : 'bg-white/90 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <IluoCircle level={info.level} size={28} />
                  <div>
                    <span className={`font-bold flex items-center gap-1 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                      {info.code} - {info.name.split(' ')[0]}
                    </span>
                    <span className={`text-[10px] block leading-tight ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      {info.iluoLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela da Matriz */}
          {sectorStations.length === 0 ? (
            <div
              className={`rounded-3xl border p-12 text-center space-y-3 ${
                tintedGlass ? 'aptis-glass-dark text-white border-white/10' : 'aptis-glass-light text-slate-900'
              }`}
            >
              <p className={`text-sm ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Nenhum posto de trabalho cadastrado para {activeSector.name}.
              </p>
              <button
                onClick={() => setIsStationModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cadastrar Primeiro Posto
              </button>
            </div>
          ) : (
            <div
              className={`rounded-3xl border overflow-hidden transition-all duration-500 ${
                tintedGlass
                  ? 'aptis-glass-dark border-white/10 text-white'
                  : 'aptis-glass-light text-slate-900'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className={
                      tintedGlass
                        ? 'bg-slate-950/80 backdrop-blur-md text-white'
                        : 'bg-slate-100/90 text-slate-800 border-b border-slate-200'
                    }>
                      <th
                        className={`py-3.5 px-4 font-semibold text-xs uppercase tracking-wider sticky left-0 z-20 min-w-[220px] ${
                          tintedGlass
                            ? 'bg-slate-950/95 backdrop-blur-md border-r border-white/10 text-white'
                            : 'bg-slate-100/95 border-r border-slate-200 text-slate-900'
                        }`}
                      >
                        Colaborador / Função
                      </th>
                      <th className="py-3.5 px-3 font-semibold text-xs uppercase tracking-wider text-center w-24">
                        Turno
                      </th>
                      {sectorStations.map(st => (
                        <th
                          key={st.id}
                          className={`py-3.5 px-3 font-semibold text-xs text-center border-l min-w-[150px] ${
                            tintedGlass ? 'border-white/10' : 'border-slate-200'
                          }`}
                        >
                          <div className={`font-bold ${tintedGlass ? 'text-slate-100' : 'text-slate-900'}`}>
                            {st.name}
                          </div>
                          <div className={`text-[10px] font-normal mt-0.5 ${
                            tintedGlass ? 'text-cyan-300' : 'text-blue-600'
                          }`}>
                            Mín. req: <strong>{st.minOperatorsRequired}</strong> autônomos
                          </div>
                        </th>
                      ))}
                      <th
                        className={`py-3.5 px-3 font-semibold text-xs uppercase tracking-wider text-center border-l w-28 ${
                          tintedGlass ? 'border-white/10' : 'border-slate-200'
                        }`}
                      >
                        Polivalência
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tintedGlass ? 'divide-white/10' : 'divide-slate-200'}`}>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={sectorStations.length + 3} className="py-12 text-center text-slate-400 text-xs">
                          <p className="mb-2">Nenhum operador cadastrado para este setor.</p>
                          <button
                            onClick={() => setIsOperatorModalOpen(true)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Cadastrar Primeiro Operador
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => {
                        const autonomousCount = Object.values(emp.skills).filter(l => l >= 3).length;
                        return (
                          <tr
                            key={emp.employeeId}
                            className={`transition-colors group ${
                              tintedGlass ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td
                              className={`py-3.5 px-4 font-medium sticky left-0 z-10 border-r ${
                                tintedGlass
                                  ? 'bg-slate-900/95 group-hover:bg-slate-800/95 border-white/10 text-white'
                                  : 'bg-white group-hover:bg-slate-50 border-slate-100 text-slate-900'
                              }`}
                            >
                              <div className={`font-semibold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                                {emp.employeeName}
                              </div>
                              <div className="text-xs text-slate-400">{emp.role}</div>
                            </td>
                            <td className="py-3.5 px-3 text-center text-xs">
                              <span
                                className={`px-2 py-0.5 rounded-full border ${
                                  tintedGlass
                                    ? 'bg-white/10 border-white/15 text-slate-300'
                                    : 'bg-slate-100 border-slate-200 text-slate-600'
                                }`}
                              >
                                {emp.shift}
                              </span>
                            </td>

                            {sectorStations.map(st => {
                              const lvl = emp.skills[st.id] || 1;
                              const info = SKILL_LEVEL_DEFINITIONS[lvl];
                              const isGap = highlightGaps && lvl < (st.targetLevel || 3);

                              return (
                                <td
                                  key={st.id}
                                  className={`py-2.5 px-3 text-center border-l transition-colors ${
                                    tintedGlass ? 'border-white/10' : 'border-slate-100'
                                  } ${
                                    isGap
                                      ? tintedGlass
                                        ? 'bg-rose-500/15 ring-1 ring-rose-500/40 inset-0'
                                        : 'bg-rose-50/70 ring-1 ring-rose-300 inset-0'
                                      : ''
                                  }`}
                                >
                                  <button
                                    onClick={() => handleCycleLevel(emp.employeeId, st.id)}
                                    className={`p-1.5 rounded-xl font-bold text-xs transition-all transform active:scale-95 cursor-pointer inline-flex items-center justify-center gap-1.5 min-w-[52px] ${
                                      displayFormat === 'badges'
                                        ? info.color
                                        : tintedGlass
                                          ? 'aptis-glass-subcard aptis-glass-subcard-interactive text-white'
                                          : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs'
                                    }`}
                                    title={`${emp.employeeName} em ${st.name}: ${info.name}. Clique para alternar nota.`}
                                  >
                                    {displayFormat === 'iluo_circles' ? (
                                      <>
                                        <IluoCircle level={lvl} size={22} />
                                        <span className={`text-[11px] font-bold ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                                          {info.code}
                                        </span>
                                      </>
                                    ) : (
                                      <span>{info.code}</span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}

                            <td className={`py-3.5 px-3 text-center border-l ${tintedGlass ? 'border-white/10' : 'border-slate-100'}`}>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  autonomousCount >= 3
                                    ? tintedGlass
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-emerald-100 text-emerald-800'
                                    : autonomousCount >= 2
                                    ? tintedGlass
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : 'bg-blue-100 text-blue-800'
                                    : tintedGlass
                                    ? 'bg-white/10 text-slate-300 border border-white/15'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {autonomousCount} / {sectorStations.length}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* Linha de Cobertura Crítica */}
                  <tfoot>
                    <tr
                      className={`border-t font-semibold text-xs ${
                        tintedGlass
                          ? 'bg-slate-950/60 border-white/10 text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <td
                        className={`py-3.5 px-4 sticky left-0 z-10 border-r ${
                          tintedGlass ? 'bg-slate-950/90 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        Operadores Autônomos (N3 ou N4)
                      </td>
                      <td className="py-3.5 px-3 text-center">-</td>
                      {sectorStations.map(st => {
                        const count = sectorEmployees.filter(emp => (emp.skills[st.id] || 0) >= 3).length;
                        const isUnder = count < st.minOperatorsRequired;
                        return (
                          <td
                            key={st.id}
                            className={`py-3.5 px-3 text-center border-l ${
                              tintedGlass ? 'border-white/10' : 'border-slate-200'
                            } ${
                              isUnder
                                ? tintedGlass
                                  ? 'bg-rose-500/15 text-rose-300 font-bold'
                                  : 'bg-rose-50 text-rose-700 font-bold'
                                : tintedGlass
                                  ? 'text-white'
                                  : 'text-slate-900'
                            }`}
                          >
                            <div className="font-bold">
                              {count} / {st.minOperatorsRequired} req.
                            </div>
                            {isUnder && (
                              <span
                                className={`inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full mt-0.5 border ${
                                  tintedGlass
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
                                    : 'bg-rose-100 text-rose-700 border-rose-200'
                                }`}
                              >
                                Gargalo
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className={`py-3.5 px-3 text-center border-l ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
                        -
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAIS DO MÓDULO */}
      <PlantSectorsManagerModal
        isOpen={isSectorModalOpen}
        onClose={() => setIsSectorModalOpen(false)}
        tenantName={currentTenant?.name}
        tintedGlass={tintedGlass}
      />

      <AddOperatorModal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
        sector={activeSector}
        stations={sectorStations}
        onAddOperator={handleAddOperator}
        tintedGlass={tintedGlass}
      />

      <AddStationModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        sector={activeSector}
        onAddStation={handleAddStation}
        tintedGlass={tintedGlass}
      />

      <AddSuccessionModal
        isOpen={isSuccessionModalOpen}
        onClose={() => setIsSuccessionModalOpen(false)}
        sector={activeSector}
        employees={sectorEmployees}
        onAddSuccession={handleAddSuccession}
        tintedGlass={tintedGlass}
      />

      <SmartExcelImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        toolTitle={EXCEL_IMPORT_CONFIGS['skills-matrix'].toolTitle}
        subtitle={EXCEL_IMPORT_CONFIGS['skills-matrix'].subtitle}
        templateFilename={EXCEL_IMPORT_CONFIGS['skills-matrix'].templateFilename}
        columns={EXCEL_IMPORT_CONFIGS['skills-matrix'].columns}
        sampleRows={EXCEL_IMPORT_CONFIGS['skills-matrix'].sampleRows}
        onImport={handleImportSkillsExcel}
      />
    </div>
  );
}
