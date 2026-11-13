'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/tenant-context';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import {
  ManagerTask,
  TaskPriority,
  TaskStatus,
  TaskViewTab,
  EisenhowerQuadrant,
  ManagerFollowUpItem,
  FollowUpStatus,
  FollowUpUpdate
} from './types';
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
  Sparkles,
  Eye,
  Building2,
  FileSpreadsheet,
  List,
  ArrowUpDown,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';
import { KamishibaiRoutine } from './components/KamishibaiRoutine';
import { ShiftHandoverModal } from './components/ShiftHandoverModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { ManagerFollowUpPanel } from './components/ManagerFollowUpPanel';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';

const INITIAL_FOLLOW_UPS: ManagerFollowUpItem[] = [
  {
    id: 'fup-1',
    tenantId: 'tenant-1',
    title: 'Homologação emergencial de novo fornecedor de matéria-prima (Aço 1045)',
    context:
      'Atraso no lote de barras laminadas do fornecedor atual ameaça o cronograma da linha de prensas no próximo mês. Compras está avaliando amostra do fornecedor Beta com urgência.',
    counterpart: 'Eng. Suprimentos (Mariana) & Lab Metalúrgico',
    sector: 'Estamparia & Prensas',
    attentionLevel: 'critico',
    status: 'aguardando_retorno',
    nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: '2026-09-20',
    updatedAt: '2026-09-25',
    history: [
      {
        id: 'h-1',
        date: '2026-09-20',
        note: 'Solicitada amostra de tração e dureza para o fornecedor alternativo.',
        author: 'Carlos Silveira'
      },
      {
        id: 'h-2',
        date: '2026-09-25',
        note: 'Laboratório confirmou recebimento dos corpos de prova. Laudo prometido em 48h.',
        author: 'Carlos Silveira'
      }
    ]
  },
  {
    id: 'fup-2',
    tenantId: 'tenant-1',
    title: 'Alinhamento com Diretoria e RH sobre nova escala de 3º Turno',
    context:
      'Proposta de adequação da escala 6x2 no setor de Usinagem CNC para atender o aumento na carteira de pedidos sem gerar sobrecarga ou passivo de horas extras.',
    counterpart: 'Gerência Geral de Operações & RH Corporativo',
    sector: 'Usinagem CNC',
    attentionLevel: 'alto',
    status: 'agendar_alinhamento',
    nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: '2026-09-22',
    updatedAt: '2026-09-26',
    history: [
      {
        id: 'h-3',
        date: '2026-09-22',
        note: 'Simulação de custos de adicional noturno enviada para controladoria.',
        author: 'Carlos Silveira'
      }
    ]
  },
  {
    id: 'fup-3',
    tenantId: 'tenant-1',
    title: 'Monitoramento da fase de garantia pós-reforma da Ponte Rolante 02',
    context:
      'Acompanhar medição de vibração e alinhamento dos trilhos durante as primeiras 200 horas de operação pós-revisão geral feita pela contratada.',
    counterpart: 'Manutenção Preditiva & Engenheiro Residente',
    sector: 'Montagem & Solda',
    attentionLevel: 'medio',
    status: 'em_monitoramento',
    nextFollowUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: '2026-09-18',
    updatedAt: '2026-09-24',
    history: [
      {
        id: 'h-4',
        date: '2026-09-24',
        note: 'Primeira análise de vibração aprovada dentro dos parâmetros ISO 10816.',
        author: 'Carlos Silveira'
      }
    ]
  }
];

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
    description:
      'Padronizar posicionamento dos gabaritos para reduzir tempo de troca de molde em 15 minutos.',
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

const COLUMNS: {
  id: TaskStatus;
  label: string;
  dot: string;
  glow: string;
}[] = [
  { id: 'todo', label: 'A Fazer', dot: 'bg-slate-400', glow: 'shadow-[0_0_8px_#94a3b8]' },
  { id: 'in_progress', label: 'Em Andamento', dot: 'bg-blue-400', glow: 'shadow-[0_0_10px_#60a5fa]' },
  { id: 'review', label: 'Em Revisão / Validação', dot: 'bg-amber-400', glow: 'shadow-[0_0_10px_#fbbf24]' },
  { id: 'done', label: 'Concluído', dot: 'bg-emerald-400', glow: 'shadow-[0_0_10px_#34d399]' }
];

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

const STATUS_ORDER: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  review: 2,
  done: 3
};

