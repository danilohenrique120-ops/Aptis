'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/tenant-context';
import { ManagerTask, TaskPriority, TaskStatus, TaskViewTab, EisenhowerQuadrant } from './types';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Trash2,
  Kanban,
  Grid2X2,
  CheckSquare,
  Repeat,
  Edit3,
  GripVertical,
  Sparkles
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';
import { KamishibaiRoutine } from './components/KamishibaiRoutine';
import { ShiftHandoverModal } from './components/ShiftHandoverModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';

const INITIAL_TASKS: ManagerTask[] = [
  {
    id: 'task-1',
    tenantId: 'tenant-1',
    title: 'Auditar parada de linha na Célula 03',
    description: 'Investigar causa raiz de aquecimento anômalo no motor da esteira principal.',
    priority: 'critical',
    status: 'in_progress',
    quadrant: 'q1_do',
    assignee: 'Carlos Silveira',
    sector: 'Usinagem CNC',
    dueDate: '2026-09-08',
    createdAt: '2026-09-04',
    subtasks: [
      { id: 'sub-1', title: 'Desligar e travar disjuntor principal (LOTO)', completed: true },
      { id: 'sub-2', title: 'Medir termografia do mancal e rolamento', completed: true },
      { id: 'sub-3', title: 'Emitir relatório de causa raiz 5 Porquês', completed: false }
    ]
  },
  {
    id: 'task-2',
    tenantId: 'tenant-1',
    title: 'Validar checklist diário de 5S no Turno B',
    description: 'Conferir organização dos carrinhos de ferramentas e bancadas de estamparia.',
    priority: 'medium',
    status: 'todo',
    quadrant: 'q3_delegate',
    assignee: 'Mariana Souza',
    sector: 'Estamparia & Prensas',
    dueDate: '2026-09-12',
    createdAt: '2026-09-05',
    subtasks: [
      { id: 'sub-4', title: 'Verificar sombra de ferramentas no quadro', completed: false },
      { id: 'sub-5', title: 'Fotografar bancada fora de padrão', completed: false }
    ]
  },
  {
    id: 'task-3',
    tenantId: 'tenant-1',
    title: 'Revisar matriz de polivalência pós-férias',
    description: 'Realocar 2 operadores treinados para a linha de prensas durante ausência programada.',
    priority: 'high',
    status: 'review',
    quadrant: 'q2_schedule',
    assignee: 'Carlos Silveira',
    sector: 'Estamparia & Prensas',
    dueDate: '2026-09-15',
    createdAt: '2026-09-02',
    subtasks: [
      { id: 'sub-6', title: 'Consultar operadores nível U/O na matriz', completed: true },
      { id: 'sub-7', title: 'Alinhar escala com RH e líder de turno', completed: false }
    ]
  },
  {
    id: 'task-4',
    tenantId: 'tenant-1',
    title: 'Treinamento de integração do operador júnior',
    description: 'Acompanhar aplicação prática do POP-012 na bancada de montagem e solda.',
    priority: 'low',
    status: 'done',
    quadrant: 'q4_eliminate',
    assignee: 'João Pedro',
    sector: 'Montagem & Solda',
    dueDate: '2026-09-03',
    createdAt: '2026-08-30',
    subtasks: [
      { id: 'sub-8', title: 'Entrega de EPI e crachá de identificação', completed: true },
      { id: 'sub-9', title: 'Avaliação prática de 1ª peça padrão', completed: true }
    ]
  },
  {
    id: 'task-5',
    tenantId: 'tenant-1',
    title: 'Plano de Ação Kaizen: Redução de Setup da Prensa Hidráulica',
    description: 'Padronizar posicionamento dos gabaritos para reduzir tempo de troca de molde em 15 minutos.',
    priority: 'high',
    status: 'in_progress',
    quadrant: 'q2_schedule',
    assignee: 'Mariana Souza',
    sector: 'Estamparia & Prensas',
    dueDate: '2026-09-18',
    createdAt: '2026-09-06',
    subtasks: [
      { id: 'sub-10', title: 'Cronometrar setup atual (SMED)', completed: true },
      { id: 'sub-11', title: 'Separar ferramentas pré-ajustadas fora da prensa', completed: false },
      { id: 'sub-12', title: 'Validar novo procedimento com equipe do Turno C', completed: false }
    ]
  }
];

