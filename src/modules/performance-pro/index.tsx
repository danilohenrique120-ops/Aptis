'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { useTenant } from '@/context/tenant-context';
import {
  Flame,
  Users,
  Target,
  Trophy,
  ClipboardCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Send,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Calendar,
  DollarSign,
  Share2,
  Search,
  Edit3,
  X,
  Zap,
  Dumbbell,
  RefreshCw,
  Crosshair,
  Upload,
  RotateCcw,
  Smartphone
} from 'lucide-react';

// ============================================================================
// TIPOS DO MÓDULO APTIS PERFORMANCE PRO (CONSULTORIA FITNESS & ALTA PERFORMANCE)
// ============================================================================

export type StudentGoal =
  | 'Emagrecimento & Definição'
  | 'Hipertrofia & Estética'
  | 'Recomposição Corporal'
  | 'Alta Performance & Força';

export type PlanPeriod = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';

export type StudentRank = 'iniciante' | 'constante' | 'alta_intensidade' | 'elite';

export type WorkoutSplitKey = 'A' | 'B' | 'C';

export interface WorkoutExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe: string;
  rest: string;
  restSeconds?: number;
  lastLoadKg?: number;
  currentLoadKg?: number;
  substituteName: string;
  substituteNote: string;
}

export interface WorkoutSplitPlan {
  label: string;
  rawText: string;
  exercises: WorkoutExerciseItem[];
}

export interface PerformanceLead {
  id: string;
  name: string;
  phone: string;
  goal: string;
  readinessScore: number;
  pillarConsistency: number;
  pillarTraining: number;
  pillarNutrition: number;
  pillarRecovery: number;
  mainBottleneck: string;
  temperature: 'quente' | 'morno' | 'frio';
  status: 'novo' | 'negociacao' | 'convertido';
  createdAt: string;
}

export interface PerformanceStudent {
  id: string;
  name: string;
  phone: string;
  accessPin?: string;
  injuryAlert?: string;
  goal: string;
  planPeriod: PlanPeriod;
  planValue: number;
  monthlyEquivalent: number;
  startDate: string;
  renewalDate: string;
  currentProtocol: string;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  adherenceScore: number;
  churnRisk: 'baixo' | 'medio' | 'alto';
  rank: StudentRank;
  lastCheckInDate: string;
  workoutSheet?: WorkoutExerciseItem[];
  rawPrescriptionText?: string;
  workoutSplits?: Record<WorkoutSplitKey, WorkoutSplitPlan>;
}

export interface WeeklyCheckIn {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  weight: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  dietScore: number;
  sleepScore: number;
  energyScore: number;
  calculatedScore: number;
  studentNotes: string;
  coachFeedback: string;
}

// ============================================================================
// DICIONÁRIO INTELIGENTE DE EQUIVALÊNCIA BIOMECÂNICA ("ACADEMIA LOTADA")
// ============================================================================

export function findBiomechanicalSubstitute(exerciseName: string): {
  substituteName: string;
  substituteNote: string;
} {
  const lower = exerciseName.toLowerCase();
  if (lower.includes('agachamento livre') || lower.includes('agachamento barra')) {
    return {
      substituteName: 'Agachamento Hack ou Smith Guiado',
      substituteNote: 'Mesmo padrão dominante de joelho/quadríceps com estabilidade extra'
    };
  }
  if (lower.includes('leg press')) {
    return {
      substituteName: 'Agachamento Búlgaro com Halteres',
      substituteNote: 'Alta tensão mecânica unilateral sem depender de máquina'
    };
  }
  if (lower.includes('supino reto')) {
    return {
      substituteName: 'Supino Reto com Halteres ou Máquina Articulada',
      substituteNote: 'Maior amplitude escapular e mesmo vetor horizontal de peitoral'
    };
  }
  if (lower.includes('supino inclinado')) {
    return {
      substituteName: 'Supino Inclinado na Máquina ou Cabo Cruzado Baixo',
      substituteNote: 'Foco em feixe clavicular (peitoral superior) com tensão contínua'
    };
  }
  if (lower.includes('puxada') || lower.includes('pulley')) {
    return {
      substituteName: 'Barra Fixa no Graviton ou Pulldown com Corda',
      substituteNote: 'Mesmo vetor de adução de ombro para expansão de dorsal'
    };
  }
  if (lower.includes('remada')) {
    return {
      substituteName: 'Remada Unilateral com Halter (Serrote) no Banco',
      substituteNote: 'Livre de fila, estabilização de core e retração escapular máxima'
    };
  }
  if (lower.includes('elevação lateral')) {
    return {
      substituteName: 'Elevação Lateral na Polia Baixa ou Sentado com Halteres',
      substituteNote: 'Isolamento puro de deltoide lateral sem roubo de trapézio'
    };
  }
  if (lower.includes('stiff') || lower.includes('terra')) {
    return {
      substituteName: 'Mesa Flexora ou Bom Dia (Good Morning) com Barra',
      substituteNote: 'Dominância de quadril e estímulo de posteriores/glúteo'
    };
  }
  if (lower.includes('cadeira extensora') || lower.includes('extensora')) {
    return {
      substituteName: 'Afundo Estático com Halteres (Tronco Vertical)',
      substituteNote: 'Ênfase em reto femoral e vastos usando apenas halteres'
    };
  }
  return {
    substituteName: `${exerciseName} (Versão com Halteres / Livre)`,
    substituteNote: 'Manter a mesma cadência (2s descida) e margem de 1 repetição na reserva'
  };
}

/**
 * Parser de Prescrição Relâmpago:
 * Transforma linhas como "Agachamento Livre 4x8-10 @RPE9 120s" em objetos estruturados
 */
export function parseSmartPrescriptionText(rawText: string): WorkoutExerciseItem[] {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  return lines.map((line, idx) => {
    // Extrai padrão 4x8-10 ou 3x12
    const setsRepsMatch = line.match(/(\d+)\s*[xX]\s*([\d\-–a-zA-Z]+)/);
    const sets = setsRepsMatch ? parseInt(setsRepsMatch[1], 10) : 4;
    const reps = setsRepsMatch ? setsRepsMatch[2] : '8-12';

    // Extrai @RPE8 ou RPE 9
    const rpeMatch = line.match(/@?\s*RPE\s*(\d+(?:\.\d+)?)/i);
    const rpe = rpeMatch ? `RPE ${rpeMatch[1]}` : 'RPE 8';

    // Extrai descanso 90s, 120s, 60s
    const restMatch = line.match(/(\d+\s*(?:s|seg|min))/i);
    const rest = restMatch ? restMatch[1].replace(/\s+/g, '') : '90s';
    const numericRest = parseInt(rest, 10) || 90;
    const restSeconds = rest.toLowerCase().includes('min') ? numericRest * 60 : numericRest;

    // Limpa o nome do exercício removendo os tokens extraídos
    let cleanName = line
      .replace(/(\d+)\s*[xX]\s*([\d\-–a-zA-Z]+)/, '')
      .replace(/@?\s*RPE\s*(\d+(?:\.\d+)?)/i, '')
      .replace(/(\d+\s*(?:s|seg|min))/i, '')
      .replace(/[-•|]+/g, ' ')
      .trim();

    if (!cleanName) cleanName = `Exercício ${idx + 1}`;

    const sub = findBiomechanicalSubstitute(cleanName);

    // Carga base de referência para histórico de progressão
    const defaultLoads = [40, 120, 50, 35, 14, 28];
    const baseLoad = defaultLoads[idx % defaultLoads.length];

    return {
      id: `ex-${idx}`,
      name: cleanName,
      sets,
      reps,
      rpe,
      rest,
      restSeconds,
      lastLoadKg: baseLoad,
      currentLoadKg: baseLoad,
      substituteName: sub.substituteName,
      substituteNote: sub.substituteNote
    };
  });
}

// ============================================================================
// DADOS DE DEMONSTRAÇÃO INICIAIS (COM DIVISÕES A/B/C E RESTRIÇÕES ARTICULARES)
// ============================================================================

export const INITIAL_DEMO_LEADS: PerformanceLead[] = [
  {
    id: 'lead-drz-1',
    name: 'Mariana Costa',
    phone: '11998765432',
    goal: 'Emagrecimento & Definição',
    readinessScore: 54,
    pillarConsistency: 60,
    pillarTraining: 45,
    pillarNutrition: 50,
    pillarRecovery: 62,
    mainBottleneck: 'Treino sem progressão de carga e excesso de cardio',
    temperature: 'quente',
    status: 'novo',
    createdAt: '2026-10-24'
  },
  {
    id: 'lead-drz-2',
    name: 'Rafael Almeida',
    phone: '11991234567',
    goal: 'Hipertrofia & Estética',
    readinessScore: 68,
    pillarConsistency: 80,
    pillarTraining: 70,
    pillarNutrition: 55,
    pillarRecovery: 67,
    mainBottleneck: 'Ajuste de dieta e divisão de volume semanal',
    temperature: 'quente',
    status: 'negociacao',
    createdAt: '2026-10-23'
  },
  {
    id: 'lead-drz-3',
    name: 'Camila Mendes',
    phone: '21997654321',
    goal: 'Recomposição Corporal',
    readinessScore: 41,
    pillarConsistency: 35,
    pillarTraining: 40,
    pillarNutrition: 45,
    pillarRecovery: 44,
    mainBottleneck: 'Falta de constância semanal e treinos longos sem intensidade',
    temperature: 'morno',
    status: 'novo',
    createdAt: '2026-10-22'
  }
];

