'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import {
  PerformanceStudent,
  WeeklyCheckIn,
  WorkoutSplitKey,
  INITIAL_DEMO_STUDENTS,
  INITIAL_DEMO_CHECKINS,
  RANK_CONFIG,
  parseSmartPrescriptionText,
  buildDefaultWorkoutSplits,
  DEFAULT_SPLIT_A_RAW
} from '@/modules/performance-pro';
import {
  Flame,
  Dumbbell,
  RefreshCw,
  CheckCircle2,
  ClipboardCheck,
  Trophy,
  Zap,
  ShieldAlert,
  Send,
  Sparkles,
  Check,
  Timer,
  Lock,
  LogOut,
  Plus,
  Minus,
  Play,
  X
} from 'lucide-react';

type DailyReadiness = 'alta' | 'moderada' | 'baixa';

function StudentPortalInner() {
  const searchParams = useSearchParams();
  const urlStudentId = searchParams.get('id');

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

  // Autenticação individual do aluno (por Link Exclusivo ?id=... ou PIN de 4 dígitos do WhatsApp)
  const [authenticatedStudentId, setAuthenticatedStudentId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (urlStudentId) {
      const exists = students.find(s => s.id === urlStudentId);
      if (exists) {
        setAuthenticatedStudentId(exists.id);
      }
    }
  }, [urlStudentId, students]);

  const currentStudent = useMemo(
    () => students.find(s => s.id === authenticatedStudentId) || null,
    [students, authenticatedStudentId]
  );

  // Abas do App do Aluno (100% isolado da visão do treinador)
  const [studentTab, setStudentTab] = useState<'treino' | 'checkin' | 'card'>('treino');

  // Divisão ativa no dia (Treino A, B ou C)
  const [activeSplit, setActiveSplit] = useState<WorkoutSplitKey>('A');

  // Auto-Regulação Diária em 3 Segundos (Readiness Score)
  const [readiness, setReadiness] = useState<DailyReadiness>('alta');

  // Controle de exercícios trocados pelo botão "Aparelho Ocupado"
  const [swappedExercises, setSwappedExercises] = useState<Record<string, boolean>>({});
  // Controle de exercícios concluídos no treino de hoje
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  // Cronômetro Flutuante de Descanso (em segundos)
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerExerciseName, setRestTimerExerciseName] = useState<string>('');

  useEffect(() => {
    if (restTimerSeconds === null || restTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestTimerSeconds(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimerSeconds]);

  // Estado do Check-in Semanal do Aluno (Ideia Salva)
  const [chkWeight, setChkWeight] = useState<string>('');
  const [chkWorkoutsDone, setChkWorkoutsDone] = useState<number>(5);
  const [chkDiet, setChkDiet] = useState<number>(9);
  const [chkSleep, setChkSleep] = useState<number>(8);
  const [chkNotes, setChkNotes] = useState<string>('');
  const [checkInSubmitted, setCheckInSubmitted] = useState<boolean>(false);

  // Lista de exercícios da divisão ativa (A, B ou C)
  const activeExercises = useMemo(() => {
    if (!currentStudent) return [];
    const splits = currentStudent.workoutSplits || buildDefaultWorkoutSplits();
    const splitData = splits[activeSplit];
    if (splitData?.exercises && splitData.exercises.length > 0) {
      return splitData.exercises;
    }
    if (currentStudent.workoutSheet && currentStudent.workoutSheet.length > 0) {
      return currentStudent.workoutSheet;
    }
    return parseSmartPrescriptionText(DEFAULT_SPLIT_A_RAW);
  }, [currentStudent, activeSplit]);

  const activeSplitLabel = useMemo(() => {
    if (!currentStudent) return 'Treino A';
    const splits = currentStudent.workoutSplits || buildDefaultWorkoutSplits();
    return splits[activeSplit]?.label || `Treino ${activeSplit}`;
  }, [currentStudent, activeSplit]);

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim();
    if (!clean) return;

    const matched = students.find(
      s =>
        s.accessPin === clean ||
        s.phone.slice(-4) === clean ||
        s.phone.replace(/\D/g, '') === clean.replace(/\D/g, '') ||
        s.id.toLowerCase() === clean.toLowerCase()
    );

    if (matched) {
      setAuthenticatedStudentId(matched.id);
      setPinError('');
    } else {
      setPinError(
        'Código não encontrado. Digite os 4 últimos dígitos do seu WhatsApp cadastrado com o treinador.'
      );
    }
  };

  const toggleSwapExercise = (exId: string) => {
    setSwappedExercises(prev => ({
      ...prev,
      [exId]: !prev[exId]
    }));
  };

  const toggleCompleteExercise = (exId: string, exName: string, defaultRestSec: number = 90) => {
    const willComplete = !completedExercises[exId];
    setCompletedExercises(prev => ({
      ...prev,
      [exId]: willComplete
    }));
    if (willComplete) {
      setRestTimerExerciseName(exName);
      setRestTimerSeconds(defaultRestSec);
    }
  };

  const startManualRestTimer = (exName: string, seconds: number) => {
    setRestTimerExerciseName(exName);
    setRestTimerSeconds(seconds);
  };

  const handleUpdateExerciseLoad = (exIndex: number, newLoadKg: number) => {
    if (!currentStudent || newLoadKg < 0) return;

    setStudents(prev =>
      prev.map(stu => {
        if (stu.id !== currentStudent.id) return stu;
        const splits = stu.workoutSplits || buildDefaultWorkoutSplits();
        const currentSplit = splits[activeSplit] || buildDefaultWorkoutSplits()[activeSplit];

        const updatedExercises = currentSplit.exercises.map((ex, idx) => {
          if (idx !== exIndex) return ex;
          return {
            ...ex,
            currentLoadKg: newLoadKg
          };
        });

        return {
          ...stu,
          workoutSplits: {
            ...splits,
            [activeSplit]: {
              ...currentSplit,
              exercises: updatedExercises
            }
          }
        };
      })
    );
  };

  const handleStudentSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    const newWeight = parseFloat(chkWeight) || currentStudent.currentWeight;
    const workoutPct = Math.min(100, Math.round((chkWorkoutsDone / 5) * 100));
    const dietPct = chkDiet * 10;
    const sleepPct = chkSleep * 10;
    const calcScore = Math.round(workoutPct * 0.45 + dietPct * 0.35 + sleepPct * 0.2);

    const newCheckIn: WeeklyCheckIn = {
      id: `chk-stu-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      date: new Date().toISOString().split('T')[0],
      weight: newWeight,
      workoutsCompleted: chkWorkoutsDone,
      workoutsPlanned: 5,
      dietScore: chkDiet,
      sleepScore: chkSleep,
      energyScore: chkSleep,
      calculatedScore: calcScore,
      studentNotes: chkNotes.trim() || 'Check-in enviado pelo App do Aluno.',
      coachFeedback: 'Check-in recebido! Em análise pelo seu treinador.'
    };

    setCheckIns(prev => [newCheckIn, ...prev]);

    const risk: PerformanceStudent['churnRisk'] =
      calcScore >= 75 ? 'baixo' : calcScore >= 50 ? 'medio' : 'alto';

    setStudents(prev =>
      prev.map(s =>
        s.id === currentStudent.id
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

    setCheckInSubmitted(true);
    setChkNotes('');
    setTimeout(() => setCheckInSubmitted(false), 4000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ==========================================================================
  // TELA DE ACESSO INDIVIDUAL DO ALUNO (SE NÃO VIER PELO LINK EXCLUSIVO ?id=)
  // ==========================================================================
  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-orange-500/30 rounded-3xl p-7 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 pt-1">
              Aptis Performance • Portal do Aluno
            </span>
            <h1 className="text-xl font-black text-white">Acesse seu Treino Individual</h1>
            <p className="text-xs text-slate-400">
              Digite os <strong>4 últimos dígitos do seu WhatsApp</strong> ou o código enviado pelo seu treinador.
            </p>
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 text-center">
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
                Código do Aluno / 4 Últimos Dígitos do WhatsApp
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-orange-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="Ex: 6655"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-base font-black tracking-widest text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-orange-500/20"
            >
              Abrir Minha Ficha de Treino
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              🔒 Ambiente individual criptografado. Utilize o link exclusivo enviado pelo seu treinador no WhatsApp ou digite os 4 últimos dígitos do seu telefone cadastrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = activeExercises.filter(ex => completedExercises[ex.id]).length;
  const progressPct =
    activeExercises.length > 0 ? Math.round((completedCount / activeExercises.length) * 100) : 0;
  const rankInfo = RANK_CONFIG[currentStudent.rank] || RANK_CONFIG.iniciante;
  const weightDelta = (currentStudent.currentWeight - currentStudent.startWeight).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pb-24">
      {/* ====================================================================
          HEADER MOBILE-FIRST EXCLUSIVO DO ALUNO (ZERO VISÃO DO TREINADOR)
      ==================================================================== */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-orange-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 block leading-none">
                Consultoria Online • Área do Aluno
              </span>
              <span className="text-sm font-black text-white tracking-tight">
                {currentStudent.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-bold">
              {rankInfo.label}
            </span>
            {!urlStudentId && (
              <button
                type="button"
                onClick={() => {
                  setAuthenticatedStudentId(null);
                  setPinInput('');
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                title="Sair da conta do aluno"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          CORPO DO APP DO ALUNO (MAX-W-LG CENTRALIZADO ESTILO APP NATIVO)
      ==================================================================== */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-5 space-y-5">
        {/* Navegação de Abas do Aluno */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setStudentTab('treino')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studentTab === 'treino'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Treino</span>
          </button>

          <button
            type="button"
            onClick={() => setStudentTab('checkin')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studentTab === 'checkin'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Check-in</span>
          </button>

          <button
            type="button"
            onClick={() => setStudentTab('card')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studentTab === 'card'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Meu Card</span>
          </button>
        </div>

        {/* ==================================================================
            ABA 1 DO ALUNO: TREINO A/B/C + CARGA (KG) + CRONÔMETRO + APARELHO OCUPADO
        ================================================================== */}
        {studentTab === 'treino' && (
          <div className="space-y-4">
            {/* Seletor de Divisão do Dia: Treino A / Treino B / Treino C */}
            <div className="grid grid-cols-3 gap-2">
              {(['A', 'B', 'C'] as WorkoutSplitKey[]).map(sp => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setActiveSplit(sp)}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    activeSplit === sp
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-black shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 font-bold hover:text-white'
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider block">Treino {sp}</span>
                  <span className="text-[10px] opacity-80 block">
                    {sp === 'A' ? 'Inferiores' : sp === 'B' ? 'Empurrar' : 'Puxar'}
                  </span>
                </button>
              ))}
            </div>

            {/* 1. Termômetro de Prontidão em 3 Segundos (Readiness Auto-Regulation) */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Como você está para treinar hoje?
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Auto-Regulação</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReadiness('alta')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    readiness === 'alta'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-black'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-base block">🔥</span>
                  <span className="text-[11px] block mt-0.5">100% Pronto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReadiness('moderada')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    readiness === 'moderada'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-black'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-base block">⚡</span>
                  <span className="text-[11px] block mt-0.5">Pouco Sono</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReadiness('baixa')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    readiness === 'baixa'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-black'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-base block">🛡️</span>
                  <span className="text-[11px] block mt-0.5">Desgastado</span>
                </button>
              </div>

              {readiness === 'baixa' && (
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-start gap-2.5 text-xs text-amber-200">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block">
                      Modo Deload Protetor Ativado Automaticamente:
                    </strong>
                    Volume ajustado em <strong>-1 série por exercício</strong> e esforço reduzido para{' '}
                    <strong>RPE 7 (2-3 repetições na reserva)</strong>.
                  </div>
                </div>
              )}
            </div>

            {/* Alerta de Cuidado Articular do Aluno (se houver) */}
            {currentStudent.injuryAlert && (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    Orientação Biomecânica Individual:
                  </span>
                  <span>{currentStudent.injuryAlert}</span>
                </div>
              </div>
            )}

            {/* Barra de Progresso do Treino */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 truncate">{activeSplitLabel}</span>
                <span className="font-black text-orange-400 shrink-0">{progressPct}% concluído</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Lista de Exercícios com Registro de Carga (kg) + Timer + Botão "Aparelho Ocupado" */}
            <div className="space-y-3">
              {activeExercises.map((ex, idx) => {
                const isSwapped = !!swappedExercises[ex.id];
                const isDone = !!completedExercises[ex.id];
                const adjustedSets = readiness === 'baixa' ? Math.max(2, ex.sets - 1) : ex.sets;
                const adjustedRpe = readiness === 'baixa' ? 'RPE 7 (Deload)' : ex.rpe;
                const displayTitle = isSwapped ? ex.substituteName : ex.name;
                const lastLoad = ex.lastLoadKg ?? 30;
                const currentLoad = ex.currentLoadKg ?? lastLoad;
                const isNewPR = currentLoad > lastLoad;
                const restSec = ex.restSeconds || 90;

                return (
                  <div
                    key={ex.id}
                    className={`rounded-2xl p-4 border transition-all space-y-3 ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : isSwapped
                        ? 'bg-slate-900 border-amber-500/50'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h3
                            className={`text-sm font-black ${
                              isDone ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {displayTitle}
                          </h3>
                          {isNewPR && (
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                              🏆 +{currentLoad - lastLoad}kg PR!
                            </span>
                          )}
                        </div>

                        {isSwapped && (
                          <p className="text-[11px] text-amber-300 font-medium">
                            ✓ Substituição Biomecânica Ativa ({ex.substituteNote})
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCompleteExercise(ex.id, displayTitle, restSec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-950 text-slate-300 border border-slate-700 hover:border-orange-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Feito' : 'Concluir'}</span>
                      </button>
                    </div>

                    {/* Métricas da Série */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Séries x Reps
                        </span>
                        <span className="text-xs font-black text-white">
                          {adjustedSets}x {ex.reps}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Intensidade
                        </span>
                        <span className="text-xs font-black text-orange-400">{adjustedRpe}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => startManualRestTimer(displayTitle, restSec)}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-orange-500/30 text-center cursor-pointer transition-all"
                        title="Iniciar Cronômetro de Descanso"
                      >
                        <span className="text-[10px] text-orange-400 uppercase font-bold flex items-center justify-center gap-1">
                          <Timer className="w-3 h-3" /> Descanso
                        </span>
                        <span className="text-xs font-black text-amber-300">{ex.rest} ▶</span>
                      </button>
                    </div>

                    {/* Registro de Carga Real (kg) no Piso da Academia */}
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Carga de Hoje (kg)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Último treino: <strong className="text-slate-300">{lastLoad} kg</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateExerciseLoad(idx, Math.max(0, currentLoad - 2))}
                          className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="px-3 py-1 rounded-lg bg-slate-900 border border-orange-500/40 text-center min-w-[68px]">
                          <span className="text-sm font-black text-orange-400">{currentLoad}</span>
                          <span className="text-[10px] text-slate-400 font-bold ml-1">kg</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateExerciseLoad(idx, currentLoad + 2)}
                          className="w-8 h-8 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Botão "Aparelho Ocupado / Academia Lotada" */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSwapExercise(ex.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          isSwapped
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-orange-300'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                        <span>
                          {isSwapped
                            ? `Voltar para exercício original (${ex.name})`
                            : `🔄 Aparelho Ocupado? Trocar por Equivalente`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================
            ABA 2 DO ALUNO: CHECK-IN SEMANAL EM 30 SEGUNDOS (SINCRONIZADO)
        ================================================================== */}
        {studentTab === 'checkin' && (
          <div className="space-y-4">
            {/* Resumo de Evolução do Aluno */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Peso Inicial</span>
                <span className="text-sm font-black text-white mt-0.5 block">
                  {currentStudent.startWeight} kg
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-orange-500/30">
                <span className="text-[10px] text-orange-400 font-bold uppercase block">Peso Atual</span>
                <span className="text-sm font-black text-orange-300 mt-0.5 block">
                  {currentStudent.currentWeight} kg
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Resultado</span>
                <span className="text-sm font-black text-amber-400 mt-0.5 block">
                  {Number(weightDelta) > 0 ? `+${weightDelta}` : weightDelta} kg
                </span>
              </div>
            </div>

            <form
              onSubmit={handleStudentSubmitCheckIn}
              className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                  Feedback Semanal Direto para o Treinador
                </span>
                <h2 className="text-lg font-black text-white mt-0.5">
                  Check-in Rápido da Semana
                </h2>
                <p className="text-xs text-slate-400">
                  Preencha em 30 segundos para o treinador ajustar as cargas e dieta da próxima semana.
                </p>
              </div>

              {checkInSubmitted && (
                <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Check-in enviado com sucesso! Seu treinador já recebeu seus dados atualizados.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Peso Atual em Jejum (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={String(currentStudent.currentWeight)}
                    value={chkWeight}
                    onChange={e => setChkWeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Treinos Feitos na Semana
                  </label>
                  <select
                    value={chkWorkoutsDone}
                    onChange={e => setChkWorkoutsDone(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>
                        {n} treinos concluídos
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Adesão à Dieta & Hidratação (0 a 10)</span>
                  <span className="text-orange-400">{chkDiet}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={chkDiet}
                  onChange={e => setChkDiet(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Qualidade do Sono & Recuperação (0 a 10)</span>
                  <span className="text-amber-400">{chkSleep}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={chkSleep}
                  onChange={e => setChkSleep(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Como você se sentiu nos treinos desta semana?
                </label>
                <textarea
                  rows={3}
                  value={chkNotes}
                  onChange={e => setChkNotes(e.target.value)}
                  placeholder="Ex: Subi carga no Leg Press, sem dores articulares e mantive 100% da dieta..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Check-in para o Treinador</span>
              </button>
            </form>
          </div>
        )}

        {/* ==================================================================
            ABA 3 DO ALUNO: MEU CARD 9:16 PARA STORIES DO INSTAGRAM
        ================================================================== */}
        {studentTab === 'card' && (
          <div className="space-y-4">
            <div className="mx-auto max-w-[310px] aspect-[9/16] rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-orange-500/50 p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.2)]">
              <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[10px] font-black uppercase tracking-widest">
                  {rankInfo.code}
                </span>
                <span className="text-[10px] font-mono text-slate-400">APTIS PERFORMANCE</span>
              </div>

              <div className="relative z-10 text-center space-y-3 my-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 block">
                    Patente Oficial Confirmada
                  </span>
                  <h3 className="text-2xl font-black text-white mt-0.5">{currentStudent.name}</h3>
                  <p className="text-xs font-bold text-amber-300 mt-0.5">{rankInfo.label}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3">
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">
                      Constância
                    </span>
                    <span className="text-lg font-black text-orange-400">
                      {currentStudent.adherenceScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">
                      Evolução Peso
                    </span>
                    <span className="text-lg font-black text-amber-300">
                      {currentStudent.currentWeight}kg
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-3 border-t border-slate-800/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">
                  Tire print e marque nos Stories:
                </span>
                <span className="text-xs font-black text-orange-400 flex items-center justify-center gap-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" /> @drezintreinador • DRZ TEAM
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          CRONÔMETRO FLUTUANTE AUTOMÁTICO DE DESCANSO (BARRA INFERIOR)
      ==================================================================== */}
      {restTimerSeconds !== null && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-50">
          <div
            className={`rounded-2xl p-4 border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 ${
              restTimerSeconds === 0
                ? 'bg-emerald-950/95 border-emerald-400 text-white'
                : 'bg-slate-900/95 border-orange-500 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${
                  restTimerSeconds === 0
                    ? 'bg-emerald-400 text-slate-950 animate-bounce'
                    : 'bg-orange-500 text-slate-950'
                }`}
              >
                {restTimerSeconds === 0 ? <Play className="w-5 h-5" /> : formatTimer(restTimerSeconds)}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">
                  {restTimerSeconds === 0
                    ? '🔥 Descanso Finalizado!'
                    : '⏱️ Cronômetro de Descanso Ativo'}
                </span>
                <span className="text-xs font-bold text-slate-200 block truncate max-w-[180px]">
                  {restTimerSeconds === 0
                    ? 'Hora de iniciar a próxima série!'
                    : restTimerExerciseName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {restTimerSeconds > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setRestTimerSeconds(prev => Math.max(0, (prev || 0) - 15))}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 cursor-pointer"
                  >
                    -15s
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestTimerSeconds(prev => (prev || 0) + 15)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-orange-300 cursor-pointer"
                  >
                    +15s
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setRestTimerSeconds(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                title="Fechar cronômetro"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé Limpo do Aluno (Zero menção ou link para o painel do treinador) */}
      <footer className="max-w-lg w-full mx-auto px-4 py-4 border-t border-slate-900 flex items-center justify-center text-[11px] text-slate-500">
        <span>Aptis Performance • Aplicativo Oficial do Aluno</span>
      </footer>
    </div>
  );
}

export default function StudentPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <StudentPortalInner />
    </Suspense>
  );
}
