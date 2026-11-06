'use client';

import React, { useState, useEffect } from 'react';
import { ManagerTask, TaskPriority, TaskStatus, EisenhowerQuadrant, SubTask } from '../types';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  CheckSquare
} from 'lucide-react';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ManagerTask | null;
  onSave: (taskData: Omit<ManagerTask, 'id' | 'createdAt' | 'tenantId'> & { id?: string }) => void;
  defaultSector?: string;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  onSave,
  defaultSector = 'Usinagem CNC'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>('q2_schedule');
  const [sector, setSector] = useState(defaultSector);
  const [assignee, setAssignee] = useState('Carlos Silveira');
  const [dueDate, setDueDate] = useState('2026-09-12');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
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

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setQuadrant(taskToEdit.quadrant || 'q2_schedule');
      setSector(taskToEdit.sector || defaultSector);
      setAssignee(taskToEdit.assignee);
      setDueDate(taskToEdit.dueDate);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setQuadrant('q2_schedule');
      setSector(defaultSector === 'all' ? 'Usinagem CNC' : defaultSector);
      setAssignee('Carlos Silveira');
      setDueDate('2026-09-12');
      setSubtasks([]);
    }
  }, [taskToEdit, isOpen, defaultSector]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };

    setSubtasks(prev => [...prev, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(s => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...(taskToEdit ? { id: taskToEdit.id } : {}),
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      quadrant,
      sector,
      assignee: assignee.trim() || 'Supervisor de Linha',
      dueDate,
      subtasks
    });

    onClose();
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const progressPercent =
    subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const inputClass = tintedGlass
    ? 'aptis-glass-input rounded-xl'
    : 'bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-3xl max-w-xl w-full p-6 my-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          tintedGlass
            ? 'aptis-glass-modal text-white'
            : 'bg-white text-slate-900 shadow-2xl border border-slate-200'
        }`}
      >
        {/* Orbes de Refração Interna do Modal (Estilo Cimel Vídeo 1) */}
        {tintedGlass && (
          <>
            <div
              className="absolute -top-20 -right-16 w-64 h-64 rounded-full opacity-35 blur-3xl pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(37, 99, 235, 0.75) 0%, rgba(6, 182, 212, 0.3) 60%, transparent 75%)'
              }}
            />
            <div
              className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full opacity-25 blur-3xl pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 70%)'
              }}
            />
          </>
        )}

        {/* Header */}
        <div
          className={`relative z-10 flex items-center justify-between pb-4 border-b ${
            tintedGlass ? 'border-white/[0.1]' : 'border-slate-200'
          }`}
        >
          <div>
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                tintedGlass
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                  : 'text-blue-600 bg-blue-50 border-blue-200'
              }`}
            >
              {taskToEdit ? 'Editar Tarefa' : 'Nova Demanda Operacional'}
            </span>
            <h2
              className={`text-lg font-black mt-1.5 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              {taskToEdit ? taskToEdit.title : 'Cadastrar Demanda de Liderança'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 space-y-4 py-4 max-h-[72vh] overflow-y-auto pr-1"
        >
          <div>
            <label
              className={`block text-xs font-bold mb-1.5 ${
                tintedGlass ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Auditoria de segurança na bancada de corte"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full text-sm p-2.5 ${inputClass}`}
            />
          </div>

          <div>
            <label
              className={`block text-xs font-bold mb-1.5 ${
                tintedGlass ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              Descrição / Instruções Operacionais
            </label>
            <textarea
              rows={2}
              placeholder="Descreva detalhes, peças envolvidas ou procedimentos..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full text-xs p-2.5 ${inputClass}`}
            />
          </div>

          {/* Matriz de Eisenhower & Prioridade em Sub-card de Vidro */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-slate-50 border border-slate-200'
            }`}
          >
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Prioridade Geral
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className={`w-full text-xs p-2 cursor-pointer ${inputClass}`}
              >
                <option value="critical">🚨 Crítica (Impeditiva)</option>
                <option value="high">🔥 Alta</option>
                <option value="medium">🔹 Média</option>
                <option value="low">⚪ Baixa</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Quadrante Eisenhower
              </label>
              <select
                value={quadrant}
                onChange={e => setQuadrant(e.target.value as EisenhowerQuadrant)}
                className={`w-full text-xs p-2 cursor-pointer ${inputClass}`}
              >
                <option value="q1_do">Q1: Urgente & Importante (Fazer Já)</option>
                <option value="q2_schedule">Q2: Importante / Não Urg. (Agendar)</option>
                <option value="q3_delegate">Q3: Urgente / Pouco Imp. (Delegar)</option>
                <option value="q4_eliminate">Q4: Não Urg. / Baixo Imp. (Eliminar)</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Status Kanban
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className={`w-full text-xs p-2 cursor-pointer ${inputClass}`}
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="review">Em Revisão / Validação</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Data Limite (SLA)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={`w-full text-xs p-2 ${inputClass}`}
              />
            </div>
          </div>

          {/* Setor & Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  tintedGlass ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                Setor / Linha
              </label>
              <input
                type="text"
                value={sector}
                onChange={e => setSector(e.target.value)}
                placeholder="Ex: Usinagem CNC"
                className={`w-full text-xs p-2.5 ${inputClass}`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  tintedGlass ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                Responsável
              </label>
              <input
                type="text"
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                placeholder="Ex: Carlos Silveira"
                className={`w-full text-xs p-2.5 ${inputClass}`}
              />
            </div>
          </div>

          {/* Checklist de Subtarefas em Sub-card de Vidro */}
          <div
            className={`rounded-2xl p-4 ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'border border-slate-200 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  tintedGlass ? 'text-white' : 'text-slate-800'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                <span>
                  Checklist de Execução ({completedCount}/{subtasks.length})
                </span>
              </div>
              {subtasks.length > 0 && (
                <span
                  className={`text-xs font-mono font-bold ${
                    tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                  }`}
                >
                  {progressPercent}%
                </span>
              )}
            </div>

            {subtasks.length > 0 && (
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden mb-3 ${
                  tintedGlass ? 'bg-white/[0.1]' : 'bg-slate-200'
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.7)'
                  }}
                />
              </div>
            )}

            <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3 pr-1">
              {subtasks.length === 0 ? (
                <p
                  className={`text-[11px] italic py-1 ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  Nenhum sub-item adicionado.
                </p>
              ) : (
                subtasks.map(sub => (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-xl border ${
                      tintedGlass
                        ? 'bg-white/[0.05] border-white/[0.1]'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="flex items-center gap-2 text-left flex-1 cursor-pointer"
                    >
                      {sub.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle
                          className={`w-4 h-4 shrink-0 ${
                            tintedGlass ? 'text-slate-400' : 'text-slate-300'
                          }`}
                        />
                      )}
                      <span
                        className={`text-xs ${
                          sub.completed
                            ? 'line-through opacity-50'
                            : tintedGlass
                            ? 'text-slate-100 font-medium'
                            : 'text-slate-700 font-medium'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        tintedGlass
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                          : 'text-slate-300 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar sub-etapa (ex: Travar disjuntor de segurança)..."
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                className={`flex-1 text-xs px-3 py-2 ${inputClass}`}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-2 text-white rounded-xl text-xs font-bold cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  border: '1px solid rgba(165, 243, 252, 0.4)'
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div
            className={`flex items-center justify-end gap-3 pt-3 border-t ${
              tintedGlass ? 'border-white/[0.1]' : 'border-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                tintedGlass
                  ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white rounded-xl transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                border: '1px solid rgba(165, 243, 252, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
              }}
            >
              {taskToEdit ? 'Salvar Alterações' : 'Criar Demanda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
