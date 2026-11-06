'use client';

import React, { useState, useEffect } from 'react';
import { RoutineTask, RoutinePeriod } from '../types';
import {
  CheckCircle2,
  Sunrise,
  Sun,
  Sunset,
  Plus,
  RotateCcw,
  ShieldCheck,
  Check
} from 'lucide-react';

const DEFAULT_ROUTINES: RoutineTask[] = [
  // Início do Turno
  {
    id: 'kam-1',
    title: 'DDS - Diálogo Diário de Segurança & Qualidade (5 min)',
    description:
      'Reunir a equipe na célula para reforçar o uso de óculos, protetor auricular e atenção ao ponto cego de empilhadeiras.',
    period: 'start_shift',
    sector: 'Usinagem CNC',
    responsibleRole: 'Supervisor de Turno',
    completed: true,
    completedAt: '06:12',
    completedBy: 'Carlos Silveira'
  },
  {
    id: 'kam-2',
    title: 'Auditoria Visual dos Dispositivos de Parada de Emergência',
    description:
      'Checar se todos os botões cogumelo e cortinas de luz das prensas estão desobstruídos e operantes.',
    period: 'start_shift',
    sector: 'Estamparia & Prensas',
    responsibleRole: 'Líder Operacional',
    completed: true,
    completedAt: '06:30',
    completedBy: 'Mariana Souza'
  },
  {
    id: 'kam-3',
    title: 'Conferência do Quadro de Presença & Rebalanceamento de Postos',
    description:
      'Identificar ausências do turno e realocar operadores polivalentes conforme a matriz de competências.',
    period: 'start_shift',
    sector: 'Geral',
    responsibleRole: 'Supervisor de Turno',
    completed: false
  },

  // Meio do Turno
  {
    id: 'kam-4',
    title: 'Auditoria de Peça Piloto (Primeira Peça Aprovada após Setup)',
    description:
      'Aferir tolerâncias geométricas com paquímetro e micrômetro calibrado e assinar ficha técnica.',
    period: 'mid_shift',
    sector: 'Usinagem CNC',
    responsibleRole: 'Líder de Qualidade',
    completed: true,
    completedAt: '10:15',
    completedBy: 'Carlos Silveira'
  },
  {
    id: 'kam-5',
    title: 'Ronda de 5S & Descarte de Cavacos / Sucata',
    description:
      'Garantir chão limpo, oleamento controlado e ausência de peças fora da caixa padrão.',
    period: 'mid_shift',
    sector: 'Estamparia & Prensas',
    responsibleRole: 'Líder Operacional',
    completed: false
  },
  {
    id: 'kam-6',
    title: 'Acompanhamento do Painel Horário de OEE & Paradas',
    description:
      'Confrontar meta x realizado de peças produzidas na hora anterior. Se desvio > 10%, registrar causa no quadro.',
    period: 'mid_shift',
    sector: 'Geral',
    responsibleRole: 'Supervisor de Turno',
    completed: false
  },

  // Final do Turno
  {
    id: 'kam-7',
    title: 'Auditoria de Bloqueio Físico LOTO & Desligamento Seguro',
    description:
      'Assegurar que equipamentos que não rodarão no próximo turno foram desligados conforme POP.',
    period: 'end_shift',
    sector: 'Montagem & Solda',
    responsibleRole: 'Técnico de Manutenção',
    completed: false
  },
  {
    id: 'kam-8',
    title: 'Atualização do Quadro de Gestão à Vista (SQDC)',
    description:
      'Anotar os números finais de Segurança, Qualidade, Entrega e Custo para o relatório diário.',
    period: 'end_shift',
    sector: 'Geral',
    responsibleRole: 'Supervisor de Turno',
    completed: false
  },
  {
    id: 'kam-9',
    title: 'Reunião de Handover de 10 min com o Supervisor Entrante',
    description:
      'Repassar pendências mecânicas, peças em quarentena e prioridades do turno seguinte.',
    period: 'end_shift',
    sector: 'Geral',
    responsibleRole: 'Supervisor de Turno',
    completed: false
  }
];

