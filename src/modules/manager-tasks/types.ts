export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type EisenhowerQuadrant = 
  | 'q1_do'         // Urgente & Importante (Fazer Já)
  | 'q2_schedule'   // Não Urgente & Importante (Planejar / Agendar)
  | 'q3_delegate'   // Urgente & Pouco Importante (Delegar)
  | 'q4_eliminate'; // Nem Urgente nem Importante (Eliminar / Monitorar)

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ManagerTask {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  sector: string;
  dueDate: string;
  createdAt: string;
  quadrant?: EisenhowerQuadrant;
  subtasks?: SubTask[];
}

export type RoutinePeriod = 'start_shift' | 'mid_shift' | 'end_shift';

export interface RoutineTask {
  id: string;
  title: string;
  description: string;
  period: RoutinePeriod;
  sector: string;
  responsibleRole: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface ShiftHandoverData {
  fromShift: string;
  toShift: string;
  supervisorOut: string;
  supervisorIn: string;
  date: string;
  sector: string;
  generalNotes: string;
  criticalIssues: string;
}

export type TaskViewTab = 'kanban' | 'eisenhower' | 'kamishibai';