export const DEFAULT_SPLIT_A_RAW = `Agachamento Livre 4x8-10 @RPE9 120s
Leg Press 45 4x10-12 @RPE8 90s
Stiff com Barra 4x8-10 @RPE8 90s
Cadeira Extensora 3x12-15 @RPE9 60s`;

export const DEFAULT_SPLIT_B_RAW = `Supino Inclinado Halteres 4x8-10 @RPE9 90s
Supino Reto Barra 4x8-10 @RPE8 90s
Elevação Lateral Halteres 4x12-15 @RPE9 60s
Tríceps Corda Polia 3x12-15 @RPE9 60s`;

export const DEFAULT_SPLIT_C_RAW = `Puxada Frontal Aberta 4x8-12 @RPE9 90s
Remada Curvada Barra 4x8-10 @RPE9 90s
Remada Unilateral Halter 3x10-12 @RPE8 75s
Rosca Direta Halteres 3x10-12 @RPE9 60s`;

const DEFAULT_RAW_PRESCRIPTION = DEFAULT_SPLIT_A_RAW;

export function buildDefaultWorkoutSplits(): Record<WorkoutSplitKey, WorkoutSplitPlan> {
  return {
    A: {
      label: 'Treino A • Inferiores Completo (Quadríceps & Glúteo)',
      rawText: DEFAULT_SPLIT_A_RAW,
      exercises: parseSmartPrescriptionText(DEFAULT_SPLIT_A_RAW)
    },
    B: {
      label: 'Treino B • Superiores Empurrar (Peito, Ombro & Tríceps)',
      rawText: DEFAULT_SPLIT_B_RAW,
      exercises: parseSmartPrescriptionText(DEFAULT_SPLIT_B_RAW)
    },
    C: {
      label: 'Treino C • Dorsais Puxar (Costas, Trapézio & Bíceps)',
      rawText: DEFAULT_SPLIT_C_RAW,
      exercises: parseSmartPrescriptionText(DEFAULT_SPLIT_C_RAW)
    }
  };
}

export const INITIAL_DEMO_STUDENTS: PerformanceStudent[] = [
  {
    id: 'stu-1',
    name: 'Beatriz Oliveira',
    phone: '11988776655',
    accessPin: '6655',
    injuryAlert: 'Condromalácia patelar leve (Joelho Dir.) — Evitar Cadeira Extensora com carga máxima',
    goal: 'Emagrecimento & Definição',
    planPeriod: 'Trimestral',
    planValue: 750,
    monthlyEquivalent: 250,
    startDate: '2026-08-05',
    renewalDate: '2026-11-02',
    currentProtocol: 'Fase 2: Definição Metabólica (5x/sem • 45min)',
    startWeight: 74.5,
    currentWeight: 67.2,
    targetWeight: 64.0,
    adherenceScore: 94,
    churnRisk: 'baixo',
    rank: 'elite',
    lastCheckInDate: '2026-10-23',
    rawPrescriptionText: DEFAULT_SPLIT_A_RAW,
    workoutSheet: parseSmartPrescriptionText(DEFAULT_SPLIT_A_RAW),
    workoutSplits: buildDefaultWorkoutSplits()
  },
  {
    id: 'stu-2',
    name: 'Lucas Ferreira',
    phone: '11977665544',
    accessPin: '5544',
    injuryAlert: 'Desconforto leve no manguito rotador esquerdo — Preferir halteres no lugar da barra reta no supino',
    goal: 'Hipertrofia & Estética',
    planPeriod: 'Semestral',
    planValue: 1380,
    monthlyEquivalent: 230,
    startDate: '2026-07-10',
    renewalDate: '2027-01-10',
    currentProtocol: 'Ganho de Massa Limpo • Ênfase Dorsal & Ombros',
    startWeight: 76.0,
    currentWeight: 82.4,
    targetWeight: 85.0,
    adherenceScore: 88,
    churnRisk: 'baixo',
    rank: 'alta_intensidade',
    lastCheckInDate: '2026-10-22',
    rawPrescriptionText: DEFAULT_SPLIT_B_RAW,
    workoutSheet: parseSmartPrescriptionText(DEFAULT_SPLIT_B_RAW),
    workoutSplits: buildDefaultWorkoutSplits()
  },
  {
    id: 'stu-3',
    name: 'Fernanda Rocha',
    phone: '11966554433',
    accessPin: '4433',
    injuryAlert: 'Encurtamento de posteriores e sensibilidade lombar — Atenção redobrada no Stiff',
    goal: 'Recomposição Corporal',
    planPeriod: 'Trimestral',
    planValue: 750,
    monthlyEquivalent: 250,
    startDate: '2026-08-01',
    renewalDate: '2026-10-30',
    currentProtocol: 'Adaptação de Rotina (4x/sem • 40min)',
    startWeight: 68.0,
    currentWeight: 66.8,
    targetWeight: 62.0,
    adherenceScore: 42,
    churnRisk: 'alto',
    rank: 'iniciante',
    lastCheckInDate: '2026-10-14',
    rawPrescriptionText: DEFAULT_SPLIT_A_RAW,
    workoutSheet: parseSmartPrescriptionText(DEFAULT_SPLIT_A_RAW),
    workoutSplits: buildDefaultWorkoutSplits()
  },
  {
    id: 'stu-4',
    name: 'Gabriel Santos',
    phone: '11955443322',
    accessPin: '3322',
    injuryAlert: 'Sem restrições articulares relatadas na anamnese',
    goal: 'Alta Performance & Força',
    planPeriod: 'Anual',
    planValue: 2400,
    monthlyEquivalent: 200,
    startDate: '2026-05-15',
    renewalDate: '2027-05-15',
    currentProtocol: 'Periodização de Força & Condicionamento (5x/sem)',
    startWeight: 84.0,
    currentWeight: 81.5,
    targetWeight: 80.0,
    adherenceScore: 76,
    churnRisk: 'medio',
    rank: 'constante',
    lastCheckInDate: '2026-10-21',
    rawPrescriptionText: DEFAULT_SPLIT_A_RAW,
    workoutSheet: parseSmartPrescriptionText(DEFAULT_SPLIT_A_RAW),
    workoutSplits: buildDefaultWorkoutSplits()
  }
];

export const INITIAL_DEMO_CHECKINS: WeeklyCheckIn[] = [
  {
    id: 'chk-1',
    studentId: 'stu-1',
    studentName: 'Beatriz Oliveira',
    date: '2026-10-23',
    weight: 67.2,
    workoutsCompleted: 5,
    workoutsPlanned: 5,
    dietScore: 9,
    sleepScore: 9,
    energyScore: 10,
    calculatedScore: 95,
    studentNotes: 'Semana excelente! Consegui subir carga no agachamento e mantive 100% da dieta.',
    coachFeedback: 'Excelente evolução, Bia! Vamos manter o volume e ajustar +100kcal limpas.'
  },
  {
    id: 'chk-2',
    studentId: 'stu-3',
    studentName: 'Fernanda Rocha',
    date: '2026-10-20',
    weight: 66.8,
    workoutsCompleted: 2,
    workoutsPlanned: 4,
    dietScore: 5,
    sleepScore: 6,
    energyScore: 5,
    calculatedScore: 45,
    studentNotes: 'Semana corrida no trabalho, acabei faltando dois dias e furei a dieta no fim de semana.',
    coachFeedback: 'Fer, ajustei seu treino para 3x de 35min essa semana para caber na sua rotina sem falhar!'
  }
];

// ============================================================================
// CONFIGURAÇÃO DE NÍVEIS (100% EM TONS DE LARANJA / ÂMBAR / DOURADO)
// ============================================================================

export const RANK_CONFIG: Record<
  StudentRank,
  {
    label: string;
    code: string;
    subtitle: string;
    badgeClass: string;
    glowClass: string;
  }