interface KamishibaiRoutineProps {
  routineTasks?: RoutineTask[];
  onToggleRoutine?: (routineId: string) => void;
  onResetTurn?: () => void;
  onAddRoutine?: (routine: Omit<RoutineTask, 'id' | 'completed'>) => void;
  currentSupervisor?: string;
  selectedSector?: string;
}

const PERIOD_CONFIG: Record<
  RoutinePeriod,
  {
    label: string;
    subtitle: string;
    badge: string;
    icon: React.ElementType;
    accentColor: string;
    iconCls: string;
  }
> = {
  start_shift: {
    label: '1. Início do Turno',
    subtitle: 'Rituais de abertura, segurança, presença e alinhamento de metas (Primeiras 2 horas)',
    badge: 'Abertura do Turno',
    icon: Sunrise,
    accentColor: 'rgba(56, 189, 248, 0.35)',
    iconCls: 'text-cyan-400'
  },
  mid_shift: {
    label: '2. Meio do Turno',
    subtitle: 'Auditorias de processo, 5S, validação de peça piloto e acompanhamento de OEE',
    badge: 'Controle de Processo',
    icon: Sun,
    accentColor: 'rgba(245, 158, 11, 0.35)',
    iconCls: 'text-amber-400'
  },
  end_shift: {
    label: '3. Final do Turno',
    subtitle: 'Fechamento de produção, gestão à vista e passagem de bastão para o próximo turno',
    badge: 'Encerramento & Handover',
    icon: Sunset,
    accentColor: 'rgba(16, 185, 129, 0.35)',
    iconCls: 'text-emerald-400'
  }
};

