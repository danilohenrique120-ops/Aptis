'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/tenant-context';
import { 
  SkillLevel, 
  SkillStation, 
  EmployeeSkillRecord, 
  SkillLevelInfo, 
  Sector, 
  TrainingAction, 
  ViewTab, 
  DisplayFormat 
} from './types';
import { IluoCircle } from './components/IluoCircle';
import { SectorManagerModal } from './components/SectorManagerModal';
import { AddOperatorModal } from './components/AddOperatorModal';
import { AddStationModal } from './components/AddStationModal';
import { GapAnalysisPanel } from './components/GapAnalysisPanel';
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
  Trash2
} from 'lucide-react';

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

export default function SkillsMatrixModule() {
  const { currentTenant, currentUser } = useTenant();

  // Multi-Sector State
  const [sectors, setSectors] = useState<Sector[]>(INITIAL_SECTORS);
  const [selectedSectorId, setSelectedSectorId] = useState<string>(INITIAL_SECTORS[0].id);
  const [stations, setStations] = useState<SkillStation[]>([]);
  const [employees, setEmployees] = useState<EmployeeSkillRecord[]>([]);
  const [trainingActions, setTrainingActions] = useState<TrainingAction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (clean default [])
  React.useEffect(() => {
    try {
      const savedStations = localStorage.getItem('aptis_skills_stations');
      const savedEmployees = localStorage.getItem('aptis_skills_employees');
      const savedActions = localStorage.getItem('aptis_skills_actions');
      const savedSectors = localStorage.getItem('aptis_skills_sectors');

      if (savedStations) setStations(JSON.parse(savedStations));
      if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
      if (savedActions) setTrainingActions(JSON.parse(savedActions));
      if (savedSectors) setSectors(JSON.parse(savedSectors));
    } catch (e) {
      console.error('Erro ao carregar dados da matriz de habilidades:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when state changes
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('aptis_skills_stations', JSON.stringify(stations));
      localStorage.setItem('aptis_skills_employees', JSON.stringify(employees));
      localStorage.setItem('aptis_skills_actions', JSON.stringify(trainingActions));
      localStorage.setItem('aptis_skills_sectors', JSON.stringify(sectors));
    }
  }, [stations, employees, trainingActions, sectors, isLoaded]);

  // View & Presentation State
  const [activeTab, setActiveTab] = useState<ViewTab>('matrix');
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('iluo_circles');
  const [highlightGaps, setHighlightGaps] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [selectedShift, setSelectedShift] = useState('all');

  // Modals
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  // Simulador de Perfil para Teste de Restrição de Área
  const [simulatedAccessRole, setSimulatedAccessRole] = useState<string>('all_access');

  const activeSector = sectors.find(s => s.id === selectedSectorId) || sectors[0];

  // ==========================================
  // VALIDAÇÃO DE ACESSO POR ÁREA (RESTRIÇÃO)
  // ==========================================
  const isUserAuthorizedForSector = (sector: Sector): boolean => {
    // 1. Caso o simulador esteja em 'all_access' ou usuário seja superadmin / tenant_admin
    if (simulatedAccessRole === 'all_access') return true;
    if (currentUser.role === 'superadmin' || currentUser.role === 'tenant_admin') {
      if (simulatedAccessRole !== 'all_access') {
        // Respeita o simulador para o usuário poder testar o bloqueio!
        return simulatedAccessRole === sector.id;
      }
      return true;
    }
    // 2. Se for membro ou simulador específico, checa o papel da área
    return simulatedAccessRole === sector.id;
  };

  const hasAccess = isUserAuthorizedForSector(activeSector);

  // Postos e colaboradores isolados do setor ativo
  const sectorStations = stations.filter(s => s.sectorId === activeSector.id);
  const sectorEmployees = employees.filter(e => e.sectorId === activeSector.id);

  const filteredEmployees = sectorEmployees.filter(emp => {
    const matchesSearch = emp.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                          emp.role.toLowerCase().includes(search.toLowerCase());
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

  // Criação Dinâmica
  const handleAddSector = (newSector: Sector) => {
    setSectors(prev => [...prev, newSector]);
    setSelectedSectorId(newSector.id);
  };

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

  return (
    <div className={`space-y-6 ${activeTab === 'gestao_a_vista' ? 'bg-slate-900 text-white p-6 rounded-2xl' : ''}`}>
      {/* 1. SELETOR DE SETOR FABRIL & SIMULADOR DE ACESSO */}
      <div className={`rounded-2xl p-4 border transition-all ${
        activeTab === 'gestao_a_vista' ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs de Setores */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Selecione a Célula / Setor Operacional:
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5">
              {sectors.map(sec => {
                const isSelected = sec.id === activeSector.id;
                const secStations = stations.filter(s => s.sectorId === sec.id).length;
                const secEmps = employees.filter(e => e.sectorId === sec.id).length;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectorId(sec.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : activeTab === 'gestao_a_vista'
                        ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      {sec.code}
                    </span>
                    <span>{sec.name}</span>
                    <span className="text-[10px] opacity-70">
                      ({secEmps} op. | {secStations} postos)
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => setIsSectorModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Cadastrar novo setor com matriz própria"
              >
                <PlusCircle className="w-4 h-4" />
                Novo Setor
              </button>
            </div>
          </div>

          {/* Simulador de Permissão de Acesso por Área */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs shrink-0 self-start lg:self-auto">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-600">Simulador de Permissão:</span>
            <select
              value={simulatedAccessRole}
              onChange={e => setSimulatedAccessRole(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              title="Alterne o perfil para testar a restrição de acesso entre setores"
            >
              <option value="all_access">👑 Gestor Geral (Acesso a Todos os Setores)</option>
              <option value="sec-usinagem">👔 Supervisor: Usinagem CNC (Restrito)</option>
              <option value="sec-estampagem">👔 Supervisora: Estamparia (Restrito)</option>
              <option value="sec-montagem">👔 Coordenador: Montagem (Restrito)</option>
            </select>
          </div>
        </div>
      </div>

      {/* CASO O USUÁRIO NÃO TENHA PERMISSÃO PARA O SETOR ATIVO */}
      {!hasAccess ? (
        <div className="bg-white rounded-2xl p-10 border border-rose-200 text-center max-w-xl mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Acesso Restrito por Área
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-3 mb-2">
            Permissão Insuficiente para {activeSector.name}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Seu perfil atual de supervisor está autorizado apenas para a sua respectiva célula de trabalho. Você não possui credencial para visualizar nem alterar as notas dos operadores deste setor.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                // Return to authorized sector
                if (simulatedAccessRole !== 'all_access') {
                  setSelectedSectorId(simulatedAccessRole);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Voltar ao Meu Setor Autorizado
            </button>
            <button
              onClick={() => setSimulatedAccessRole('all_access')}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Liberar Modo Gestor Geral (Teste)
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* HEADER DO SETOR ATIVO & AÇÕES */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  Setor Ativo: {activeSector.code}
                </span>
                <span className="text-xs text-slate-500">
                  Líder: <strong>{activeSector.managerName}</strong> ({activeSector.managerRole})
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Matriz de Habilidades: {activeSector.name}
              </h1>
              <p className="text-xs text-slate-600">
                {activeSector.description}
              </p>
            </div>

            {/* Ações do Módulo */}
            <div className="flex flex-wrap items-center gap-2">
              {employees.length === 0 && stations.length === 0 ? (
                <button
                  onClick={() => {
                    setStations(INITIAL_STATIONS);
                    setEmployees(INITIAL_EMPLOYEES);
                    setTrainingActions(INITIAL_ACTIONS);
                  }}
                  title="Carregar dados de demonstração para teste"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Carregar Exemplos
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja zerar a matriz de habilidades e operadores?')) {
                      setStations([]);
                      setEmployees([]);
                      setTrainingActions([]);
                    }
                  }}
                  title="Limpar matriz de competências"
                  className="inline-flex items-center gap-1 px-2.5 py-2 text-slate-400 hover:text-rose-600 text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar Matriz
                </button>
              )}
              <button
                onClick={() => setIsOperatorModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar Operador
              </button>

              <button
                onClick={() => setIsStationModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Adicionar Posto
              </button>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-slate-200"
                title="Exportar dados da matriz em CSV / Excel"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>

          {/* KPI Cards do Setor */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Operadores do Setor</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{totalSectorEmployees}</p>
              <span className="text-[11px] text-slate-500">Quadro ativo exclusivo</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
                <span>Taxa de Polivalência</span>
                <Award className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{polyvalentRate}%</p>
              <span className="text-[11px] text-slate-500">{polyvalentCount} operadores multifuncionais</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Postos Mapeados</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{sectorStations.length}</p>
              <span className="text-[11px] text-slate-500">Células desta linha</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-rose-600 text-xs font-medium">
                <span>Gargalos / Alertas</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-600 mt-2">{criticalStationsCount}</p>
              <span className="text-[11px] text-rose-600">Abaixo do mínimo exigido</span>
            </div>
          </div>

          {/* NAVEGAÇÃO DE ABAS & CONTROLES VISUAIS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
            {/* Abas Principais */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'matrix'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Matriz Operacional
              </button>

              <button
                onClick={() => setActiveTab('gap_analysis')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'gap_analysis'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Diagnóstico de Gaps & Ações
                {criticalStationsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black">
                    {criticalStationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('gestao_a_vista')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'gestao_a_vista'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Modo Gestão à Vista (Quadro)
              </button>
            </div>

            {/* Alternadores Visuais (ILUO vs Badges & Gaps) */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              {/* Formato de Exibição */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setDisplayFormat('iluo_circles')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    displayFormat === 'iluo_circles'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <IluoCircle level={3} size={16} />
                  Círculos ILUO
                </button>
                <button
                  onClick={() => setDisplayFormat('badges')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                    displayFormat === 'badges'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Badges (N1..N4)
                </button>
              </div>

              {/* Destacar Gaps */}
              <button
                onClick={() => setHighlightGaps(!highlightGaps)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  highlightGaps
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Destacar células onde a nota está abaixo do nível desejado (N3)"
              >
                {highlightGaps ? '✓ Gaps Destacados' : 'Destacar Gaps'}
              </button>
            </div>
          </div>

          {/* CONTEÚDO DA ABA 1: MATRIZ OPERACIONAL / GESTÃO À VISTA */}
          {(activeTab === 'matrix' || activeTab === 'gestao_a_vista') && (
            <div className="space-y-4">
              {/* Legenda dos Níveis ILUO */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    Escala de Competência Lean (ILUO) • Clique na nota para avançar (1 a 4)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Nível desejado de autonomia: <strong>N3 (3/4)</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {Object.values(SKILL_LEVEL_DEFINITIONS).map(info => (
                    <div key={info.level} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5 shadow-2xs">
                      <IluoCircle level={info.level} size={28} />
                      <div>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          {info.code} - {info.name.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight">{info.iluoLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtros da Matriz */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Buscar operadores em ${activeSector.name}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Turno:</span>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="text-xs border border-slate-200 bg-slate-50 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Todos os Turnos</option>
                    <option value="Turno A">Turno A</option>
                    <option value="Turno B">Turno B</option>
                    <option value="Turno C">Turno C</option>
                  </select>
                </div>
              </div>

              {/* TABELA DA MATRIZ */}
              {sectorStations.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
                  <p className="text-slate-500 text-sm">Nenhum posto de trabalho cadastrado para {activeSector.name}.</p>
                  <button
                    onClick={() => setIsStationModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Cadastrar Primeiro Posto
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider sticky left-0 bg-slate-900 z-10 min-w-[220px]">
                            Colaborador / Função
                          </th>
                          <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider text-center w-24">
                            Turno
                          </th>
                          {sectorStations.map(st => (
                            <th key={st.id} className="py-3 px-3 font-semibold text-xs text-center border-l border-slate-800 min-w-[150px]">
                              <div className="font-bold text-slate-100">{st.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                Mín. req: <strong>{st.minOperatorsRequired}</strong> autônomos
                              </div>
                            </th>
                          ))}
                          <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider text-center border-l border-slate-800 w-28">
                            Polivalência
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredEmployees.length === 0 ? (
                          <tr>
                            <td colSpan={sectorStations.length + 3} className="py-12 text-center text-slate-500 text-xs">
                              <p className="mb-2">Nenhum operador cadastrado para este setor.</p>
                              <button
                                onClick={() => setIsOperatorModalOpen(true)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer"
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
                              <tr key={emp.employeeId} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                                  <div className="font-semibold text-slate-900">{emp.employeeName}</div>
                                  <div className="text-xs text-slate-500">{emp.role}</div>
                                </td>
                                <td className="py-3 px-3 text-center text-xs text-slate-600">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
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
                                      className={`py-2.5 px-3 text-center border-l border-slate-100 transition-colors ${
                                        isGap ? 'bg-rose-50/70 ring-1 ring-rose-300 inset-0' : ''
                                      }`}
                                    >
                                      <button
                                        onClick={() => handleCycleLevel(emp.employeeId, st.id)}
                                        className={`p-1.5 rounded-lg font-bold text-xs transition-all transform active:scale-90 border cursor-pointer inline-flex items-center justify-center gap-1.5 min-w-[50px] ${
                                          displayFormat === 'badges'
                                            ? info.color
                                            : 'bg-white hover:bg-slate-50 border-slate-200'
                                        }`}
                                        title={`${emp.employeeName} em ${st.name}: ${info.name}. Clique para alternar.`}
                                      >
                                        {displayFormat === 'iluo_circles' ? (
                                          <>
                                            <IluoCircle level={lvl} size={24} />
                                            <span className="text-[11px] font-bold text-slate-700">{info.code}</span>
                                          </>
                                        ) : (
                                          <span>{info.code}</span>
                                        )}
                                      </button>
                                    </td>
                                  );
                                })}

                                <td className="py-3 px-3 text-center border-l border-slate-100">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                    autonomousCount >= 3 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : autonomousCount >= 2 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
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
                        <tr className="bg-slate-50 border-t-2 border-slate-300 font-semibold text-xs text-slate-800">
                          <td className="py-3 px-4 sticky left-0 bg-slate-50 z-10">
                            Operadores Autônomos (N3 ou N4)
                          </td>
                          <td className="py-3 px-3 text-center">-</td>
                          {sectorStations.map(st => {
                            const count = sectorEmployees.filter(emp => (emp.skills[st.id] || 0) >= 3).length;
                            const isUnder = count < st.minOperatorsRequired;
                            return (
                              <td 
                                key={st.id} 
                                className={`py-3 px-3 text-center border-l border-slate-200 ${
                                  isUnder ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-900'
                                }`}
                              >
                                {count} / {st.minOperatorsRequired} req.
                                {isUnder && (
                                  <span className="block text-[10px] text-rose-600 uppercase font-bold">
                                    Abaixo do mín.
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-3 px-3 text-center border-l border-slate-200">-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONTEÚDO DA ABA 2: DIAGNÓSTICO DE GAPS & PLANO DE AÇÃO */}
          {activeTab === 'gap_analysis' && (
            <GapAnalysisPanel
              sector={activeSector}
              stations={sectorStations}
              employees={sectorEmployees}
              trainingActions={trainingActions}
              onAddTrainingAction={handleAddTrainingAction}
              onUpdateActionStatus={handleUpdateActionStatus}
              onDeleteTrainingAction={handleDeleteTrainingAction}
              onCycleLevel={handleCycleLevel}
            />
          )}
        </>
      )}

      {/* MODAIS DO MÓDULO */}
      <SectorManagerModal
        isOpen={isSectorModalOpen}
        onClose={() => setIsSectorModalOpen(false)}
        sectors={sectors}
        onAddSector={handleAddSector}
      />

      <AddOperatorModal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
        sector={activeSector}
        stations={sectorStations}
        onAddOperator={handleAddOperator}
      />

      <AddStationModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        sector={activeSector}
        onAddStation={handleAddStation}
      />
    </div>
  );
}