const COLUMNS: { id: TaskStatus; label: string; bg: string; dot: string }[] = [
  { id: 'todo', label: 'A Fazer', bg: 'bg-slate-100/70', dot: 'bg-slate-400' },
  { id: 'in_progress', label: 'Em Andamento', bg: 'bg-blue-50/70', dot: 'bg-blue-500' },
  { id: 'review', label: 'Em Revisão / Validação', bg: 'bg-amber-50/70', dot: 'bg-amber-500' },
  { id: 'done', label: 'Concluído', bg: 'bg-emerald-50/70', dot: 'bg-emerald-500' }
];

const SECTORS = [
  { id: 'all', label: 'Todos os Setores' },
  { id: 'Usinagem CNC', label: 'Usinagem CNC' },
  { id: 'Estamparia & Prensas', label: 'Estamparia & Prensas' },
  { id: 'Montagem & Solda', label: 'Montagem & Solda' },
  { id: 'Geral', label: 'Geral / Supervisão' }
];

export default function ManagerTasksModule() {
  const { currentTenant } = useTenant();
  const [tasks, setTasks] = useState<ManagerTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskViewTab>('kanban');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Load from localStorage on mount (clean default [])
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('aptis_routine_tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        setTasks([]);
      }
    } catch (e) {
      console.error('Erro ao carregar tarefas da rotina:', e);
      setTasks([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when tasks change
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('aptis_routine_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);
  
  // Drag & Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ManagerTask | null>(null);
  const [isShiftHandoverOpen, setIsShiftHandoverOpen] = useState(false);

  // Sector and search filtering
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.assignee.toLowerCase().includes(search.toLowerCase()) ||
      task.sector.toLowerCase().includes(search.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    const matchesSector = selectedSector === 'all' || 
      task.sector.toLowerCase().includes(selectedSector.toLowerCase()) ||
      selectedSector.toLowerCase().includes(task.sector.toLowerCase());

    return matchesSearch && matchesPriority && matchesSector;
  });

  const handleSaveTask = (taskData: Omit<ManagerTask, 'id' | 'createdAt' | 'tenantId'> & { id?: string }) => {
    if (taskData.id) {
      // Edit existing
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } : t));
    } else {
      // Create new
      const newTask: ManagerTask = {
        id: `task-${Date.now()}`,
        tenantId: currentTenant.id,
        createdAt: new Date().toISOString().split('T')[0],
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        quadrant: taskData.quadrant || 'q2_schedule',
        sector: taskData.sector,
        assignee: taskData.assignee,
        dueDate: taskData.dueDate,
        subtasks: taskData.subtasks || []
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleMoveStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleMoveQuadrant = (taskId: string, newQuadrant: EisenhowerQuadrant) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, quadrant: newQuadrant } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId || !task.subtasks) return task;
      return {
        ...task,
        subtasks: task.subtasks.map(sub => 
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        )
      };
    }));
  };

  const openNewTaskModal = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: ManagerTask) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLDivElement>, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColumn(null);
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, colId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      handleMoveStatus(taskId, colId);
    }
    setDragOverColumn(null);
    setDraggedTaskId(null);
  };

  // SLA Calculation
  const getSlaBadge = (dueDateStr: string, isDone: boolean) => {
    if (isDone) return null;
    const today = new Date().toISOString().split('T')[0];
    if (dueDateStr < today) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
          🔴 Atrasada
        </span>
      );
    } else if (dueDateStr === today) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
          🟡 Vence Hoje
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
          🟢 No Prazo
        </span>
      );
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'critical':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">Crítica</span>;
      case 'high':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">Alta</span>;
      case 'medium':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">Média</span>;
      case 'low':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Baixa</span>;
    }
  };

  const getQuadrantBadge = (q?: EisenhowerQuadrant) => {
    switch (q) {
      case 'q1_do':
        return <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Q1: Fazer Já</span>;
      case 'q2_schedule':
        return <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Q2: Planejar</span>;
      case 'q3_delegate':
        return <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Q3: Delegar</span>;
      case 'q4_eliminate':
        return <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Q4: Eliminar</span>;
      default:
        return null;
    }
  };

  const totalTasks = tasks.length;
  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Header do Módulo Aptis Routine */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-md">
              Aptis Routine • Pilar de Rotina & Governança
            </span>
            <span className="text-xs text-slate-500">Unidade: {currentTenant.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            Aptis Routine: Gestão de Turnos & Rotinas de Liderança
          </h1>
          <p className="text-sm text-slate-600">
            Quadro Kamishibai, priorização matricial Eisenhower e passagem de turno estruturada sem gargalos no WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {tasks.length === 0 ? (
            <button
              onClick={() => setTasks(INITIAL_TASKS)}
              title="Carregar tarefas de demonstração para teste"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Carregar Exemplos
            </button>
          ) : (
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja limpar todas as tarefas e deixar o módulo 100% em branco?')) {
                  setTasks([]);
                }
              }}
              title="Limpar todas as tarefas"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-slate-400 hover:text-rose-600 text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar Tarefas
            </button>
          )}

          <button
            onClick={() => setIsShiftHandoverOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            <Repeat className="w-4 h-4 text-cyan-600" />
            Passagem de Turno
          </button>

          <button
            onClick={openNewTaskModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* KPI Cards Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Demandas</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalTasks}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-medium">
            <span>Urgentes / Críticas</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{criticalTasks}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 text-xs font-medium">
            <span>Em Andamento</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{inProgressTasks}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
            <span>Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{doneTasks}</p>
        </div>
      </div>

      {/* Abas Principais de Visualização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Fluxo Kanban
          </button>

          <button
            onClick={() => setActiveTab('eisenhower')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'eisenhower'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            Matriz de Eisenhower
          </button>

          <button
            onClick={() => setActiveTab('kamishibai')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'kamishibai'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Rotina do Líder (Kamishibai)
          </button>
        </div>

        {/* Filtro Setorial Rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Área:</span>
          {SECTORS.map(sec => (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedSector === sec.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Dinâmico Conforme a Aba Ativa */}
      {activeTab === 'kamishibai' ? (
        <KamishibaiRoutine selectedSector={selectedSector} />
      ) : activeTab === 'eisenhower' ? (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar tarefas por título ou responsável..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
          <EisenhowerMatrix
            tasks={filteredTasks}
            onMoveQuadrant={handleMoveQuadrant}
            onSelectTask={openEditTaskModal}
            onToggleSubtask={handleToggleSubtask}
          />
        </div>
      ) : (
        /* Visualização Kanban com Drag and Drop */
        <div className="space-y-4">
          {/* Barra de Busca e Filtro de Prioridade com Dica de Arraste */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por tarefa, responsável ou setor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
              <GripVertical className="w-3.5 h-3.5 text-slate-400" />
              <span>Arraste os cartões entre as colunas para atualizar o status</span>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Prioridade:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs border border-slate-200 bg-slate-50 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          {tasks.length === 0 && (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-800">Quadro de Rotinas Limpo & Pronto para Uso</h4>
                <p className="text-xs text-slate-600">
                  Cadastre as primeiras pendências, ordens de serviço ou auditorias da sua fábrica para iniciar o fluxo operacional.
                </p>
              </div>
              <button
                onClick={openNewTaskModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Criar 1ª Tarefa
              </button>
            </div>
          )}

          {/* Kanban Board com Drag and Drop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {COLUMNS.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id);
              const isDragOver = dragOverColumn === col.id;

              return (
                <div 
                  key={col.id} 
                  onDragOver={(e) => handleColumnDragOver(e, col.id)}
                  onDragLeave={handleColumnDragLeave}
                  onDrop={(e) => handleColumnDrop(e, col.id)}
                  className={`rounded-xl p-3 border min-h-[480px] flex flex-col transition-all duration-200 ${
                    isDragOver 
                      ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/60 ring-dashed shadow-md scale-[1.01]' 
                      : 'bg-slate-100/60 border-slate-200/80'
                  }`}
                >
                  {/* Coluna Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{col.label}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Lista de Cards */}
                  <div className="space-y-3 flex-1 flex flex-col">
                    {colTasks.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-400 italic flex-1 flex items-center justify-center border-2 border-dashed border-slate-200/60 rounded-xl">
                        Nenhuma tarefa nesta etapa
                      </div>
                    ) : (
                      colTasks.map(task => {
                        const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                        const totalSubtasks = task.subtasks?.length || 0;
                        const subProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
                        const isBeingDragged = draggedTaskId === task.id;

                        return (
                          <div 
                            key={task.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white rounded-xl p-3.5 border shadow-xs hover:shadow-md transition-all relative group cursor-grab active:cursor-grabbing select-none ${
                              isBeingDragged
                                ? 'opacity-35 border-dashed border-blue-500 scale-[0.97]'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {/* Badges de Topo: Grip, Prioridade, Quadrante e SLA */}
                            <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                {getPriorityBadge(task.priority)}
                                {getQuadrantBadge(task.quadrant)}
                              </div>
                              {getSlaBadge(task.dueDate, task.status === 'done')}
                            </div>

                            {/* Setor Tag */}
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                              {task.sector}
                            </div>

                            {/* Título & Descrição */}
                            <h4 
                              onClick={() => openEditTaskModal(task)}
                              className="text-xs font-bold text-slate-800 leading-snug mb-1 hover:text-blue-600 cursor-pointer"
                              title="Clique para editar"
                            >
                              {task.title}
                            </h4>

                            {task.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                                {task.description}
                              </p>
                            )}

                            {/* Progresso de Subtarefas (Pilar 3) */}
                            {totalSubtasks > 0 && (
                              <div className="mt-2 mb-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium mb-1">
                                  <span>Checklist ({completedSubtasks}/{totalSubtasks})</span>
                                  <span className="font-bold text-blue-700">{subProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-blue-600 h-full transition-all duration-300"
                                    style={{ width: `${subProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Informações do Rodapé */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <User className="w-3 h-3 text-slate-400" />
                                {task.assignee}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {formatDate(task.dueDate)}
                              </span>
                            </div>

                            {/* Ações Rápidas: Mover Status, Editar e Excluir */}
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400 font-medium">Mover:</span>
                                {COLUMNS.filter(c => c.id !== task.status).map(dest => (
                                  <button
                                    key={dest.id}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={() => handleMoveStatus(task.id, dest.id)}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors cursor-pointer"
                                    title={`Mover para ${dest.label}`}
                                  >
                                    {dest.label.split(' ')[0]}
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={() => openEditTaskModal(task)}
                                  className="text-slate-400 hover:text-blue-600 p-1 transition-colors cursor-pointer"
                                  title="Editar detalhes"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                  title="Excluir tarefa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Indicador de Drop Zone ao arrastar sobre a coluna */}
                    {isDragOver && (
                      <div className="border-2 border-dashed border-blue-400 bg-blue-100/50 rounded-xl p-3 text-center text-xs font-bold text-blue-700 animate-pulse flex items-center justify-center gap-1.5">
                        <span>Soltar aqui para mover para {col.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Tarefas */}
      <TaskDetailsModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        onSave={handleSaveTask}
        defaultSector={selectedSector}
      />

      {/* Modal de Passagem de Turno */}
      <ShiftHandoverModal
        isOpen={isShiftHandoverOpen}
        onClose={() => setIsShiftHandoverOpen(false)}
        tasks={tasks}
        selectedSector={selectedSector}
      />
    </div>
  );
}
