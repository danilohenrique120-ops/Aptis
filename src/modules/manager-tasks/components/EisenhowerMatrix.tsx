'use client';

import React, { useState, useEffect } from 'react';
import { ManagerTask, EisenhowerQuadrant, TaskStatus } from '../types';
import {
  Flame,
  CalendarCheck,
  Users,
  Archive,
  Clock,
  User,
  CheckCircle2,
  Layers,
  Circle,
  GripVertical
} from 'lucide-react';
import { formatDate, getDaysUntil } from '@/lib/utils';

interface EisenhowerMatrixProps {
  tasks: ManagerTask[];
  onMoveQuadrant: (taskId: string, newQuadrant: EisenhowerQuadrant) => void;
  onEditTask?: (task: ManagerTask) => void;
  onSelectTask?: (task: ManagerTask) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const QUADRANTS: {
  id: EisenhowerQuadrant;
  title: string;
  subtitle: string;
  badge: string;
  accentGlow: string;
  darkBadgeCls: string;
  lightBadgeCls: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'q1_do',
    title: '1. Fazer Imediatamente',
    subtitle: 'Urgente & Importante • Crises, desvios críticos e riscos imediatos',
    badge: 'Urgente + Importante',
    accentGlow: 'rgba(244, 63, 94, 0.35)',
    darkBadgeCls: 'bg-rose-500/20 text-rose-300 border border-rose-400/35',
    lightBadgeCls: 'bg-rose-100 text-rose-800 border border-rose-200',
    icon: Flame
  },
  {
    id: 'q2_schedule',
    title: '2. Planejar & Agendar',
    subtitle: 'Não Urgente, mas Altamente Estratégico • Kaizen, matriz e melhoria contínua',
    badge: 'Estratégico / Alto Impacto',
    accentGlow: 'rgba(59, 130, 246, 0.35)',
    darkBadgeCls: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/35',
    lightBadgeCls: 'bg-blue-100 text-blue-800 border border-blue-200',
    icon: CalendarCheck
  },
  {
    id: 'q3_delegate',
    title: '3. Delegar / Acompanhar',
    subtitle: 'Urgente, mas Baixo Impacto Direto • Interrupções, checagens de rotina e relatórios',
    badge: 'Urgente + Delegável',
    accentGlow: 'rgba(245, 158, 11, 0.35)',
    darkBadgeCls: 'bg-amber-500/20 text-amber-300 border border-amber-400/35',
    lightBadgeCls: 'bg-amber-100 text-amber-800 border border-amber-200',
    icon: Users
  },
  {
    id: 'q4_eliminate',
    title: '4. Eliminar / Reduzir',
    subtitle: 'Nem Urgente Nem Importante • Retrabalhos, burocracia excessiva e dispersão',
    badge: 'Desperdício / Rever',
    accentGlow: 'rgba(148, 163, 184, 0.25)',
    darkBadgeCls: 'bg-white/[0.08] text-slate-300 border border-white/[0.15]',
    lightBadgeCls: 'bg-slate-200 text-slate-700 border border-slate-300',
    icon: Archive
  }
];

