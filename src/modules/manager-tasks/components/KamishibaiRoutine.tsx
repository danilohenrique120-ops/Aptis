'use client';

import React, { useState } from 'react';
import { RoutineTask, RoutinePeriod } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Sunrise, 
  Sun, 
  Sunset, 
  Plus, 
  RotateCcw, 
  ShieldCheck, 
  Award,
  Check
} from 'lucide-react';

const DEFAULT_ROUTINES: RoutineTask[] = [
  // Início do Turno
  {
    id: 'kam-1',
    title: 'DDS - Diálogo Diário de Segurança & Qualidade (5 min)',
    description: 'Reunir a equipe na célula para reforçar o uso de óculos, protetor auricular e atenção ao ponto cego de empilhadeiras.',
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
    description: 'Checar se todos os botões cogumelo e cortinas de luz das prensas estão desobstruídos e operantes.',
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
    description: 'Identificar ausências do turno e realocar operadores polivalentes conforme a matriz de competências.',
    period: 'start_shift',
    sector: 'Geral',
    responsibleRole: 'Supervisor de Turno',
    completed: false
  },

  // Meio do Turno
  {
    id: 'kam-4',
    title: 'Auditoria de Peça Piloto (Primeira Peça Aprovada após Setup)',
    description: 'Aferir tolerâncias geométricas com paquímetro e micrômetro calibrado e assinar ficha técnica.',
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
    description: 'Garantir chão limpo, oleamento controlado e ausência de peças fora da caixa padrão.',
    period: 'mid_shift',
    sector: 'Estamparia & Prensas',
    responsibleRole: 'Líder Operacional',
    completed: false
  },
  {
    id: 'kam-6',
    title: 'Acompanhamento do Painel Horário de OEE & Paradas',
    description: 'Confrontar meta x realizado de peças produzidas na hora anterior. Se desvio > 10%, registrar causa no quadro.',
    period: 'mid_shift',
    sector: 'Geral',
    responsibleRole: 'Supervisor de Turno',
    completed: false
  },

  // Final do Turno
  {
    id: 'kam-7',
    title: 'Auditoria de Bloqueio Físico LOTO & Desligamento Seguro',
    description: 'Assegurar que equipamentos que não rodarão no próximo turno foram desligados conforme POP.',
    period: 'end_shift',
    sector: 'Montagem & Solda',
    responsibleRole: 'Técnico de Manutenção',
    completed: false
  },
  {
    id: 'kam-8',
    title: 'Atualização do Quadro de Gestão à Vista (SQDC)',
    description: 'Anotar os números finais de Segurança, Qualidade, Entrega e Custo para o relatório diário.',
    period: 'end_shift',
    sector: 'Geral',
    responsibleRole: 'Supervisor de Turno',
    completed: false
  },
  {
    id: 'kam-9',
    title: 'Reunião de Handover de 10 min com o Supervisor Entrante',
    description: 'Repassar pendências mecânicas, peças em quarentena e prioridades do turno seguinte.',
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

const PERIOD_CONFIG: Record<RoutinePeriod, {
  label: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  bg: string;
  border: string;
  badgeBg: string;
}> = {
  start_shift: {
    label: '1. Início do Turno',
    subtitle: 'Rituais de abertura, segurança, presença e alinhamento de metas (Primeiras 2 horas)',
    badge: 'Abertura do Turno',
    icon: Sunrise,
    bg: 'bg-blue-50/40',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800'
  },
  mid_shift: {
    label: '2. Meio do Turno',
    subtitle: 'Auditorias de processo, 5S, validação de peça piloto e acompanhamento de OEE',
    badge: 'Controle de Processo',
    icon: Sun,
    bg: 'bg-amber-50/40',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800'
  },
  end_shift: {
    label: '3. Final do Turno',
    subtitle: 'Fechamento de produção, gestão à vista e passagem de bastão para o próximo turno',
    badge: 'Encerramento & Handover',
    icon: Sunset,
    bg: 'bg-emerald-50/40',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800'
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
  const [internalRoutines, setInternalRoutines] = useState<RoutineTask[]>(initialRoutineTasks || DEFAULT_ROUTINES);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPeriod, setNewPeriod] = useState<RoutinePeriod>('start_shift');
  const [newRole, setNewRole] = useState('Supervisor do Turno');
  const [newSector, setNewSector] = useState('Usinagem CNC');

  const routines = initialRoutineTasks || internalRoutines;

  // Filter routines by selected sector if applicable
  const filteredRoutines = selectedSector === 'all'
    ? routines
    : routines.filter(r => r.sector === 'Geral' || r.sector.toLowerCase().includes(selectedSector.toLowerCase()) || selectedSector.toLowerCase().includes(r.sector.toLowerCase()));

  const total = filteredRoutines.length;
  const completed = filteredRoutines.filter(r => r.completed).length;
  const adherenceRate = total > 0 ? Math.round((completed / total) * 100) : 100;

  const handleToggle = (id: string) => {
    if (externalToggle) {
      externalToggle(id);
    } else {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setInternalRoutines(prev => prev.map(r => {
        if (r.id !== id) return r;
        const willComplete = !r.completed;
        return {
          ...r,
          completed: willComplete,
          completedAt: willComplete ? timeStr : undefined,
          completedBy: willComplete ? currentSupervisor : undefined
        };
      }));
    }
  };

  const handleReset = () => {
    if (confirm('Deseja resetar as checagens para iniciar um novo turno de trabalho?')) {
      if (externalReset) {
        externalReset();
      } else {
        setInternalRoutines(prev => prev.map(r => ({
          ...r,
          completed: false,
          completedAt: undefined,
          completedBy: undefined
        })));
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
      {/* Header do Kamishibai / Painel de Aderência */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded">
              Leader Standard Work • Metodologia Kamishibai
            </span>
            <span className="text-xs text-slate-400">Supervisor Ativo: {currentSupervisor}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Rotina Padronizada de Liderança Operacional
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            O checklist Kamishibai garante que os rituais fundamentais do chão de fábrica sejam executados rigorosamente em cada turno, prevenindo acidentes, falhas de qualidade e paradas inesperadas.
          </p>
        </div>

        {/* Card do Score de Aderência */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 flex items-center gap-5 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Aderência ao Padrão</div>
            <div className="text-3xl font-black text-white mt-0.5">{adherenceRate}%</div>
            <div className="text-[11px] text-slate-300 mt-0.5">{completed} de {total} rituais concluídos</div>
          </div>
          <div className={`w-16 h-16 rounded-full bg-slate-900 border-4 flex items-center justify-center font-bold text-sm shadow-inner ${
            adherenceRate >= 80 ? 'border-emerald-500 text-emerald-400' : adherenceRate >= 50 ? 'border-amber-500 text-amber-400' : 'border-rose-500 text-rose-400'
          }`}>
            {adherenceRate >= 80 ? '🟢 OK' : adherenceRate >= 50 ? '🟡 ATN' : '🔴 CRIT'}
          </div>
        </div>
      </div>

      {/* Barra de Ações Rápidas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Clique no cartão do ritual para validar a checagem com carimbo de hora e supervisor.</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Ritual
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
            title="Limpar checagens e preparar rotina para o próximo turno"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetar Turno
          </button>
        </div>
      </div>

      {/* Colunas por Fase do Turno (Início, Meio e Fim) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(['start_shift', 'mid_shift', 'end_shift'] as RoutinePeriod[]).map(period => {
          const cfg = PERIOD_CONFIG[period];
          const Icon = cfg.icon;
          const tasks = filteredRoutines.filter(t => t.period === period);
          const periodCompleted = tasks.filter(t => t.completed).length;

          return (
            <div
              key={period}
              className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-5 flex flex-col justify-between shadow-xs`}
            >
              <div>
                {/* Header da Fase */}
                <div className="flex items-start justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white text-slate-800 flex items-center justify-center shadow-xs border border-slate-200">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {cfg.label}
                      </h3>
                      <span className="text-[10px] text-slate-500 line-clamp-1">
                        {cfg.subtitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-slate-800 border border-slate-200 shrink-0">
                    {periodCompleted}/{tasks.length}
                  </span>
                </div>

                {/* Lista de Rituais */}
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      Nenhum ritual cadastrado para este setor nesta etapa.
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleToggle(task.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          task.completed
                            ? 'bg-emerald-50/70 border-emerald-200 text-slate-600 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {task.completed ? (
                            <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-blue-500 bg-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4 className={`text-xs font-bold leading-tight ${
                              task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}>
                              {task.title}
                            </h4>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">{task.sector}</span>
                            {task.completed ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Validado {task.completedAt ? `às ${task.completedAt}` : ''} ({task.completedBy || 'Gestor'})
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

              <div className="pt-4 mt-4 border-t border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 font-medium">
                  {periodCompleted === tasks.length && tasks.length > 0 ? (
                    <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
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
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Novo Ritual de Liderança</h3>
            <p className="text-xs text-slate-500 mb-4">Cadastre uma rotina padronizada para os supervisores.</p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Ritual *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Auditoria de Peça Piloto no Centro de Usinagem"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Instruções</label>
                <textarea
                  rows={2}
                  placeholder="Critérios de aceitação ou itens a checar..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Momento do Turno</label>
                  <select
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value as RoutinePeriod)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="start_shift">Início do Turno</option>
                    <option value="mid_shift">Meio do Turno</option>
                    <option value="end_shift">Final do Turno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Setor</label>
                  <input
                    type="text"
                    value={newSector}
                    onChange={e => setNewSector(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Papel Responsável</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
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
