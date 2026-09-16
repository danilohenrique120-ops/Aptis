'use client';

import React, { useState } from 'react';
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
  bg: string;
  border: string;
  headerBg: string;
  headerText: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'q1_do',
    title: '1. Fazer Imediatamente',
    subtitle: 'Urgente & Importante • Crises, desvios críticos e riscos imediatos',
    badge: 'Urgente + Importante',
    bg: 'bg-rose-50/40',
    border: 'border-rose-200',
    headerBg: 'bg-rose-100/70',
    headerText: 'text-rose-900',
    icon: Flame
  },
  {
    id: 'q2_schedule',
    title: '2. Planejar & Agendar',
    subtitle: 'Não Urgente, mas Altamente Estratégico • Kaizen, matriz e melhoria contínua',
    badge: 'Estratégico / Alto Impacto',
    bg: 'bg-blue-50/40',
    border: 'border-blue-200',
    headerBg: 'bg-blue-100/70',
    headerText: 'text-blue-900',
    icon: CalendarCheck
  },
  {
    id: 'q3_delegate',
    title: '3. Delegar / Acompanhar',
    subtitle: 'Urgente, mas Baixo Impacto Direto • Interrupções, checagens de rotina e relatórios',
    badge: 'Urgente + Delegável',
    bg: 'bg-amber-50/40',
    border: 'border-amber-200',
    headerBg: 'bg-amber-100/70',
    headerText: 'text-amber-900',
    icon: Users
  },
  {
    id: 'q4_eliminate',
    title: '4. Eliminar / Reduzir',
    subtitle: 'Nem Urgente Nem Importante • Retrabalhos, burocracia excessiva e dispersão',
    badge: 'Desperdício / Rever',
    bg: 'bg-slate-50/60',
    border: 'border-slate-200',
    headerBg: 'bg-slate-200/70',
    headerText: 'text-slate-800',
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

  const handleQuadrantDragOver = (e: React.DragEvent<HTMLDivElement>, quadrantId: EisenhowerQuadrant) => {
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

  const handleQuadrantDrop = (e: React.DragEvent<HTMLDivElement>, quadrantId: EisenhowerQuadrant) => {
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
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Concluído
        </span>
      );
    }

    const days = getDaysUntil(dueDateStr);

    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
          🔴 Atrasado ({Math.abs(days)}d)
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
          🟡 Vence Hoje
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        🟢 {days}d restantes
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Topo Explicativo da Matriz */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Matriz de Priorização Estratégica (Eisenhower)
            </h2>
            <p className="text-xs text-slate-500">
              Separe o que é realmente urgente do que gera valor a longo prazo para a fábrica.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <GripVertical className="w-3.5 h-3.5 text-blue-500" />
          <span>Arraste os cartões entre os quadrantes para reclassificar.</span>
        </div>
      </div>

      {/* Grid 2x2 dos 4 Quadrantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {QUADRANTS.map(q => {
          const Icon = q.icon;
          const quadrantTasks = tasks.filter(t => (t.quadrant || 'q2_schedule') === q.id);
          const isDragOver = dragOverQuadrant === q.id;

          return (
            <div
              key={q.id}
              onDragOver={(e) => handleQuadrantDragOver(e, q.id)}
              onDragLeave={handleQuadrantDragLeave}
              onDrop={(e) => handleQuadrantDrop(e, q.id)}
              className={`rounded-2xl border p-4 flex flex-col min-h-[380px] shadow-xs transition-all duration-200 ${
                isDragOver 
                  ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/60 ring-dashed scale-[1.01]'
                  : `${q.border} ${q.bg}`
              }`}
            >
              {/* Cabeçalho do Quadrante */}
              <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${q.headerBg} ${q.headerText}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {q.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.headerBg} ${q.headerText}`}>
                        {q.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {q.subtitle}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {quadrantTasks.length}
                </span>
              </div>

              {/* Lista de Tarefas do Quadrante */}
              <div className="space-y-2.5 flex-1 flex flex-col">
                {quadrantTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 italic flex-1 flex items-center justify-center border-2 border-dashed border-slate-200/50 rounded-xl">
                    Nenhuma demanda neste quadrante
                  </div>
                ) : (
                  quadrantTasks.map(task => {
                    const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                    const totalSubtasks = task.subtasks?.length || 0;
                    const isBeingDragged = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl p-3.5 border shadow-xs hover:shadow-md transition-all group cursor-grab active:cursor-grabbing select-none ${
                          isBeingDragged
                            ? 'opacity-35 border-dashed border-blue-500 scale-[0.97]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                              {task.sector}
                            </span>
                          </div>
                          {getSlaBadge(task.dueDate, task.status)}
                        </div>

                        <h4 
                          onClick={() => handleCardClick(task)}
                          className="text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer leading-snug mb-1"
                          title="Clique para editar"
                        >
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mb-2.5">
                            {task.description}
                          </p>
                        )}

                        {/* Barra e Checklist de Subtarefas */}
                        {totalSubtasks > 0 && (
                          <div className="mb-2.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-1">
                              <span>Checklist de Etapas</span>
                              <span>{completedSubtasks}/{totalSubtasks} ({Math.round((completedSubtasks/totalSubtasks)*100)}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                              <div 
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                              />
                            </div>
                            {/* Visualização rápida de subitens */}
                            <div className="space-y-1">
                              {task.subtasks?.map(sub => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={() => onToggleSubtask?.(task.id, sub.id)}
                                  className="w-full text-left flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-900 cursor-pointer"
                                >
                                  {sub.completed ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-3 h-3 text-slate-300 shrink-0" />
                                  )}
                                  <span className={sub.completed ? 'line-through text-slate-400' : ''}>
                                    {sub.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <User className="w-3 h-3 text-slate-400" />
                            {task.assignee}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatDate(task.dueDate)}
                          </span>
                        </div>

                        {/* Ação rápida de transferência de quadrante */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Mover para:</span>
                          <div className="flex items-center gap-1">
                            {QUADRANTS.filter(dest => dest.id !== q.id).map(dest => (
                              <button
                                key={dest.id}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => onMoveQuadrant(task.id, dest.id)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                                title={`Mover para ${dest.title}`}
                              >
                                {dest.id === 'q1_do' ? 'Q1' : dest.id === 'q2_schedule' ? 'Q2' : dest.id === 'q3_delegate' ? 'Q3' : 'Q4'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Drop Zone Visual Indicator */}
                {isDragOver && (
                  <div className="border-2 border-dashed border-blue-400 bg-blue-100/50 rounded-xl p-3 text-center text-xs font-bold text-blue-700 animate-pulse flex items-center justify-center gap-1.5">
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