export function KamishibaiRoutine({
  routineTasks: initialRoutineTasks,
  onToggleRoutine: externalToggle,
  onResetTurn: externalReset,
  onAddRoutine: externalAdd,
  currentSupervisor = 'Carlos Silveira',
  selectedSector = 'all'
}: KamishibaiRoutineProps) {
  const [internalRoutines, setInternalRoutines] = useState<RoutineTask[]>(
    initialRoutineTasks || DEFAULT_ROUTINES
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPeriod, setNewPeriod] = useState<RoutinePeriod>('start_shift');
  const [newRole, setNewRole] = useState('Supervisor do Turno');
  const [newSector, setNewSector] = useState('Usinagem CNC');
  const [tintedGlass, setTintedGlass] = useState(true);

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

  const routines = initialRoutineTasks || internalRoutines;

  // Filter routines by selected sector if applicable
  const filteredRoutines =
    selectedSector === 'all'
      ? routines
      : routines.filter(
          r =>
            r.sector === 'Geral' ||
            r.sector.toLowerCase().includes(selectedSector.toLowerCase()) ||
            selectedSector.toLowerCase().includes(r.sector.toLowerCase())
        );

  const total = filteredRoutines.length;
  const completed = filteredRoutines.filter(r => r.completed).length;
  const adherenceRate = total > 0 ? Math.round((completed / total) * 100) : 100;

  const handleToggle = (id: string) => {
    if (externalToggle) {
      externalToggle(id);
    } else {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      setInternalRoutines(prev =>
        prev.map(r => {
          if (r.id !== id) return r;
          const willComplete = !r.completed;
          return {
            ...r,
            completed: willComplete,
            completedAt: willComplete ? timeStr : undefined,
            completedBy: willComplete ? currentSupervisor : undefined
          };
        })
      );
    }
  };

  const handleReset = () => {
    if (confirm('Deseja resetar as checagens para iniciar um novo turno de trabalho?')) {
      if (externalReset) {
        externalReset();
      } else {
        setInternalRoutines(prev =>
          prev.map(r => ({
            ...r,
            completed: false,
            completedAt: undefined,
            completedBy: undefined
          }))
        );
      }
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (externalAdd) {
      externalAdd({
        title: newTitle.trim(),
        description: newDescription.trim(),
        period: newPeriod,
        sector: newSector,
        responsibleRole: newRole
      });
    } else {
      const created: RoutineTask = {
        id: `kam-${Date.now()}`,
        title: newTitle.trim(),
        description: newDescription.trim(),
        period: newPeriod,
        sector: newSector,
        responsibleRole: newRole,
        completed: false
      };
      setInternalRoutines(prev => [...prev, created]);
    }

    setNewTitle('');
    setNewDescription('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header do Kamishibai / Painel de Aderência em Vidro (Estilo Halvo Vídeo 4) */}
      <div
        className={`rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className="absolute -right-12 -top-12 w-64 h-64 rounded-full opacity-35 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.55) 0%, rgba(6, 182, 212, 0.25) 60%, transparent 75%)'
          }}
        />

        <div className="relative z-10 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                tintedGlass
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              Leader Standard Work • Metodologia Kamishibai
            </span>
            <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Supervisor Ativo: {currentSupervisor}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Rotina Padronizada de Liderança Operacional
          </h2>
          <p
            className={`text-xs max-w-2xl leading-relaxed ${
              tintedGlass ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            O checklist Kamishibai garante que os rituais fundamentais do chão de fábrica sejam executados rigorosamente em cada turno, prevenindo acidentes, falhas de qualidade e paradas inesperadas.
          </p>
        </div>

        {/* Card do Score de Aderência em Sub-vidro com Dial Circular (Estilo Halvo Vídeo 4) */}
        <div
          className={`relative z-10 rounded-2xl p-4 flex items-center gap-5 shrink-0 ${
            tintedGlass
              ? 'aptis-glass-subcard'
              : 'bg-white border border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <div
              className={`text-[10px] uppercase font-bold ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Aderência ao Padrão
            </div>
            <div className="text-3xl font-black font-mono mt-0.5">{adherenceRate}%</div>
            <div
              className={`text-[11px] mt-0.5 ${
                tintedGlass ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {completed} de {total} rituais concluídos
            </div>
          </div>
          <div
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-xs shadow-inner ${
              adherenceRate >= 80
                ? 'border-emerald-400 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                : adherenceRate >= 50
                ? 'border-amber-400 text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                : 'border-rose-400 text-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.35)]'
            }`}
          >
            {adherenceRate >= 80 ? '🟢 OK' : adherenceRate >= 50 ? '🟡 ATN' : '🔴 CRIT'}
          </div>
        </div>
      </div>

      {/* Barra de Ações Rápidas */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className={`flex items-center gap-2 text-xs ${
            tintedGlass ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Clique no cartão do ritual para validar a checagem com carimbo de hora e supervisor.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 py-2 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: '1px solid rgba(110, 231, 183, 0.4)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 16px -4px rgba(16, 185, 129, 0.5)'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Ritual
          </button>
          <button
            onClick={handleReset}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border ${
              tintedGlass
                ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Limpar checagens e preparar rotina para o próximo turno"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetar Turno
          </button>
        </div>
      </div>

      {/* Colunas por Fase do Turno (Início, Meio e Fim) em Vidro Especular */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(['start_shift', 'mid_shift', 'end_shift'] as RoutinePeriod[]).map(period => {
          const cfg = PERIOD_CONFIG[period];
          const Icon = cfg.icon;
          const tasks = filteredRoutines.filter(t => t.period === period);
          const periodCompleted = tasks.filter(t => t.completed).length;

          return (
            <div
              key={period}
              className={`rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden ${
                tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
              }`}
            >
              <div
                className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-25 blur-3xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${cfg.accentColor} 0%, transparent 70%)`
                }}
              />

              <div className="relative z-10">
                {/* Header da Fase */}
                <div
                  className={`flex items-start justify-between gap-2 pb-3.5 mb-4 border-b ${
                    tintedGlass ? 'border-white/[0.08]' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tintedGlass
                          ? 'aptis-glass-subcard'
                          : 'bg-white border border-slate-200 shadow-xs'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${cfg.iconCls}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black leading-tight">{cfg.label}</h3>
                      <span
                        className={`text-[10px] line-clamp-1 ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {cfg.subtitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      tintedGlass
                        ? 'bg-white/[0.07] text-white border-white/[0.15]'
                        : 'bg-white text-slate-800 border-slate-200'
                    }`}
                  >
                    {periodCompleted}/{tasks.length}
                  </span>
                </div>

                {/* Lista de Rituais (Cards de Cenas estilo Halvo Vídeo 4) */}
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div
                      className={`text-center py-8 text-xs italic ${
                        tintedGlass ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Nenhum ritual cadastrado para este setor nesta etapa.
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleToggle(task.id)}
                        className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer flex items-start gap-3 select-none hover:-translate-y-1 ${
                          task.completed
                            ? tintedGlass
                              ? 'bg-emerald-500/15 border border-emerald-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_14px_28px_-6px_rgba(16,185,129,0.25)]'
                              : 'bg-emerald-50/70 border border-emerald-200 text-slate-600'
                            : tintedGlass
                            ? 'aptis-glass-subcard aptis-glass-subcard-interactive'
                            : 'bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-lg'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {task.completed ? (
                            <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.6)]">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-md border-2 ${
                                tintedGlass
                                  ? 'border-white/30 bg-white/[0.05]'
                                  : 'border-slate-300 bg-white'
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4
                              className={`text-xs font-bold leading-tight ${
                                task.completed
                                  ? tintedGlass
                                    ? 'line-through text-emerald-200/70'
                                    : 'line-through text-slate-500'
                                  : tintedGlass
                                  ? 'text-white'
                                  : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </h4>
                          </div>

                          {task.description && (
                            <p
                              className={`text-[11px] mt-1 leading-relaxed ${
                                tintedGlass ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {task.description}
                            </p>
                          )}

                          <div
                            className={`mt-2.5 flex items-center justify-between text-[10px] ${
                              tintedGlass ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            <span
                              className={`font-mono px-2 py-0.5 rounded-full font-semibold ${
                                tintedGlass
                                  ? 'bg-white/[0.07] text-cyan-200 border border-white/[0.1]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.sector}
                            </span>
                            {task.completed ? (
                              <span
                                className={`font-semibold flex items-center gap-1 ${
                                  tintedGlass ? 'text-emerald-300' : 'text-emerald-700'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                Validado {task.completedAt ? `às ${task.completedAt}` : ''} (
                                {task.completedBy || 'Gestor'})
                              </span>
                            ) : (
                              <span>{task.responsibleRole}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div
                className={`relative z-10 pt-4 mt-4 border-t text-center ${
                  tintedGlass ? 'border-white/[0.08]' : 'border-slate-200'
                }`}
              >
                <span
                  className={`text-[11px] font-medium ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {periodCompleted === tasks.length && tasks.length > 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fase 100% cumprida
                    </span>
                  ) : (
                    `${tasks.length - periodCompleted} rituais pendentes nesta etapa`
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Adicionar Novo Ritual */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`rounded-3xl max-w-md w-full p-6 relative overflow-hidden ${
              tintedGlass
                ? 'aptis-glass-modal text-white'
                : 'bg-white text-slate-900 shadow-2xl border border-slate-200'
            }`}
          >
            {tintedGlass && (
              <div
                className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, #10b981 0%, transparent 70%)'
                }}
              />
            )}
            <h3
              className={`text-lg font-black mb-1 relative z-10 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              Novo Ritual de Liderança
            </h3>
            <p
              className={`text-xs mb-4 relative z-10 ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Cadastre uma rotina padronizada para os supervisores.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5 relative z-10">
              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    tintedGlass ? 'text-cyan-300' : 'text-slate-700'
                  }`}
                >
                  Título do Ritual *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Auditoria de Peça Piloto no Centro de Usinagem"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2.5 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Descrição / Instruções
                </label>
                <textarea
                  rows={2}
                  placeholder="Critérios de aceitação ou itens a checar..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2.5 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Momento do Turno
                  </label>
                  <select
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value as RoutinePeriod)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none cursor-pointer ${
                      tintedGlass
                        ? 'aptis-glass-input'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    <option value="start_shift">Início do Turno</option>
                    <option value="mid_shift">Meio do Turno</option>
                    <option value="end_shift">Final do Turno</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Setor
                  </label>
                  <input
                    type="text"
                    value={newSector}
                    onChange={e => setNewSector(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none ${
                      tintedGlass
                        ? 'aptis-glass-input'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Papel Responsável
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2.5 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div
                className={`flex items-center justify-end gap-2 pt-3 border-t ${
                  tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
                    tintedGlass
                      ? 'text-slate-300 hover:bg-white/[0.08] border border-white/[0.12]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer transition-all"
                >
                  Salvar Ritual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
