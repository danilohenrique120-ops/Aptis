'use client';

import React, { useState, useEffect } from 'react';
import { ManagerTask, TaskPriority, TaskStatus, EisenhowerQuadrant, SubTask } from '../types';
import { X, Plus, Trash2, CheckCircle2, Circle, Calendar, User, Tag, Layers, CheckSquare } from 'lucide-react';

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
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
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
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {taskToEdit ? 'Editar Tarefa' : 'Nova Demanda'}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {taskToEdit ? taskToEdit.title : 'Cadastrar Demanda de Liderança'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Título da Tarefa *</label>
            <input
              type="text"
              required
              placeholder="Ex: Auditoria de segurança na bancada de corte"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Instruções Operacionais</label>
            <textarea
              rows={2}
              placeholder="Descreva detalhes, peças envolvidas ou procedimentos..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Matriz de Eisenhower & Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade Geral</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="critical">🚨 Crítica (Impeditiva)</option>
                <option value="high">🔥 Alta</option>
                <option value="medium">🔹 Média</option>
                <option value="low">⚪ Baixa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quadrante Eisenhower</label>
              <select
                value={quadrant}
                onChange={e => setQuadrant(e.target.value as EisenhowerQuadrant)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="q1_do">Q1: Urgente & Importante (Fazer Já)</option>
                <option value="q2_schedule">Q2: Importante / Não Urg. (Agendar)</option>
                <option value="q3_delegate">Q3: Urgente / Pouco Imp. (Delegar)</option>
                <option value="q4_eliminate">Q4: Não Urg. / Baixo Imp. (Eliminar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kanban</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="review">Em Revisão / Validação</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Data Limite (SLA)</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Setor & Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Setor / Linha</label>
              <input
                type="text"
                value={sector}
                onChange={e => setSector(e.target.value)}
                placeholder="Ex: Usinagem CNC"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável</label>
              <input
                type="text"
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                placeholder="Ex: Carlos Silveira"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Checklist de Subtarefas */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>Checklist de Execução ({completedCount}/{subtasks.length})</span>
              </div>
              {subtasks.length > 0 && (
                <span className="text-xs font-bold text-blue-700">{progressPercent}%</span>
              )}
            </div>

            {subtasks.length > 0 && (
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3 pr-1">
              {subtasks.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic py-1">Nenhum sub-item adicionado.</p>
              ) : (
                subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="flex items-center gap-2 text-left flex-1 cursor-pointer"
                    >
                      {sub.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={`text-xs ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {sub.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 transition-colors cursor-pointer"
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
                className="flex-1 text-xs border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {taskToEdit ? 'Salvar Alterações' : 'Criar Demanda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