export default function ManagerTasksModule() {
  const { currentTenant } = useTenant();
  const { sectors: plantSectors } = usePlantSectors();
  const safePlantSectors = Array.isArray(plantSectors) ? plantSectors : [];
  const sectorsList = [
    { id: 'all', label: 'Todos os Setores' },
    ...safePlantSectors.map(s => ({ id: s.name, label: s.name }))
  ];
  const [tasks, setTasks] = useTenantStorage<ManagerTask[]>('manager-tasks', 'tasks', INITIAL_TASKS);
  const [followUps, setFollowUps] = useTenantStorage<ManagerFollowUpItem[]>(
    'manager-tasks',
    'follow_ups',
    INITIAL_FOLLOW_UPS
  );
  const [activeTab, setActiveTab] = useState<TaskViewTab>('kanban');
  const [tasksViewMode, setTasksViewMode] = useState<'kanban' | 'list'>('kanban');
  const [listStatusFilter, setListStatusFilter] = useState<'all' | TaskStatus>('all');
  const [listSortBy, setListSortBy] = useState<'dueDate' | 'priority' | 'status' | 'title'>('dueDate');
  const [listSortDir, setListSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedListSubtasks, setExpandedListSubtasks] = useState<Record<string, boolean>>({});
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
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

  // Drag & Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ManagerTask | null>(null);
  const [isShiftHandoverOpen, setIsShiftHandoverOpen] = useState(false);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);

  const handleImportTasksExcel = (rows: Record<string, any>[]) => {
    const newTasks: ManagerTask[] = rows.map((row, idx) => {
      const rawPriority = (row.priority || '').trim().toLowerCase();
      let priority: TaskPriority = 'medium';
      if (rawPriority.includes('crit')) priority = 'critical';
      else if (rawPriority.includes('alt')) priority = 'high';
      else if (rawPriority.includes('baix')) priority = 'low';

      const rawStatus = (row.status || '').trim().toLowerCase();
      let status: TaskStatus = 'todo';
      if (rawStatus.includes('andam') || rawStatus.includes('prog')) status = 'in_progress';
      else if (rawStatus.includes('revis') || rawStatus.includes('valid')) status = 'review';
      else if (rawStatus.includes('conc') || rawStatus.includes('feito')) status = 'done';

      let quadrant: EisenhowerQuadrant = 'q2_schedule';
      if (priority === 'critical') quadrant = 'q1_do';
      else if (priority === 'high') quadrant = 'q1_do';
      else if (priority === 'low') quadrant = 'q3_delegate';

      return {
        id: `task-imp-${Date.now()}-${idx}`,
        tenantId: currentTenant.id,
        title: (row.title || 'Tarefa Importada').trim(),
        description: (row.description || '').trim(),
        priority,
        status,
        quadrant,
        assignee: (row.assignee || 'Carlos Silveira').trim(),
        sector: (row.sector || selectedSector || 'Usinagem CNC').trim(),
        dueDate: (
          row.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        ).trim(),
        createdAt: new Date().toISOString().split('T')[0],
        subtasks: []
      };
    });

    setTasks(prev => [...newTasks, ...prev]);

    return {
      successCount: newTasks.length,
      message: `${newTasks.length} tarefas importadas com sucesso no quadro de rotina!`
    };
  };

  // Follow-up Handlers
  const handleSaveFollowUp = (
    data: Omit<ManagerFollowUpItem, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'tenantId'> & {
      id?: string;
      history?: FollowUpUpdate[];
    }
  ) => {
    const nowStr = new Date().toISOString().split('T')[0];
    if (data.id) {
      setFollowUps(prev =>
        prev.map(item =>
          item.id === data.id
            ? {
                ...item,
                ...data,
                updatedAt: nowStr
              }
            : item
        )
      );
    } else {
      const newItem: ManagerFollowUpItem = {
        id: `fup-${Date.now()}`,
        tenantId: currentTenant.id,
        createdAt: nowStr,
        updatedAt: nowStr,
        title: data.title,
        context: data.context,
        counterpart: data.counterpart,
        sector: data.sector,
        attentionLevel: data.attentionLevel,
        status: data.status,
        nextFollowUpDate: data.nextFollowUpDate,
        history: data.history || []
      };
      setFollowUps(prev => [newItem, ...prev]);
    }
  };

  const handleDeleteFollowUp = (id: string) => {
    setFollowUps(prev => prev.filter(item => item.id !== id));
  };

  const handleAddQuickFollowUpUpdate = (id: string, note: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newUpdate: FollowUpUpdate = {
      id: `up-${Date.now()}`,
      date: today,
      note,
      author: 'Gestor'
    };
    setFollowUps(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        return {
          ...item,
          updatedAt: today,
          history: [newUpdate, ...(item.history || [])]
        };
      })
    );
  };

  const handleChangeFollowUpStatus = (id: string, newStatus: FollowUpStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setFollowUps(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        return {
          ...item,
          status: newStatus,
          updatedAt: today
        };
      })
    );
  };

  // Sector and search filtering
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.assignee.toLowerCase().includes(search.toLowerCase()) ||
      task.sector.toLowerCase().includes(search.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    const matchesSector =
      selectedSector === 'all' ||
      task.sector.toLowerCase().includes(selectedSector.toLowerCase()) ||
      selectedSector.toLowerCase().includes(task.sector.toLowerCase());

    return matchesSearch && matchesPriority && matchesSector;
  });

  const handleSaveTask = (
    taskData: Omit<ManagerTask, 'id' | 'createdAt' | 'tenantId'> & { id?: string }
  ) => {
    if (taskData.id) {
      setTasks(prev => prev.map(t => (t.id === taskData.id ? { ...t, ...taskData } : t)));
    } else {
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
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  const handleMoveQuadrant = (taskId: string, newQuadrant: EisenhowerQuadrant) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, quadrant: newQuadrant } : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId || !task.subtasks) return task;
        return {
          ...task,
          subtasks: task.subtasks.map(sub =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          )
        };
      })
    );
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

  // SLA Calculation (Estilizado como as pílulas translúcidas do Packing Board - Vídeo 1 Cimel)
  const getSlaBadge = (dueDateStr: string, isDone: boolean) => {
    if (isDone) return null;
    const today = new Date().toISOString().split('T')[0];
    if (dueDateStr < today) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            tintedGlass
              ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
              : 'bg-rose-100 text-rose-700 border-rose-200'
          }`}
        >
          🔴 Atrasada
        </span>
      );
    } else if (dueDateStr === today) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            tintedGlass
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}
        >
          🟡 Vence Hoje
        </span>
      );
    } else {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
            tintedGlass
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          🟢 No Prazo
        </span>
      );
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'critical':
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              tintedGlass
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
                : 'bg-rose-100 text-rose-800 border-rose-200'
            }`}
          >
            Crítica
          </span>
        );
      case 'high':
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              tintedGlass
                ? 'bg-orange-500/20 text-orange-300 border-orange-400/35'
                : 'bg-orange-100 text-orange-800 border-orange-200'
            }`}
          >
            Alta
          </span>
        );
      case 'medium':
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              tintedGlass
                ? 'bg-blue-500/20 text-blue-300 border-blue-400/35'
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}
          >
            Média
          </span>
        );
      case 'low':
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              tintedGlass
                ? 'bg-slate-500/20 text-slate-300 border-slate-400/30'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Baixa
          </span>
        );
    }
  };

  const getQuadrantBadge = (q?: EisenhowerQuadrant) => {
    switch (q) {
      case 'q1_do':
        return (
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-rose-500/15 text-rose-300 border-rose-400/30'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            Q1: Fazer Já
          </span>
        );
      case 'q2_schedule':
        return (
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            Q2: Planejar
          </span>
        );
      case 'q3_delegate':
        return (
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            Q3: Delegar
          </span>
        );
      case 'q4_eliminate':
        return (
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-white/[0.06] text-slate-300 border-white/[0.15]'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            Q4: Eliminar
          </span>
        );
      default:
        return null;
    }
  };

  const totalTasks = tasks.length;
  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  // Configuração da Barra de Abas Meniscus (Inspirada no Vídeo 2 - Meniscus)
  const routineTabs: Array<{
    id: TaskViewTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    glowColor: string;
    beadGradient: string;
    badgeAlert?: boolean;
  }> = [
    {
      id: 'kanban',
      label: 'Kanban & Lista',
      icon: Kanban,
      glowColor: 'rgba(59, 130, 246, 0.58)',
      beadGradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)'
    },
    {
      id: 'eisenhower',
      label: 'Matriz de Eisenhower',
      icon: Grid2X2,
      glowColor: 'rgba(139, 92, 246, 0.58)',
      beadGradient: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)'
    },
    {
      id: 'kamishibai',
      label: 'Rotina do Líder (Kamishibai)',
      icon: CheckSquare,
      glowColor: 'rgba(16, 185, 129, 0.58)',
      beadGradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)'
    },
    {
      id: 'followup',
      label: 'Assuntos sob Atenção (Follow-up)',
      icon: Eye,
      glowColor: 'rgba(245, 158, 11, 0.58)',
      beadGradient: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
      badgeAlert:
        followUps.filter(f => f.status !== 'encerrado' && f.attentionLevel === 'critico').length > 0
    }
  ];

  const activeMeniscusTab =
    routineTabs.find(t => t.id === activeTab) || routineTabs[0];

  const handleToggleListSort = (field: 'dueDate' | 'priority' | 'status' | 'title') => {
    if (listSortBy === field) {
      setListSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setListSortBy(field);
      setListSortDir('asc');
    }
  };

  const toggleExpandSubtasks = (taskId: string) => {
    setExpandedListSubtasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const listTasks = filteredTasks
    .filter(t => listStatusFilter === 'all' || t.status === listStatusFilter)
    .slice()
    .sort((a, b) => {
      let cmp = 0;
      if (listSortBy === 'dueDate') {
        cmp = a.dueDate.localeCompare(b.dueDate);
      } else if (listSortBy === 'priority') {
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      } else if (listSortBy === 'status') {
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      } else if (listSortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      }
      return listSortDir === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="space-y-6 w-full">
      {/* =====================================================================
          1. HEADER EXECUTIVO EM VIDRO ESPECULAR (Estilo Cimel Vídeo 1)
         ===================================================================== */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-500 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className="absolute -top-16 -right-12 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.65) 0%, rgba(6, 182, 212, 0.25) 60%, transparent 75%)'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'bg-blue-500/20 text-blue-200 border-blue-400/35'
                    : 'text-blue-700 bg-blue-50 border-blue-200'
                }`}
              >
                Módulo Operacional de Liderança
              </span>
              <span
                className={`text-xs ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Unidade: {currentTenant.name}
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              Aptis Routine • Gestão da Rotina & Kamishibai
            </h1>
            <p
              className={`text-xs sm:text-sm mt-1 ${
                tintedGlass ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Governança industrial de rotinas (Kamishibai), priorização matricial (Eisenhower), passagem de turno e controle de SLA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {tasks.length === 0 ? (
              <button
                onClick={() => setTasks(INITIAL_TASKS)}
                title="Carregar tarefas de demonstração para teste"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Carregar Exemplos
              </button>
            ) : (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Tem certeza que deseja limpar todas as tarefas e deixar o módulo 100% em branco?'
                    )
                  ) {
                    setTasks([]);
                  }
                }}
                title="Limpar todas as tarefas"
                className={`inline-flex items-center gap-1 px-2.5 py-2 text-xs transition-colors cursor-pointer rounded-xl ${
                  tintedGlass
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                    : 'text-slate-400 hover:text-rose-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Tarefas
              </button>
            )}

            <button
              onClick={() => setIsExcelImporterOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}
              title="Importar tarefas a partir de planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Importar Excel
            </button>

            <button
              onClick={() => setIsShiftHandoverOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-subcard text-white hover:border-cyan-400/40'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              <Repeat className="w-4 h-4 text-cyan-400" />
              Passagem de Turno
            </button>

            <button
              onClick={openNewTaskModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                border: '1px solid rgba(165, 243, 252, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
              }}
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </button>
          </div>
        </div>

        {/* KPI Cards Rápidos em Sub-cápsulas de Vidro (Estilo Cimel Vídeo 1) */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-white/[0.08]">
          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>Total Demandas</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              {totalTasks}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-rose-300' : 'text-rose-600'
              }`}
            >
              <span>Urgentes / Críticas</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-rose-400' : 'text-rose-600'
              }`}
            >
              {criticalTasks}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-cyan-300' : 'text-blue-600'
              }`}
            >
              <span>Em Andamento</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-cyan-300' : 'text-blue-600'
              }`}
            >
              {inProgressTasks}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-600'
              }`}
            >
              <span>Concluídas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-600'
              }`}
            >
              {doneTasks}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. BARRA DE ABAS MENISCUS LIQUID BEAD + FILTRO SETORIAL (Vídeo 2 - Meniscus)
         ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative inline-flex self-start">
          {/* Halo Cromático Meniscus projetado sob a cápsula */}
          <div
            className="absolute -inset-2 rounded-full blur-2xl opacity-45 pointer-events-none transition-all duration-500"
            style={{
              background: `radial-gradient(circle, ${activeMeniscusTab.glowColor} 0%, transparent 70%)`
            }}
          />

          <div className="aptis-meniscus-track rounded-full p-1.5 flex flex-wrap items-center gap-1 relative z-10">
            {routineTabs.map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-500 cursor-pointer ${
                    isSelected
                      ? 'text-white scale-[1.03]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={
                    isSelected
                      ? {
                          background: tab.beadGradient,
                          boxShadow: `0 0 22px ${tab.glowColor}, inset 0 1.5px 1px rgba(255,255,255,0.65)`
                        }
                      : undefined
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badgeAlert && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#fb7185]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro Setorial em Cápsula de Vidro (Estilo Ardena Vídeo 3) */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl ${
            tintedGlass
              ? 'aptis-glass-subcard text-white'
              : 'bg-white border border-slate-200 shadow-2xs text-slate-800'
          }`}
        >
          <label
            htmlFor="sector-select"
            className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
              tintedGlass ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Área / Setor:</span>
          </label>
          <select
            id="sector-select"
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer min-w-[180px] ${
              tintedGlass ? 'text-cyan-300' : 'text-slate-900'
            }`}
          >
            {sectorsList.map(sec => (
              <option key={sec.id} value={sec.id} className="bg-slate-900 text-white py-1">
                {sec.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================================
          3. CONTEÚDO DINÂMICO CONFORME A ABA ATIVA
         ===================================================================== */}
      {activeTab === 'followup' ? (
        <ManagerFollowUpPanel
          followUps={followUps}
          onSaveFollowUp={handleSaveFollowUp}
          onDeleteFollowUp={handleDeleteFollowUp}
          onAddQuickUpdate={handleAddQuickFollowUpUpdate}
          onChangeStatus={handleChangeFollowUpStatus}
          onResetExamples={() => setFollowUps(INITIAL_FOLLOW_UPS)}
          selectedSectorFilter={selectedSector}
        />
      ) : activeTab === 'kamishibai' ? (
        <KamishibaiRoutine selectedSector={selectedSector} />
      ) : activeTab === 'eisenhower' ? (
        <div className="space-y-4">
          <div
            className={`p-3.5 rounded-2xl flex flex-col sm:flex-row gap-3 ${
              tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light'
            }`}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar tarefas por título ou responsável..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 text-xs rounded-xl focus:outline-none border ${
                  tintedGlass
                    ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder-slate-400 focus:border-cyan-400/50'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
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
        /* ===================================================================
           QUADRO KANBAN / MODO LISTA EM DUPLA CAMADA DE VIDRO
           =================================================================== */
        <div className="space-y-4">
          {/* Barra de Busca, Filtro de Prioridade e Seletor Kanban vs Lista */}
          <div
            className={`flex flex-col lg:flex-row gap-3 p-3.5 rounded-2xl items-stretch lg:items-center ${
              tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por tarefa, responsável ou setor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 text-xs rounded-xl focus:outline-none border ${
                  tintedGlass
                    ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder-slate-400 focus:border-cyan-400/50'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>

            {tasksViewMode === 'kanban' && (
              <div
                className={`hidden xl:flex items-center gap-1.5 text-[11px] px-3 py-2 rounded-xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-slate-300'
                    : 'text-slate-500 bg-slate-50 border border-slate-200'
                }`}
              >
                <GripVertical className="w-3.5 h-3.5 text-cyan-400" />
                <span>Arraste os cartões entre as colunas para atualizar o status</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5 justify-between sm:justify-end">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-slate-200'
                    : 'bg-slate-50 border border-slate-200 text-slate-700'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium">Prioridade:</span>
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className={`text-xs font-bold bg-transparent focus:outline-none cursor-pointer ${
                    tintedGlass ? 'text-cyan-300' : 'text-slate-900'
                  }`}
                >
                  <option value="all" className="bg-slate-900 text-white">
                    Todas as Prioridades
                  </option>
                  <option value="critical" className="bg-slate-900 text-white">
                    Crítica
                  </option>
                  <option value="high" className="bg-slate-900 text-white">
                    Alta
                  </option>
                  <option value="medium" className="bg-slate-900 text-white">
                    Média
                  </option>
                  <option value="low" className="bg-slate-900 text-white">
                    Baixa
                  </option>
                </select>
              </div>

              {/* Alternador Visão Kanban vs Modo Lista */}
              <div
                className={`flex items-center gap-1 p-1 rounded-xl text-xs shrink-0 ${
                  tintedGlass ? 'aptis-meniscus-track' : 'bg-slate-100 border border-slate-200'
                }`}
                role="group"
                aria-label="Modo de visualização das tarefas"
              >
                <button
                  type="button"
                  onClick={() => setTasksViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    tasksViewMode === 'kanban'
                      ? tintedGlass
                        ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-[0_0_14px_rgba(59,130,246,0.45)]'
                        : 'bg-white text-blue-700 shadow-xs'
                      : tintedGlass
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setTasksViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    tasksViewMode === 'list'
                      ? tintedGlass
                        ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-[0_0_14px_rgba(59,130,246,0.45)]'
                        : 'bg-white text-blue-700 shadow-xs'
                      : tintedGlass
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Modo Lista
                </button>
              </div>
            </div>
          </div>

          {tasks.length === 0 && (
            <div
              className={`rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
              }`}
            >
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold">Quadro de Rotinas Limpo & Pronto para Uso</h4>
                <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                  Cadastre as primeiras pendências, ordens de serviço ou auditorias da sua fábrica para iniciar o fluxo operacional.
                </p>
              </div>
              <button
                onClick={openNewTaskModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Criar 1ª Tarefa
              </button>
            </div>
          )}

          {tasksViewMode === 'kanban' ? (
          /* COLUNAS DO PACKING BOARD KANBAN EM DUPLA CAMADA DE VIDRO (Vídeo 1 Cimel) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {COLUMNS.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id);
              const isDragOver = dragOverColumn === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={e => handleColumnDragOver(e, col.id)}
                  onDragLeave={handleColumnDragLeave}
                  onDrop={e => handleColumnDrop(e, col.id)}
                  className={`rounded-3xl p-4 min-h-[500px] max-h-[740px] flex flex-col transition-all duration-300 ${
                    isDragOver
                      ? 'ring-2 ring-cyan-400/70 scale-[1.01] bg-cyan-500/10 border border-cyan-400/50'
                      : tintedGlass
                      ? 'aptis-glass-dark'
                      : 'aptis-glass-light'
                  }`}
                >
                  {/* Coluna Header */}
                  <div
                    className={`flex items-center justify-between pb-3.5 mb-3.5 border-b ${
                      tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot} ${col.glow}`} />
                      <h3
                        className={`text-xs font-extrabold uppercase tracking-wider ${
                          tintedGlass ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {col.label}
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        tintedGlass
                          ? 'bg-white/[0.07] text-cyan-200 border-white/[0.14]'
                          : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                      }`}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Lista de Cards (2ª Camada de Vidro Aninhado - Estilo Cimel Packing Board) */}
                  <div className="space-y-3 flex-1 flex flex-col overflow-y-auto max-h-[630px] pr-1">
                    {colTasks.length === 0 ? (
                      <div
                        className={`py-10 text-center text-xs italic flex-1 flex items-center justify-center border border-dashed rounded-2xl ${
                          tintedGlass
                            ? 'text-slate-500 border-white/[0.1]'
                            : 'text-slate-400 border-slate-300'
                        }`}
                      >
                        Nenhuma tarefa nesta etapa
                      </div>
                    ) : (
                      colTasks.map(task => {
                        const completedSubtasks =
                          task.subtasks?.filter(s => s.completed).length || 0;
                        const totalSubtasks = task.subtasks?.length || 0;
                        const subProgress =
                          totalSubtasks > 0
                            ? Math.round((completedSubtasks / totalSubtasks) * 100)
                            : 0;
                        const isBeingDragged = draggedTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={e => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                            className={`rounded-2xl p-4 transition-all duration-300 relative group cursor-grab active:cursor-grabbing select-none ${
                              isBeingDragged
                                ? 'opacity-35 border-dashed border-cyan-400 scale-[0.97]'
                                : tintedGlass
                                ? 'aptis-glass-subcard aptis-glass-subcard-interactive'
                                : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1'
                            }`}
                          >
                            {/* Badges de Topo: Grip, Prioridade, Quadrante e SLA */}
                            <div className="flex items-center justify-between gap-1.5 mb-2.5 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <GripVertical
                                  className={`w-3.5 h-3.5 transition-colors ${
                                    tintedGlass
                                      ? 'text-slate-500 group-hover:text-cyan-300'
                                      : 'text-slate-300 group-hover:text-slate-600'
                                  }`}
                                />
                                {getPriorityBadge(task.priority)}
                                {getQuadrantBadge(task.quadrant)}
                              </div>
                              {getSlaBadge(task.dueDate, task.status === 'done')}
                            </div>

                            {/* Setor Tag */}
                            <div
                              className={`text-[10px] font-bold uppercase tracking-wider mb-1 font-mono ${
                                tintedGlass ? 'text-cyan-300/80' : 'text-slate-400'
                              }`}
                            >
                              {task.sector}
                            </div>

                            {/* Título & Descrição */}
                            <h4
                              onClick={() => openEditTaskModal(task)}
                              className={`text-xs sm:text-[13px] font-bold leading-snug mb-1.5 cursor-pointer transition-colors ${
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
                                className={`text-[11px] line-clamp-2 mb-3 leading-relaxed ${
                                  tintedGlass ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {task.description}
                              </p>
                            )}

                            {/* Progresso de Subtarefas com Barra Luminosa (Estilo Halvo Vídeo 4) */}
                            {totalSubtasks > 0 && (
                              <div
                                className={`mt-2 mb-3 p-2.5 rounded-xl border ${
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
                                  <span>
                                    Checklist ({completedSubtasks}/{totalSubtasks})
                                  </span>
                                  <span
                                    className={`font-mono font-bold ${
                                      tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                                    }`}
                                  >
                                    {subProgress}%
                                  </span>
                                </div>
                                <div
                                  className={`w-full h-1.5 rounded-full overflow-hidden ${
                                    tintedGlass ? 'bg-white/[0.1]' : 'bg-slate-200'
                                  }`}
                                >
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${subProgress}%`,
                                      background:
                                        'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
                                      boxShadow: '0 0 10px rgba(6, 182, 212, 0.7)'
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Informações do Rodapé */}
                            <div
                              className={`pt-2.5 border-t flex items-center justify-between text-[11px] ${
                                tintedGlass
                                  ? 'border-white/[0.08] text-slate-300'
                                  : 'border-slate-100 text-slate-500'
                              }`}
                            >
                              <span
                                className={`flex items-center gap-1.5 font-semibold ${
                                  tintedGlass ? 'text-slate-200' : 'text-slate-700'
                                }`}
                              >
                                <User className="w-3 h-3 text-cyan-400" />
                                {task.assignee}
                              </span>
                              <span className="flex items-center gap-1 font-mono text-[10px]">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {formatDate(task.dueDate)}
                              </span>
                            </div>

                            {/* Ações Rápidas: Mover Status, Editar e Excluir (Pílulas Translúcidas estilo Packing Board Vídeo 1) */}
                            <div
                              className={`mt-2.5 pt-2.5 border-t flex items-center justify-between text-xs ${
                                tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-1 flex-wrap">
                                <span
                                  className={`text-[10px] font-medium ${
                                    tintedGlass ? 'text-slate-400' : 'text-slate-400'
                                  }`}
                                >
                                  Mover:
                                </span>
                                {COLUMNS.filter(c => c.id !== task.status).map(dest => (
                                  <button
                                    key={dest.id}
                                    onMouseDown={e => e.stopPropagation()}
                                    onClick={() => handleMoveStatus(task.id, dest.id)}
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer border ${
                                      tintedGlass
                                        ? 'bg-white/[0.06] hover:bg-cyan-500/25 text-slate-200 hover:text-cyan-200 border-white/[0.1]'
                                        : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border-slate-200'
                                    }`}
                                    title={`Mover para ${dest.label}`}
                                  >
                                    {dest.label.split(' ')[0]}
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onMouseDown={e => e.stopPropagation()}
                                  onClick={() => openEditTaskModal(task)}
                                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                    tintedGlass
                                      ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08]'
                                      : 'text-slate-400 hover:text-blue-600'
                                  }`}
                                  title="Editar detalhes"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onMouseDown={e => e.stopPropagation()}
                                  onClick={() => handleDeleteTask(task.id)}
                                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                    tintedGlass
                                      ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                                      : 'text-slate-400 hover:text-rose-600'
                                  }`}
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
                      <div className="border-2 border-dashed border-cyan-400 bg-cyan-500/15 rounded-2xl p-3 text-center text-xs font-bold text-cyan-200 animate-pulse flex items-center justify-center gap-1.5">
                        <span>Soltar aqui para mover para {col.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          ) : (
            /* ===================================================================
               MODO LISTA OPERACIONAL EM VIDRO ESPECULAR
               =================================================================== */
            <div className="space-y-4">
              {/* Filtros Rápidos por Etapa & Ordenação */}
              <div
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl ${
                  tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setListStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      listStatusFilter === 'all'
                        ? tintedGlass
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40'
                          : 'bg-slate-900 text-white border-slate-900'
                        : tintedGlass
                        ? 'aptis-glass-subcard text-slate-300 hover:text-white'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Todas</span>
                    <span className="font-mono text-[10px] opacity-80">({filteredTasks.length})</span>
                  </button>

                  {COLUMNS.map(col => {
                    const count = filteredTasks.filter(t => t.status === col.id).length;
                    const isActive = listStatusFilter === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setListStatusFilter(col.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                          isActive
                            ? tintedGlass
                              ? 'bg-cyan-500/20 text-white border-cyan-400/45'
                              : 'bg-blue-600 text-white border-blue-600'
                            : tintedGlass
                            ? 'aptis-glass-subcard text-slate-300 hover:text-white'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${col.dot} ${col.glow}`} />
                        <span>{col.label.split(' ')[0] === 'Em' ? col.label.split(' /')[0] : col.label}</span>
                        <span className="font-mono text-[10px] opacity-80">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${
                      tintedGlass
                        ? 'aptis-glass-subcard text-slate-200'
                        : 'bg-slate-50 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-medium">Ordenar:</span>
                    <select
                      value={listSortBy}
                      onChange={e =>
                        setListSortBy(e.target.value as 'dueDate' | 'priority' | 'status' | 'title')
                      }
                      className={`font-bold bg-transparent focus:outline-none cursor-pointer ${
                        tintedGlass ? 'text-cyan-300' : 'text-slate-900'
                      }`}
                    >
                      <option value="dueDate" className="bg-slate-900 text-white">
                        Prazo (SLA)
                      </option>
                      <option value="priority" className="bg-slate-900 text-white">
                        Prioridade
                      </option>
                      <option value="status" className="bg-slate-900 text-white">
                        Status
                      </option>
                      <option value="title" className="bg-slate-900 text-white">
                        Título (A-Z)
                      </option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setListSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      tintedGlass
                        ? 'aptis-glass-subcard text-cyan-300 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    title={listSortDir === 'asc' ? 'Ordem Crescente' : 'Ordem Decrescente'}
                  >
                    {listSortDir === 'asc' ? '↑ Cresc.' : '↓ Decresc.'}
                  </button>
                </div>
              </div>

              {/* Tabela da Lista de Tarefas */}
              <div
                className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
                  tintedGlass
                    ? 'aptis-glass-dark border-white/10 text-white'
                    : 'bg-white border-slate-200 shadow-xs text-slate-900'
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr
                        className={
                          tintedGlass
                            ? 'bg-slate-950/80 backdrop-blur-md text-slate-200 border-b border-white/[0.08]'
                            : 'bg-slate-900 text-white'
                        }
                      >
                        <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider w-48">
                          <button
                            type="button"
                            onClick={() => handleToggleListSort('status')}
                            className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            <span>Status</span>
                            <ArrowUpDown className="w-3 h-3 opacity-70" />
                          </button>
                        </th>
                        <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider min-w-[260px]">
                          <button
                            type="button"
                            onClick={() => handleToggleListSort('title')}
                            className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            <span>Tarefa / Setor</span>
                            <ArrowUpDown className="w-3 h-3 opacity-70" />
                          </button>
                        </th>
                        <th className="py-3.5 px-3 font-semibold text-xs uppercase tracking-wider text-center w-28">
                          <button
                            type="button"
                            onClick={() => handleToggleListSort('priority')}
                            className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            <span>Prioridade</span>
                            <ArrowUpDown className="w-3 h-3 opacity-70" />
                          </button>
                        </th>
                        <th className="py-3.5 px-3 font-semibold text-xs uppercase tracking-wider w-40">
                          Checklist
                        </th>
                        <th className="py-3.5 px-3 font-semibold text-xs uppercase tracking-wider min-w-[150px]">
                          Responsável
                        </th>
                        <th className="py-3.5 px-3 font-semibold text-xs uppercase tracking-wider min-w-[175px]">
                          <button
                            type="button"
                            onClick={() => handleToggleListSort('dueDate')}
                            className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            <span>Prazo & SLA</span>
                            <ArrowUpDown className="w-3 h-3 opacity-70" />
                          </button>
                        </th>
                        <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-right w-24">
                          Ações
                        </th>
                      </tr>
                    </thead>

                    <tbody className={`divide-y ${tintedGlass ? 'divide-white/[0.06]' : 'divide-slate-100'}`}>
                      {listTasks.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                            <p className="mb-3">
                              Nenhuma tarefa encontrada com os filtros atuais.
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              {(listStatusFilter !== 'all' || priorityFilter !== 'all' || search) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setListStatusFilter('all');
                                    setPriorityFilter('all');
                                    setSearch('');
                                  }}
                                  className={`px-3 py-1.5 rounded-xl font-semibold border cursor-pointer ${
                                    tintedGlass
                                      ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  Limpar Filtros
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={openNewTaskModal}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Nova Tarefa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        listTasks.map(task => {
                          const colMeta = COLUMNS.find(c => c.id === task.status) || COLUMNS[0];
                          const completedSubtasks =
                            task.subtasks?.filter(s => s.completed).length || 0;
                          const totalSubtasks = task.subtasks?.length || 0;
                          const subProgress =
                            totalSubtasks > 0
                              ? Math.round((completedSubtasks / totalSubtasks) * 100)
                              : 0;
                          const isExpanded = Boolean(expandedListSubtasks[task.id]);

                          return (
                            <React.Fragment key={task.id}>
                              <tr
                                className={`transition-colors group ${
                                  task.status === 'done' ? 'opacity-75' : ''
                                } ${tintedGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/90'}`}
                              >
                                {/* Status Interativo */}
                                <td className="py-3.5 px-4 align-middle">
                                  <div
                                    className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${
                                      tintedGlass
                                        ? 'aptis-glass-subcard text-white border-white/15'
                                        : 'bg-slate-50 text-slate-800 border-slate-200'
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${colMeta.dot} ${colMeta.glow}`} />
                                    <select
                                      value={task.status}
                                      onChange={e =>
                                        handleMoveStatus(task.id, e.target.value as TaskStatus)
                                      }
                                      aria-label={`Alterar status da tarefa ${task.title}`}
                                      className={`bg-transparent outline-none cursor-pointer text-[11px] font-bold pr-1 ${
                                        tintedGlass
                                          ? 'text-white [&>option]:bg-slate-900'
                                          : 'text-slate-800'
                                      }`}
                                    >
                                      {COLUMNS.map(c => (
                                        <option key={c.id} value={c.id}>
                                          {c.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </td>

                                {/* Título, Setor, Descrição & Quadrante */}
                                <td className="py-3.5 px-4 align-middle">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                                        tintedGlass ? 'text-cyan-300/85' : 'text-blue-700'
                                      }`}
                                    >
                                      {task.sector}
                                    </span>
                                    {getQuadrantBadge(task.quadrant)}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openEditTaskModal(task)}
                                    className={`text-left text-xs sm:text-[13px] font-bold leading-snug transition-colors cursor-pointer block ${
                                      task.status === 'done' ? 'line-through decoration-slate-400/70' : ''
                                    } ${
                                      tintedGlass
                                        ? 'text-white hover:text-cyan-300'
                                        : 'text-slate-900 hover:text-blue-600'
                                    }`}
                                    title="Clique para editar detalhes"
                                  >
                                    {task.title}
                                  </button>
                                  {task.description && (
                                    <p
                                      className={`text-[11px] line-clamp-1 mt-0.5 max-w-md ${
                                        tintedGlass ? 'text-slate-400' : 'text-slate-500'
                                      }`}
                                    >
                                      {task.description}
                                    </p>
                                  )}
                                </td>

                                {/* Prioridade */}
                                <td className="py-3.5 px-3 text-center align-middle">
                                  {getPriorityBadge(task.priority)}
                                </td>

                                {/* Checklist Interativo */}
                                <td className="py-3.5 px-3 align-middle">
                                  {totalSubtasks > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleExpandSubtasks(task.id)}
                                      className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer ${
                                        tintedGlass
                                          ? 'bg-black/25 hover:bg-white/[0.06] border-white/[0.08]'
                                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                                      }`}
                                      title="Clique para expandir e marcar subtarefas"
                                    >
                                      <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                                        <span className="inline-flex items-center gap-1">
                                          {isExpanded ? (
                                            <ChevronDown className="w-3 h-3 text-cyan-400" />
                                          ) : (
                                            <ChevronRight className="w-3 h-3 text-slate-400" />
                                          )}
                                          {completedSubtasks}/{totalSubtasks}
                                        </span>
                                        <span
                                          className={`font-mono font-bold ${
                                            tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                                          }`}
                                        >
                                          {subProgress}%
                                        </span>
                                      </div>
                                      <div
                                        className={`w-full h-1.5 rounded-full overflow-hidden ${
                                          tintedGlass ? 'bg-white/[0.1]' : 'bg-slate-200'
                                        }`}
                                      >
                                        <div
                                          className="h-full rounded-full transition-all duration-300"
                                          style={{
                                            width: `${subProgress}%`,
                                            background:
                                              'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)'
                                          }}
                                        />
                                      </div>
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400 px-2">-</span>
                                  )}
                                </td>

                                {/* Responsável */}
                                <td className="py-3.5 px-3 align-middle">
                                  <span
                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                      tintedGlass ? 'text-slate-200' : 'text-slate-700'
                                    }`}
                                  >
                                    <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                    {task.assignee}
                                  </span>
                                </td>

                                {/* Prazo & SLA */}
                                <td className="py-3.5 px-3 align-middle">
                                  <div className="flex flex-col items-start gap-1">
                                    <span
                                      className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${
                                        tintedGlass ? 'text-slate-200' : 'text-slate-700'
                                      }`}
                                    >
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {formatDate(task.dueDate)}
                                    </span>
                                    {getSlaBadge(task.dueDate, task.status === 'done')}
                                  </div>
                                </td>

                                {/* Ações */}
                                <td className="py-3.5 px-4 text-right align-middle">
                                  <div className="inline-flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => openEditTaskModal(task)}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        tintedGlass
                                          ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08]'
                                          : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                      }`}
                                      title="Editar tarefa"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTask(task.id)}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        tintedGlass
                                          ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                      }`}
                                      title="Excluir tarefa"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Gaveta Expandida de Subtarefas no Modo Lista */}
                              {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                                <tr
                                  className={
                                    tintedGlass ? 'bg-black/25' : 'bg-slate-50/70'
                                  }
                                >
                                  <td colSpan={7} className="px-6 py-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`text-[10px] font-bold uppercase tracking-wider mr-1 ${
                                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                                        }`}
                                      >
                                        Subtarefas:
                                      </span>
                                      {task.subtasks.map(sub => (
                                        <button
                                          key={sub.id}
                                          type="button"
                                          onClick={() => handleToggleSubtask(task.id, sub.id)}
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all cursor-pointer ${
                                            sub.completed
                                              ? tintedGlass
                                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30 line-through opacity-80'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 line-through opacity-80'
                                              : tintedGlass
                                              ? 'aptis-glass-subcard text-slate-200 hover:border-cyan-400/40'
                                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                                          }`}
                                        >
                                          <CheckCircle2
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                              sub.completed ? 'text-emerald-400' : 'text-slate-400'
                                            }`}
                                          />
                                          <span>{sub.title}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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

      {/* Modal de Importação de Excel Inteligente */}
      <SmartExcelImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        toolTitle={EXCEL_IMPORT_CONFIGS['manager-tasks'].toolTitle}
        subtitle={EXCEL_IMPORT_CONFIGS['manager-tasks'].subtitle}
        templateFilename={EXCEL_IMPORT_CONFIGS['manager-tasks'].templateFilename}
        columns={EXCEL_IMPORT_CONFIGS['manager-tasks'].columns}
        sampleRows={EXCEL_IMPORT_CONFIGS['manager-tasks'].sampleRows}
        onImport={handleImportTasksExcel}
      />
    </div>
  );
}