> = {
  iniciante: {
    label: 'Iniciante',
    code: 'NÍVEL 1',
    subtitle: 'Fase de adaptação de rotina e técnica de execução',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    glowClass: 'from-slate-500 to-slate-700'
  },
  constante: {
    label: 'Constante',
    code: 'NÍVEL 2',
    subtitle: 'Cumpre 100% dos treinos planejados na semana',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    glowClass: 'from-amber-400 to-orange-500'
  },
  alta_intensidade: {
    label: 'Alta Intensidade',
    code: 'NÍVEL 3',
    subtitle: 'Domina progressão de carga e adesão à dieta',
    badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
    glowClass: 'from-orange-500 to-amber-500'
  },
  elite: {
    label: 'Atleta Elite',
    code: 'NÍVEL MÁXIMO',
    subtitle: 'Transformação corporal de referência e disciplina máxima',
    badgeClass: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-400/50',
    glowClass: 'from-orange-400 via-amber-400 to-yellow-500'
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL DO PAINEL DO TREINADOR
// ============================================================================

export default function PerformanceProModule() {
  const { currentTenant } = useTenant();

  // Persistência Multi-Tenant sincronizada com Supabase
  const [leads, setLeads] = useTenantStorage<PerformanceLead[]>(
    'performance-pro',
    'leads',
    INITIAL_DEMO_LEADS
  );
  const [students, setStudents] = useTenantStorage<PerformanceStudent[]>(
    'performance-pro',
    'students',
    INITIAL_DEMO_STUDENTS
  );
  const [checkIns, setCheckIns] = useTenantStorage<WeeklyCheckIn[]>(
    'performance-pro',
    'checkins',
    INITIAL_DEMO_CHECKINS
  );

  // Navegação de Abas (Agora incluindo Prescrição Rápida e Lousa Biomecânica!)
  const [activeTab, setActiveTab] = useState<
    'leads' | 'students' | 'prescricao' | 'biomecanica' | 'checkins' | 'gamification'
  >('leads');

  // Filtros
  const [searchStudent, setSearchStudent] = useState('');
  const [renewalFilter, setRenewalFilter] = useState<'all' | 'expiring' | 'churn_risk'>('all');
  const [copiedBioLink, setCopiedBioLink] = useState(false);
  const [copiedStudentPortal, setCopiedStudentPortal] = useState(false);

  // Modais
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
  const [isNewCheckInOpen, setIsNewCheckInOpen] = useState(false);
  const [storyCardStudent, setStoryCardStudent] = useState<PerformanceStudent | null>(null);
  const [editingStudent, setEditingStudent] = useState<PerformanceStudent | null>(null);

  // Estado do Novo Contato Manual (Aba 1)
  const [quizName, setQuizName] = useState('');
  const [quizPhone, setQuizPhone] = useState('');
  const [quizGoal, setQuizGoal] = useState('Emagrecimento & Definição');
  const [qConsistency, setQConsistency] = useState(60);
  const [qTraining, setQTraining] = useState(50);
  const [qNutrition, setQNutrition] = useState(50);
  const [qRecovery, setQRecovery] = useState(60);

  // Estado de Novo Aluno (Aba 2)
  const [stuName, setStuName] = useState('');
  const [stuPhone, setStuPhone] = useState('');
  const [stuGoal, setStuGoal] = useState('Emagrecimento & Definição');
  const [stuPlanPeriod, setStuPlanPeriod] = useState<PlanPeriod>('Trimestral');
  const [stuPlanValue, setStuPlanValue] = useState('750');
  const [stuRenewalDate, setStuRenewalDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  });
  const [stuProtocol, setStuProtocol] = useState('Fase 1: Adaptação & Estímulo Metabólico (4x/sem)');
  const [stuStartWeight, setStuStartWeight] = useState('75');
  const [stuCurrentWeight, setStuCurrentWeight] = useState('75');
  const [stuTargetWeight, setStuTargetWeight] = useState('68');

  // Estado de Novo Check-in (Aba Check-ins)
  const [chkStudentId, setChkStudentId] = useState('');
  const [chkWeight, setChkWeight] = useState('');
  const [chkWorkoutsDone, setChkWorkoutsDone] = useState('5');
  const [chkWorkoutsPlanned, setChkWorkoutsPlanned] = useState('5');
  const [chkDiet, setChkDiet] = useState('8');
  const [chkSleep, setChkSleep] = useState('8');
  const [chkEnergy, setChkEnergy] = useState('8');
  const [chkStudentNotes, setChkStudentNotes] = useState('');
  const [chkCoachFeedback, setChkCoachFeedback] = useState('');

  // ==========================================================================
  // ESTADOS DA ABA "PRESCRIÇÃO RÁPIDA (DIVISÕES A/B/C) & ACADEMIA LOTADA"
  // ==========================================================================
  const [selectedPrescStudentId, setSelectedPrescStudentId] = useState<string>('stu-1');
  const [selectedSplit, setSelectedSplit] = useState<WorkoutSplitKey>('A');
  const [prescriptionText, setPrescriptionText] = useState<string>(DEFAULT_SPLIT_A_RAW);
  const [savedPrescriptionToast, setSavedPrescriptionToast] = useState(false);
  const [copiedExclusiveStudentId, setCopiedExclusiveStudentId] = useState<string | null>(null);

  const selectedPrescStudent = useMemo(
    () => students.find(s => s.id === selectedPrescStudentId) || students[0],
    [students, selectedPrescStudentId]
  );

  const parsedExercises = useMemo(
    () => parseSmartPrescriptionText(prescriptionText),
    [prescriptionText]
  );

  const handleSelectPrescStudent = (stuId: string, splitKey: WorkoutSplitKey = selectedSplit) => {
    setSelectedPrescStudentId(stuId);
    const found = students.find(s => s.id === stuId);
    const splits = found?.workoutSplits || buildDefaultWorkoutSplits();
    const targetSplit = splits[splitKey];
    if (targetSplit?.rawText) {
      setPrescriptionText(targetSplit.rawText);
    } else if (found?.rawPrescriptionText && splitKey === 'A') {
      setPrescriptionText(found.rawPrescriptionText);
    } else {
      setPrescriptionText(
        splitKey === 'A'
          ? DEFAULT_SPLIT_A_RAW
          : splitKey === 'B'
          ? DEFAULT_SPLIT_B_RAW
          : DEFAULT_SPLIT_C_RAW
      );
    }
  };

  const handleSelectSplitTab = (splitKey: WorkoutSplitKey) => {
    setSelectedSplit(splitKey);
    if (selectedPrescStudent) {
      handleSelectPrescStudent(selectedPrescStudent.id, splitKey);
    }
  };

  const handleUpdateStudentInjuryAlert = (studentId: string, newAlert: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, injuryAlert: newAlert } : s))
    );
  };

  const handleCopyExclusiveStudentLink = (stuId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aptis.com.br';
    navigator.clipboard.writeText(`${origin}/performance/aluno?id=${stuId}`);
    setCopiedExclusiveStudentId(stuId);
    setTimeout(() => setCopiedExclusiveStudentId(null), 2500);
  };

  const handleSavePrescriptionToStudent = () => {
    if (!selectedPrescStudent) return;
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== selectedPrescStudent.id) return s;
        const currentSplits = s.workoutSplits || buildDefaultWorkoutSplits();
        const existingExercises = currentSplits[selectedSplit]?.exercises || [];

        // Preserva as cargas anotadas pelo aluno nos exercícios de mesmo nome
        const mergedExercises = parsedExercises.map((ex, idx) => {
          const match = existingExercises.find(
            old => old.name.toLowerCase() === ex.name.toLowerCase()
          );
          return {
            ...ex,
            id: `ex-${selectedSplit}-${idx}`,
            lastLoadKg: match?.lastLoadKg ?? ex.lastLoadKg,
            currentLoadKg: match?.currentLoadKg ?? ex.currentLoadKg
          };
        });

        const updatedSplits: Record<WorkoutSplitKey, WorkoutSplitPlan> = {
          ...currentSplits,
          [selectedSplit]: {
            label:
              currentSplits[selectedSplit]?.label ||
              `Treino ${selectedSplit}`,
            rawText: prescriptionText,
            exercises: mergedExercises
          }
        };

        return {
          ...s,
          rawPrescriptionText: prescriptionText,
          workoutSheet: mergedExercises,
          workoutSplits: updatedSplits
        };
      })
    );
    setSavedPrescriptionToast(true);
    setTimeout(() => setSavedPrescriptionToast(false), 2500);
  };

  // ==========================================================================
  // ESTADOS DA ABA "LOUSA BIOMECÂNICA (ANÁLISE DE EXECUÇÃO)"
  // ==========================================================================
  const [bioStudentId, setBioStudentId] = useState<string>('stu-1');
  const [bioExercise, setBioExercise] = useState<string>('Agachamento Livre (Vista Lateral)');
  const [bioFailedRep, setBioFailedRep] = useState<string>('Repetição 7 de 10');
  const [bioDeviation, setBioDeviation] = useState<string>('Retroversão Pélvica (Butt Wink) no fundo');
  const [bioCue, setBioCue] = useState<string>(
    'Travar o brace abdominal antes de iniciar a descida e limitar a amplitude 5cm antes de perder o neutro lombar.'
  );
  // 3 pontos articulares no Canvas (A: Tronco/Ombro, B: Vértice Quadril/Joelho, C: Tornozelo/Fêmur)
  const [jointPoints, setJointPoints] = useState<{
    A: { x: number; y: number };
    B: { x: number; y: number };
    C: { x: number; y: number };
  }>({
    A: { x: 240, y: 85 },
    B: { x: 165, y: 205 },
    C: { x: 265, y: 275 }
  });
  const [draggingJoint, setDraggingJoint] = useState<'A' | 'B' | 'C' | null>(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calcula o ângulo biomecânico exato em graus no ponto B (entre BA e BC)
  const calculatedJointAngle = useMemo(() => {
    const { A, B, C } = jointPoints;
    const v1 = { x: A.x - B.x, y: A.y - B.y };
    const v2 = { x: C.x - B.x, y: C.y - B.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y) || 1;
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y) || 1;
    const cos = Math.min(1, Math.max(-1, dot / (mag1 * mag2)));
    return Math.round((Math.acos(cos) * 180) / Math.PI);
  }, [jointPoints]);

  // Desenha a Lousa Biomecânica Interativa no Canvas
  useEffect(() => {
    if (activeTab !== 'biomecanica') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid Técnico de Fundo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Linha Vertical de Prumo (Bar Path Ideal)
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(jointPoints.A.x, 20);
    ctx.lineTo(jointPoints.A.x, h - 20);
    ctx.stroke();
    ctx.restore();

    // Vetores Articulares (BA e BC) em Laranja Neon
    const { A, B, C } = jointPoints;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.stroke();

    // Arco do Ângulo no Vértice B
    const angle1 = Math.atan2(A.y - B.y, A.x - B.x);
    const angle2 = Math.atan2(C.y - B.y, C.x - B.x);
    ctx.fillStyle = 'rgba(249, 115, 22, 0.22)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(B.x, B.y);
    ctx.arc(B.x, B.y, 34, angle1, angle2, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Placar do Ângulo no Vértice B
    ctx.fillStyle = '#020617';
    ctx.fillRect(B.x - 70, B.y - 18, 56, 26);
    ctx.strokeStyle = '#f97316';
    ctx.strokeRect(B.x - 70, B.y - 18, 56, 26);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`${calculatedJointAngle}°`, B.x - 56, B.y);

    // Desenha os 3 Pontos Articulares Arrastáveis
    const drawNode = (pt: { x: number; y: number }, label: string) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(label, pt.x + 14, pt.y + 4);
    };

    drawNode(A, 'A • Ombro / Tronco');
    drawNode(B, 'B • Eixo Articular');
    drawNode(C, 'C • Joelho / Base');
  }, [activeTab, jointPoints, calculatedJointAngle]);

  const handleCanvasPointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const dist = (p: { x: number; y: number }) => Math.hypot(p.x - x, p.y - y);
    if (dist(jointPoints.A) < 28) setDraggingJoint('A');
    else if (dist(jointPoints.B) < 28) setDraggingJoint('B');
    else if (dist(jointPoints.C) < 28) setDraggingJoint('C');
  };

  const handleCanvasPointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingJoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.max(20, Math.min(canvas.width - 20, (e.clientX - rect.left) * scaleX));
    const y = Math.max(20, Math.min(canvas.height - 20, (e.clientY - rect.top) * scaleY));

    setJointPoints(prev => ({
      ...prev,
      [draggingJoint]: { x, y }
    }));
  };

  const handleCanvasPointerUp = () => {
    setDraggingJoint(null);
  };

  // ==========================================================================
  // MÉTRICAS DIRETAS DO TREINADOR
  // ==========================================================================

  const getDaysUntilRenewal = (renewalDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(renewalDateStr + 'T00:00:00');
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const metrics = useMemo(() => {
    const totalMRR = students.reduce((acc, s) => acc + (s.monthlyEquivalent || 0), 0);
    const expiringCount = students.filter(s => getDaysUntilRenewal(s.renewalDate) <= 15).length;
    const highChurnCount = students.filter(s => s.churnRisk === 'alto').length;
    const pendingLeadsCount = leads.filter(l => l.status !== 'convertido').length;

    return {
      totalMRR,
      expiringCount,
      highChurnCount,
      pendingLeadsCount
    };
  }, [students, leads]);

  // ==========================================================================
  // AÇÕES DO TREINADOR
  // ==========================================================================

  const handleCopyBioLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aptis.com.br';
    navigator.clipboard.writeText(`${origin}/performance#diagnostico`);
    setCopiedBioLink(true);
    setTimeout(() => setCopiedBioLink(false), 2500);
  };

  const handleCopyStudentPortalLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aptis.com.br';
    navigator.clipboard.writeText(`${origin}/performance/aluno`);
    setCopiedStudentPortal(true);
    setTimeout(() => setCopiedStudentPortal(false), 2500);
  };

  const handleCreateLeadFromQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizName.trim() || !quizPhone.trim()) return;

    const score = Math.round((qConsistency + qTraining + qNutrition + qRecovery) / 4);
    const minPillar = Math.min(qConsistency, qTraining, qNutrition, qRecovery);
    let bottleneck = 'Ajuste de carga e divisão de treino';
    if (minPillar === qConsistency) {
      bottleneck = 'Falta de constância semanal nos treinos';
    } else if (minPillar === qTraining) {
      bottleneck = 'Treino sem progressão de carga real';
    } else if (minPillar === qNutrition) {
      bottleneck = 'Dificuldade em manter a dieta na rotina';
    } else if (minPillar === qRecovery) {
      bottleneck = 'Sono e recuperação muscular baixos';
    }

    const newLead: PerformanceLead = {
      id: `lead-${Date.now()}`,
      name: quizName.trim(),
      phone: quizPhone.replace(/\D/g, ''),
      goal: quizGoal,
      readinessScore: score,
      pillarConsistency: qConsistency,
      pillarTraining: qTraining,
      pillarNutrition: qNutrition,
      pillarRecovery: qRecovery,
      mainBottleneck: bottleneck,
      temperature: score <= 65 ? 'quente' : 'morno',
      status: 'novo',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLeads(prev => [newLead, ...prev]);
    setIsQuizModalOpen(false);
    setQuizName('');
    setQuizPhone('');
  };

  const handleConvertLeadToStudent = (lead: PerformanceLead) => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    const renewalStr = d.toISOString().split('T')[0];

    const newStudent: PerformanceStudent = {
      id: `stu-${Date.now()}`,
      name: lead.name,
      phone: lead.phone,
      goal: lead.goal,
      planPeriod: 'Trimestral',
      planValue: 750,
      monthlyEquivalent: 250,
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: renewalStr,
      currentProtocol: `Fase 1: Correção de ${lead.mainBottleneck}`,
      startWeight: 72,
      currentWeight: 72,
      targetWeight: 65,
      adherenceScore: 85,
      churnRisk: 'baixo',
      rank: 'iniciante',
      lastCheckInDate: new Date().toISOString().split('T')[0],
      rawPrescriptionText: DEFAULT_RAW_PRESCRIPTION,
      workoutSheet: parseSmartPrescriptionText(DEFAULT_RAW_PRESCRIPTION)
    };

    setStudents(prev => [newStudent, ...prev]);
    setLeads(prev => prev.map(l => (l.id === lead.id ? { ...l, status: 'convertido' } : l)));
    setActiveTab('students');
  };

  const handleDeleteLead = (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente remover o contato "${name}"?`)) return;
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName.trim()) return;

    const totalVal = parseFloat(stuPlanValue) || 250;
    const monthsMap: Record<PlanPeriod, number> = {
      Mensal: 1,
      Trimestral: 3,
      Semestral: 6,
      Anual: 12
    };
    const monthlyEq = Math.round(totalVal / monthsMap[stuPlanPeriod]);

    if (editingStudent) {
      setStudents(prev =>
        prev.map(s =>
          s.id === editingStudent.id
            ? {
                ...s,
                name: stuName.trim(),
                phone: stuPhone.replace(/\D/g, ''),
                goal: stuGoal,
                planPeriod: stuPlanPeriod,
                planValue: totalVal,
                monthlyEquivalent: monthlyEq,
                renewalDate: stuRenewalDate,
                currentProtocol: stuProtocol,
                startWeight: parseFloat(stuStartWeight) || s.startWeight,
                currentWeight: parseFloat(stuCurrentWeight) || s.currentWeight,
                targetWeight: parseFloat(stuTargetWeight) || s.targetWeight
              }
            : s
        )
      );
    } else {
      const newStudent: PerformanceStudent = {
        id: `stu-${Date.now()}`,
        name: stuName.trim(),
        phone: stuPhone.replace(/\D/g, ''),
        goal: stuGoal,
        planPeriod: stuPlanPeriod,
        planValue: totalVal,
        monthlyEquivalent: monthlyEq,
        startDate: new Date().toISOString().split('T')[0],
        renewalDate: stuRenewalDate,
        currentProtocol: stuProtocol,
        startWeight: parseFloat(stuStartWeight) || 70,
        currentWeight: parseFloat(stuCurrentWeight) || 70,
        targetWeight: parseFloat(stuTargetWeight) || 65,
        adherenceScore: 90,
        churnRisk: 'baixo',
        rank: 'iniciante',
        lastCheckInDate: new Date().toISOString().split('T')[0],
        rawPrescriptionText: DEFAULT_RAW_PRESCRIPTION,
        workoutSheet: parseSmartPrescriptionText(DEFAULT_RAW_PRESCRIPTION)
      };
      setStudents(prev => [newStudent, ...prev]);
    }

    setIsNewStudentOpen(false);
    setEditingStudent(null);
    setStuName('');
    setStuPhone('');
  };

  const openEditStudentModal = (student: PerformanceStudent) => {
    setEditingStudent(student);
    setStuName(student.name);
    setStuPhone(student.phone);
    setStuGoal(student.goal);
    setStuPlanPeriod(student.planPeriod);
    setStuPlanValue(String(student.planValue));
    setStuRenewalDate(student.renewalDate);
    setStuProtocol(student.currentProtocol);
    setStuStartWeight(String(student.startWeight));
    setStuCurrentWeight(String(student.currentWeight));
    setStuTargetWeight(String(student.targetWeight));
    setIsNewStudentOpen(true);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente remover o aluno "${name}"?`)) return;
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleCreateCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStu = students.find(s => s.id === chkStudentId) || students[0];
    if (!targetStu) return;

    const done = parseInt(chkWorkoutsDone) || 0;
    const planned = Math.max(parseInt(chkWorkoutsPlanned) || 1, 1);
    const workoutPct = Math.min(100, Math.round((done / planned) * 100));
    const dietPct = (parseInt(chkDiet) || 0) * 10;
    const sleepPct = (parseInt(chkSleep) || 0) * 10;
    const energyPct = (parseInt(chkEnergy) || 0) * 10;

    const calcScore = Math.round(workoutPct * 0.4 + dietPct * 0.3 + sleepPct * 0.15 + energyPct * 0.15);
    const newWeight = parseFloat(chkWeight) || targetStu.currentWeight;

    const newCheckIn: WeeklyCheckIn = {
      id: `chk-${Date.now()}`,
      studentId: targetStu.id,
      studentName: targetStu.name,
      date: new Date().toISOString().split('T')[0],
      weight: newWeight,
      workoutsCompleted: done,
      workoutsPlanned: planned,
      dietScore: parseInt(chkDiet) || 8,
      sleepScore: parseInt(chkSleep) || 8,
      energyScore: parseInt(chkEnergy) || 8,
      calculatedScore: calcScore,
      studentNotes: chkStudentNotes || 'Check-in enviado pelo aluno.',
      coachFeedback: chkCoachFeedback || 'Treino revisado e ajustado para a semana.'
    };

    setCheckIns(prev => [newCheckIn, ...prev]);

    const risk: PerformanceStudent['churnRisk'] =
      calcScore >= 75 ? 'baixo' : calcScore >= 50 ? 'medio' : 'alto';

    setStudents(prev =>
      prev.map(s =>
        s.id === targetStu.id
          ? {
              ...s,
              currentWeight: newWeight,
              adherenceScore: calcScore,
              churnRisk: risk,
              lastCheckInDate: newCheckIn.date
            }
          : s
      )
    );

    setIsNewCheckInOpen(false);
    setChkStudentNotes('');
    setChkCoachFeedback('');
  };

  const handleDeleteCheckIn = (id: string) => {
    if (!window.confirm('Deseja realmente excluir este check-in?')) return;
    setCheckIns(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateStudentRank = (studentId: string, newRank: StudentRank) => {
    setStudents(prev => prev.map(s => (s.id === studentId ? { ...s, rank: newRank } : s)));
  };

  // ==========================================================================
  // MENSAGENS AUTOMÁTICAS DE WHATSAPP
  // ==========================================================================

  const buildLeadWhatsAppUrl = (lead: PerformanceLead) => {
    const text = `Fala ${lead.name.split(' ')[0]}, tudo bem? Vi aqui que você acabou de fazer o nosso Diagnóstico de Prontidão Física!\n\n📊 *Seu Score deu ${lead.readinessScore}%* com foco em *${lead.goal}*.\n⚠️ Principal ponto para ajustarmos: *${lead.mainBottleneck}*.\n\nSeparei um plano prático para destravar seu resultado. Como estão seus horários hoje para te explicar como funciona a Consultoria?`;
    return `https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  const buildRenewalWhatsAppUrl = (stu: PerformanceStudent) => {
    const diffWeight = (stu.currentWeight - stu.startWeight).toFixed(1);
    const sign = Number(diffWeight) > 0 ? `+${diffWeight}kg` : `${diffWeight}kg`;
    const text = `Fala ${stu.name.split(' ')[0]}! Passando para parabenizar pela sua evolução até aqui no nosso Time (${sign} desde o início!).\n\nSeu plano *${stu.planPeriod}* encerra em *${stu.renewalDate.split('-').reverse().join('/')}* e já deixei pronta a próxima fase do seu treino (*${stu.currentProtocol}*).\n\nVamos garantir sua renovação?`;
    return `https://wa.me/55${stu.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  const buildCheckInWhatsAppUrl = (chk: WeeklyCheckIn) => {
    const stu = students.find(s => s.id === chk.studentId);
    const phone = stu?.phone?.replace(/\D/g, '') || '';
    const text = `Fala ${chk.studentName.split(' ')[0]}! Analisei seu Check-in da semana:\n\n🔥 *Nota da Semana:* ${chk.calculatedScore}%\n🏋️ *Treinos:* ${chk.workoutsCompleted}/${chk.workoutsPlanned}\n⚖️ *Peso:* ${chk.weight}kg\n\n🎯 *Orientação para esta semana:*\n"${chk.coachFeedback}"\n\nPra cima!`;
    return `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`;
  };

  const buildPrescriptionWhatsAppUrl = () => {
    if (!selectedPrescStudent) return '#';
    const phone = selectedPrescStudent.phone.replace(/\D/g, '');
    const listText = parsedExercises
      .map(
        (ex, i) =>
          `${i + 1}. *${ex.name}* — ${ex.sets}x${ex.reps} (${ex.rpe} • Descanso: ${ex.rest})\n   🔄 _Aparelho ocupado? Troque por:_ ${ex.substituteName}`
      )
      .join('\n\n');

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pin = selectedPrescStudent.accessPin || selectedPrescStudent.phone.slice(-4);
    const text = `Fala ${selectedPrescStudent.name.split(' ')[0]}! Acabei de atualizar o seu *Treino ${selectedSplit}* no *Aptis Performance Pro*:\n\n${listText}\n\n📲 *Acesse seu App Individual Exclusivo (Treinos A/B/C + Timer + Carga):*\n${origin}/performance/aluno?id=${selectedPrescStudent.id}\n🔑 _Código de acesso rápido:_ ${pin}`;
    return `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`;
  };

  const buildBiomechanicsWhatsAppUrl = () => {
    const stu = students.find(s => s.id === bioStudentId) || students[0];
    const phone = stu?.phone?.replace(/\D/g, '') || '';
    const text = `Fala ${stu ? stu.name.split(' ')[0] : 'Atleta'}! Acabei de passar seu vídeo na nossa *Lousa Biomecânica*:\n\n🏋️ *Exercício:* ${bioExercise}\n📐 *Ângulo Articular Medido:* ${calculatedJointAngle}° (na ${bioFailedRep})\n⚠️ *Desvio Identificado:* ${bioDeviation}\n\n🎯 *Ajuste Técnico Imediato:*\n"${bioCue}"\n\nNa próxima sessão aplica esse ajuste e me manda a 1ª série de trabalho! 🔥`;
    return `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`;
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.goal.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.currentProtocol.toLowerCase().includes(searchStudent.toLowerCase());
    if (!matchesSearch) return false;
    if (renewalFilter === 'expiring') return getDaysUntilRenewal(s.renewalDate) <= 15;
    if (renewalFilter === 'churn_risk') return s.churnRisk === 'alto' || s.churnRisk === 'medio';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ====================================================================
          TOPO LIMPO E DIRETO (100% EM TONS DE LARANJA & SLATE ESCURO)
      ==================================================================== */}
      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-orange-500/30 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-400">
              <Flame className="w-4 h-4" /> Gestão da Consultoria Online
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Central do Treinador
            </h1>
          </div>

          {/* Botões Rápidos: Link da Bio + Link do Aluno */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyBioLink}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              {copiedBioLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Link da Bio Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-orange-400" />
                  <span>Copiar Link do Quiz (Bio)</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyStudentPortalLink}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-orange-500/40 text-orange-300 text-xs font-bold transition-all cursor-pointer"
            >
              {copiedStudentPortal ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Link do Aluno Copiado!</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  <span>Copiar Link do Aluno</span>
                </>
              )}
            </button>

            <Link
              href={`/performance/aluno?id=${selectedPrescStudent?.id || 'stu-1'}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-orange-500/20"
            >
              <span>Ver App do Aluno</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 CARTÕES DE RESUMO SIMPLES E CLAROS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div
            onClick={() => {
              setActiveTab('students');
              setRenewalFilter('all');
            }}
            className="bg-slate-900/90 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Faturamento Mensal</span>
              <DollarSign className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">
              R$ {metrics.totalMRR.toLocaleString('pt-BR')}
            </div>
            <span className="text-xs text-orange-400 font-medium">
              {students.length} alunos ativos
            </span>
          </div>

          <div
            onClick={() => setActiveTab('leads')}
            className="bg-slate-900/90 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Novos Contatos (Bio)</span>
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1.5">
              {metrics.pendingLeadsCount}
            </div>
            <span className="text-xs text-slate-400">Aguardando seu WhatsApp</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('students');
              setRenewalFilter('expiring');
            }}
            className="bg-slate-900/90 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Planos a Vencer</span>
              <Calendar className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-orange-300 mt-1.5">
              {metrics.expiringCount}
            </div>
            <span className="text-xs text-slate-400">Vencem em até 15 dias</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('students');
              setRenewalFilter('churn_risk');
            }}
            className="bg-slate-900/90 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Baixa Frequência</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1.5">
              {metrics.highChurnCount}
            </div>
            <span className="text-xs text-slate-400">Alunos precisando de incentivo</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          BARRA DE ABAS LIMPA E INTUITIVA (LARANJA & ÂMBAR)
      ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-sm">
        <button
          onClick={() => setActiveTab('leads')}
          className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'leads'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Target className="w-4 h-4 shrink-0" />
          <span>Contatos ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Alunos ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescricao')}
          className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'prescricao'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span>Treino Rápido</span>
        </button>

        <button
          onClick={() => setActiveTab('biomecanica')}
          className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'biomecanica'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Crosshair className="w-4 h-4 shrink-0" />
          <span>Biomecânica</span>
        </button>

        <button
          onClick={() => setActiveTab('checkins')}
          className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'checkins'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ClipboardCheck className="w-4 h-4 shrink-0" />
          <span>Check-ins ({checkIns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gamification')}
          className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'gamification'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span>Níveis & Stories</span>
        </button>
      </div>

      {/* ====================================================================
          ABA 1: NOVOS CONTATOS (QUEM RESPONDEU O QUIZ DA BIO)
      ==================================================================== */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Interessados que preencheram o Quiz da Bio
              </h2>
              <p className="text-xs text-slate-500">
                Clique em <strong>Chamar no WhatsApp</strong> para enviar a análise pronta ou converta em aluno ativo.
              </p>
            </div>

            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar Contato Manual
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leads.map(lead => (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          lead.status === 'convertido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {lead.status === 'convertido' ? '✓ Já é Aluno' : '🔥 Novo Interessado'}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1.5">{lead.name}</h3>
                      <p className="text-xs font-semibold text-orange-600">{lead.goal}</p>
                    </div>

                    <div className="px-3 py-2 rounded-xl bg-slate-950 text-orange-400 text-center shrink-0 border border-orange-500/30">
                      <span className="text-base font-black block leading-none">{lead.readinessScore}%</span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Score</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 text-xs text-slate-800">
                    <span className="text-[10px] font-bold uppercase text-orange-700 block mb-0.5">
                      Principal dificuldade relatada:
                    </span>
                    {lead.mainBottleneck}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <a
                    href={buildLeadWhatsAppUrl(lead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Chamar no WhatsApp
                  </a>

                  <div className="flex items-center gap-2">
                    {lead.status !== 'convertido' && (
                      <button
                        onClick={() => handleConvertLeadToStudent(lead)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-orange-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        + Virar Aluno Ativo
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteLead(lead.id, lead.name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-auto"
                      title="Excluir Contato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          ABA 2: MEUS ALUNOS (CARTEIRA ATIVA & RENOVAÇÕES)
      ==================================================================== */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={searchStudent}
                  onChange={e => setSearchStudent(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                onClick={() => setRenewalFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  renewalFilter === 'all'
                    ? 'bg-slate-900 text-orange-400'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({students.length})
              </button>
              <button
                onClick={() => setRenewalFilter('expiring')}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  renewalFilter === 'expiring'
                    ? 'bg-orange-500 text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Vencendo em ≤ 15 dias ({metrics.expiringCount})
              </button>
              <button
                onClick={() => setRenewalFilter('churn_risk')}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  renewalFilter === 'churn_risk'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Baixa Frequência ({metrics.highChurnCount})
              </button>
            </div>

            <button
              onClick={() => {
                setEditingStudent(null);
                setStuName('');
                setStuPhone('');
                setIsNewStudentOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Novo Aluno
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map(stu => {
              const daysLeft = getDaysUntilRenewal(stu.renewalDate);
              const isExpiring = daysLeft <= 15;
              const weightDiff = (stu.currentWeight - stu.startWeight).toFixed(1);
              const rankInfo = RANK_CONFIG[stu.rank];

              return (
                <div
                  key={stu.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between gap-4 ${
                    isExpiring ? 'border-orange-400 ring-1 ring-orange-400/30' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                            {rankInfo.label}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {stu.planPeriod} • R$ {stu.planValue}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mt-1.5">{stu.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{stu.currentProtocol}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditStudentModal(stu)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Editar Aluno"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(stu.id, stu.name)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Remover Aluno"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {stu.injuryAlert && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Anamnese / Restrição:</strong> {stu.injuryAlert}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Peso</span>
                        <span className="text-xs font-black text-slate-900 block mt-0.5">
                          {stu.startWeight} → {stu.currentWeight}kg
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          ({Number(weightDiff) > 0 ? `+${weightDiff}` : weightDiff}kg)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Frequência</span>
                        <span
                          className={`text-sm font-black block mt-0.5 ${
                            stu.adherenceScore >= 75
                              ? 'text-emerald-600'
                              : stu.adherenceScore >= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {stu.adherenceScore}%
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {stu.churnRisk === 'baixo' ? 'Em dia' : stu.churnRisk === 'medio' ? 'Atenção' : 'Risco'}
                        </span>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          isExpiring
                            ? 'bg-orange-50 border-orange-300 text-orange-950'
                            : 'bg-slate-50 border-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase block opacity-75">Vencimento</span>
                        <span className="text-xs font-black block mt-0.5">
                          {stu.renewalDate.split('-').reverse().join('/')}
                        </span>
                        <span className="text-[10px] font-bold">
                          {daysLeft < 0 ? `Vencido` : `${daysLeft} dias`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={buildRenewalWhatsAppUrl(stu)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        isExpiring
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isExpiring ? 'Renovar no WhatsApp' : 'WhatsApp'}
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyExclusiveStudentLink(stu.id)}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Copiar Link Exclusivo deste Aluno"
                    >
                      {copiedExclusiveStudentId === stu.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Link Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                          <span>Link do Aluno</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        handleSelectPrescStudent(stu.id, 'A');
                        setActiveTab('prescricao');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Treinos A/B/C
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          ABA 3 (NOVA): PRESCRIÇÃO RELÂMPAGO "SEM MENUS" (DIVISÕES A/B/C)
      ==================================================================== */}
      {activeTab === 'prescricao' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Divisões A / B / C • Equivalência Biomecânica Automática
              </span>
              <h2 className="text-lg font-black text-slate-900">
                Prescrição Relâmpago + Divisão de Treinos A / B / C
              </h2>
              <p className="text-xs text-slate-500">
                Selecione o aluno e a divisão (<code>Treino A</code>, <code>Treino B</code> ou <code>Treino C</code>). O sistema gera as substituições para academia lotada e sincroniza com o link exclusivo do aluno.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <select
                value={selectedPrescStudent?.id || ''}
                onChange={e => handleSelectPrescStudent(e.target.value, selectedSplit)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold border border-slate-800"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    Aluno: {s.name} (PIN: {s.accessPin || s.phone.slice(-4)})
                  </option>
                ))}
              </select>

              {selectedPrescStudent && (
                <button
                  type="button"
                  onClick={() => handleCopyExclusiveStudentLink(selectedPrescStudent.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedExclusiveStudentId === selectedPrescStudent.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Link Exclusivo Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-orange-600" />
                      <span>Copiar Link de {selectedPrescStudent.name.split(' ')[0]}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Alerta de Anamnese / Restrição Articular do Aluno Selecionado */}
          {selectedPrescStudent && (
            <div className="bg-amber-950/95 text-amber-100 rounded-2xl p-4 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    Alerta de Anamnese & Restrição Articular ({selectedPrescStudent.name})
                  </span>
                  <p className="text-xs font-medium text-amber-100">
                    {selectedPrescStudent.injuryAlert || 'Sem restrições articulares registradas.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={selectedPrescStudent.injuryAlert || ''}
                  onChange={e =>
                    handleUpdateStudentInjuryAlert(selectedPrescStudent.id, e.target.value)
                  }
                  placeholder="Registrar restrição/lesão..."
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-white w-full sm:w-64 focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>
          )}

          {/* Seletor de Divisão de Treino: A / B / C */}
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                { key: 'A' as WorkoutSplitKey, title: 'Treino A', desc: 'Inferiores Completo' },
                { key: 'B' as WorkoutSplitKey, title: 'Treino B', desc: 'Superiores (Empurrar)' },
                { key: 'C' as WorkoutSplitKey, title: 'Treino C', desc: 'Dorsais & Bíceps (Puxar)' }
              ]
            ).map(sp => (
              <button
                key={sp.key}
                type="button"
                onClick={() => handleSelectSplitTab(sp.key)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedSplit === sp.key
                    ? 'bg-slate-950 border-orange-500 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      selectedSplit === sp.key ? 'text-orange-400' : 'text-slate-900'
                    }`}
                  >
                    {sp.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      selectedSplit === sp.key
                        ? 'bg-orange-500 text-slate-950'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Divisão {sp.key}
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-1 font-medium ${
                    selectedSplit === sp.key ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {sp.desc}
                </p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Editor Rápido por Linha de Comando */}
            <div className="lg:col-span-5 bg-slate-950 text-white rounded-2xl p-5 border border-orange-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Editando Treino {selectedSplit}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {parsedExercises.length} exercícios lidos
                  </span>
                </div>

                <textarea
                  rows={8}
                  value={prescriptionText}
                  onChange={e => setPrescriptionText(e.target.value)}
                  placeholder="Ex: Supino Inclinado Halteres 4x8-10 @RPE9 90s"
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-orange-500 focus:outline-none text-xs font-mono text-orange-100 leading-relaxed"
                />

                {/* Atalhos de Inserção Rápida em 1 Clique */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                    + Adicionar em 1 Clique ao Treino {selectedSplit}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Supino Reto Barra 4x8-10 @RPE9 90s',
                      'Remada Curvada 4x8-10 @RPE8 90s',
                      'Puxada Frontal 4x10-12 @RPE8 75s',
                      'Leg Press 45 4x10-12 @RPE9 90s'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          setPrescriptionText(prev => (prev.trim() ? `${prev.trim()}\n${preset}` : preset))
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-orange-300 font-medium cursor-pointer"
                      >
                        + {preset.split(' ').slice(0, 2).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSavePrescriptionToStudent}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                >
                  {savedPrescriptionToast ? (
                    <>
                      <Check className="w-4 h-4" />
                      Treino {selectedSplit} Salvo no App de {selectedPrescStudent?.name.split(' ')[0]}!
                    </>
                  ) : (
                    <>
                      <Dumbbell className="w-4 h-4" />
                      Salvar Treino {selectedSplit} no App de {selectedPrescStudent?.name.split(' ')[0]}
                    </>
                  )}
                </button>

                <a
                  href={buildPrescriptionWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Treino {selectedSplit} + Link Individual no WhatsApp
                </a>
              </div>
            </div>

            {/* Tabela Estruturada Automática + Botão Academia Lotada */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-black uppercase text-slate-900">
                    Treino {selectedSplit} Estruturado Automaticamente
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Inclui o equivalente de academia lotada e exibe a carga atual registrada pelo aluno.
                  </p>
                </div>
                {selectedPrescStudent && (
                  <Link
                    href={`/performance/aluno?id=${selectedPrescStudent.id}`}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    Ver no App de {selectedPrescStudent.name.split(' ')[0]}{' '}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <div className="space-y-2.5">
                {parsedExercises.map((ex, index) => {
                  const savedSplitEx =
                    selectedPrescStudent?.workoutSplits?.[selectedSplit]?.exercises?.[index];
                  const studentLoad = savedSplitEx?.currentLoadKg ?? ex.currentLoadKg ?? 30;
                  return (
                    <div
                      key={ex.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-900 text-orange-400 text-[10px] font-black flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-black text-slate-900">{ex.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-orange-800 bg-orange-100/80 px-2.5 py-1 rounded-lg w-fit">
                          <RefreshCw className="w-3 h-3 text-orange-600 shrink-0" />
                          <span>
                            <strong>Se ocupado:</strong> {ex.substituteName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-center">
                          <span className="text-[9px] text-orange-700 font-bold uppercase block">
                            Carga Aluno
                          </span>
                          <span className="text-xs font-black text-orange-900">
                            {studentLoad} kg
                          </span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-center">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Séries</span>
                          <span className="text-xs font-black text-slate-900">
                            {ex.sets}x{ex.reps}
                          </span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-center">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Esforço</span>
                          <span className="text-xs font-black text-orange-600">{ex.rpe}</span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-center">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Pausa</span>
                          <span className="text-xs font-black text-slate-700">{ex.rest}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          ABA 4 (NOVA): LOUSA BIOMECÂNICA (CORREÇÃO POSTURAL E ÂNGULOS)
      ==================================================================== */}
      {activeTab === 'biomecanica' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Análise Tática de Movimento • Especialidade Biomecânica
              </span>
              <h2 className="text-lg font-black text-slate-900">
                Lousa Biomecânica: Medidor de Ângulo Articular & Laudo no WhatsApp
              </h2>
              <p className="text-xs text-slate-500">
                Arraste os <strong>3 pontos articulares (A, B, C)</strong> sobre a imagem/vídeo do aluno para medir o ângulo exato em graus e envie a correção técnica.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-orange-300 text-xs font-bold cursor-pointer">
                <Upload className="w-4 h-4 text-orange-400" />
                <span>Carregar Foto/Frame do Aluno</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedMediaUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setJointPoints({
                    A: { x: 240, y: 85 },
                    B: { x: 165, y: 205 },
                    C: { x: 265, y: 275 }
                  })
                }
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Resetar Ângulos"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Lousa Visual Interativa (Canvas) */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-4 border border-orange-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4" /> Arraste os pontos A, B e C com o mouse
                </span>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black font-mono">
                  Ângulo Medido: {calculatedJointAngle}°
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                {uploadedMediaUrl && (
                  <img
                    src={uploadedMediaUrl}
                    alt="Execução do Aluno"
                    className="absolute inset-0 w-full h-full object-contain opacity-65 pointer-events-none"
                  />
                )}
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={340}
                  onMouseDown={handleCanvasPointerDown}
                  onMouseMove={handleCanvasPointerMove}
                  onMouseUp={handleCanvasPointerUp}
                  onMouseLeave={handleCanvasPointerUp}
                  className="relative z-10 w-full h-[320px] cursor-crosshair select-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-[11px] text-slate-400 px-1">
                <span>Linha pontilhada amarela: Prumo Vertical da Barra (Bar Path)</span>
                <span className="text-orange-300 font-semibold">
                  {calculatedJointAngle < 90
                    ? '✓ Profundidade Paralela Atingida (< 90°)'
                    : '⚠️ Amplitude Acima de 90°'}
                </span>
              </div>
            </div>

            {/* Painel de Diagnóstico Biomecânico & Disparo no WhatsApp */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Aluno Avaliado</label>
                    <select
                      value={bioStudentId}
                      onChange={e => setBioStudentId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Repetição da Falha</label>
                    <input
                      type="text"
                      value={bioFailedRep}
                      onChange={e => setBioFailedRep(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Exercício Analisado</label>
                  <input
                    type="text"
                    value={bioExercise}
                    onChange={e => setBioExercise(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Desvio Biomecânico Detectado (1 Clique)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      'Retroversão Pélvica (Butt Wink)',
                      'Valgo Dinâmico de Joelho',
                      'Perda de Neutro Torácico',
                      'Fase Excêntrica sem Controle'
                    ].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setBioDeviation(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer border transition-all ${
                          bioDeviation === tag
                            ? 'bg-orange-500 text-slate-950 border-orange-500'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={bioDeviation}
                    onChange={e => setBioDeviation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-orange-700 mb-1">
                    Comando Técnico de Correção (Vai para o WhatsApp)
                  </label>
                  <textarea
                    rows={3}
                    value={bioCue}
                    onChange={e => setBioCue(e.target.value)}
                    className="w-full p-3 rounded-xl bg-orange-50/60 border border-orange-200 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <a
                href={buildBiomechanicsWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                Enviar Laudo Biomecânico ({calculatedJointAngle}°) no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          ABA 5: CHECK-IN DA SEMANA (ACOMPANHAMENTO 1:1 SIMPLIFICADO)
      ==================================================================== */}
      {activeTab === 'checkins' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Acompanhamento Semanal dos Alunos
              </h2>
              <p className="text-xs text-slate-500">
                Veja os check-ins enviados pelo Link do Aluno ou registre manualmente e responda no WhatsApp.
              </p>
            </div>

            <button
              onClick={() => {
                if (students.length > 0) {
                  setChkStudentId(students[0].id);
                  setChkWeight(String(students[0].currentWeight));
                }
                setIsNewCheckInOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Novo Check-in
            </button>
          </div>

          <div className="space-y-3">
            {checkIns.map(chk => (
              <div
                key={chk.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        chk.calculatedScore >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : chk.calculatedScore >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Nota: {chk.calculatedScore}%
                    </span>
                    <h3 className="text-base font-black text-slate-900">{chk.studentName}</h3>
                    <span className="text-xs text-slate-400">
                      • {chk.date.split('-').reverse().join('/')}
                    </span>
                    <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                      {chk.workoutsCompleted}/{chk.workoutsPlanned} treinos • {chk.weight}kg
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">
                        Relato do Aluno:
                      </span>
                      <p className="text-slate-700">&ldquo;{chk.studentNotes}&rdquo;</p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80">
                      <span className="font-bold text-[10px] uppercase text-orange-700 block mb-0.5">
                        Seu Feedback:
                      </span>
                      <p className="text-slate-900 font-medium">&ldquo;{chk.coachFeedback}&rdquo;</p>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
                  <a
                    href={buildCheckInWhatsAppUrl(chk)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar no WhatsApp
                  </a>
                  <button
                    onClick={() => handleDeleteCheckIn(chk.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer"
                    title="Excluir Check-in"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          ABA 6: NÍVEIS & STORIES (GAMIFICAÇÃO EM TONS DE LARANJA)
      ==================================================================== */}
      {activeTab === 'gamification' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Níveis de Disciplina & Card 9:16 para Instagram Stories
              </h2>
              <p className="text-xs text-slate-500">
                Promova o nível do aluno e gere o Card Oficial para ele postar nos Stories marcando seu perfil.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map(stu => {
              const cfg = RANK_CONFIG[stu.rank];
              const diff = (stu.currentWeight - stu.startWeight).toFixed(1);
              return (
                <div
                  key={stu.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                        {cfg.code} • {cfg.label}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1.5">{stu.name}</h3>
                      <p className="text-xs text-slate-500">
                        Peso: <strong>{stu.startWeight}kg → {stu.currentWeight}kg ({diff}kg)</strong> • Frequência: <strong>{stu.adherenceScore}%</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => setStoryCardStudent(stu)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Gerar Card Stories
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                      Alterar Nível do Aluno:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(Object.keys(RANK_CONFIG) as StudentRank[]).map(rKey => (
                        <button
                          key={rKey}
                          onClick={() => handleUpdateStudentRank(stu.id, rKey)}
                          className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                            stu.rank === rKey
                              ? 'bg-slate-950 text-orange-400 border-orange-500 font-black'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {RANK_CONFIG[rKey].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 1: ADICIONAR CONTATO MANUAL (LARANJA)
      ==================================================================== */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-orange-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                  Novo Interessado
                </span>
                <h3 className="text-xl font-black text-white">Cadastrar Contato com Score</h3>
              </div>
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeadFromQuiz} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={quizName}
                    onChange={e => setQuizName(e.target.value)}
                    placeholder="Ex: Juliana Martins"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">WhatsApp (com DDD)</label>
                  <input
                    type="text"
                    required
                    value={quizPhone}
                    onChange={e => setQuizPhone(e.target.value)}
                    placeholder="Ex: 11999998888"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Objetivo Principal</label>
                <select
                  value={quizGoal}
                  onChange={e => setQuizGoal(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option>Emagrecimento & Definição</option>
                  <option>Hipertrofia & Estética</option>
                  <option>Recomposição Corporal</option>
                  <option>Alta Performance & Força</option>
                </select>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-semibold">1. Constância Semanal</span>
                    <span className="text-orange-400 font-bold">{qConsistency}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={qConsistency}
                    onChange={e => setQConsistency(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-semibold">2. Intensidade de Treino</span>
                    <span className="text-orange-400 font-bold">{qTraining}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={qTraining}
                    onChange={e => setQTraining(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-semibold">3. Adesão à Dieta</span>
                    <span className="text-orange-400 font-bold">{qNutrition}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={qNutrition}
                    onChange={e => setQNutrition(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-semibold">4. Sono & Recuperação</span>
                    <span className="text-orange-400 font-bold">{qRecovery}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={qRecovery}
                    onChange={e => setQRecovery(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black uppercase tracking-wider cursor-pointer"
              >
                Salvar Contato
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: CADASTRAR / EDITAR ALUNO (LARANJA)
      ==================================================================== */}
      {isNewStudentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-orange-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">
                {editingStudent ? `Editar Aluno: ${editingStudent.name}` : 'Cadastrar Novo Aluno'}
              </h3>
              <button
                onClick={() => setIsNewStudentOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={stuName}
                    onChange={e => setStuName(e.target.value)}
                    placeholder="Ex: Pedro Henrique"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">WhatsApp (com DDD)</label>
                  <input
                    type="text"
                    required
                    value={stuPhone}
                    onChange={e => setStuPhone(e.target.value)}
                    placeholder="Ex: 11988887777"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Plano</label>
                  <select
                    value={stuPlanPeriod}
                    onChange={e => setStuPlanPeriod(e.target.value as PlanPeriod)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Valor Pago (R$)</label>
                  <input
                    type="number"
                    required
                    value={stuPlanValue}
                    onChange={e => setStuPlanValue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={stuRenewalDate}
                    onChange={e => setStuRenewalDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Objetivo do Aluno</label>
                <select
                  value={stuGoal}
                  onChange={e => setStuGoal(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option>Emagrecimento & Definição</option>
                  <option>Hipertrofia & Estética</option>
                  <option>Recomposição Corporal</option>
                  <option>Alta Performance & Força</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Treino / Fase Atual</label>
                <input
                  type="text"
                  required
                  value={stuProtocol}
                  onChange={e => setStuProtocol(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Peso Inicial (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stuStartWeight}
                    onChange={e => setStuStartWeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Peso Atual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stuCurrentWeight}
                    onChange={e => setStuCurrentWeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Meta (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stuTargetWeight}
                    onChange={e => setStuTargetWeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black uppercase tracking-wider cursor-pointer"
              >
                {editingStudent ? 'Salvar Alterações' : 'Confirmar Cadastro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: REGISTRAR CHECK-IN DA SEMANA (LARANJA)
      ==================================================================== */}
      {isNewCheckInOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-orange-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Novo Check-in da Semana</h3>
              <button
                onClick={() => setIsNewCheckInOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCheckIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Aluno</label>
                <select
                  value={chkStudentId}
                  onChange={e => {
                    setChkStudentId(e.target.value);
                    const found = students.find(s => s.id === e.target.value);
                    if (found) setChkWeight(String(found.currentWeight));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.currentWeight}kg)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Novo Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={chkWeight}
                    onChange={e => setChkWeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Treinos Feitos</label>
                  <input
                    type="number"
                    required
                    value={chkWorkoutsDone}
                    onChange={e => setChkWorkoutsDone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Meta da Semana</label>
                  <input
                    type="number"
                    required
                    value={chkWorkoutsPlanned}
                    onChange={e => setChkWorkoutsPlanned(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nota Dieta (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={chkDiet}
                    onChange={e => setChkDiet(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nota Sono (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={chkSleep}
                    onChange={e => setChkSleep(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Energia (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={chkEnergy}
                    onChange={e => setChkEnergy(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Relato do Aluno</label>
                <textarea
                  rows={2}
                  value={chkStudentNotes}
                  onChange={e => setChkStudentNotes(e.target.value)}
                  placeholder="Como foi a semana do aluno..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-orange-400 font-bold mb-1">Seu Feedback para o Aluno</label>
                <textarea
                  rows={2}
                  value={chkCoachFeedback}
                  onChange={e => setChkCoachFeedback(e.target.value)}
                  placeholder="Orientação que irá para o WhatsApp do aluno..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-orange-500/40 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black uppercase tracking-wider cursor-pointer"
              >
                Salvar Check-in
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: CARD 9:16 PARA INSTAGRAM STORIES (100% LARANJA & DOURADO)
      ==================================================================== */}
      {storyCardStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full">
            <button
              onClick={() => setStoryCardStudent(null)}
              className="absolute -top-3 -right-3 z-20 p-2 rounded-full bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 cursor-pointer shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-[32px] p-7 border-2 border-orange-500/60 shadow-[0_0_80px_rgba(249,115,22,0.35)] text-center text-white space-y-6 relative overflow-hidden">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-400/40 text-orange-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-orange-400" />
                  Reconhecimento Oficial de Evolução
                </div>
                <p className="text-[11px] text-slate-400 font-mono uppercase tracking-widest pt-1">
                  {currentTenant.id === 'tenant-dhp' ? 'CONSULTORIA ONLINE // HIGH PERFORMANCE' : currentTenant.name}
                </p>
              </div>

              <div className="relative z-10 py-4 flex flex-col items-center">
                <div
                  className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${
                    RANK_CONFIG[storyCardStudent.rank].glowClass
                  } p-0.5 shadow-[0_0_40px_rgba(249,115,22,0.4)]`}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center">
                    <Trophy className="w-10 h-10 text-orange-400 mb-1" />
                    <span className="text-[9px] font-mono font-black text-orange-300">
                      {RANK_CONFIG[storyCardStudent.rank].code}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white mt-4 tracking-tight">
                  {storyCardStudent.name}
                </h3>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest mt-0.5">
                  Nível: {RANK_CONFIG[storyCardStudent.rank].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Frequência
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {storyCardStudent.adherenceScore}%
                  </span>
                </div>
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Peso Atual
                  </span>
                  <span className="text-2xl font-black text-orange-400">
                    {storyCardStudent.currentWeight}kg
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-xs text-slate-300 relative z-10">
                <span className="text-[10px] font-mono uppercase text-orange-400 block font-bold mb-0.5">
                  Objetivo:
                </span>
                {storyCardStudent.goal}
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-orange-300/80 uppercase tracking-widest relative z-10">
                A constância constrói resultados extraordinários 🔥
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