export function EisenhowerMatrix({
  tasks,
  onMoveQuadrant,
  onEditTask,
  onSelectTask,
  onToggleSubtask
}: EisenhowerMatrixProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<EisenhowerQuadrant | null>(null);
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

  const handleCardClick = (task: ManagerTask) => {
    if (onSelectTask) {
      onSelectTask(task);
    } else if (onEditTask) {
      onEditTask(task);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverQuadrant(null);
  };

  const handleQuadrantDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    quadrantId: EisenhowerQuadrant
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverQuadrant !== quadrantId) {
      setDragOverQuadrant(quadrantId);
    }
  };

  const handleQuadrantDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverQuadrant(null);
  };

  const handleQuadrantDrop = (
    e: React.DragEvent<HTMLDivElement>,
    quadrantId: EisenhowerQuadrant
  ) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onMoveQuadrant(taskId, quadrantId);
    }
    setDragOverQuadrant(null);
    setDraggedTaskId(null);
  };

  const getSlaBadge = (dueDateStr: string, status: TaskStatus) => {
    if (status === 'done') {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            tintedGlass
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
              : 'text-emerald-700 bg-emerald-100/70 border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" /> Concluído
        </span>
      );
    }

    const days = getDaysUntil(dueDateStr);

    if (days < 0) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border animate-pulse ${
            tintedGlass
              ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
              : 'text-rose-700 bg-rose-100 border-rose-200'
          }`}
        >
          🔴 Atrasado ({Math.abs(days)}d)
        </span>
      );
    }
    if (days === 0) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            tintedGlass
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
              : 'text-amber-800 bg-amber-100 border-amber-200'
          }`}
        >
          🟡 Vence Hoje
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
          tintedGlass
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
        }`}
      >
        🟢 {days}d restantes
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Topo Explicativo da Matriz em Vidro */}
      <div
        className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              tintedGlass
                ? 'aptis-glass-subcard text-purple-300'
                : 'bg-blue-50 text-blue-600'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              Matriz de Priorização Estratégica (Eisenhower)
            </h2>
            <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Separe o que é realmente urgente do que gera valor a longo prazo para a fábrica.
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl ${
            tintedGlass
              ? 'aptis-glass-subcard text-slate-300'
              : 'text-slate-500 bg-slate-50 border border-slate-200'
          }`}
        >
          <GripVertical className="w-3.5 h-3.5 text-purple-400" />
          <span>Arraste os cartões entre os quadrantes para reclassificar.</span>
        </div>
      </div>

      {/* Grid 2x2 dos 4 Quadrantes em Dupla Camada de Vidro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {QUADRANTS.map(q => {
          const Icon = q.icon;
          const quadrantTasks = tasks.filter(t => (t.quadrant || 'q2_schedule') === q.id);
          const isDragOver = dragOverQuadrant === q.id;

          return (
            <div
              key={q.id}
              onDragOver={e => handleQuadrantDragOver(e, q.id)}
              onDragLeave={handleQuadrantDragLeave}
              onDrop={e => handleQuadrantDrop(e, q.id)}
              className={`rounded-3xl p-5 flex flex-col min-h-[390px] relative overflow-hidden transition-all duration-300 ${
                isDragOver
                  ? 'ring-2 ring-purple-400/70 scale-[1.01] bg-purple-500/10 border border-purple-400/50'
                  : tintedGlass
                  ? 'aptis-glass-dark'
                  : 'aptis-glass-light'
              }`}
            >
              {/* Halo cromático sutil do quadrante */}
              <div
                className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-25 blur-3xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${q.accentGlow} 0%, transparent 70%)`
                }}
              />

              {/* Cabeçalho do Quadrante */}
              <div
                className={`relative z-10 flex items-start justify-between gap-2 pb-3.5 mb-3.5 border-b ${
                  tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      tintedGlass ? q.darkBadgeCls : q.lightBadgeCls
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-black leading-tight ${
                          tintedGlass ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {q.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tintedGlass ? q.darkBadgeCls : q.lightBadgeCls
                        }`}
                      >
                        {q.badge}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        tintedGlass ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {q.subtitle}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    tintedGlass
                      ? 'bg-white/[0.07] text-white border-white/[0.15]'
                      : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                >
                  {quadrantTasks.length}
                </span>
              </div>

              {/* Lista de Tarefas do Quadrante */}
              <div className="relative z-10 space-y-2.5 flex-1 flex flex-col max-h-[460px] overflow-y-auto pr-1">
                {quadrantTasks.length === 0 ? (
                  <div
                    className={`py-12 text-center text-xs italic flex-1 flex items-center justify-center border border-dashed rounded-2xl ${
                      tintedGlass
                        ? 'text-slate-500 border-white/[0.1]'
                        : 'text-slate-400 border-slate-300'
                    }`}
                  >
                    Nenhuma demanda neste quadrante
                  </div>
                ) : (
                  quadrantTasks.map(task => {
                    const completedSubtasks =
                      task.subtasks?.filter(s => s.completed).length || 0;
                    const totalSubtasks = task.subtasks?.length || 0;
                    const isBeingDragged = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-2xl p-4 transition-all duration-300 group cursor-grab active:cursor-grabbing select-none ${
                          isBeingDragged
                            ? 'opacity-35 border-dashed border-purple-400 scale-[0.97]'
                            : tintedGlass
                            ? 'aptis-glass-subcard aptis-glass-subcard-interactive'
                            : 'bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:-translate-y-1'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <GripVertical
                              className={`w-3.5 h-3.5 transition-colors ${
                                tintedGlass
                                  ? 'text-slate-500 group-hover:text-purple-300'
                                  : 'text-slate-300 group-hover:text-slate-600'
                              }`}
                            />
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                                tintedGlass ? 'text-cyan-300/80' : 'text-slate-400'
                              }`}
                            >
                              {task.sector}
                            </span>
                          </div>
                          {getSlaBadge(task.dueDate, task.status)}
                        </div>

                        <h4
                          onClick={() => handleCardClick(task)}
                          className={`text-xs font-bold transition-colors cursor-pointer leading-snug mb-1 ${
                            tintedGlass
                              ? 'text-white hover:text-cyan-300'
                              : 'text-slate-800 hover:text-blue-600'
                          }`}
                          title="Clique para editar"
                        >
                          {task.title}
                        </h4>

                        {task.description && (
                          <p
                            className={`text-[11px] line-clamp-2 mb-2.5 ${
                              tintedGlass ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {task.description}
                          </p>
                        )}

                        {/* Barra e Checklist de Subtarefas */}
                        {totalSubtasks > 0 && (
                          <div
                            className={`mb-2.5 p-2.5 rounded-xl border ${
                              tintedGlass
                                ? 'bg-black/25 border-white/[0.07]'
                                : 'bg-slate-50 border-slate-100'
                            }`}
                          >
                            <div
                              className={`flex items-center justify-between text-[10px] font-semibold mb-1.5 ${
                                tintedGlass ? 'text-slate-300' : 'text-slate-600'
                              }`}
                            >
                              <span>Checklist de Etapas</span>
                              <span className="font-mono">
                                {completedSubtasks}/{totalSubtasks} (
                                {Math.round((completedSubtasks / totalSubtasks) * 100)}%)
                              </span>
                            </div>
                            <div
                              className={`w-full h-1.5 rounded-full overflow-hidden mb-2 ${
                                tintedGlass ? 'bg-white/[0.1]' : 'bg-slate-200'
                              }`}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                                  background:
                                    'linear-gradient(90deg, #a855f7 0%, #3b82f6 100%)',
                                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.6)'
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              {task.subtasks?.map(sub => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onMouseDown={e => e.stopPropagation()}
                                  onClick={() => onToggleSubtask?.(task.id, sub.id)}
                                  className={`w-full text-left flex items-center gap-1.5 text-[10px] cursor-pointer ${
                                    tintedGlass
                                      ? 'text-slate-300 hover:text-white'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  {sub.completed ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Circle className="w-3 h-3 text-slate-400 shrink-0" />
                                  )}
                                  <span
                                    className={
                                      sub.completed ? 'line-through opacity-50' : ''
                                    }
                                  >
                                    {sub.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div
                          className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                            tintedGlass
                              ? 'border-white/[0.08] text-slate-300'
                              : 'border-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="flex items-center gap-1 font-medium">
                            <User className="w-3 h-3 text-cyan-400" />
                            {task.assignee}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatDate(task.dueDate)}
                          </span>
                        </div>

                        {/* Ação rápida de transferência de quadrante */}
                        <div
                          className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] ${
                            tintedGlass
                              ? 'border-white/[0.08] text-slate-400'
                              : 'border-slate-100 text-slate-400'
                          }`}
                        >
                          <span>Mover para:</span>
                          <div className="flex items-center gap-1">
                            {QUADRANTS.filter(dest => dest.id !== q.id).map(dest => (
                              <button
                                key={dest.id}
                                onMouseDown={e => e.stopPropagation()}
                                onClick={() => onMoveQuadrant(task.id, dest.id)}
                                className={`px-2 py-0.5 rounded-full font-semibold transition-colors cursor-pointer border ${
                                  tintedGlass
                                    ? 'bg-white/[0.06] hover:bg-purple-500/25 text-slate-200 border-white/[0.1]'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                }`}
                                title={`Mover para ${dest.title}`}
                              >
                                {dest.id === 'q1_do'
                                  ? 'Q1'
                                  : dest.id === 'q2_schedule'
                                  ? 'Q2'
                                  : dest.id === 'q3_delegate'
                                  ? 'Q3'
                                  : 'Q4'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isDragOver && (
                  <div className="border-2 border-dashed border-purple-400 bg-purple-500/15 rounded-2xl p-3 text-center text-xs font-bold text-purple-200 animate-pulse flex items-center justify-center gap-1.5">
                    <span>Soltar aqui para classificar como {q.badge}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
