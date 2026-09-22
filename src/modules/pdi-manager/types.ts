export type PdiStatus = 'draft' | 'in_progress' | 'review' | 'completed' | 'delayed';

export type LearningPillar = '70_practice' | '20_mentoring' | '10_courses';

export interface PdiActionItem {
  id: string;
  title: string;
  pillar: LearningPillar;
  skillCategory: string;
  status: 'todo' | 'doing' | 'done' | 'blocked';
  deadline: string;
  mentorOrSupport: string;
  evidenceCriteria: string;
  notes?: string;
  completedAt?: string;
}

export interface PdiCheckIn {
  id: string;
  pdiId: string;
  date: string;
  reviewerName: string;
  evolutionPercent: number;
  summary: string;
  strengthsNoticed: string;
  blockersAndAdjustments: string;
  nextCheckInDate: string;
}

export interface EmployeePdi {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  shift: string;
  avatarUrl?: string;
  currentLevel: string;
  targetRole: string;
  targetLevel: string;
  cycleYear: string;
  status: PdiStatus;
  progressPercent: number;
  startDate: string;
  targetEndDate: string;
  careerGoal: string;
  strengths: string[];
  growthGaps: string[];
  actions: PdiActionItem[];
  checkIns: PdiCheckIn[];
  updatedAt: string;
}

export interface PdiTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  targetRole: string;
  suggestedStrengths: string[];
  suggestedGaps: string[];
  suggestedActions: Array<{
    title: string;
    pillar: LearningPillar;
    skillCategory: string;
    deadlineDays: number;
    mentorOrSupport: string;
    evidenceCriteria: string;
  }>;
}
